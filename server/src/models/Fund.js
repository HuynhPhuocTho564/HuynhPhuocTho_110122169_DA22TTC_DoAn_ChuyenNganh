const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Fund = sequelize.define('funds', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sponsor_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  school_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 0),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  fiscal_year: {
    type: DataTypes.STRING(10)
  },
  name: {
    type: DataTypes.STRING(255)
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Fund;
