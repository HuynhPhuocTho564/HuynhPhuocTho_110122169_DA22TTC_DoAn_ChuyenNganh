/**
 * Script fix các học bổng có tên "HB undefined"
 */
const { Scholarship, Fund, School } = require('../models');

async function fixUndefinedScholarships() {
  try {
    console.log('🔍 Tìm và fix các học bổng có tên "HB undefined"...\n');

    // Tìm các học bổng có tên chứa "undefined"
    const badScholarships = await Scholarship.findAll({
      where: {
        name: {
          [require('sequelize').Op.like]: '%undefined%'
        }
      },
      include: [
        { model: Fund, as: 'fund' },
        { model: School, as: 'school' }
      ]
    });

    console.log(`Tìm thấy ${badScholarships.length} học bổng cần fix:\n`);

    for (const schol of badScholarships) {
      console.log(`❌ ID ${schol.id}: "${schol.name}"`);
      console.log(`   Fund: ${schol.fund?.name || 'N/A'}`);
      console.log(`   School: ${schol.school?.code || 'N/A'}`);
      
      // Tạo tên mới dựa trên fund name
      if (schol.fund?.name) {
        // Lấy type từ tên cũ (Xuất sắc, Vượt khó, etc.)
        let typeName = '';
        if (schol.name.includes('Xuất sắc')) typeName = 'Xuất sắc';
        else if (schol.name.includes('Vượt khó')) typeName = 'Vượt khó';
        else if (schol.name.includes('Đặc biệt')) typeName = 'Đặc biệt';
        
        const schoolCode = schol.school?.code || '';
        const year = schol.academic_year || '2025';
        
        // Tạo tên mới: "HB Tiếp sức đến trường - Xuất sắc CTU 2025"
        const newName = `HB ${schol.fund.name} - ${typeName} ${schoolCode} ${year}`;
        
        await schol.update({ name: newName });
        console.log(`   ✅ Đã fix thành: "${newName}"\n`);
      }
    }

    console.log('✅ Hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  }
}

fixUndefinedScholarships();
