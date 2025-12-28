const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Scholarship = sequelize.define('scholarships', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  school_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fund_id: {
    type: DataTypes.INTEGER
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  semester: {
    type: DataTypes.STRING(20)
  },
  academic_year: {
    type: DataTypes.STRING(20)
  },
  amount_per_slot: {
    type: DataTypes.DECIMAL(15, 0),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  slots: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  criteria_json: {
    type: DataTypes.JSON // Lưu tiêu chí động: {min_gpa: 3.0, require_poor: true}
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'CLOSED', 'FINISHED'),
    defaultValue: 'OPEN'
  },
  created_by: {
    type: DataTypes.INTEGER,
    comment: 'ID của admin tạo học bổng'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Scholarship;
