const authService = require('../services/authService');
const { User, School, Student, StudentDocument } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { isValidEmail, isStrongPassword } = require('../utils/validation');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// POST /api/users/create-uni-admin - Tạo tài khoản UNI_ADMIN (Chỉ SUPER_ADMIN)
const createUniAdmin = async (req, res) => {
  try {
    const { username, email, password, school_id } = req.body;

    // Validation
    if (!username || !email || !password || !school_id) {
      return errorResponse(res, 'Vui lòng nhập đầy đủ thông tin');
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, 'Email không hợp lệ');
    }

    if (!isStrongPassword(password)) {
      return errorResponse(res, 'Mật khẩu phải có ít nhất 6 ký tự');
    }

    const newAdmin = await authService.createUniAdmin(req.body);

    return successResponse(res, newAdmin, 'Tạo tài khoản cán bộ thành công', 201);
  } catch (error) {
    console.error('Create uni admin error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// GET /api/users - Lấy danh sách users (SUPER_ADMIN xem tất cả, UNI_ADMIN xem trong trường)
const getUsers = async (req, res) => {
  try {
    const { role, school_id } = req.user;
    const { page = 1, limit = 20, search, roleFilter } = req.query;

    const whereClause = {};

    // UNI_ADMIN chỉ xem users trong trường mình
    if (role === 'UNI_ADMIN') {
      whereClause.school_id = school_id;
    }

    // Filter theo role nếu có
    if (roleFilter) {
      whereClause.role = roleFilter;
    }

    // Search theo username hoặc email
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: School,
          as: 'school',
          attributes: ['id', 'name', 'code']
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    return successResponse(res, {
      users: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/users/sponsors - Lấy danh sách nhà tài trợ (SUPER_ADMIN only)
const getSponsors = async (req, res) => {
  try {
    const { Sponsor } = require('../models');
    
    const sponsors = await User.findAll({
      where: { role: 'SPONSOR' },
      attributes: { exclude: ['password_hash'] },
      include: [
        {
          model: Sponsor,
          as: 'sponsorProfile',
          attributes: ['id', 'company_name', 'contact_person', 'contact_email', 'contact_phone']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Format data
    const formattedSponsors = sponsors.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      status: user.status,
      is_active: user.status === 'ACTIVE',
      organization_name: user.sponsorProfile?.company_name || '',
      contact_person: user.sponsorProfile?.contact_person || '',
      contact_email: user.sponsorProfile?.contact_email || '',
      contact_phone: user.sponsorProfile?.contact_phone || '',
      created_at: user.created_at
    }));

    return successResponse(res, formattedSponsors);
  } catch (error) {
    console.error('Get sponsors error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// PUT /api/users/:id/status - Khóa/Mở khóa tài khoản
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'LOCKED'].includes(status)) {
      return errorResponse(res, 'Trạng thái không hợp lệ');
    }

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'Không tìm thấy người dùng', 404);
    }

    // UNI_ADMIN chỉ được khóa user trong trường mình
    if (req.user.role === 'UNI_ADMIN' && user.school_id !== req.user.school_id) {
      return errorResponse(res, 'Bạn không có quyền thực hiện thao tác này', 403);
    }

    await user.update({ status });

    return successResponse(res, null, `${status === 'LOCKED' ? 'Khóa' : 'Mở khóa'} tài khoản thành công`);
  } catch (error) {
    console.error('Update user status error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/users/:id/reset-password - Reset mật khẩu về mặc định (SUPER_ADMIN only)
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { hashPassword } = require('../utils/helper');

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'Không tìm thấy người dùng', 404);
    }

    // Reset về mật khẩu mặc định: 123456
    const defaultPassword = '123456';
    const password_hash = await hashPassword(defaultPassword);
    await user.update({ password_hash });

    return successResponse(res, null, 'Đã reset mật khẩu về 123456');
  } catch (error) {
    console.error('Reset password error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// PUT /api/users/profile - Cập nhật profile của user hiện tại
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address, bank_name, bank_number } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return errorResponse(res, 'Không tìm thấy người dùng', 404);
    }

    // Nếu là STUDENT, cập nhật cả student profile
    if (user.role === 'STUDENT') {
      const { Student } = require('../models');
      const student = await Student.findOne({ where: { user_id: userId } });
      
      if (student) {
        await student.update({
          full_name: full_name || student.full_name,
          phone: phone || student.phone,
          address: address || student.address,
          bank_name: bank_name || student.bank_name,
          bank_number: bank_number || student.bank_number,
        });
      }
    }

    // Cập nhật user nếu có full_name
    if (full_name) {
      await user.update({ full_name });
    }

    return successResponse(res, null, 'Cập nhật thông tin thành công');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// GET /api/users/my-documents - Lấy danh sách documents của sinh viên
const getMyDocuments = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return errorResponse(res, 'Không tìm thấy thông tin sinh viên', 404);
    }

    const documents = await StudentDocument.findAll({
      where: { student_id: student.id },
      order: [['created_at', 'DESC']]
    });

    return successResponse(res, documents);
  } catch (error) {
    console.error('Get my documents error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// POST /api/users/my-documents - Upload document
const uploadMyDocument = async (req, res) => {
  try {
    const { type = 'KHAC' } = req.body;

    if (!req.file) {
      return errorResponse(res, 'Vui lòng chọn file');
    }

    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return errorResponse(res, 'Không tìm thấy thông tin sinh viên', 404);
    }

    // Validate file
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return errorResponse(res, 'Chỉ chấp nhận file PDF, JPG, PNG');
    }

    if (req.file.size > maxSize) {
      return errorResponse(res, 'File không được vượt quá 5MB');
    }

    const document = await StudentDocument.create({
      student_id: student.id,
      file_name: req.file.originalname,
      file_url: `/uploads/documents/${req.file.filename}`,
      type
    });

    return successResponse(res, document, 'Upload thành công');
  } catch (error) {
    console.error('Upload document error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// DELETE /api/users/my-documents/:id - Xóa document
const deleteMyDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return errorResponse(res, 'Không tìm thấy thông tin sinh viên', 404);
    }

    const document = await StudentDocument.findOne({
      where: { id, student_id: student.id }
    });

    if (!document) {
      return errorResponse(res, 'Không tìm thấy file', 404);
    }

    // Xóa file vật lý
    const filePath = path.join(__dirname, '../../', document.file_url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await document.destroy();

    return successResponse(res, null, 'Đã xóa file');
  } catch (error) {
    console.error('Delete document error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  createUniAdmin,
  getUsers,
  getSponsors,
  updateUserStatus,
  resetPassword,
  updateProfile,
  getMyDocuments,
  uploadMyDocument,
  deleteMyDocument
};
