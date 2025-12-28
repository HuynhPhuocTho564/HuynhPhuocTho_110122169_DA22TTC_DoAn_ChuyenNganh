const { School, User, Scholarship, Faculty } = require('../models');
const { Op } = require('sequelize');

// Tạo trường đại học mới (SUPER_ADMIN)
const createUniversity = async (universityData) => {
  const { code, name, logo_url, phone, address } = universityData;

  // Kiểm tra mã trường đã tồn tại chưa
  const existingSchool = await School.findOne({
    where: { code }
  });

  if (existingSchool) {
    throw new Error(`Mã trường "${code}" đã tồn tại trong hệ thống`);
  }

  // Tạo trường mới
  const school = await School.create({
    code,
    name,
    logo_url,
    phone,
    address,
    status: 'ACTIVE'
  });

  return school;
};

// Lấy danh sách trường (có phân trang và tìm kiếm)
const getUniversities = async (filters = {}) => {
  const { page = 1, limit = 20, search, status } = filters;

  const whereClause = {};

  // Filter theo status
  if (status) {
    whereClause.status = status;
  }

  // Search theo tên hoặc mã trường
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { code: { [Op.like]: `%${search}%` } }
    ];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await School.findAndCountAll({
    where: whereClause,
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
    // Include thống kê cơ bản
    attributes: {
      include: [
        // Đếm số sinh viên
        [
          School.sequelize.literal(`(
            SELECT COUNT(*)
            FROM users
            WHERE users.school_id = schools.id
            AND users.role = 'STUDENT'
            AND users.status = 'ACTIVE'
          )`),
          'student_count'
        ],
        // Đếm số học bổng
        [
          School.sequelize.literal(`(
            SELECT COUNT(*)
            FROM scholarships
            WHERE scholarships.school_id = schools.id
          )`),
          'scholarship_count'
        ]
      ]
    }
  });

  return {
    universities: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  };
};

// Lấy chi tiết trường
const getUniversityById = async (id) => {
  const school = await School.findByPk(id, {
    include: [
      {
        model: Faculty,
        as: 'faculties',
        attributes: ['id', 'name']
      }
    ]
  });

  if (!school) {
    throw new Error('Không tìm thấy trường đại học');
  }

  // Thống kê chi tiết
  const studentCount = await User.count({
    where: { 
      school_id: id,
      role: 'STUDENT',
      status: 'ACTIVE'
    }
  });

  const adminCount = await User.count({
    where: { 
      school_id: id,
      role: 'UNI_ADMIN',
      status: 'ACTIVE'
    }
  });

  const scholarshipCount = await Scholarship.count({
    where: { school_id: id }
  });

  const activeScholarshipCount = await Scholarship.count({
    where: { 
      school_id: id,
      status: 'OPEN'
    }
  });

  return {
    ...school.toJSON(),
    stats: {
      student_count: studentCount,
      admin_count: adminCount,
      scholarship_count: scholarshipCount,
      active_scholarship_count: activeScholarshipCount
    }
  };
};

// Cập nhật thông tin trường
const updateUniversity = async (id, updateData) => {
  const school = await School.findByPk(id);

  if (!school) {
    throw new Error('Không tìm thấy trường đại học');
  }

  // Nếu đổi mã trường, kiểm tra trùng
  if (updateData.code && updateData.code !== school.code) {
    const existingSchool = await School.findOne({
      where: { 
        code: updateData.code,
        id: { [Op.ne]: id } // Không tính chính nó
      }
    });

    if (existingSchool) {
      throw new Error(`Mã trường "${updateData.code}" đã tồn tại`);
    }
  }

  // Cập nhật
  await school.update(updateData);

  return school;
};

// Khóa/Mở khóa trường
const updateUniversityStatus = async (id, status) => {
  const school = await School.findByPk(id);

  if (!school) {
    throw new Error('Không tìm thấy trường đại học');
  }

  if (!['ACTIVE', 'LOCKED'].includes(status)) {
    throw new Error('Trạng thái không hợp lệ');
  }

  // Nếu khóa trường, cảnh báo về tác động
  if (status === 'LOCKED') {
    const studentCount = await User.count({
      where: { 
        school_id: id,
        role: 'STUDENT',
        status: 'ACTIVE'
      }
    });

    const activeScholarships = await Scholarship.count({
      where: { 
        school_id: id,
        status: 'OPEN'
      }
    });

    if (studentCount > 0 || activeScholarships > 0) {
      // Không chặn, chỉ warning trong response
      await school.update({ status });
      return {
        school,
        warning: `Trường có ${studentCount} sinh viên và ${activeScholarships} học bổng đang hoạt động`
      };
    }
  }

  await school.update({ status });

  return { school };
};

// Xóa trường (Soft delete - chỉ khi không có dữ liệu liên quan)
const deleteUniversity = async (id) => {
  const school = await School.findByPk(id);

  if (!school) {
    throw new Error('Không tìm thấy trường đại học');
  }

  // Kiểm tra có users không
  const userCount = await User.count({
    where: { school_id: id }
  });

  if (userCount > 0) {
    throw new Error(`Không thể xóa trường có ${userCount} người dùng. Vui lòng chuyển họ sang trường khác trước.`);
  }

  // Kiểm tra có học bổng không
  const scholarshipCount = await Scholarship.count({
    where: { school_id: id }
  });

  if (scholarshipCount > 0) {
    throw new Error(`Không thể xóa trường có ${scholarshipCount} học bổng. Vui lòng xóa học bổng trước.`);
  }

  // Xóa trường
  await school.destroy();

  return true;
};

module.exports = {
  createUniversity,
  getUniversities,
  getUniversityById,
  updateUniversity,
  updateUniversityStatus,
  deleteUniversity
};
