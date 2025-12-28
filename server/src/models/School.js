const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const School = sequelize.define('schools', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  logo_url: {
    type: DataTypes.STRING(500)
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  address: {
    type: DataTypes.STRING(255)
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'LOCKED'),
    defaultValue: 'ACTIVE'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = School;
