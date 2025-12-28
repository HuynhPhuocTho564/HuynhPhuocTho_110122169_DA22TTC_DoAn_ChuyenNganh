const { sequelize } = require('../config/database');

/**
 * Cập nhật bảng sponsors:
 * - Thêm: contact_email, contact_phone, address, mission, description
 * - Xóa: website (không dùng nữa)
 */
const updateSponsorColumns = async () => {
  try {
    console.log('🔄 Cập nhật bảng sponsors...\n');

    // 1. Thêm các cột mới
    const columnsToAdd = [
      { name: 'contact_email', type: 'VARCHAR(255)' },
      { name: 'contact_phone', type: 'VARCHAR(20)' },
      { name: 'address', type: 'VARCHAR(500)' },
      { name: 'mission', type: 'TEXT' },
      { name: 'description', type: 'TEXT' }
    ];

    console.log('📥 Thêm các cột mới...');
    for (const col of columnsToAdd) {
      try {
        await sequelize.query(`ALTER TABLE sponsors ADD COLUMN ${col.name} ${col.type}`);
        console.log(`  ✅ Đã thêm: ${col.name}`);
      } catch (err) {
        if (err.original?.code === 'ER_DUP_FIELDNAME') {
          console.log(`  ℹ️ ${col.name} đã tồn tại`);
        } else {
          throw err;
        }
      }
    }

    // 2. Xóa cột website (không dùng nữa)
    console.log('\n🗑️ Xóa cột không dùng...');
    try {
      await sequelize.query(`ALTER TABLE sponsors DROP COLUMN website`);
      console.log('  ✅ Đã xóa: website');
    } catch (err) {
      if (err.original?.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('  ℹ️ website đã được xóa trước đó');
      } else {
        console.log('  ⚠️ Không thể xóa website:', err.message);
      }
    }

    console.log('\n✅ Hoàn tất cập nhật bảng sponsors!');
    console.log('\nCấu trúc mới:');
    console.log('  - id, user_id, company_name, contact_person');
    console.log('  - contact_email, contact_phone, address');
    console.log('  - mission, description');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
};

if (require.main === module) {
  updateSponsorColumns()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = updateSponsorColumns;
