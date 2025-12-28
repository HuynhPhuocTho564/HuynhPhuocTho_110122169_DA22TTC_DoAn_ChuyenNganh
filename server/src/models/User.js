const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  school_id: {
    type: DataTypes.INTEGER,
    allowNull: true // NULL cho Super Admin
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true // Sequelize tự validate email format
    }
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('SUPER_ADMIN', 'UNI_ADMIN', 'STUDENT', 'SPONSOR'),
    allowNull: false
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

module.exports = User;
