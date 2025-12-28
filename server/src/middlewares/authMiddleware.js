const { verifyToken } = require('../utils/helper');
const { User } = require('../models');
const { errorResponse } = require('../utils/responseHelper');

/**
 * Middleware xác thực JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Vui lòng đăng nhập để tiếp tục', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
    }

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'school_id', 'username', 'email', 'role', 'status', 'created_at']
    });

    if (!user || user.status !== 'ACTIVE') {
      return errorResponse(res, 'Tài khoản không tồn tại hoặc đã bị khóa', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return errorResponse(res, 'Lỗi xác thực', 500);
  }
};

/**
 * Middleware kiểm tra quyền (Role-based Access Control)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res, 
        `Chức năng này yêu cầu quyền: ${allowedRoles.join(' hoặc ')}`, 
        403
      );
    }
    next();
  };
};

/**
 * Middleware kiểm tra user thuộc cùng trường (Multi-tenant isolation)
 */
const checkSchoolAccess = (req, res, next) => {
  const { school_id } = req.user;
  
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (!school_id) {
    return errorResponse(res, 'Tài khoản chưa được gán trường', 403);
  }

  req.schoolId = school_id;
  next();
};

/**
 * Optional authentication - không bắt buộc đăng nhập
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (decoded) {
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password_hash'] }
      });

      req.user = (user && user.status === 'ACTIVE') ? user : null;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = { authenticate, authorize, checkSchoolAccess, optionalAuth };
