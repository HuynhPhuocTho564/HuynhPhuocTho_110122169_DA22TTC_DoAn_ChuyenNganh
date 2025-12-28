const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('students', {
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
  class_id: {
    type: DataTypes.INTEGER
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  student_code: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  dob: {
    type: DataTypes.DATEONLY
  },
  gender: {
    type: DataTypes.ENUM('MALE', 'FEMALE', 'OTHER')
  },
  gpa: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 4
    }
  },
  drr: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  poor_cert_type: {
    type: DataTypes.ENUM('NONE', 'POOR', 'NEAR_POOR', 'DISABILITY', 'ORPHAN_BOTH', 'ORPHAN_ONE'),
    defaultValue: 'NONE'
  },
  bank_number: {
    type: DataTypes.STRING(50)
  },
  bank_name: {
    type: DataTypes.STRING(100)
  },
  phone: {
    type: DataTypes.STRING(15)
  },
  address: {
    type: DataTypes.STRING(255)
  },
  id_number: {
    type: DataTypes.STRING(12)
  }
}, {
  timestamps: false,
  tableName: 'students'
});

module.exports = Student;
