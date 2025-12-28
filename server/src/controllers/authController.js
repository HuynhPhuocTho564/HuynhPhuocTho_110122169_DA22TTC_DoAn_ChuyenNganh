const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { isValidEmail, isStrongPassword } = require('../utils/validation');

// POST /api/auth/login - Đăng nhập
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Validation
    if (!identifier || !password) {
      return errorResponse(res, 'Vui lòng nhập đầy đủ thông tin đăng nhập');
    }

    const { user, token } = await authService.login(identifier, password);

    return successResponse(res, { user, token }, 'Đăng nhập thành công');
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, error.message, 401);
  }
};

// GET /api/auth/me - Lấy thông tin user hiện tại
const getMe = async (req, res) => {
  try {
    // req.user đã được gắn bởi authenticate middleware
    const profile = await authService.getProfile(req.user.id);
    
    return successResponse(res, profile, 'Lấy thông tin thành công');
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// PUT /api/auth/change-password - Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return errorResponse(res, 'Vui lòng nhập đầy đủ thông tin');
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 'Mật khẩu mới và xác nhận mật khẩu không khớp');
    }

    if (!isStrongPassword(newPassword)) {
      return errorResponse(res, 'Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    await authService.changePassword(req.user.id, oldPassword, newPassword);

    return successResponse(res, null, 'Đổi mật khẩu thành công');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/auth/register - Đăng ký tài khoản sinh viên
const register = async (req, res) => {
  try {
    const { full_name, student_code, email, password, school_id } = req.body;

    // Validation
    if (!full_name || !student_code || !email || !password || !school_id) {
      return errorResponse(res, 'Vui lòng nhập đầy đủ thông tin');
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, 'Email không hợp lệ');
    }

    if (!isStrongPassword(password)) {
      return errorResponse(res, 'Mật khẩu phải có ít nhất 6 ký tự');
    }

    const user = await authService.register({
      full_name,
      student_code,
      email,
      password,
      school_id
    });

    return successResponse(res, { user }, 'Đăng ký thành công', 201);
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, error.message, 400);
  }
};

// POST /api/auth/forgot-password - Quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 'Vui lòng nhập email');
    }

    if (!isValidEmail(email)) {
      return errorResponse(res, 'Email không hợp lệ');
    }

    await authService.forgotPassword(email);

    return successResponse(res, null, 'Đã gửi email hướng dẫn đặt lại mật khẩu');
  } catch (error) {
    console.error('Forgot password error:', error);
    return errorResponse(res, error.message, 400);
  }
};

module.exports = {
  login,
  getMe,
  changePassword,
  register,
  forgotPassword
};
