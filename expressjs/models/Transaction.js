const mongoose = require('mongoose');

const borrowingStatusSchema = new mongoose.Schema({
  status_name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Borrowed', 'Returned', 'Overdue', 'Lost', 'Damaged']
  },
  description: {
    type: String,
    trim: true
  }
});

const borrowingSchema = new mongoose.Schema({
  copy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Copy',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  borrow_date: {
    type: Date,
    default: Date.now,
    required: true
  },
  due_date: {
    type: Date,
    required: true
  },
  return_date: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: ['Borrowed', 'Returned', 'Overdue', 'Lost', 'Damaged'],
    default: 'Borrowed'
  },
  fine_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  handled_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const reservationStatusSchema = new mongoose.Schema({
  status_name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Pending', 'Ready', 'Cancelled', 'Fulfilled', 'Expired']
  },
  description: {
    type: String,
    trim: true
  }
});

const reservationSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reservation_date: {
    type: Date,
    default: Date.now,
    required: true
  },
  expiry_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Ready', 'Cancelled', 'Fulfilled', 'Expired'],
    default: 'Pending'
  },
  assigned_copy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Copy'
  },
  handled_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  queue_position: {
    type: Number,
    min: 1
  },
  notification_sent: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
borrowingSchema.index({ user: 1, status: 1 });
borrowingSchema.index({ copy: 1, status: 1 });
borrowingSchema.index({ due_date: 1, status: 1 });
borrowingSchema.index({ borrow_date: 1 });

reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ book: 1, status: 1 });
reservationSchema.index({ queue_position: 1, status: 1 });
reservationSchema.index({ expiry_date: 1, status: 1 });

const BorrowingStatus = mongoose.model('BorrowingStatus', borrowingStatusSchema);
const Borrowing = mongoose.model('Borrowing', borrowingSchema);
const ReservationStatus = mongoose.model('ReservationStatus', reservationStatusSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = {
  BorrowingStatus,
  Borrowing,
  ReservationStatus,
  Reservation
};
