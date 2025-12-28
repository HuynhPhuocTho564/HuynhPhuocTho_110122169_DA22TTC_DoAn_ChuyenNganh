const { Student, User, Class, Major, Faculty, School } = require('./src/models');

async function testStudents() {
  try {
    // Count students
    const totalStudents = await Student.count();
    console.log('Total students in Student table:', totalStudents);

    // Count users with STUDENT role
    const totalStudentUsers = await User.count({ where: { role: 'STUDENT' } });
    console.log('Total users with STUDENT role:', totalStudentUsers);

    // Check students with user
    const studentsWithUser = await Student.findAll({
      include: [{
        model: User,
        as: 'user',
        where: { role: 'STUDENT' },
        required: true
      }],
      limit: 5
    });
    console.log('\nStudents with user (first 5):');
    studentsWithUser.forEach(s => {
      console.log(`  - ${s.student_code}: ${s.full_name}, user_id=${s.user_id}, school_id=${s.user?.school_id}`);
    });

    // Check students without user
    const studentsWithoutUser = await Student.findAll({
      include: [{
        model: User,
        as: 'user',
        required: false
      }],
      limit: 5
    });
    console.log('\nStudents (first 5, user optional):');
    studentsWithoutUser.forEach(s => {
      console.log(`  - ${s.student_code}: ${s.full_name}, user_id=${s.user_id}, has_user=${!!s.user}`);
    });

    // Check User school_id distribution
    const usersWithSchool = await User.count({ where: { role: 'STUDENT', school_id: { [require('sequelize').Op.ne]: null } } });
    const usersWithoutSchool = await User.count({ where: { role: 'STUDENT', school_id: null } });
    console.log('\nStudent users with school_id:', usersWithSchool);
    console.log('Student users without school_id:', usersWithoutSchool);

    // Test the exact query SUPER_ADMIN would use
    console.log('\n=== Testing SUPER_ADMIN query ===');
    const { count, rows } = await Student.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          where: { role: 'STUDENT' },
          attributes: ['id', 'email', 'status', 'school_id'],
          required: true
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name'],
          required: false
        }
      ],
      limit: 10,
      order: [['student_code', 'ASC']]
    });
    console.log('SUPER_ADMIN query result count:', count);
    console.log('First 10 students:');
    rows.forEach(s => {
      console.log(`  - ${s.student_code}: ${s.full_name}, email=${s.user?.email}, school_id=${s.user?.school_id}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

testStudents();
