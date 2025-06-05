const mongoose = require('mongoose');

const shiftTypeSchema = new mongoose.Schema({
  shift_name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    enum: ['Morning', 'Afternoon', 'Evening', 'Full Day']
  },
  start_time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  end_time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const scheduleStatusSchema = new mongoose.Schema({
  status_name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled']
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const scheduleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shift_date: {
    type: Date,
    required: true
  },
  shift_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShiftType',
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  notes: {
    type: String,
    trim: true
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approved_at: {
    type: Date
  },
  // For tracking actual work hours
  check_in_time: {
    type: Date
  },
  check_out_time: {
    type: Date
  },
  actual_hours: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
scheduleSchema.index({ user: 1, shift_date: 1 });
scheduleSchema.index({ shift_date: 1, status: 1 });
scheduleSchema.index({ user: 1, status: 1 });
scheduleSchema.index({ approved_by: 1 });

// Compound index to ensure one shift per user per day per shift type
scheduleSchema.index({ user: 1, shift_date: 1, shift_type: 1 }, { unique: true });

// Virtual for formatted shift date
scheduleSchema.virtual('formatted_date').get(function() {
  return this.shift_date.toLocaleDateString('vi-VN');
});

// Method to calculate actual working hours
scheduleSchema.methods.calculateActualHours = function() {
  if (this.check_in_time && this.check_out_time) {
    const diffMs = this.check_out_time - this.check_in_time;
    this.actual_hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
    return this.actual_hours;
  }
  return 0;
};

const ShiftType = mongoose.model('ShiftType', shiftTypeSchema);
const ScheduleStatus = mongoose.model('ScheduleStatus', scheduleStatusSchema);
const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = {
  ShiftType,
  ScheduleStatus,
  Schedule
};
