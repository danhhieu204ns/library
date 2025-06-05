const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  role_name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Admin', 'CTV', 'DocGia']
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const userStatusSchema = new mongoose.Schema({
  status_name: {
    type: String,
    required: true,
    unique: true,
    enum: ['Active', 'Inactive', 'Banned']
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password_hash: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  full_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'CTV', 'DocGia'],
    default: 'DocGia'
  },
  registration_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Inactive', 'Banned'],
    default: 'Active'
  },
  phone_number: {
    type: String,
    trim: true,
    maxlength: 20
  },
  address: {
    type: String,
    trim: true
  },
  // Additional roles for flexibility
  additional_roles: [{
    type: String,
    enum: ['Admin', 'CTV', 'DocGia']
  }]
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ username: 1, email: 1 });
userSchema.index({ role: 1, status: 1 });

const Role = mongoose.model('Role', roleSchema);
const UserStatus = mongoose.model('UserStatus', userStatusSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Role, UserStatus, User };
