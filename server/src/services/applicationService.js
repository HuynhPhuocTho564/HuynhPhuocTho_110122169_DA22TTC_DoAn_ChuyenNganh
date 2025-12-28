const { Application, Scholarship, Student, User, ApplicationDocument, Class, Major, Faculty, School, Fund, Sponsor, Notification } = require('../models');
const { calculateApplicationScore, checkEligibility } = require('../utils/scoringHelper');
const { getCurrentDate } = require('../utils/helper');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Nộp hồ sơ (STUDENT) - Với Data Snapshot Logic
const submitApplication = async (scholarshipId, userId) => {
  // Bắt đầu transaction để đảm bảo data consistency
  const transaction = await sequelize.transaction();

  try {
    // 1. Lấy thông tin sinh viên
    const student = await Student.findOne({
      where: { user_id: userId },
      include: [
        {
          model: Class,
          as: 'class',
          include: [
            {
              model: Major,
              as: 'major',
              include: [{ model: Faculty, as: 'faculty' }]
            }
          ]
        }
      ],
      transaction
    });

    if (!student) {
      throw new Error('Không tìm thấy thông tin sinh viên');
    }

    // 2. Lấy thông tin học bổng với lock để tránh race condition
    const scholarship = await Scholarship.findByPk(scholarshipId, {
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!scholarship) {
      throw new Error('Không tìm thấy học bổng');
    }

    // 3. Kiểm tra học bổng có đang mở không
    if (scholarship.status !== 'OPEN') {
      throw new Error('Học bổng này hiện không nhận hồ sơ');
    }

    // 4. Kiểm tra ngày bắt đầu (chưa đến ngày mở)
    const now = getCurrentDate();
    if (now < new Date(scholarship.start_date)) {
      throw new Error('Học bổng chưa đến thời gian nhận hồ sơ');
    }

    // 5. Kiểm tra hạn nộp
    if (now > new Date(scholarship.end_date)) {
      throw new Error('Đã hết hạn nộp hồ sơ');
    }

    // 6. Kiểm tra hồ sơ đã nộp trước đó
    const existingApplication = await Application.findOne({
      where: {
        scholarship_id: scholarshipId,
        student_id: student.id
      },
      transaction
    });

    if (existingApplication) {
      // Chỉ không cho nộp lại nếu đã APPROVED hoặc DISBURSED
      if (existingApplication.status === 'APPROVED') {
        throw new Error('Hồ sơ của bạn đã được duyệt');
      } else if (existingApplication.status === 'DISBURSED') {
        throw new Error('Bạn đã nhận học bổng này rồi');
      }
      // Cho phép cập nhật nếu PENDING, NEED_UPDATE, hoặc REJECTED
      // Sẽ cập nhật hồ sơ cũ thay vì tạo mới
    }

    // 7. Kiểm tra multi-tenant (Sinh viên chỉ nộp học bổng của trường mình)
    const user = await User.findByPk(userId, { transaction });
    if (user.school_id !== scholarship.school_id) {
      throw new Error('Bạn chỉ có thể nộp hồ sơ cho học bổng của trường mình');
    }

    // 8. SNAPSHOT DATA - Đóng băng dữ liệu tại thời điểm nộp
    const snapshotData = {
      full_name: student.full_name,
      student_code: student.student_code,
      dob: student.dob,
      gender: student.gender,
      gpa: student.gpa,
      drr: student.drr,
      poor_cert_type: student.poor_cert_type,
      bank_number: student.bank_number,
      bank_name: student.bank_name,
      class_name: student.class?.name || null,
      major_name: student.class?.major?.name || null,
      faculty_name: student.class?.major?.faculty?.name || null,
      snapshot_time: new Date()
    };

    // 9. Kiểm tra điều kiện đủ tiêu chuẩn không
    const eligibility = checkEligibility(snapshotData, scholarship.criteria_json);
    if (!eligibility.isEligible) {
      throw new Error(`Không đủ điều kiện: ${eligibility.errors.join(', ')}`);
    }

    // 10. Tính điểm tự động (Auto Scoring)
    const systemScore = calculateApplicationScore(snapshotData, scholarship.criteria_json);

    let application;
    
    // 11. Nếu đã có hồ sơ (PENDING/NEED_UPDATE/REJECTED) -> cập nhật
    if (existingApplication) {
      await existingApplication.update({
        status: 'PENDING',
        system_score: systemScore,
        snapshot_data: snapshotData,
        submitted_at: new Date(),
        admin_note: null,
        reviewed_by: null,
        reviewed_at: null
      }, { transaction });
      application = existingApplication;
    } else {
      // Tạo hồ sơ mới
      application = await Application.create({
        scholarship_id: scholarshipId,
        student_id: student.id,
        status: 'PENDING',
        system_score: systemScore,
        snapshot_data: snapshotData,
        submitted_at: new Date()
      }, { transaction });
    }

    await transaction.commit();

    return application;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// Lấy lịch sử hồ sơ của sinh viên (STUDENT)
const getMyApplications = async (userId) => {
  const student = await Student.findOne({ where: { user_id: userId } });

  if (!student) {
    throw new Error('Không tìm thấy thông tin sinh viên');
  }

  const applications = await Application.findAll({
    where: { student_id: student.id },
    include: [
      {
        model: Scholarship,
        as: 'scholarship',
        attributes: ['id', 'name', 'amount_per_slot', 'semester', 'academic_year', 'status']
      },
      {
        model: ApplicationDocument,
        as: 'documents'
      }
    ],
    order: [['submitted_at', 'DESC']]
  });

  return applications;
};

// Lấy danh sách hồ sơ (UNI_ADMIN, SUPER_ADMIN) - Có filter và sort
const getApplications = async (userRole, userSchoolId, filters = {}) => {
  // Validate và chuẩn hóa pagination
  let { page = 1, limit = 20, status, scholarshipId, search, sortBy = 'system_score' } = filters;
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.max(1, Math.min(100, parseInt(limit) || 20));

  const whereClause = {};
  const includeClause = [
    {
      model: Scholarship,
      as: 'scholarship',
      attributes: ['id', 'name', 'amount_per_slot', 'slots', 'school_id']
    },
    {
      model: Student,
      as: 'student',
      attributes: ['id', 'student_code', 'full_name', 'phone'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['email']
        }
      ]
    }
  ];

  // Multi-tenant: UNI_ADMIN chỉ xem hồ sơ của trường mình
  if (userRole === 'UNI_ADMIN') {
    const scholarships = await Scholarship.findAll({
      where: { school_id: userSchoolId },
      attributes: ['id']
    });
    const scholarshipIds = scholarships.map(s => s.id);
    
    if (scholarshipIds.length === 0) {
      return {
        applications: [],
        pagination: { total: 0, page, limit, totalPages: 0 }
      };
    }
    whereClause.scholarship_id = { [Op.in]: scholarshipIds };
  }
  // SUPER_ADMIN xem tất cả - không cần filter school_id

  // Filter theo status
  if (status) {
    whereClause.status = status;
  }

  // Filter theo học bổng cụ thể
  if (scholarshipId) {
    whereClause.scholarship_id = scholarshipId;
  }

  const offset = (page - 1) * limit;

  // Xác định cách sort
  let orderClause = [];
  if (sortBy === 'system_score') {
    orderClause = [['system_score', 'DESC']];
  } else if (sortBy === 'submitted_at') {
    orderClause = [['submitted_at', 'DESC']];
  }

  const { count, rows } = await Application.findAndCountAll({
    where: whereClause,
    include: includeClause,
    limit,
    offset,
    order: orderClause
  });

  // Nếu có search, filter sau khi query (vì snapshot_data là JSON)
  let filteredRows = rows;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredRows = rows.filter(app => {
      const snapshot = app.snapshot_data || {};
      const studentCode = app.student?.student_code || '';
      return (
        (snapshot.full_name && snapshot.full_name.toLowerCase().includes(searchLower)) ||
        (snapshot.student_code && snapshot.student_code.toLowerCase().includes(searchLower)) ||
        studentCode.toLowerCase().includes(searchLower)
      );
    });
  }

  return {
    applications: filteredRows,
    pagination: {
      total: search ? filteredRows.length : count,
      page,
      limit,
      totalPages: Math.ceil((search ? filteredRows.length : count) / limit)
    }
  };
};

// Lấy chi tiết hồ sơ (UNI_ADMIN, STUDENT, SUPER_ADMIN)
const getApplicationById = async (id, userRole, userId, userSchoolId) => {
  const application = await Application.findByPk(id, {
    include: [
      {
        model: Scholarship,
        as: 'scholarship',
        include: [{ model: School, as: 'school' }]
      },
      {
        model: Student,
        as: 'student',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'username']
          }
        ]
      },
      {
        model: ApplicationDocument,
        as: 'documents'
      },
      {
        model: User,
        as: 'reviewer',
        attributes: ['id', 'username'],
        required: false
      }
    ]
  });

  if (!application) {
    throw new Error('Không tìm thấy hồ sơ');
  }

  // Kiểm tra quyền truy cập
  if (userRole === 'STUDENT') {
    const student = await Student.findOne({ where: { user_id: userId } });
    if (!student || application.student_id !== student.id) {
      throw new Error('Bạn không có quyền xem hồ sơ này');
    }
  } else if (userRole === 'UNI_ADMIN') {
    // UNI_ADMIN chỉ xem hồ sơ của trường mình
    if (application.scholarship.school_id !== userSchoolId) {
      throw new Error('Bạn không có quyền xem hồ sơ này');
    }
  }
  // SUPER_ADMIN có thể xem tất cả

  return application;
};

// Xét duyệt hồ sơ (UNI_ADMIN, SUPER_ADMIN) - APPROVED/REJECTED/NEED_UPDATE
// Nâng cấp: Gửi notification cho Sponsor khi APPROVED
const reviewApplication = async (id, reviewData, reviewerId, reviewerRole, reviewerSchoolId) => {
  const { status, admin_note } = reviewData;

  // Dùng transaction với lock để tránh race condition
  const transaction = await sequelize.transaction();

  try {
    // Lấy application kèm scholarship và fund để truy vấn sponsor
    const application = await Application.findByPk(id, {
      include: [
        { 
          model: Scholarship, 
          as: 'scholarship',
          include: [
            {
              model: Fund,
              as: 'fund',
              include: [
                {
                  model: Sponsor,
                  as: 'sponsor',
                  attributes: ['id', 'user_id', 'company_name']
                }
              ]
            }
          ]
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'full_name', 'student_code']
        }
      ],
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!application) {
      throw new Error('Không tìm thấy hồ sơ');
    }

    // Kiểm tra quyền: UNI_ADMIN chỉ duyệt hồ sơ của trường mình
    if (reviewerRole === 'UNI_ADMIN' && application.scholarship.school_id !== reviewerSchoolId) {
      throw new Error('Bạn không có quyền xét duyệt hồ sơ này');
    }

    // Kiểm tra học bổng còn OPEN không
    if (application.scholarship.status === 'FINISHED') {
      throw new Error('Học bổng đã kết thúc, không thể xét duyệt');
    }

    // ============ KHÔNG CHO THAY ĐỔI NẾU ĐÃ APPROVED HOẶC DISBURSED ============
    if (application.status === 'APPROVED') {
      throw new Error('Hồ sơ đã được duyệt, không thể thay đổi trạng thái');
    }
    if (application.status === 'DISBURSED') {
      throw new Error('Hồ sơ đã giải ngân, không thể thay đổi trạng thái');
    }

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = ['APPROVED', 'REJECTED', 'NEED_UPDATE', 'PENDING'];
    if (!validStatuses.includes(status)) {
      throw new Error('Trạng thái không hợp lệ');
    }

    // Nếu REJECTED hoặc NEED_UPDATE, bắt buộc phải có lý do
    if ((status === 'REJECTED' || status === 'NEED_UPDATE') && !admin_note) {
      throw new Error('Vui lòng nhập lý do từ chối hoặc yêu cầu bổ sung');
    }

    // Nếu APPROVED, kiểm tra còn suất không (với lock)
    if (status === 'APPROVED') {
      const approvedCount = await Application.count({
        where: {
          scholarship_id: application.scholarship_id,
          status: 'APPROVED',
          id: { [Op.ne]: id } // Không đếm chính nó nếu đang update
        },
        transaction
      });

      if (approvedCount >= application.scholarship.slots) {
        throw new Error('Học bổng đã hết suất');
      }
    }

    // Cập nhật trạng thái
    await application.update({
      status,
      admin_note,
      reviewed_by: reviewerId,
      reviewed_at: new Date()
    }, { transaction });

    // ============ GỬI NOTIFICATION CHO SPONSOR KHI APPROVED ============
    if (status === 'APPROVED') {
      // Lấy thông tin sinh viên từ snapshot hoặc student
      const snapshot = application.snapshot_data || {};
      const studentName = snapshot.full_name || application.student?.full_name || 'Sinh viên';
      const studentCode = snapshot.student_code || application.student?.student_code || '';
      const scholarshipName = application.scholarship?.name || 'Học bổng';

      // Kiểm tra học bổng có Nhà tài trợ không (fund_id != null)
      const fund = application.scholarship?.fund;
      const sponsor = fund?.sponsor;

      if (sponsor && sponsor.user_id) {
        // Tạo notification cho Sponsor
        await Notification.create({
          user_id: sponsor.user_id,
          title: '🎓 Sinh viên mới được duyệt học bổng',
          message: `Sinh viên ${studentName} (${studentCode}) vừa được duyệt nhận học bổng "${scholarshipName}" của quý đơn vị.`,
          type: 'SUCCESS',
          is_read: false,
          created_at: new Date()
        }, { transaction });
      }

      // Gửi notification cho sinh viên (thông báo được duyệt)
      const studentUser = await Student.findByPk(application.student_id, {
        attributes: ['user_id'],
        transaction
      });

      if (studentUser?.user_id) {
        await Notification.create({
          user_id: studentUser.user_id,
          title: '🎉 Chúc mừng! Hồ sơ được duyệt',
          message: `Hồ sơ xin học bổng "${scholarshipName}" của bạn đã được duyệt. Vui lòng kiểm tra thông tin tài khoản ngân hàng để nhận tiền.`,
          type: 'SUCCESS',
          is_read: false,
          created_at: new Date()
        }, { transaction });
      }
    }

    // Gửi notification cho sinh viên khi REJECTED hoặc NEED_UPDATE
    if (status === 'REJECTED' || status === 'NEED_UPDATE') {
      const studentUser = await Student.findByPk(application.student_id, {
        attributes: ['user_id'],
        transaction
      });

      if (studentUser?.user_id) {
        const scholarshipName = application.scholarship?.name || 'Học bổng';
        const title = status === 'REJECTED' 
          ? '❌ Hồ sơ không được duyệt' 
          : '📝 Yêu cầu bổ sung hồ sơ';
        const message = status === 'REJECTED'
          ? `Hồ sơ xin học bổng "${scholarshipName}" của bạn không được duyệt. Lý do: ${admin_note}`
          : `Hồ sơ xin học bổng "${scholarshipName}" cần bổ sung thông tin. Chi tiết: ${admin_note}`;

        await Notification.create({
          user_id: studentUser.user_id,
          title,
          message,
          type: status === 'REJECTED' ? 'ERROR' : 'WARNING',
          is_read: false,
          created_at: new Date()
        }, { transaction });
      }
    }

    await transaction.commit();

    return application;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  submitApplication,
  getMyApplications,
  getApplications,
  getApplicationById,
  reviewApplication
};
