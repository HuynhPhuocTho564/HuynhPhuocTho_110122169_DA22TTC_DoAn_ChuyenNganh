const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('audit_logs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // null nếu là system action
    comment: 'ID người thực hiện'
  },
  username: {
    type: DataTypes.STRING(100),
    comment: 'Username tại thời điểm thực hiện'
  },
  user_role: {
    type: DataTypes.STRING(50),
    comment: 'Role tại thời điểm thực hiện'
  },
  school_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Trường của người thực hiện'
  },
  action: {
    type: DataTypes.ENUM(
      'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
      'CREATE', 'UPDATE', 'DELETE',
      'APPROVE', 'REJECT', 'DISBURSE',
      'IMPORT', 'EXPORT',
      'CHANGE_PASSWORD', 'RESET_PASSWORD'
    ),
    allowNull: false
  },
  entity_type: {
    type: DataTypes.STRING(50),
    comment: 'Loại đối tượng: scholarship, application, user, student...'
  },
  entity_id: {
    type: DataTypes.INTEGER,
    comment: 'ID của đối tượng bị tác động'
  },
  entity_name: {
    type: DataTypes.STRING(255),
    comment: 'Tên/mô tả đối tượng để dễ đọc'
  },
  old_values: {
    type: DataTypes.JSON,
    comment: 'Giá trị cũ trước khi thay đổi'
  },
  new_values: {
    type: DataTypes.JSON,
    comment: 'Giá trị mới sau khi thay đổi'
  },
  ip_address: {
    type: DataTypes.STRING(50)
  },
  user_agent: {
    type: DataTypes.STRING(500)
  },
  description: {
    type: DataTypes.TEXT,
    comment: 'Mô tả chi tiết hành động'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action'] },
    { fields: ['entity_type'] },
    { fields: ['school_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = AuditLog;
