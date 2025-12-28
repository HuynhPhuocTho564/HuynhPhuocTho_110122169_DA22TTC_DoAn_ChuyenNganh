const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ApplicationDocument = sequelize.define('application_documents', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  application_id: {
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
    type: DataTypes.ENUM('HO_NGHEO', 'BANG_DIEM', 'KHAC'),
    defaultValue: 'KHAC'
  }
});

module.exports = ApplicationDocument;
