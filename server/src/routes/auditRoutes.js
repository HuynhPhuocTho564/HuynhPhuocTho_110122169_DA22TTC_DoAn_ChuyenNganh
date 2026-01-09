const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { AuditLog, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { Op } = require('sequelize');

// GET /api/audit-logs - Lấy danh sách audit logs (SUPER_ADMIN only)
router.get('/', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      action, 
      entity_type, 
      user_id,
      username,
      from_date,
      to_date,
      search
    } = req.query;

    const whereClause = {};

    // Filter theo action
    if (action) {
      whereClause.action = action;
    }

    // Filter theo entity_type
    if (entity_type) {
      whereClause.entity_type = entity_type;
    }

    // Filter theo user_id
    if (user_id) {
      whereClause.user_id = user_id;
    }

    // Filter theo username
    if (username) {
      whereClause.username = { [Op.like]: `%${username}%` };
    }

    // Filter theo khoảng thời gian
    if (from_date || to_date) {
      whereClause.created_at = {};
      if (from_date) {
        whereClause.created_at[Op.gte] = new Date(from_date);
      }
      if (to_date) {
        whereClause.created_at[Op.lte] = new Date(to_date + 'T23:59:59');
      }
    }

    // Search trong description hoặc entity_name
    if (search) {
      whereClause[Op.or] = [
        { description: { [Op.like]: `%${search}%` } },
        { entity_name: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    return successResponse(res, {
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    return errorResponse(res, error.message, 500);
  }
});

// GET /api/audit-logs/stats - Thống kê audit logs
router.get('/stats', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  try {
    const { from_date, to_date } = req.query;
    
    const whereClause = {};
    if (from_date || to_date) {
      whereClause.created_at = {};
      if (from_date) whereClause.created_at[Op.gte] = new Date(from_date);
      if (to_date) whereClause.created_at[Op.lte] = new Date(to_date + 'T23:59:59');
    }

    // Đếm theo action
    const actionStats = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        'action',
        [AuditLog.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['action'],
      raw: true
    });

    // Đếm theo entity_type
    const entityStats = await AuditLog.findAll({
      where: whereClause,
      attributes: [
        'entity_type',
        [AuditLog.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['entity_type'],
      raw: true
    });

    // Top users có nhiều hoạt động nhất
    const topUsers = await AuditLog.findAll({
      where: { ...whereClause, user_id: { [Op.ne]: null } },
      attributes: [
        'user_id',
        'username',
        [AuditLog.sequelize.fn('COUNT', '*'), 'count']
      ],
      group: ['user_id', 'username'],
      order: [[AuditLog.sequelize.fn('COUNT', '*'), 'DESC']],
      limit: 10,
      raw: true
    });

    return successResponse(res, {
      actionStats,
      entityStats,
      topUsers
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
});

// GET /api/audit-logs/actions - Lấy danh sách các action types
router.get('/actions', authenticate, authorize('SUPER_ADMIN'), async (req, res) => {
  const actions = [
    { value: 'LOGIN', label: 'Đăng nhập', icon: '🔑' },
    { value: 'LOGOUT', label: 'Đăng xuất', icon: '🚪' },
    { value: 'LOGIN_FAILED', label: 'Đăng nhập thất bại', icon: '❌' },
    { value: 'CREATE', label: 'Tạo mới', icon: '➕' },
    { value: 'UPDATE', label: 'Cập nhật', icon: '✏️' },
    { value: 'DELETE', label: 'Xóa', icon: '🗑️' },
    { value: 'APPROVE', label: 'Duyệt hồ sơ', icon: '✅' },
    { value: 'REJECT', label: 'Từ chối hồ sơ', icon: '❌' },
    { value: 'DISBURSE', label: 'Giải ngân', icon: '💰' },
    { value: 'IMPORT', label: 'Import dữ liệu', icon: '📥' },
    { value: 'EXPORT', label: 'Xuất báo cáo', icon: '📤' },
    { value: 'CHANGE_PASSWORD', label: 'Đổi mật khẩu', icon: '🔒' }
  ];
  return successResponse(res, actions);
});

module.exports = router;
