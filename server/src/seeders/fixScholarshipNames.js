/**
 * Script kiểm tra và fix các học bổng có name undefined/null
 */
const { Scholarship, Fund, School } = require('../models');

async function fixScholarshipNames() {
  try {
    console.log('🔍 Kiểm tra học bổng có name undefined/null...\n');

    // Lấy tất cả học bổng
    const scholarships = await Scholarship.findAll({
      include: [
        { model: Fund, as: 'fund' },
        { model: School, as: 'school' }
      ]
    });

    let fixedCount = 0;

    for (const schol of scholarships) {
      if (!schol.name || schol.name === 'undefined' || schol.name === 'null') {
        console.log(`❌ Học bổng ID ${schol.id}: name = "${schol.name}"`);
        console.log(`   Fund: ${schol.fund?.name || 'N/A'}`);
        console.log(`   School: ${schol.school?.name || 'N/A'}`);
        console.log(`   Type: ${schol.type || 'N/A'}`);
        console.log('');
        
        // Tạo tên mới dựa trên fund và type
        if (schol.fund?.name && schol.type) {
          const typeMap = {
            'MERIT': 'Xuất sắc',
            'NEED': 'Vượt khó',
            'SPECIAL': 'Đặc biệt'
          };
          const typeName = typeMap[schol.type] || schol.type;
          const schoolCode = schol.school?.code || '';
          const year = schol.academic_year || '2025';
          
          const newName = `${schol.fund.name} - ${typeName} ${schoolCode} ${year}`;
          
          await schol.update({ name: newName });
          console.log(`   ✅ Đã fix thành: "${newName}"`);
          fixedCount++;
        }
      }
    }

    console.log(`\n📊 Tổng kết:`);
    console.log(`   - Tổng học bổng: ${scholarships.length}`);
    console.log(`   - Đã fix: ${fixedCount}`);

    // Hiển thị danh sách học bổng sau khi fix
    console.log('\n📋 Danh sách học bổng hiện tại:');
    const updated = await Scholarship.findAll({
      include: [{ model: School, as: 'school' }],
      order: [['id', 'ASC']]
    });
    
    updated.forEach(s => {
      console.log(`   ${s.id}. ${s.name} (${s.school?.code || 'N/A'})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

fixScholarshipNames();
