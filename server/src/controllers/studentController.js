const { Student, User, Class, Major, Faculty, School } = require('../models');
const { Op } = require('sequelize');
const { hashPassword } = require('../utils/helper');

// Lấy danh sách lớp
const getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      attributes: ['id', 'name', 'code'],
      order: [['name', 'ASC']]
    });
    res.json({ success: true, data: classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách sinh viên (UNI_ADMIN chỉ xem sinh viên trường mình)
const getStudents = async (req, res) => {
  try {
    const { search, page = 1, limit = 20, class_id, circumstance, school_id } = req.query;
    console.log('=== GET STUDENTS ===');
    console.log('User role:', req.user.role);
    console.log('User school_id:', req.user.school_id);
    console.log('Filter params:', { search, page, limit, class_id, circumstance, school_id });
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause cho User
    const userWhere = {
      role: 'STUDENT'
    };

    // UNI_ADMIN chỉ xem sinh viên trường mình
    if (req.user.role === 'UNI_ADMIN') {
      userWhere.school_id = req.user.school_id;
      userWhere.status = 'ACTIVE';
    } else if (req.user.role === 'SUPER_ADMIN') {
      // SUPER_ADMIN có thể filter theo trường
      if (school_id) {
        userWhere.school_id = school_id;
      }
      // Không filter status để xem tất cả
    }

    console.log('User where clause:', userWhere);

    // Build where clause cho Student (search)
    const studentWhere = {};
    if (search) {
      studentWhere[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { student_code: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filter theo lớp
    if (class_id) {
      studentWhere.class_id = class_id;
    }

    // Filter theo hoàn cảnh
    if (circumstance) {
      if (circumstance === 'DIFFICULT') {
        studentWhere.poor_cert_type = { [Op.ne]: 'NONE' };
      } else {
        studentWhere.poor_cert_type = circumstance;
      }
    }

    console.log('Student where clause:', studentWhere);

    const { count, rows } = await Student.findAndCountAll({
      where: studentWhere,
      include: [
        {
          model: User,
          as: 'user',
          where: userWhere,
          attributes: ['id', 'email', 'status', 'school_id'],
          required: true,
          include: [
            {
              model: School,
              as: 'school',
              attributes: ['id', 'name', 'code'],
              required: false
            }
          ]
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name'],
          required: false,
          include: [
            {
              model: Major,
              as: 'major',
              attributes: ['id', 'name'],
              required: false,
              include: [
                {
                  model: Faculty,
                  as: 'faculty',
                  attributes: ['id', 'name'],
                  required: false,
                  include: [
                    {
                      model: require('../models').School,
                      as: 'school',
                      attributes: ['id', 'name', 'code'],
                      required: false
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['student_code', 'ASC']]
    });

    console.log('Found students count:', count);
    console.log('First student user:', rows[0]?.user?.toJSON());
    console.log('=== END GET STUDENTS ===');

    res.json({
      success: true,
      data: {
        students: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết sinh viên
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'status', 'school_id']
        },
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
      ]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên' });
    }

    // UNI_ADMIN chỉ xem sinh viên trường mình
    if (req.user.role === 'UNI_ADMIN' && student.user.school_id !== req.user.school_id) {
      return res.status(403).json({ success: false, message: 'Không có quyền xem sinh viên này' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Get student by id error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật hoàn cảnh sinh viên (UNI_ADMIN duyệt)
const updateCircumstance = async (req, res) => {
  try {
    const { id } = req.params;
    const { poor_cert_type } = req.body;

    // Validate loại hoàn cảnh
    const validTypes = ['NONE', 'POOR', 'NEAR_POOR', 'DISABILITY', 'ORPHAN_BOTH', 'ORPHAN_ONE'];
    if (!validTypes.includes(poor_cert_type)) {
      return res.status(400).json({ success: false, message: 'Loại hoàn cảnh không hợp lệ' });
    }

    const student = await Student.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['school_id'] }]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên' });
    }

    // UNI_ADMIN chỉ cập nhật sinh viên trường mình
    if (req.user.role === 'UNI_ADMIN' && student.user.school_id !== req.user.school_id) {
      return res.status(403).json({ success: false, message: 'Không có quyền cập nhật sinh viên này' });
    }

    await student.update({ poor_cert_type });

    res.json({ success: true, message: 'Cập nhật hoàn cảnh thành công', data: student });
  } catch (error) {
    console.error('Update circumstance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo sinh viên mới
const createStudent = async (req, res) => {
  try {
    const { student_code, full_name, email, class_id, gpa, drr, poor_cert_type } = req.body;

    // Validate
    if (!student_code || !full_name || !email) {
      return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
    }

    // Kiểm tra trùng mã sinh viên
    const existingStudent = await Student.findOne({ where: { student_code } });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: 'Mã sinh viên đã tồn tại' });
    }

    // Kiểm tra trùng email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email đã tồn tại' });
    }

    // Tạo user account
    const user = await User.create({
      school_id: req.user.school_id,
      username: student_code,
      email,
      password_hash: await hashPassword('123456'),
      role: 'STUDENT',
      full_name,
      status: 'ACTIVE'
    });

    // Tạo student profile
    const student = await Student.create({
      user_id: user.id,
      student_code,
      full_name,
      class_id: class_id || null,
      gpa: gpa || 0,
      drr: drr || 0,
      poor_cert_type: poor_cert_type || 'NONE'
    });

    res.status(201).json({ success: true, message: 'Thêm sinh viên thành công', data: student });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật sinh viên
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, class_id, gpa, drr, poor_cert_type } = req.body;

    const student = await Student.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'school_id'] }]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên' });
    }

    // UNI_ADMIN chỉ cập nhật sinh viên trường mình
    if (req.user.role === 'UNI_ADMIN' && student.user.school_id !== req.user.school_id) {
      return res.status(403).json({ success: false, message: 'Không có quyền cập nhật sinh viên này' });
    }

    await student.update({
      full_name: full_name || student.full_name,
      class_id: class_id || student.class_id,
      gpa: gpa !== undefined ? gpa : student.gpa,
      drr: drr !== undefined ? drr : student.drr,
      poor_cert_type: poor_cert_type || student.poor_cert_type
    });

    // Cập nhật full_name trong User nếu có
    if (full_name && student.user) {
      await User.update({ full_name }, { where: { id: student.user.id } });
    }

    res.json({ success: true, message: 'Cập nhật sinh viên thành công', data: student });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa sinh viên
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'school_id'] }]
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sinh viên' });
    }

    // UNI_ADMIN chỉ xóa sinh viên trường mình
    if (req.user.role === 'UNI_ADMIN' && student.user.school_id !== req.user.school_id) {
      return res.status(403).json({ success: false, message: 'Không có quyền xóa sinh viên này' });
    }

    const userId = student.user_id;

    // Xóa student trước
    await student.destroy();

    // Xóa user account
    if (userId) {
      await User.destroy({ where: { id: userId } });
    }

    res.json({ success: true, message: 'Xóa sinh viên thành công' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getClasses,
  getStudents,
  getStudentById,
  updateCircumstance,
  createStudent,
  updateStudent,
  deleteStudent
};