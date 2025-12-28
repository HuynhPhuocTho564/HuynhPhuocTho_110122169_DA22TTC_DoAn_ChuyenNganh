const { Student, User, School, Class, Major, Faculty } = require('./src/models');

async function test() {
  try {
    const { count, rows } = await Student.findAndCountAll({
      include: [
        {
          model: User,
          as: 'user',
          where: { role: 'STUDENT' },
          attributes: ['id', 'email', 'status', 'school_id'],
          required: true,
          include: [
            {
              model: School,
              as: 'school',
              attributes: ['id', 'name', 'code'],
              required: false
            }
          ]
        }
      ],
      limit: 3
    });

    console.log('Count:', count);
    rows.forEach(s => {
      console.log(`Student: ${s.student_code}`);
      console.log(`  user.id: ${s.user?.id}`);
      console.log(`  user.email: ${s.user?.email}`);
      console.log(`  user.school_id: ${s.user?.school_id}`);
      console.log(`  user.school: ${JSON.stringify(s.user?.school)}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

test();
