const express = require('express');
const router = express.Router();
const { Schedule, ShiftType, ScheduleStatus } = require('../models/Schedule');
const { User } = require('../models/User');
const { auth, isStaff, isAdmin } = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');

// Get schedules with filtering and pagination
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('user_id').optional().isMongoId().withMessage('Invalid user ID'),
  query('status').optional().isIn(['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled']).withMessage('Invalid status'),
  query('date_from').optional().isISO8601().withMessage('Invalid date format'),
  query('date_to').optional().isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { user_id, status, date_from, date_to } = req.query;
    const filter = {};

    // Role-based filtering
    if (!['Admin', 'CTV'].includes(req.user.role)) {
      // Regular users can only see their own schedules
      filter.user = req.user._id;
    } else if (user_id) {
      filter.user = user_id;
    }

    if (status) filter.status = status;
    
    // Date range filtering
    if (date_from || date_to) {
      filter.shift_date = {};
      if (date_from) filter.shift_date.$gte = new Date(date_from);
      if (date_to) filter.shift_date.$lte = new Date(date_to);
    }

    const schedules = await Schedule.find(filter)
      .populate('user', 'username full_name email')
      .populate('shift_type', 'shift_name start_time end_time')
      .populate('approved_by', 'username full_name')
      .sort({ shift_date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Schedule.countDocuments(filter);

    res.json({
      success: true,
      data: schedules,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_records: total,
        per_page: limit
      }
    });

  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get shift types
router.get('/meta/shift-types', auth, isStaff, async (req, res) => {
  try {
    const shiftTypes = await ShiftType.find().sort({ shift_name: 1 });
    res.json({
      success: true,
      data: { shift_types: shiftTypes }
    });
  } catch (error) {
    console.error('Get shift types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
