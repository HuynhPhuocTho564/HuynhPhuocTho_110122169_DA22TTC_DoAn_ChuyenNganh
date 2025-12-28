const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentDocument = sequelize.define('student_documents', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  file_name: {
    type: DataTypes.STRING(255)
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('BANG_DIEM', 'HO_NGHEO', 'CCCD', 'KHAC'),
    defaultValue: 'KHAC'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = StudentDocument;
