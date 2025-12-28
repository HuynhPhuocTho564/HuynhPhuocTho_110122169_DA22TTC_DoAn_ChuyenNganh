const { Scholarship, School } = require('../models');

/**
 * Cập nhật thời gian học bổng TVU cho đúng thực tế
 * - HK1: Tháng 9 - Tháng 1 năm sau
 * - academic_year: YYYY-YYYY+1 format
 */
const updateTVUScholarshipDates = async () => {
  try {
    console.log('🔄 Cập nhật thời gian học bổng TVU...\n');

    const tvuSchool = await School.findOne({ where: { code: 'TVU' } });
    if (!tvuSchool) {
      console.log('❌ Không tìm thấy trường TVU');
      return;
    }

    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    
    // Thời gian thực tế cho HK1: Tháng 9 - Tháng 1 năm sau
    const hk1StartDate = new Date(currentYear, 8, 1);  // 01/09/2025
    const hk1EndDate = new Date(currentYear + 1, 0, 31);  // 31/01/2026

    // Cập nhật tất cả học bổng TVU năm hiện tại
    const [updatedCount] = await Scholarship.update(
      {
        academic_year: academicYear,
        start_date: hk1StartDate,
        end_date: hk1EndDate
      },
      {
        where: {
          school_id: tvuSchool.id,
          academic_year: currentYear.toString() // Chỉ cập nhật những cái có năm sai
        }
      }
    );

    console.log(`✅ Đã cập nhật ${updatedCount} học bổng TVU`);
    console.log(`   - Năm học: ${academicYear}`);
    console.log(`   - Thời gian: ${hk1StartDate.toLocaleDateString('vi-VN')} - ${hk1EndDate.toLocaleDateString('vi-VN')}`);

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
};

if (require.main === module) {
  updateTVUScholarshipDates()
    .then(() => {
      console.log('\n✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = updateTVUScholarshipDates;
