// Quick test script to check database
const { Scholarship, School } = require('./src/models');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test Scholarship count
    const scholarshipCount = await Scholarship.count();
    console.log(`📚 Scholarships in database: ${scholarshipCount}`);

    // Test School count
    const schoolCount = await School.count();
    console.log(`🏫 Schools in database: ${schoolCount}`);

    if (scholarshipCount === 0) {
      console.log('\n⚠️  No scholarships found! Please run: npm run seed');
    }

    if (schoolCount === 0) {
      console.log('\n⚠️  No schools found! Please run: npm run seed');
    }

    // Try to fetch scholarships
    console.log('\n🔍 Fetching scholarships...');
    const scholarships = await Scholarship.findAll({
      limit: 5,
      include: [
        {
          model: School,
          as: 'school',
          required: false
        }
      ]
    });

    console.log(`✅ Found ${scholarships.length} scholarships`);
    
    if (scholarships.length > 0) {
      console.log('\n📋 Sample scholarship:');
      console.log(JSON.stringify(scholarships[0].toJSON(), null, 2));
    }

    console.log('\n✅ Database test completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database test failed:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testDatabase();
