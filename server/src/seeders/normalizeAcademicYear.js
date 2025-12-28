const { sequelize } = require('../config/database');

/**
 * Chuẩn hóa tất cả academic_year về format YYYY-YYYY+1
 * VD: 2022 -> 2022-2023, 2025 -> 2025-2026
 */
const normalizeAcademicYear = async () => {
  try {
    console.log('🔄 Chuẩn hóa năm học về format YYYY-YYYY+1...\n');

    // Lấy danh sách năm học cần chuẩn hóa (chỉ có 4 số)
    const [years] = await sequelize.query(`
      SELECT DISTINCT academic_year 
      FROM scholarships 
      WHERE academic_year REGEXP '^[0-9]{4}$'
    `);

    if (years.length === 0) {
      console.log('✅ Tất cả năm học đã đúng format!');
      return;
    }

    console.log('Các năm cần chuẩn hóa:', years.map(y => y.academic_year).join(', '));

    // Cập nhật từng năm
    for (const row of years) {
      const oldYear = row.academic_year;
      const yearNum = parseInt(oldYear);
      const newYear = `${yearNum}-${yearNum + 1}`;

      const [result] = await sequelize.query(`
        UPDATE scholarships 
        SET academic_year = '${newYear}' 
        WHERE academic_year = '${oldYear}'
      `);

      console.log(`  ✅ ${oldYear} -> ${newYear} (${result.affectedRows} học bổng)`);
    }

    // Kiểm tra kết quả
    const [finalYears] = await sequelize.query(`
      SELECT DISTINCT academic_year FROM scholarships ORDER BY academic_year DESC
    `);

    console.log('\n📋 Danh sách năm học sau khi chuẩn hóa:');
    finalYears.forEach(y => console.log(`  - ${y.academic_year}`));

    console.log('\n✅ Hoàn tất chuẩn hóa năm học!');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
};

if (require.main === module) {
  normalizeAcademicYear()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = normalizeAcademicYear;
