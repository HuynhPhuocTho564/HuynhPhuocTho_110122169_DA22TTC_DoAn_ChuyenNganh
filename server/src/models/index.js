// Import tất cả models
const User = require('./User');
const School = require('./School');
const Faculty = require('./Faculty');
const Major = require('./Major');
const Class = require('./Class');
const Student = require('./Student');
const Sponsor = require('./Sponsor');
const Fund = require('./Fund');
const Scholarship = require('./Scholarship');
const Application = require('./Application');
const ApplicationDocument = require('./ApplicationDocument');
const StudentDocument = require('./StudentDocument');
const Notification = require('./Notification');
const ActivityLog = require('./ActivityLog');
const AuditLog = require('./AuditLog');

// ============ ĐỊNH NGHĨA RELATIONSHIPS ============
// Nguyên tắc: hasMany (1-N), belongsTo (N-1), belongsToMany (N-N)

// School relationships
School.hasMany(User, { foreignKey: 'school_id', as: 'users' });
School.hasMany(Faculty, { foreignKey: 'school_id', as: 'faculties' });
School.hasMany(Scholarship, { foreignKey: 'school_id', as: 'scholarships' });

// User relationships
User.belongsTo(School, { foreignKey: 'school_id', as: 'school' });
User.hasOne(Student, { foreignKey: 'user_id', as: 'studentProfile' });
User.hasOne(Sponsor, { foreignKey: 'user_id', as: 'sponsorProfile' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// Faculty -> Major -> Class hierarchy
Faculty.belongsTo(School, { foreignKey: 'school_id', as: 'school' });
Faculty.hasMany(Major, { foreignKey: 'faculty_id', as: 'majors' });

Major.belongsTo(Faculty, { foreignKey: 'faculty_id', as: 'faculty' });
Major.hasMany(Class, { foreignKey: 'major_id', as: 'classes' });

Class.belongsTo(Major, { foreignKey: 'major_id', as: 'major' });
Class.hasMany(Student, { foreignKey: 'class_id', as: 'students' });

// Student relationships
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Student.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Student.hasMany(Application, { foreignKey: 'student_id', as: 'applications' });
Student.hasMany(StudentDocument, { foreignKey: 'student_id', as: 'documents' });

// StudentDocument relationships
StudentDocument.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

// Sponsor relationships
Sponsor.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Sponsor.hasMany(Fund, { foreignKey: 'sponsor_id', as: 'funds' });

// Fund relationships
Fund.belongsTo(Sponsor, { foreignKey: 'sponsor_id', as: 'sponsor' });
Fund.belongsTo(School, { foreignKey: 'school_id', as: 'school' });
Fund.hasMany(Scholarship, { foreignKey: 'fund_id', as: 'scholarships' });

// Scholarship relationships
Scholarship.belongsTo(School, { foreignKey: 'school_id', as: 'school' });
Scholarship.belongsTo(Fund, { foreignKey: 'fund_id', as: 'fund' });
Scholarship.hasMany(Application, { foreignKey: 'scholarship_id', as: 'applications' });

// Application relationships (CORE LOGIC)
Application.belongsTo(Scholarship, { foreignKey: 'scholarship_id', as: 'scholarship' });
Application.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Application.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
Application.hasMany(ApplicationDocument, { foreignKey: 'application_id', as: 'documents' });

// ApplicationDocument relationships
ApplicationDocument.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });

// Notification relationships
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ActivityLog relationships
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// AuditLog relationships
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Export tất cả models
module.exports = {
  User,
  School,
  Faculty,
  Major,
  Class,
  Student,
  Sponsor,
  Fund,
  Scholarship,
  Application,
  ApplicationDocument,
  StudentDocument,
  Notification,
  ActivityLog,
  AuditLog
};
