const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Faculty = sequelize.define('faculties', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  school_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
});

module.exports = Faculty;
