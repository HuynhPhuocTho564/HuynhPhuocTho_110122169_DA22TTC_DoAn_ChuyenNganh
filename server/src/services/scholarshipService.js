const { Scholarship, School, Fund, Sponsor, Application, Student } = require('../models');
const { Op } = require('sequelize');

// Tạo học bổng mới (UNI_ADMIN)
const createScholarship = async (scholarshipData, userId, userRole, userSchoolId) => {
  const {
    name,
    semester,
    academic_year,
    amount_per_slot,
    slots,
    description,
    criteria_json,
    start_date,
    end_date,
    fund_id,
    status
  } = scholarshipData;

  // UNI_ADMIN chỉ tạo học bổng cho trường mình
  const school_id = userRole === 'SUPER_ADMIN' ? scholarshipData.school_id : userSchoolId;

  if (!school_id) {
    throw new Error('Không xác định được trường');
  }

  // Validate dates
  if (new Date(start_date) >= new Date(end_date)) {
    throw new Error('Ngày bắt đầu phải trước ngày kết thúc');
  }

  // Validate: Không cho OPEN nếu chưa đến start_date
  let finalStatus = status || 'OPEN';
  if (finalStatus === 'OPEN') {
    const now = new Date();
    if (now < new Date(start_date)) {
      throw new Error('Không thể mở học bổng trước ngày bắt đầu');
    }
  }

  const scholarship = await Scholarship.create({
    school_id,
    fund_id,
    name,
    semester,
    academic_year,
    amount_per_slot,
    slots,
    description,
    criteria_json,
    start_date,
    end_date,
    status: finalStatus
  });

  return scholarship;
};

// Lấy danh sách học bổng
const getScholarships = async (userRole, userSchoolId, filters = {}) => {
  const { page = 1, limit = 50, status, search, school_id } = filters;

  const whereClause = {};

  // Filter theo school_id nếu có (ưu tiên cao nhất)
  if (school_id) {
    whereClause.school_id = school_id;
  }
  // Nếu không có filter school_id, áp dụng rule theo role
  else if (userRole === 'UNI_ADMIN') {
    // UNI_ADMIN xem tất cả học bổng của trường mình
    whereClause.school_id = userSchoolId;
  }
  // STUDENT, SUPER_ADMIN và Public xem tất cả trường (sinh viên xem để tham khảo)

  // Filter theo status nếu có
  if (status) {
    whereClause.status = status;
  }

  // Search theo tên
  if (search) {
    whereClause.name = { [Op.like]: `%${search}%` };
  }

  const offset = (page - 1) * limit;

  try {
    const { count, rows } = await Scholarship.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: School,
          as: 'school',
          attributes: ['id', 'name', 'code'],
          required: false // Không bắt buộc phải có school
        },
        {
          model: Fund,
          as: 'fund',
          required: false,
          include: [
            {
              model: Sponsor,
              as: 'sponsor',
              attributes: ['id', 'company_name'],
              required: false
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      scholarships: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    console.error('Error in getScholarships:', error);
    // Fallback: query without includes if associations fail
    const { count, rows } = await Scholarship.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    return {
      scholarships: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }
};

// Lấy chi tiết học bổng
const getScholarshipById = async (id, userRole, userSchoolId) => {
  const scholarship = await Scholarship.findByPk(id, {
    include: [
      {
        model: School,
        as: 'school'
      },
      {
        model: Fund,
        as: 'fund',
        required: false,
        include: [
          {
            model: Sponsor,
            as: 'sponsor'
          }
        ]
      }
    ]
  });

  if (!scholarship) {
    throw new Error('Không tìm thấy học bổng');
  }

  // Kiểm tra quyền truy cập
  // UNI_ADMIN chỉ xem học bổng trường mình
  if (userRole === 'UNI_ADMIN') {
    if (scholarship.school_id !== userSchoolId) {
      throw new Error('Bạn không có quyền xem học bổng này');
    }
  }
  // STUDENT có thể xem tất cả học bổng (để tham khảo), nhưng chỉ nộp được trường mình

  // Đếm số lượng đơn đã nộp
  const applicationCount = await Application.count({
    where: { scholarship_id: id }
  });

  const approvedCount = await Application.count({
    where: { scholarship_id: id, status: 'APPROVED' }
  });

  return {
    ...scholarship.toJSON(),
    stats: {
      total_applications: applicationCount,
      approved_applications: approvedCount,
      remaining_slots: scholarship.slots - approvedCount
    }
  };
};

// Cập nhật học bổng
const updateScholarship = async (id, updateData, userRole, userSchoolId) => {
  const scholarship = await Scholarship.findByPk(id);

  if (!scholarship) {
    throw new Error('Không tìm thấy học bổng');
  }

  // Kiểm tra quyền
  if (userRole === 'UNI_ADMIN' && scholarship.school_id !== userSchoolId) {
    throw new Error('Bạn không có quyền sửa học bổng này');
  }

  // Không cho sửa nếu đã có người nộp đơn
  const hasApplications = await Application.count({
    where: { scholarship_id: id }
  });

  if (hasApplications > 0 && (updateData.slots || updateData.amount_per_slot)) {
    throw new Error('Không thể thay đổi số suất hoặc giá trị khi đã có đơn đăng ký');
  }

  // Validate: Không cho OPEN nếu chưa đến start_date
  if (updateData.status === 'OPEN') {
    const startDate = updateData.start_date ? new Date(updateData.start_date) : new Date(scholarship.start_date);
    const now = new Date();
    if (now < startDate) {
      throw new Error('Không thể mở học bổng trước ngày bắt đầu');
    }
  }

  // Validate dates nếu có update
  if (updateData.start_date && updateData.end_date) {
    if (new Date(updateData.start_date) >= new Date(updateData.end_date)) {
      throw new Error('Ngày bắt đầu phải trước ngày kết thúc');
    }
  }

  await scholarship.update(updateData);

  return scholarship;
};

// Xóa học bổng
const deleteScholarship = async (id, userRole, userSchoolId) => {
  const scholarship = await Scholarship.findByPk(id);

  if (!scholarship) {
    throw new Error('Không tìm thấy học bổng');
  }

  // Kiểm tra quyền
  if (userRole === 'UNI_ADMIN' && scholarship.school_id !== userSchoolId) {
    throw new Error('Bạn không có quyền xóa học bổng này');
  }

  // Chỉ xóa được nếu chưa có đơn nào
  const hasApplications = await Application.count({
    where: { scholarship_id: id }
  });

  if (hasApplications > 0) {
    throw new Error('Không thể xóa học bổng đã có đơn đăng ký');
  }

  await scholarship.destroy();

  return true;
};

module.exports = {
  createScholarship,
  getScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship
};
