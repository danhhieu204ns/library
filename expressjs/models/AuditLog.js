const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const auditLogSchema = new mongoose.Schema({
  // User information
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Cho phép null cho system events
    },
    username: String,
    email: String,
    role: {
      type: String,
      enum: ['Admin', 'CTV', 'DocGia']
    }
  },
  // Backwards compatibility
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userRole: {
    type: String,
    enum: ['Admin', 'CTV', 'DocGia']
  },
  action: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ADMIN_ACTION', 'BORROW', 'RETURN', 'RESERVE', 'CANCEL_RESERVATION', 'UPLOAD', 'SHIFT_REQUEST', 'ROLE_CHANGE', 'PERMISSION_CHANGE', 'OTHER',
      'VIEW_USERS', 'IMPORT_BOOKS' // Thêm các action đặc thù
    ]
  },
  // Backwards compatibility
  resource: {
    type: String
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['USER', 'BOOK', 'BORROWING', 'RESERVATION', 'SCHEDULE', 'REVIEW', 'ROLE', 'SHIFT_REQUEST', 'SYSTEM', 'FILE', 'OTHER']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  endpoint: {
    type: String
  },
  description: {
    type: String,
    required: false
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  success: {
    type: Boolean,
    default: true
  },
  statusCode: {
    type: Number
  },
  ip: {
    type: String
  },
  ipAddress: String, // Alias for ip
  userAgent: {
    type: String,
    default: ''
  },
  requestData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  responseMessage: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: null
  },
  duration: {
    type: Number, // milliseconds
    default: 0
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'WARNING', 'INFO'],
    default: 'SUCCESS'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ 'user.userId': 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1 });
auditLogSchema.index({ success: 1, createdAt: -1 });
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ timestamp: -1 });

// Thêm plugin pagination
auditLogSchema.plugin(mongoosePaginate);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
