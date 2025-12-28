const { User, School, Faculty, Major, Class, Student } = require('../models');
const { hashPassword } = require('../utils/helper');

// Danh sách họ và tên Việt Nam
const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương'];
const middleNames = ['Văn', 'Thị', 'Hữu', 'Đức', 'Minh', 'Anh', 'Quốc', 'Thanh', 'Tuấn', 'Hoàng', 'Phương', 'Thu', 'Hà', 'Mai'];
const firstNames = ['An', 'Bình', 'Cường', 'Dũng', 'Hùng', 'Khoa', 'Long', 'Nam', 'Phong', 'Quân', 'Sơn', 'Tài', 'Tuấn', 'Vinh', 'Hà', 'Hương', 'Lan', 'Linh', 'Mai', 'Nga', 'Nhung', 'Phương', 'Thảo', 'Trang', 'Vy'];

// Generate random Vietnamese name
const generateName = () => {
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  return `${lastName} ${middleName} ${firstName}`;
};

// Generate student code (format: B + year + number)
const generateStudentCode = (year, index) => {
  return `B${year}${String(index).padStart(4, '0')}`;
};

// Generate random GPA (2.0 - 4.0)
const generateGPA = () => {
  return (Math.random() * 2 + 2).toFixed(2);
};

// Generate random DRR (50 - 100)
const generateDRR = () => {
  return Math.floor(Math.random() * 51 + 50);
};

// Danh sách khoa theo trường
const facultiesBySchool = {
  'VNU': ['Khoa Công nghệ', 'Khoa Kinh tế', 'Khoa Khoa học Tự nhiên', 'Khoa Xã hội Nhân văn'],
  'HUST': ['Khoa Điện - Điện tử', 'Khoa Cơ khí', 'Khoa Công nghệ Thông tin', 'Khoa Hóa - Sinh học'],
  'VNU-HCM': ['Khoa Công nghệ Thông tin', 'Khoa Sinh học', 'Khoa Vật lý', 'Khoa Hóa học'],
  'CTU': ['Khoa Công nghệ Thông tin & Truyền thông', 'Khoa Nông nghiệp', 'Khoa Kinh tế', 'Khoa Sư phạm'],
  'HU': ['Khoa Y Dược', 'Khoa Sư phạm', 'Khoa Khoa học', 'Khoa Kinh tế'],
  'UD': ['Khoa Công nghệ', 'Khoa Kinh tế', 'Khoa Ngoại ngữ', 'Khoa Sư phạm'],
  'NEU': ['Khoa Kinh tế Chính trị', 'Khoa Quản trị Kinh doanh', 'Khoa Kế toán', 'Khoa Tài chính'],
  'FTU': ['Khoa Kinh doanh Quốc tế', 'Khoa Ngoại ngữ', 'Khoa Kinh tế', 'Khoa Luật Quốc tế'],
  'HMU': ['Khoa Y khoa', 'Khoa Dược', 'Khoa Răng Hàm Mặt', 'Khoa Y tế Công cộng'],
  'HNUE': ['Khoa Toán - Tin', 'Khoa Vật lý', 'Khoa Hóa học', 'Khoa Sinh học'],
  'UET': ['Khoa Công nghệ Thông tin', 'Khoa Điện tử Viễn thông', 'Khoa Khoa học Máy tính', 'Khoa Mạng'],
  'HUS': ['Khoa Toán - Cơ - Tin học', 'Khoa Vật lý', 'Khoa Hóa học', 'Khoa Sinh học'],
  'USSH': ['Khoa Triết học', 'Khoa Lịch sử', 'Khoa Văn học', 'Khoa Xã hội học'],
  'HCMUAF': ['Khoa Nông học', 'Khoa Lâm nghiệp', 'Khoa Công nghệ Sinh học', 'Khoa Môi trường'],
  'TDTU': ['Khoa Công nghệ Thông tin', 'Khoa Điện - Điện tử', 'Khoa Cơ khí', 'Khoa Xây dựng']
};

// Danh sách ngành theo khoa
const majorsByFaculty = {
  'Khoa Công nghệ': ['Công nghệ Thông tin', 'Khoa học Máy tính', 'Kỹ thuật Phần mềm'],
  'Khoa Công nghệ Thông tin': ['Công nghệ Thông tin', 'Khoa học Máy tính', 'An toàn Thông tin'],
  'Khoa Công nghệ Thông tin & Truyền thông': ['Công nghệ Thông tin', 'Mạng máy tính', 'Hệ thống Thông tin'],
  'Khoa Kinh tế': ['Kinh tế', 'Quản trị Kinh doanh', 'Tài chính Ngân hàng'],
  'Khoa Điện - Điện tử': ['Kỹ thuật Điện', 'Điện tử Viễn thông', 'Tự động hóa'],
  'Khoa Cơ khí': ['Kỹ thuật Cơ khí', 'Cơ điện tử', 'Kỹ thuật Ô tô'],
  'Khoa Y khoa': ['Y khoa', 'Y học Dự phòng', 'Y học Cổ truyền'],
  'Khoa Nông nghiệp': ['Nông học', 'Khoa học Cây trồng', 'Bảo vệ Thực vật'],
  'Khoa Sư phạm': ['Sư phạm Toán', 'Sư phạm Lý', 'Sư phạm Hóa'],
  'Khoa Khoa học Tự nhiên': ['Toán học', 'Vật lý', 'Hóa học', 'Sinh học'],
  'Khoa Xã hội Nhân văn': ['Triết học', 'Lịch sử', 'Văn học', 'Xã hội học']
};

const seedStudentData = async () => {
  try {
    console.log('🎓 Bắt đầu tạo dữ liệu sinh viên...\n');

    // Lấy tất cả các trường
    const schools = await School.findAll();
    
    if (schools.length === 0) {
      console.log('⚠️  Không tìm thấy trường nào. Vui lòng chạy seed:real trước!');
      return;
    }

    let totalStudents = 0;
    const currentYear = new Date().getFullYear();

    for (const school of schools) {
      console.log(`\n📚 Tạo dữ liệu cho ${school.name} (${school.code})...`);

      // Lấy danh sách khoa cho trường này
      const facultyNames = facultiesBySchool[school.code] || ['Khoa Công nghệ', 'Khoa Kinh tế'];

      for (const facultyName of facultyNames) {
        // Tạo khoa
        const faculty = await Faculty.create({
          school_id: school.id,
          name: facultyName,
          code: facultyName.replace(/Khoa /g, '').replace(/ /g, '').toUpperCase().substring(0, 5)
        });

        // Lấy danh sách ngành cho khoa này
        const majorNames = majorsByFaculty[facultyName] || ['Công nghệ Thông tin'];

        for (const majorName of majorNames) {
          // Tạo ngành
          const major = await Major.create({
            faculty_id: faculty.id,
            name: majorName,
            code: majorName.replace(/ /g, '').toUpperCase().substring(0, 5)
          });

          // Tạo 2-3 lớp cho mỗi ngành (các khóa khác nhau)
          const numClasses = Math.floor(Math.random() * 2) + 2; // 2-3 lớp
          
          for (let classIndex = 0; classIndex < numClasses; classIndex++) {
            const classYear = currentYear - classIndex - 1; // K46, K47, K48
            const classCode = `${school.code}${classYear % 100}${major.code.substring(0, 3)}`;
            
            // Tạo lớp
            const classRoom = await Class.create({
              major_id: major.id,
              code: classCode,
              name: `${majorName} K${classYear % 100}`,
              academic_year: classYear.toString()
            });

            // Tạo 5-10 sinh viên cho mỗi lớp
            const numStudents = Math.floor(Math.random() * 6) + 5; // 5-10 sinh viên
            
            for (let i = 0; i < numStudents; i++) {
              const studentCode = generateStudentCode(classYear, totalStudents + i + 1);
              const fullName = generateName();
              const gpa = parseFloat(generateGPA());
              const drr = generateDRR();
              const isPoor = Math.random() < 0.3; // 30% sinh viên nghèo
              
              // Tạo email với domain của trường
              const emailDomain = school.email.split('@')[1];
              const emailPrefix = studentCode.toLowerCase();
              const email = `${emailPrefix}@${emailDomain}`;

              // Tạo user account
              const user = await User.create({
                school_id: school.id,
                username: studentCode,
                email: email,
                password_hash: await hashPassword('123456'),
                role: 'STUDENT',
                full_name: fullName,
                phone: `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
                date_of_birth: new Date(2000 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                gender: Math.random() > 0.5 ? 'MALE' : 'FEMALE',
                address: `${school.address.split(',')[school.address.split(',').length - 1].trim()}`,
                gpa: gpa,
                drr: drr,
                is_poor: isPoor,
                status: 'ACTIVE'
              });

              totalStudents++;
            }

            console.log(`  ✅ Lớp ${classRoom.code}: ${numStudents} sinh viên`);
          }
        }
      }

      console.log(`✅ Hoàn thành ${school.code}`);
    }

    console.log(`\n🎉 Tạo thành công ${totalStudents} sinh viên!\n`);
    console.log('📋 Thông tin đăng nhập sinh viên:');
    console.log('┌─────────────────────────────────────────┐');
    console.log('│ Tất cả sinh viên:                       │');
    console.log('│   Username: Mã sinh viên (VD: B2020001)│');
    console.log('│   Password: 123456                      │');
    console.log('│   Email: [mã_sv]@[domain_trường]       │');
    console.log('└─────────────────────────────────────────┘\n');

    // Hiển thị một số sinh viên mẫu
    const sampleStudents = await User.findAll({
      where: { role: 'STUDENT' },
      limit: 10,
      attributes: ['username', 'email', 'full_name', 'gpa', 'drr', 'is_poor']
    });

    console.log('📝 Một số sinh viên mẫu:');
    sampleStudents.forEach((student, index) => {
      console.log(`${index + 1}. ${student.username} - ${student.full_name}`);
      console.log(`   Email: ${student.email}`);
      console.log(`   GPA: ${student.gpa} | DRR: ${student.drr} | Hộ nghèo: ${student.is_poor ? 'Có' : 'Không'}\n`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu sinh viên:', error);
    throw error;
  }
};

// Chạy seed
if (require.main === module) {
  seedStudentData()
    .then(() => {
      console.log('✅ Hoàn tất!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Thất bại:', error);
      process.exit(1);
    });
}

module.exports = seedStudentData;
