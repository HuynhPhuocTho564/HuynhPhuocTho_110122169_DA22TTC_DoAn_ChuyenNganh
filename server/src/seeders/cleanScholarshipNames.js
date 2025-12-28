/**
 * Script xóa mã trường và năm khỏi tên học bổng
 * VD: "HB Tiếp sức đến trường - CTU 2024 - Xuất sắc CTU 2025-2026" 
 *  -> "HB Tiếp sức đến trường - Xuất sắc"
 */
const { Scholarship, School } = require('../models');

async function cleanScholarshipNames() {
  try {
    console.log('🔧 Làm sạch tên học bổng...\n');

    const scholarships = await Scholarship.findAll({
      include: [{ model: School, as: 'school' }]
    });

    let updatedCount = 0;

    for (const schol of scholarships) {
      let newName = schol.name;
      
      // Xóa các pattern: "CTU 2025", "CTU 2025-2026", "HUST 2024", etc.
      // Pattern: mã trường (2-10 ký tự chữ) + năm (4 số hoặc 4-4 số)
      newName = newName.replace(/\s+(CTU|HUST|HCMUT|HCMUAF|TVU|VNU|UEH)\s+\d{4}(-\d{4})?/gi, '');
      
      // Xóa pattern: "- CTU 2024 -" thành "-"
      newName = newName.replace(/\s*-\s*-\s*/g, ' - ');
      
      // Xóa khoảng trắng thừa
      newName = newName.replace(/\s+/g, ' ').trim();
      
      // Xóa dấu "-" ở cuối nếu có
      newName = newName.replace(/\s*-\s*$/, '');
      
      if (newName !== schol.name) {
        console.log(`📝 ID ${schol.id}:`);
        console.log(`   Cũ: "${schol.name}"`);
        console.log(`   Mới: "${newName}"`);
        
        await schol.update({ name: newName });
        updatedCount++;
      }
    }

    console.log(`\n✅ Đã cập nhật ${updatedCount}/${scholarships.length} học bổng`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

cleanScholarshipNames();
