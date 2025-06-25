const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { addUserPermissions } = require('./middleware/permissions');
const { initializeRoles } = require('./middleware/rolePermissions');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later.',
//     error: 'Rate limit exceeded'
//   }
// });
// app.use('/api', limiter);

// Middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add audit logging middleware
const { autoAuditLogger } = require('./middleware/auditLog');
app.use(autoAuditLogger);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/community_library')
.then(() => {
  console.log('Connected to MongoDB');
  // Initialize default roles
  initializeRoles();
})
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/books', require('./routes/books'));
app.use('/api/borrowings', require('./routes/borrowings'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/user-roles', require('./routes/userRoles'));
app.use('/api/shift-requests', require('./routes/shiftRequests'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/import', require('./routes/import')); // Chức năng import sách từ Excel

// API Documentation endpoint
app.get('/api/docs', (req, res) => {  res.json({    success: true,
    message: 'Yen Library API v1.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      books: '/api/books',
      borrowings: '/api/borrowings',
      reservations: '/api/reservations',
      schedules: '/api/schedules',      
      reviews: '/api/reviews',
      admin: '/api/admin',
      upload: '/api/upload',
      roles: '/api/roles',
      userRoles: '/api/user-roles',
      import: '/api/import'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: err.message,
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
      error: 'Invalid ObjectId'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value',
      error: 'Resource already exists'
    });
  }
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'Unauthorized'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: 'Unauthorized'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({ 
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    error: 'Not Found',
    requestedPath: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
