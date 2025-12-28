const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');

const app = express();

// ============ MIDDLEWARES ============
// CORS - Cho phép frontend gọi API
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON body (giới hạn 10MB để tránh DoS attack)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploaded documents)
app.use('/uploads', express.static('uploads'));

// ============ ROUTES ============
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Scholarship Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// Test students classes endpoint (debug)
app.get('/api/students-classes-test', (req, res) => {
  res.json({ success: true, message: 'Direct route works!' });
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');
const universityRoutes = require('./routes/universityRoutes');
const importRoutes = require('./routes/importRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const studentRoutes = require('./routes/studentRoutes');
console.log('✅ All routes loaded');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/stats', statisticsRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/import', importRoutes);
app.use('/api/sponsor', sponsorRoutes);
app.use('/api/students', studentRoutes);
console.log('✅ /api/students route mounted');

// ============ ERROR HANDLER ============
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Endpoint not found' 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============ START SERVER ============
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test DB connection trước khi start
    await testConnection();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
