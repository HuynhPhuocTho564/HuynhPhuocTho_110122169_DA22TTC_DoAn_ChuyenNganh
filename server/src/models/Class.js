const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Class = sequelize.define('classes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  major_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100)
  }
});

module.exports = Class;
