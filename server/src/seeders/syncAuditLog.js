/**
 * Script để tạo bảng audit_logs
 * Chạy: node src/seeders/syncAuditLog.js
 */
require('dotenv').config();
const { sequelize } = require('../config/database');
const AuditLog = require('../models/AuditLog');

const syncAuditLog = async () => {
  try {
    console.log('🔄 Syncing AuditLog table...');
    
    // Sync chỉ bảng AuditLog (force: false để không xóa dữ liệu cũ nếu có)
    await AuditLog.sync({ alter: true });
    
    console.log('✅ AuditLog table synced successfully!');
    
    // Kiểm tra bảng đã tạo
    const [results] = await sequelize.query('DESCRIBE audit_logs');
    console.log('\n📋 Table structure:');
    results.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing AuditLog:', error.message);
    process.exit(1);
  }
};

syncAuditLog();
