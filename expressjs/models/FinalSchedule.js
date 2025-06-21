const mongoose = require('mongoose');

const FinalScheduleSchema = new mongoose.Schema({
  week: {
    type: String,
    required: true,
    unique: true
  },
  shifts: [{
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
    }
  }],
  isFinalized: {
    type: Boolean,
    default: false
  },
  finalizedAt: {
    type: Date
  },
  finalizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

module.exports = mongoose.model('FinalSchedule', FinalScheduleSchema);
