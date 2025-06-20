const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userRole: {
    type: String,
    required: true,
    enum: ['Admin', 'CTV', 'DocGia']
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  endpoint: {
    type: String,
    required: true
  },
  success: {
    type: Boolean,
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
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
  }
}, {
  timestamps: true
});

// Index for better query performance
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ success: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
