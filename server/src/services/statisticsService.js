const { 
  User, 
  School, 
  Scholarship, 
  Application, 
  Student, 
  Sponsor,
  Fund 
} = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * Helper: Convert count to number
 */
const toNumber = (val) => parseInt(val) || 0;

/**
 * Lấy danh sách năm học và học kỳ có trong hệ thống
 */
const getAcademicPeriods = async () => {
  const periods = await Scholarship.findAll({
    attributes: [
      [sequelize.fn('DISTINCT', sequelize.col('academic_year')), 'academic_year'],
      'semester'
    ],
    where: {
      academic_year: { [Op.ne]: null }
    },
    group: ['academic_year', 'semester'],
    order: [['academic_year', 'DESC'], ['semester', 'DESC']],
    raw: true
  });

  // Chuẩn hóa năm học: nếu là "2025" -> "2025-2026", nếu đã là "2025-2026" giữ nguyên
  const formatYear = (year) => {
    if (!year) return null;
    // Nếu đã có format YYYY-YYYY thì giữ nguyên
    if (year.includes('-')) return year;
    // Nếu chỉ có YYYY thì thêm -YYYY+1
    const y = parseInt(year);
    return isNaN(y) ? year : `${y}-${y + 1}`;
  };

  const rawYears = [...new Set(periods.map(p => p.academic_year))].filter(Boolean);
  const formattedYears = rawYears.map(formatYear).filter(Boolean);
  // Loại bỏ trùng lặp sau khi format (vd: "2025" và "2025-2026" đều thành "2025-2026")
  const years = [...new Set(formattedYears)];
  // Lấy các semester thực tế từ database (có thể là 'HK1', 'HK2', '1', '2', etc.)
  const semesters = [...new Set(periods.map(p => p.semester))].filter(Boolean);

  return { years, semesters, periods };
};

/**
 * Thống kê tổng quan toàn hệ thống (SUPER_ADMIN)
 */
const getSystemStats = async (filters = {}) => {
  const { academic_year } = filters;
  // Convert semester: '1' -> 'HK1', '2' -> 'HK2'
  const semester = filters.semester ? `HK${filters.semester}` : null;
  
  // Build scholarship filter
  const scholarshipWhere = {};
  if (academic_year) scholarshipWhere.academic_year = academic_year;
  if (semester) scholarshipWhere.semester = semester;
  
  const totalSchools = await School.count({ where: { status: 'ACTIVE' } });

  const usersByRole = await User.findAll({
    attributes: [
      'role',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    where: { status: 'ACTIVE' },
    group: ['role'],
    raw: true
  });

  const scholarshipsByStatus = await Scholarship.findAll({
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('amount_per_slot')), 'total_amount']
    ],
    where: scholarshipWhere,
    group: ['status'],
    raw: true
  });

  // Get scholarship IDs for filtered period
  const filteredScholarshipIds = await Scholarship.findAll({
    where: scholarshipWhere,
    attributes: ['id'],
    raw: true
  }).then(rows => rows.map(r => r.id));

  const applicationsByStatus = filteredScholarshipIds.length > 0 
    ? await Application.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { scholarship_id: { [Op.in]: filteredScholarshipIds } },
        group: ['status'],
        raw: true
      })
    : [];

  const approvedApplications = filteredScholarshipIds.length > 0
    ? await Application.findAll({
        where: { 
          status: 'APPROVED',
          scholarship_id: { [Op.in]: filteredScholarshipIds }
        },
        include: [{
          model: Scholarship,
          as: 'scholarship',
          attributes: ['amount_per_slot']
        }]
      })
    : [];

  const totalDisbursed = approvedApplications.reduce(
    (sum, app) => sum + parseFloat(app.scholarship?.amount_per_slot || 0),
    0
  );

  const topSchools = await School.findAll({
    attributes: [
      'id', 'name', 'code',
      [sequelize.fn('COUNT', sequelize.col('users.id')), 'student_count']
    ],
    include: [{
      model: User,
      as: 'users',
      where: { role: 'STUDENT' },
      attributes: [],
      required: false
    }],
    group: ['schools.id'],
    order: [[sequelize.fn('COUNT', sequelize.col('users.id')), 'DESC']],
    limit: 5,
    subQuery: false
  });

  // Normalize counts to numbers
  const normalizedUsersByRole = usersByRole.map(r => ({ ...r, count: toNumber(r.count) }));
  const normalizedScholarships = scholarshipsByStatus.map(s => ({ ...s, count: toNumber(s.count) }));
  const normalizedApplications = applicationsByStatus.map(a => ({ ...a, count: toNumber(a.count) }));

  // Đếm số nhà tài trợ (từ User với role SPONSOR)
  const totalSponsors = await User.count({ where: { role: 'SPONSOR', status: 'ACTIVE' } });

  return {
    overview: {
      total_schools: totalSchools,
      total_users: normalizedUsersByRole.reduce((sum, r) => sum + r.count, 0),
      total_students: normalizedUsersByRole.find(r => r.role === 'STUDENT')?.count || 0,
      total_admins: normalizedUsersByRole.find(r => r.role === 'UNI_ADMIN')?.count || 0,
      total_sponsors: totalSponsors,
      total_scholarships: normalizedScholarships.reduce((sum, s) => sum + s.count, 0),
      total_applications: normalizedApplications.reduce((sum, a) => sum + a.count, 0),
      total_disbursed: totalDisbursed
    },
    users_by_role: normalizedUsersByRole,
    scholarships_by_status: normalizedScholarships,
    applications_by_status: normalizedApplications,
    top_schools: topSchools,
    filter_applied: { academic_year, semester }
  };
};

/**
 * Thống kê của một trường cụ thể (UNI_ADMIN)
 */
const getUniversityStats = async (schoolId, filters = {}) => {
  const { academic_year } = filters;
  // Convert semester: '1' -> 'HK1', '2' -> 'HK2'
  const semester = filters.semester ? `HK${filters.semester}` : null;
  
  // Build scholarship filter
  const scholarshipWhere = { school_id: schoolId };
  if (academic_year) scholarshipWhere.academic_year = academic_year;
  if (semester) scholarshipWhere.semester = semester;
  // Tổng số sinh viên
  const totalStudents = await Student.count({
    include: [{
      model: User,
      as: 'user',
      where: { school_id: schoolId, status: 'ACTIVE' },
      attributes: []
    }]
  });

  // Học bổng theo trạng thái
  const scholarships = await Scholarship.findAll({
    where: scholarshipWhere,
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('SUM', sequelize.col('slots')), 'total_slots'],
      [sequelize.fn('SUM', sequelize.col('amount_per_slot')), 'total_budget']
    ],
    group: ['status'],
    raw: true
  });

  // Lấy scholarship IDs
  const scholarshipIds = await Scholarship.findAll({
    where: scholarshipWhere,
    attributes: ['id'],
    raw: true
  }).then(rows => rows.map(r => r.id));

  // Hồ sơ theo trạng thái
  const applications = scholarshipIds.length > 0 
    ? await Application.findAll({
        where: { scholarship_id: { [Op.in]: scholarshipIds } },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      })
    : [];

  // Tổng tiền đã cấp
  const approvedApps = scholarshipIds.length > 0
    ? await Application.findAll({
        where: { 
          scholarship_id: { [Op.in]: scholarshipIds },
          status: 'APPROVED'
        },
        include: [{
          model: Scholarship,
          as: 'scholarship',
          attributes: ['amount_per_slot']
        }]
      })
    : [];

  const totalDisbursed = approvedApps.reduce(
    (sum, app) => sum + parseFloat(app.scholarship?.amount_per_slot || 0),
    0
  );

  // Học bổng đang mở
  const openScholarships = await Scholarship.findAll({
    where: { ...scholarshipWhere, status: 'OPEN' },
    attributes: ['id', 'name', 'end_date'],
    include: [{
      model: Application,
      as: 'applications',
      attributes: ['status'],
      required: false
    }]
  });

  const pendingByScholarship = openScholarships.map(s => ({
    scholarship_id: s.id,
    scholarship_name: s.name,
    end_date: s.end_date,
    pending_count: s.applications?.filter(a => a.status === 'PENDING').length || 0,
    total_applications: s.applications?.length || 0
  }));

  // Normalize counts
  const normalizedScholarships = scholarships.map(s => ({ ...s, count: toNumber(s.count) }));
  const normalizedApplications = applications.map(a => ({ ...a, count: toNumber(a.count) }));

  return {
    overview: {
      total_students: totalStudents,
      total_scholarships: normalizedScholarships.reduce((sum, s) => sum + s.count, 0),
      total_applications: normalizedApplications.reduce((sum, a) => sum + a.count, 0),
      total_disbursed: totalDisbursed,
      total_beneficiaries: approvedApps.length
    },
    scholarships_by_status: normalizedScholarships,
    applications_by_status: normalizedApplications,
    pending_by_scholarship: pendingByScholarship,
    filter_applied: { academic_year, semester }
  };
};

/**
 * Thống kê của nhà tài trợ (SPONSOR)
 */
const getSponsorStats = async (userId, filters = {}) => {
  const { academic_year } = filters;
  // Convert semester: '1' -> 'HK1', '2' -> 'HK2'
  const semester = filters.semester ? `HK${filters.semester}` : null;
  const sponsor = await Sponsor.findOne({ where: { user_id: userId } });

  if (!sponsor) {
    return {
      overview: {
        total_funds: 0,
        total_contributed: 0,
        total_scholarships: 0,
        total_recipients: 0,
        total_disbursed: 0
      },
      scholarships: [],
      recipients_by_school: [],
      scholarships_by_year: [],
      recent_recipients: [],
      message: 'Chưa có thông tin nhà tài trợ'
    };
  }

  const funds = await Fund.findAll({
    where: { sponsor_id: sponsor.id },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'total_funds'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
    ],
    raw: true
  });

  // Build scholarship filter
  const scholarshipWhere = {};
  if (academic_year) scholarshipWhere.academic_year = academic_year;
  if (semester) scholarshipWhere.semester = semester;

  const scholarships = await Scholarship.findAll({
    where: scholarshipWhere,
    include: [{
      model: Fund,
      as: 'fund',
      where: { sponsor_id: sponsor.id },
      attributes: ['id', 'name', 'amount']
    }],
    attributes: ['id', 'name', 'amount_per_slot', 'slots', 'status', 'semester', 'academic_year']
  });

  // Tính tổng tiền tài trợ từ các học bổng đã lọc (thay vì từ funds)
  const totalContributed = scholarships.reduce(
    (sum, s) => sum + (parseFloat(s.amount_per_slot) * parseInt(s.slots) || 0),
    0
  );

  const scholarshipIds = scholarships.map(s => s.id);

  const recipients = scholarshipIds.length > 0
    ? await Application.findAll({
        where: {
          scholarship_id: { [Op.in]: scholarshipIds },
          status: { [Op.in]: ['APPROVED', 'DISBURSED'] }
        },
        include: [{
          model: Scholarship,
          as: 'scholarship',
          attributes: ['name', 'amount_per_slot', 'fund_id'],
          include: [
            {
              model: School,
              as: 'school',
              attributes: ['name', 'code']
            },
            {
              model: Fund,
              as: 'fund',
              attributes: ['name']
            }
          ]
        }],
        attributes: ['id', 'status', 'snapshot_data', 'reviewed_at']
      })
    : [];

  // Chỉ tính tiền đã giải ngân từ những hồ sơ có status = DISBURSED
  const totalDisbursed = recipients
    .filter(r => r.status === 'DISBURSED')
    .reduce((sum, r) => sum + parseFloat(r.scholarship?.amount_per_slot || 0), 0);

  return {
    overview: {
      total_funds: toNumber(funds[0]?.total_funds),
      total_contributed: totalContributed,
      total_scholarships: scholarships.length,
      total_recipients: recipients.length,
      total_disbursed: totalDisbursed
    },
    scholarships: scholarships.map(s => ({
      id: s.id,
      name: s.name,
      amount_per_slot: s.amount_per_slot,
      slots: s.slots,
      status: s.status,
      fund_name: s.fund?.name
    })),
    recent_recipients: recipients.slice(0, 10).map(r => ({
      student_name: r.snapshot_data?.full_name || 'N/A',
      scholarship_name: r.scholarship?.name,
      amount: r.scholarship?.amount_per_slot,
      school: r.scholarship?.school?.name,
      fund_name: r.scholarship?.fund?.name,
      status: r.status,
      reviewed_at: r.reviewed_at
    })),
    filter_applied: { academic_year, semester }
  };
};

module.exports = {
  getSystemStats,
  getUniversityStats,
  getSponsorStats,
  getAcademicPeriods
};
