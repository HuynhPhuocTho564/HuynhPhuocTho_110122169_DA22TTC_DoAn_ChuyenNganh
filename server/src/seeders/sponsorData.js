const { sequelize } = require('../config/database');
const { User, School, Sponsor, Fund, Scholarship } = require('../models');
const { hashPassword } = require('../utils/helper');

/**
 * Seed data cho Nhà tài trợ với học bổng ở nhiều trường
 * Chạy: node src/seeders/sponsorData.js
 */
const seedSponsorData = async () => {
  try {
    console.log('🌱 Bắt đầu seed dữ liệu Nhà tài trợ...\n');

    // Lấy danh sách trường hiện có
    const schools = await School.findAll({ where: { status: 'ACTIVE' } });
    if (schools.length < 2) {
      console.log('❌ Cần ít nhất 2 trường trong database. Hãy chạy seed trường trước.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const ctu = schools.find(s => s.code === 'CTU');
    const hust = schools.find(s => s.code === 'HUST');
    const hcmuaf = schools.find(s => s.code === 'HCMUAF');

    // ============ 1. TẠO TÀI KHOẢN SPONSOR ============
    console.log('👤 Tạo/Lấy tài khoản Nhà tài trợ...');

    const sponsorData = [
      { username: 'sponsor_vingroup', email: 'scholarship@vingroup.net', full_name: 'Quỹ Vingroup' },
      { username: 'sponsor_vallet', email: 'vallet@scholarship.org', full_name: 'Quỹ Odon Vallet' },
      { username: 'sponsor_dbscl', email: 'hocbong@dbscl.vn', full_name: 'Quỹ Học bổng ĐBSCL' },
      { username: 'sponsor_tuoitre', email: 'tiepsuc@tuoitre.vn', full_name: 'Báo Tuổi Trẻ' }
    ];

    const sponsorUsers = [];
    for (const data of sponsorData) {
      const [user, created] = await User.findOrCreate({
        where: { username: data.username },
        defaults: {
          school_id: null,
          email: data.email,
          password_hash: await hashPassword('123456'),
          full_name: data.full_name,
          role: 'SPONSOR',
          status: 'ACTIVE'
        }
      });
      sponsorUsers.push(user);
      console.log(`   ${created ? '✅ Tạo mới' : '📌 Đã có'}: ${data.username}`);
    }

    console.log(`✅ Có ${sponsorUsers.length} tài khoản sponsor\n`);

    // ============ 2. TẠO SPONSOR PROFILE ============
    console.log('🏢 Tạo/Lấy hồ sơ Nhà tài trợ...');

    const sponsorProfileData = [
      { user_id: sponsorUsers[0].id, company_name: 'Tập đoàn Vingroup', website: 'https://vingroup.net', contact_person: 'Nguyễn Văn Minh' },
      { user_id: sponsorUsers[1].id, company_name: 'Quỹ học bổng Odon Vallet', website: 'https://vallet.org', contact_person: 'GS. Odon Vallet' },
      { user_id: sponsorUsers[2].id, company_name: 'Quỹ Khuyến học Đồng bằng Sông Cửu Long', website: 'https://dbscl.vn', contact_person: 'Trần Thị Hoa' },
      { user_id: sponsorUsers[3].id, company_name: 'Báo Tuổi Trẻ - Tiếp sức đến trường', website: 'https://tuoitre.vn', contact_person: 'Lê Văn Hùng' }
    ];

    const sponsors = [];
    for (const data of sponsorProfileData) {
      const [sponsor, created] = await Sponsor.findOrCreate({
        where: { user_id: data.user_id },
        defaults: data
      });
      sponsors.push(sponsor);
      console.log(`   ${created ? '✅ Tạo mới' : '📌 Đã có'}: ${data.company_name}`);
    }

    console.log(`✅ Có ${sponsors.length} hồ sơ sponsor\n`);

    // ============ 3. TẠO QUỸ TÀI TRỢ (FUNDS) ============
    console.log('💰 Tạo Quỹ tài trợ...');

    const fundsData = [];

    // Vingroup - Tài trợ cho 3 trường
    if (ctu) {
      fundsData.push({
        sponsor_id: sponsors[0].id,
        school_id: ctu.id,
        name: 'Quỹ Vingroup - CTU 2024',
        amount: 500000000,
        fiscal_year: currentYear.toString()
      });
    }
    if (hust) {
      fundsData.push({
        sponsor_id: sponsors[0].id,
        school_id: hust.id,
        name: 'Quỹ Vingroup - HUST 2024',
        amount: 800000000,
        fiscal_year: currentYear.toString()
      });
    }
    if (hcmuaf) {
      fundsData.push({
        sponsor_id: sponsors[0].id,
        school_id: hcmuaf.id,
        name: 'Quỹ Vingroup - HCMUAF 2024',
        amount: 300000000,
        fiscal_year: currentYear.toString()
      });
    }

    // Vallet - Tài trợ cho 2 trường
    if (ctu) {
      fundsData.push({
        sponsor_id: sponsors[1].id,
        school_id: ctu.id,
        name: 'Quỹ Vallet - CTU 2024',
        amount: 200000000,
        fiscal_year: currentYear.toString()
      });
    }
    if (hust) {
      fundsData.push({
        sponsor_id: sponsors[1].id,
        school_id: hust.id,
        name: 'Quỹ Vallet - HUST 2024',
        amount: 300000000,
        fiscal_year: currentYear.toString()
      });
    }

    // ĐBSCL - Chỉ tài trợ CTU
    if (ctu) {
      fundsData.push({
        sponsor_id: sponsors[2].id,
        school_id: ctu.id,
        name: 'Quỹ Khuyến học ĐBSCL - CTU 2024',
        amount: 150000000,
        fiscal_year: currentYear.toString()
      });
    }

    // Tuổi Trẻ - Tài trợ cho 3 trường
    if (ctu) {
      fundsData.push({
        sponsor_id: sponsors[3].id,
        school_id: ctu.id,
        name: 'Tiếp sức đến trường - CTU 2024',
        amount: 100000000,
        fiscal_year: currentYear.toString()
      });
    }
    if (hust) {
      fundsData.push({
        sponsor_id: sponsors[3].id,
        school_id: hust.id,
        name: 'Tiếp sức đến trường - HUST 2024',
        amount: 100000000,
        fiscal_year: currentYear.toString()
      });
    }
    if (hcmuaf) {
      fundsData.push({
        sponsor_id: sponsors[3].id,
        school_id: hcmuaf.id,
        name: 'Tiếp sức đến trường - HCMUAF 2024',
        amount: 100000000,
        fiscal_year: currentYear.toString()
      });
    }

    const createdFunds = [];
    for (const data of fundsData) {
      const [fund, created] = await Fund.findOrCreate({
        where: { name: data.name },
        defaults: data
      });
      createdFunds.push(fund);
      console.log(`   ${created ? '✅ Tạo mới' : '📌 Đã có'}: ${data.name}`);
    }
    console.log(`✅ Có ${createdFunds.length} quỹ tài trợ\n`);

    // ============ 4. TẠO HỌC BỔNG TỪ CÁC QUỸ ============
    console.log('🎓 Tạo Học bổng từ các quỹ...');

    // Định nghĩa các loại học bổng cho sinh viên khó khăn
    const scholarshipTypes = [
      {
        suffix: 'Nghèo vượt khó',
        amount: 5000000,
        description: 'Học bổng dành cho sinh viên có hoàn cảnh khó khăn, nghèo vượt khó trong học tập.',
        criteria: { min_gpa: 2.0, min_drr: 65, require_poor: true }
      },
      {
        suffix: 'Cận nghèo học giỏi',
        amount: 7000000,
        description: 'Học bổng dành cho sinh viên hộ cận nghèo có thành tích học tập tốt.',
        criteria: { min_gpa: 2.8, min_drr: 75, require_poor: true }
      },
      {
        suffix: 'Mồ côi hiếu học',
        amount: 10000000,
        description: 'Học bổng đặc biệt dành cho sinh viên mồ côi có tinh thần hiếu học.',
        criteria: { min_gpa: 2.5, min_drr: 70, require_poor: true }
      }
    ];

    let scholarshipCount = 0;
    for (const fund of createdFunds) {
      const school = schools.find(s => s.id === fund.school_id);
      const sponsor = sponsors.find(s => s.id === fund.sponsor_id);
      const sponsorName = sponsor.company_name || 'Nhà tài trợ';

      // Tạo nhiều loại học bổng cho mỗi quỹ
      for (const type of scholarshipTypes) {
        const scholarshipName = `HB ${sponsorName} - ${type.suffix} ${school.code} ${currentYear}`;
        
        const [schol, created] = await Scholarship.findOrCreate({
          where: { 
            fund_id: fund.id,
            name: scholarshipName
          },
          defaults: {
            school_id: fund.school_id,
            fund_id: fund.id,
            name: scholarshipName,
            description: `${type.description} Tại ${school.name}, được tài trợ bởi ${sponsorName}.`,
            semester: 'HK1',
            academic_year: currentYear.toString(),
            amount_per_slot: type.amount,
            slots: Math.floor(fund.amount / type.amount / 5), // Chia đều cho các loại
            start_date: new Date(currentYear, 11, 1),  // 1/12/2025
            end_date: new Date(currentYear + 1, 1, 28), // 28/2/2026
            status: 'OPEN',
            criteria_json: type.criteria
          }
        });
        
        if (created) {
          scholarshipCount++;
          console.log(`   ✅ ${scholarshipName}`);
        }
      }
    }

    console.log(`✅ Tạo thêm ${scholarshipCount} học bổng mới\n`);

    // ============ TỔNG KẾT ============
    console.log('🎉 Seed dữ liệu Nhà tài trợ thành công!\n');
    console.log('📋 Thông tin đăng nhập Nhà tài trợ:');
    console.log('┌──────────────────────────────────────────────────┐');
    for (const user of sponsorUsers) {
      console.log(`│   Username: ${user.username.padEnd(34)} │`);
      console.log(`│   Password: 123456                               │`);
      console.log('├──────────────────────────────────────────────────┤');
    }
    console.log('└──────────────────────────────────────────────────┘\n');

    console.log('📊 Tổng kết:');
    console.log(`   - ${sponsorUsers.length} tài khoản nhà tài trợ`);
    console.log(`   - ${createdFunds.length} quỹ tài trợ (nhiều trường)`);
    console.log(`   - ${scholarshipCount} học bổng cho SV khó khăn\n`);

    console.log('🔗 Quan hệ Nhà tài trợ - Trường:');
    console.log('   - Vingroup: CTU, HUST, HCMUAF (3 trường)');
    console.log('   - Vallet: CTU, HUST (2 trường)');
    console.log('   - ĐBSCL: CTU (1 trường)');
    console.log('   - Tuổi Trẻ: CTU, HUST, HCMUAF (3 trường)\n');

  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  }
};

// Chạy seed
if (require.main === module) {
  seedSponsorData()
    .then(() => {
      console.log('✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = seedSponsorData;
