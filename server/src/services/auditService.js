const AuditLog = require('../models/AuditLog');

/**
 * Ghi log hành động vào database
 */
const logAction = async ({
  userId,
  username,
  userRole,
  schoolId,
  action,
  entityType,
  entityId,
  entityName,
  oldValues = null,
  newValues = null,
  description,
  ipAddress,
  userAgent
}) => {
  try {
    await AuditLog.create({
      user_id: userId,
      username,
      user_role: userRole,
      school_id: schoolId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      old_values: oldValues,
      new_values: newValues,
      description,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (error) {
    // Không throw error để không ảnh hưởng flow chính
    console.error('Audit log error:', error.message);
  }
};

/**
 * Helper để lấy IP và User Agent từ request
 */
const getRequestInfo = (req) => {
  return {
    ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress,
    userAgent: req.headers['user-agent']?.substring(0, 500)
  };
};

/**
 * Log đăng nhập thành công
 */
const logLogin = async (req, user) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  await logAction({
    userId: user.id,
    username: user.username,
    userRole: user.role,
    schoolId: user.school_id,
    action: 'LOGIN',
    entityType: 'user',
    entityId: user.id,
    entityName: user.username,
    description: `Đăng nhập thành công`,
    ipAddress,
    userAgent
  });
};

/**
 * Log đăng nhập thất bại
 */
const logLoginFailed = async (req, username, reason) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  await logAction({
    username,
    action: 'LOGIN_FAILED',
    entityType: 'user',
    entityName: username,
    description: `Đăng nhập thất bại: ${reason}`,
    ipAddress,
    userAgent
  });
};

/**
 * Log tạo mới
 */
const logCreate = async (req, entityType, entity, entityName) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const user = req.user || {};
  await logAction({
    userId: user.id,
    username: user.username,
    userRole: user.role,
    schoolId: user.school_id,
    action: 'CREATE',
    entityType,
    entityId: entity.id,
    entityName,
    newValues: entity.toJSON ? entity.toJSON() : entity,
    description: `Tạo mới ${entityType}: ${entityName}`,
    ipAddress,
    userAgent
  });
};

/**
 * Log cập nhật
 */
const logUpdate = async (req, entityType, entityId, entityName, oldValues, newValues) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const user = req.user || {};
  await logAction({
    userId: user.id,
    username: user.username,
    userRole: user.role,
    schoolId: user.school_id,
    action: 'UPDATE',
    entityType,
    entityId,
    entityName,
    oldValues,
    newValues,
    description: `Cập nhật ${entityType}: ${entityName}`,
    ipAddress,
    userAgent
  });
};

/**
 * Log xóa
 */
const logDelete = async (req, entityType, entityId, entityName, oldValues) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const user = req.user || {};
  await logAction({
    userId: user.id,
    username: user.username,
    userRole: user.role,
    schoolId: user.school_id,
    action: 'DELETE',
    entityType,
    entityId,
    entityName,
    oldValues,
    description: `Xóa ${entityType}: ${entityName}`,
    ipAddress,
    userAgent
  });
};

/**
 * Log duyệt hồ sơ
 */
const logApprove = async (req, application, scholarshipName, studentName) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const user = req.user || {};
  await logAction({
    userId: user.id,
    username: user.username,
    userRole: user.role,
    schoolId: user.school_id,
    action: 'APPROVE',
    entityType: 'application',
    entityId: application.id,
    entityName: `${studentName} - ${scholarshipName}`,
    description: `Duyệt hồ sơ: ${studentName} cho học bổng ${scholarshipName}`,
    ipAddress,
    userAgent
  });
};

/**
 * Log từ chối hồ sơ
 */
const logReject = async (req, application, scholarshipName, studentName, reason) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const user = req.user || {};
  await logAction({
    userId: user.id,
    username: user.username,
    userRole: user.role,
    schoolId: user.school_id,
    action: 'REJECT',
    entityType: 'application',
    entityId: application.id,
    entityName: `${studentName} - ${scholarshipName}`,
    description: `Từ chối hồ sơ: ${studentName}. Lý do: ${reason}`,
    ipAddress,
    userAgent
  });
};

/**
 * Log xuất báo cáo
 */
const logExport = async (req, reportType, description) => {
  const { ipAddress, userAgent } = getRequestInfo(req);
  const user = req.user || {};
  await logAction({
    userId: user.id,
    username: user.username,
    userRole: user.role,
    schoolId: user.school_id,
    action: 'EXPORT',
    entityType: 'report',
    entityName: reportType,
    description,
    ipAddress,
    userAgent
  });
};

module.exports = {
  logAction,
  logLogin,
  logLoginFailed,
  logCreate,
  logUpdate,
  logDelete,
  logApprove,
  logReject,
  logExport,
  getRequestInfo
};
