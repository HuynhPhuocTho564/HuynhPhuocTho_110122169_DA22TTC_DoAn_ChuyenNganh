const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Sponsor model - thông tin nhà tài trợ
const Sponsor = sequelize.define('sponsors', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  company_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  contact_person: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  contact_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  contact_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  mission: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: false,
  tableName: 'sponsors'
});

module.exports = Sponsor;
