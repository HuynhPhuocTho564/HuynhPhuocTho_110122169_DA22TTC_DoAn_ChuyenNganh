const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ActivityLog = sequelize.define('activity_logs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  school_id: {
    type: DataTypes.INTEGER
  },
  user_id: {
    type: DataTypes.INTEGER
  },
  action: {
    type: DataTypes.STRING(50)
  },
  target_id: {
    type: DataTypes.INTEGER
  },
  details: {
    type: DataTypes.JSON // Lưu chi tiết thay đổi
  },
  ip_address: {
    type: DataTypes.STRING(45)
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = ActivityLog;
