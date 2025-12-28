const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Major = sequelize.define('majors', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  faculty_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
});

module.exports = Major;
