const { Scholarship, Sponsor, User, Fund, School } = require('../models');

/**
 * Liên kết học bổng TVU với các nhà tài trợ tương ứng
 */
const linkScholarshipsToSponsors = async () => {
  try {
    console.log('🔗 Bắt đầu liên kết học bổng với nhà tài trợ...\n');

    // Tìm trường TVU
    const tvuSchool = await School.findOne({ where: { code: 'TVU' } });
    if (!tvuSchool) {
      console.log('❌ Không tìm thấy trường TVU!');
      return;
    }

    // Mapping tên học bổng với username sponsor
    const mappings = [
      { scholarshipKeyword: 'Nguyễn Thiện Thành', sponsorUsername: 'sponsor_nguyenthienthanh' },
      { scholarshipKeyword: 'Quỹ Từ thiện Trí Tuệ', sponsorUsername: 'sponsor_quytuthien' },
      { scholarshipKeyword: 'TS Nguyễn Đồng', sponsorUsername: 'sponsor_nguyendong' },
      { scholarshipKeyword: 'Vòng Tay Thái Bình', sponsorUsername: 'sponsor_vongtaythaibinh' },
      { scholarshipKeyword: 'Chenelière', sponsorUsername: 'sponsor_cheneliere' },
      { scholarshipKeyword: 'WEAV', sponsorUsername: 'sponsor_weav' },
      { scholarshipKeyword: 'Tzu-Chi', sponsorUsername: 'sponsor_tzuchi' },
    ];

    for (const mapping of mappings) {
      // Tìm sponsor
      const sponsorUser = await User.findOne({ where: { username: mapping.sponsorUsername } });
      if (!sponsorUser) {
        console.log(`⚠️ Không tìm thấy sponsor: ${mapping.sponsorUsername}`);
        continue;
      }

      const sponsor = await Sponsor.findOne({ where: { user_id: sponsorUser.id } });
      if (!sponsor) {
        console.log(`⚠️ Không tìm thấy thông tin sponsor cho: ${mapping.sponsorUsername}`);
        continue;
      }

      // Tìm học bổng
      const scholarships = await Scholarship.findAll({
        where: { school_id: tvuSchool.id },
      });

      const matchedScholarship = scholarships.find(s => 
        s.name.includes(mapping.scholarshipKeyword)
      );

      if (!matchedScholarship) {
        console.log(`⚠️ Không tìm thấy học bổng chứa: ${mapping.scholarshipKeyword}`);
        continue;
      }

      // Kiểm tra xem đã có Fund chưa
      let fund = await Fund.findOne({
        where: { sponsor_id: sponsor.id }
      });

      if (!fund) {
        // Tạo Fund mới
        fund = await Fund.create({
          sponsor_id: sponsor.id,
          school_id: tvuSchool.id,
          name: `Quỹ tài trợ ${sponsor.company_name}`,
          amount: matchedScholarship.amount_per_slot * matchedScholarship.slots,
          description: `Quỹ tài trợ học bổng từ ${sponsor.company_name}`
        });
        console.log(`✅ Đã tạo Fund: ${fund.name}`);
      }

      // Cập nhật fund_id cho học bổng
      if (!matchedScholarship.fund_id) {
        await matchedScholarship.update({ fund_id: fund.id });
        console.log(`✅ Đã liên kết: "${matchedScholarship.name}" với "${sponsor.company_name}"`);
      } else {
        console.log(`ℹ️ Học bổng đã được liên kết: ${matchedScholarship.name}`);
      }
    }

    console.log('\n🎉 Hoàn tất liên kết học bổng với nhà tài trợ!');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
};

// Chạy script
if (require.main === module) {
  linkScholarshipsToSponsors()
    .then(() => {
      console.log('\n✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = linkScholarshipsToSponsors;
