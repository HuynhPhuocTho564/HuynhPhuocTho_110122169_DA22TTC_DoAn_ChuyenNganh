const { User, Student, Sponsor, School } = require('../models');
const { hashPassword, comparePassword, generateToken } = require('../utils/helper');
const { Op } = require('sequelize');

/**
 * Service đăng nhập - Hỗ trợ login bằng username hoặc email
 */
const login = async (identifier, password) => {
  const trimmedIdentifier = identifier?.trim();
  
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { username: trimmedIdentifier },
        { email: trimmedIdentifier }
      ]
    },
    include: [{
      model: School,
      as: 'school',
      attributes: ['id', 'name', 'code']
    }]
  });

  if (!user) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
  }

  if (user.status === 'LOCKED') {
    throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên');
  }

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
    school_id: user.school_id
  });

  const userResponse = user.toJSON();
  delete userResponse.password_hash;

  return { user: userResponse, token };
};

/**
 * Service lấy thông tin user hiện tại (Profile)
 */
const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password_hash'] }
  });

  if (!user) {
    throw new Error('Không tìm thấy thông tin người dùng');
  }

  // Lấy school nếu có
  if (user.school_id) {
    const school = await School.findByPk(user.school_id, {
      attributes: ['id', 'name', 'code']
    });
    user.dataValues.school = school;
  }

  // Lấy student profile nếu là STUDENT
  if (user.role === 'STUDENT') {
    const student = await Student.findOne({
      where: { user_id: userId }
    });
    user.dataValues.studentProfile = student;
  }

  // Lấy sponsor profile nếu là SPONSOR
  if (user.role === 'SPONSOR') {
    const sponsor = await Sponsor.findOne({
      where: { user_id: userId },
      attributes: ['id', 'user_id', 'company_name', 'website', 'contact_person']
    });
    user.dataValues.sponsorProfile = sponsor;
  }

  return user;
};

/**
 * Service đổi mật khẩu
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  const isOldPasswordValid = await comparePassword(oldPassword, user.password_hash);
  if (!isOldPasswordValid) {
    throw new Error('Mật khẩu cũ không đúng');
  }

  const newPasswordHash = await hashPassword(newPassword);
  await user.update({ password_hash: newPasswordHash });

  return true;
};

/**
 * Service tạo tài khoản UNI_ADMIN
 */
const createUniAdmin = async (adminData) => {
  const { username, email, password, school_id } = adminData;

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email }]
    }
  });

  if (existingUser) {
    throw new Error('Tên đăng nhập hoặc email đã được sử dụng');
  }

  const school = await School.findByPk(school_id);
  if (!school) {
    throw new Error('Không tìm thấy trường đại học');
  }

  const password_hash = await hashPassword(password);
  const user = await User.create({
    username,
    email,
    password_hash,
    role: 'UNI_ADMIN',
    school_id,
    status: 'ACTIVE'
  });

  const userResponse = user.toJSON();
  delete userResponse.password_hash;

  return userResponse;
};

/**
 * Service đăng ký tài khoản sinh viên
 */
const register = async (studentData) => {
  const { full_name, student_code, email, password, school_id } = studentData;

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        { email },
        { username: student_code }
      ]
    }
  });

  if (existingUser) {
    throw new Error('Email hoặc mã sinh viên đã được sử dụng');
  }

  const school = await School.findByPk(school_id);
  if (!school) {
    throw new Error('Không tìm thấy trường đại học');
  }

  const password_hash = await hashPassword(password);
  const user = await User.create({
    username: student_code,
    email,
    password_hash,
    role: 'STUDENT',
    school_id,
    status: 'ACTIVE'
  });

  await Student.create({
    user_id: user.id,
    student_code,
    full_name
  });

  const userResponse = user.toJSON();
  delete userResponse.password_hash;

  return userResponse;
};

/**
 * Service quên mật khẩu
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });
  // Không tiết lộ email có tồn tại hay không (bảo mật)
  return true;
};

module.exports = {
  login,
  getProfile,
  changePassword,
  createUniAdmin,
  register,
  forgotPassword
};
