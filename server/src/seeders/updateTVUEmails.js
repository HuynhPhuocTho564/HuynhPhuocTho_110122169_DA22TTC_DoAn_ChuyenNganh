const { User, School } = require('../models');

/**
 * Cập nhật email sinh viên TVU từ @tvu.edu.vn sang @st.tvu.edu.vn
 */
const updateTVUEmails = async () => {
  try {
    console.log('🔄 Bắt đầu cập nhật email sinh viên TVU...\n');

    // Tìm trường TVU
    const tvuSchool = await School.findOne({ where: { code: 'TVU' } });
    if (!tvuSchool) {
      console.log('❌ Không tìm thấy trường TVU!');
      return;
    }

    // Tìm tất cả sinh viên TVU có email cũ
    const students = await User.findAll({
      where: {
        school_id: tvuSchool.id,
        role: 'STUDENT'
      }
    });

    let updatedCount = 0;
    for (const student of students) {
      if (student.email && student.email.endsWith('@tvu.edu.vn')) {
        const newEmail = student.email.replace('@tvu.edu.vn', '@st.tvu.edu.vn');
        await student.update({ email: newEmail });
        console.log(`✅ ${student.username}: ${student.email} -> ${newEmail}`);
        updatedCount++;
      } else if (student.email && student.email.endsWith('@st.tvu.edu.vn')) {
        console.log(`ℹ️ ${student.username}: Email đã đúng format (${student.email})`);
      }
    }

    console.log(`\n🎉 Đã cập nhật ${updatedCount} email sinh viên TVU!`);

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
};

// Chạy script
if (require.main === module) {
  updateTVUEmails()
    .then(() => {
      console.log('\n✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = updateTVUEmails;
