const { School, Scholarship, Sponsor, User, Fund } = require('../models');

/**
 * Thêm học bổng "Tiếp sức đến trường" cho TVU
 * Sử dụng nhà tài trợ đã có: Báo Tuổi Trẻ - Tiếp sức đến trường
 */
const addTiepSucTVU = async () => {
  try {
    console.log('🌱 Thêm học bổng Tiếp sức đến trường cho TVU...\n');

    // 1. Tìm trường TVU
    const tvuSchool = await School.findOne({ where: { code: 'TVU' } });
    if (!tvuSchool) {
      console.log('❌ Không tìm thấy trường TVU');
      return;
    }

    // 2. Tìm admin TVU
    const tvuAdmin = await User.findOne({ 
      where: { school_id: tvuSchool.id, role: 'UNI_ADMIN' } 
    });
    if (!tvuAdmin) {
      console.log('❌ Không tìm thấy admin TVU');
      return;
    }

    // 3. Tìm nhà tài trợ "Tiếp sức đến trường"
    const sponsor = await Sponsor.findOne({ 
      where: { company_name: 'Báo Tuổi Trẻ - Tiếp sức đến trường' },
      include: [{ model: User, as: 'user' }]
    });
    if (!sponsor) {
      console.log('❌ Không tìm thấy nhà tài trợ Tiếp sức đến trường');
      return;
    }
    console.log('✅ Tìm thấy nhà tài trợ:', sponsor.company_name);

    // 4. Tạo Fund cho TVU
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    
    let fund = await Fund.findOne({
      where: { 
        sponsor_id: sponsor.id,
        school_id: tvuSchool.id,
        name: `Tiếp sức đến trường - TVU ${currentYear}`
      }
    });

    if (!fund) {
      fund = await Fund.create({
        sponsor_id: sponsor.id,
        school_id: tvuSchool.id,
        name: `Tiếp sức đến trường - TVU ${currentYear}`,
        amount: 300000000, // 300 triệu
        fiscal_year: academicYear
      });
      console.log('✅ Đã tạo quỹ:', fund.name);
    } else {
      console.log('ℹ️ Quỹ đã tồn tại:', fund.name);
    }

    // 5. Tạo học bổng
    const scholarshipData = {
      name: `Học bổng Tiếp sức đến trường TVU ${academicYear}`,
      description: `Học bổng "Tiếp sức đến trường" do Báo Tuổi Trẻ phối hợp tổ chức, dành cho tân sinh viên có hoàn cảnh khó khăn tại Đại học Trà Vinh.

Đây là chương trình học bổng lớn nhất Việt Nam, đã hỗ trợ hàng chục ngàn sinh viên nghèo vượt khó trên cả nước từ năm 2003 đến nay.

Điều kiện:
- Tân sinh viên năm nhất
- Có hoàn cảnh gia đình khó khăn (hộ nghèo, cận nghèo, mồ côi)
- Điểm thi đại học đạt từ điểm chuẩn trở lên
- Có tinh thần vượt khó, nghị lực trong học tập`,
      amount_per_slot: 15000000, // 15 triệu/suất
      slots: 20,
      criteria_json: {
        min_gpa: 2.0,
        require_poor: true,
        poor_types: ['POOR', 'NEAR_POOR', 'ORPHAN_BOTH', 'ORPHAN_ONE'],
        freshman_only: true
      }
    };

    const existing = await Scholarship.findOne({
      where: { school_id: tvuSchool.id, name: scholarshipData.name }
    });

    if (!existing) {
      const hk1StartDate = new Date(currentYear, 8, 1);  // 01/09
      const hk1EndDate = new Date(currentYear + 1, 0, 31);  // 31/01

      await Scholarship.create({
        school_id: tvuSchool.id,
        fund_id: fund.id,
        name: scholarshipData.name,
        description: scholarshipData.description,
        semester: 'HK1',
        academic_year: academicYear,
        amount_per_slot: scholarshipData.amount_per_slot,
        slots: scholarshipData.slots,
        start_date: hk1StartDate,
        end_date: hk1EndDate,
        status: 'OPEN',
        criteria_json: scholarshipData.criteria_json,
        created_by: tvuAdmin.id
      });
      console.log('✅ Đã tạo học bổng:', scholarshipData.name);
    } else {
      console.log('ℹ️ Học bổng đã tồn tại:', scholarshipData.name);
    }

    console.log('\n🎉 Hoàn tất!');
    console.log('Nhà tài trợ "Tiếp sức đến trường" giờ tài trợ cho: CTU, HUST, HCMUAF, TVU');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
};

if (require.main === module) {
  addTiepSucTVU()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = addTiepSucTVU;
