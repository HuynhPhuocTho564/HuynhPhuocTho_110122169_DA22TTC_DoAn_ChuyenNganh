const { Scholarship } = require('../models');

/**
 * Cập nhật ngày học bổng để còn hiệu lực
 * Chạy: node src/seeders/updateScholarshipDates.js
 */
const updateScholarshipDates = async () => {
  try {
    console.log('🔄 Cập nhật ngày học bổng...\n');

    const currentYear = new Date().getFullYear();
    
    // Cập nhật tất cả học bổng có ngày hết hạn đã qua
    const [updatedCount] = await Scholarship.update(
      {
        start_date: new Date(currentYear, 11, 1),  // 1/12/2025
        end_date: new Date(currentYear + 1, 1, 28), // 28/2/2026
        status: 'OPEN'
      },
      {
        where: {
          status: ['OPEN', 'CLOSED']
        }
      }
    );

    console.log(`✅ Đã cập nhật ${updatedCount} học bổng`);
    console.log(`   - Ngày bắt đầu: 01/12/${currentYear}`);
    console.log(`   - Ngày kết thúc: 28/02/${currentYear + 1}`);
    console.log(`   - Trạng thái: OPEN\n`);

    // Hiển thị danh sách học bổng đã cập nhật
    const scholarships = await Scholarship.findAll({
      attributes: ['id', 'name', 'start_date', 'end_date', 'status'],
      order: [['id', 'ASC']]
    });

    console.log('📋 Danh sách học bổng:');
    scholarships.forEach(s => {
      const start = new Date(s.start_date).toLocaleDateString('vi-VN');
      const end = new Date(s.end_date).toLocaleDateString('vi-VN');
      console.log(`   [${s.status}] ${s.name}`);
      console.log(`         ${start} - ${end}`);
    });

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
};

if (require.main === module) {
  updateScholarshipDates()
    .then(() => {
      console.log('\n✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = updateScholarshipDates;
