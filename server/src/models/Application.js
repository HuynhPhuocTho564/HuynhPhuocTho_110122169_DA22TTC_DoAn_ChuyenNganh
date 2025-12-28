const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('applications', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  scholarship_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'NEED_UPDATE', 'APPROVED', 'REJECTED', 'DISBURSED'),
    defaultValue: 'PENDING'
  },
  system_score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Điểm tự động tính dựa trên GPA + hoàn cảnh'
  },
  snapshot_data: {
    type: DataTypes.JSON,
    comment: 'Lưu cứng dữ liệu SV tại thời điểm nộp để tránh gian lận'
  },
  admin_note: {
    type: DataTypes.TEXT
  },
  reviewed_by: {
    type: DataTypes.INTEGER
  },
  reviewed_at: {
    type: DataTypes.DATE
  },
  submitted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    comment: 'Thời gian cập nhật hồ sơ'
  }
});

module.exports = Application;
