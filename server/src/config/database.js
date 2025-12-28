const { Sequelize } = require('sequelize');
require('dotenv').config();

// Khởi tạo Sequelize instance với connection pooling để tối ưu performance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Chỉ log query khi dev
    pool: {
      max: 10,        // Tối đa 10 connections đồng thời
      min: 0,
      acquire: 30000, // Timeout 30s khi lấy connection
      idle: 10000     // Đóng connection sau 10s không dùng
    },
    timezone: '+07:00', // Múi giờ Việt Nam
    define: {
      timestamps: false,      // Tắt createdAt/updatedAt tự động vì đã có trong schema
      underscored: false,     // Giữ camelCase cho field names
      freezeTableName: true   // Không tự động pluralize tên bảng
    }
  }
);

// Test connection - Hàm async để xử lý lỗi rõ ràng
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error.message);
    process.exit(1); // Dừng server nếu không kết nối được DB
  }
};

module.exports = { sequelize, testConnection };
