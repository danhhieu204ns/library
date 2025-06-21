const mongoose = require('mongoose');

const ShiftRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlot: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  week: {
    type: String,
    required: true
  },
  reason: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add indices for efficient querying
// Index for finding specific user's requests for a specific date and time
ShiftRequestSchema.index({ userId: 1, date: 1, timeSlot: 1 });
// Index for filtering by week and status
ShiftRequestSchema.index({ week: 1, status: 1 });

module.exports = mongoose.model('ShiftRequest', ShiftRequestSchema);
