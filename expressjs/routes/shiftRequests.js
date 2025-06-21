const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissions');
const { PERMISSIONS } = require('../config/permissions');
const ShiftRequest = require('../models/ShiftRequest');
const FinalSchedule = require('../models/FinalSchedule');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to get the week start date (Monday) from any date
const getWeekStartDate = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  // Adjust when day is 0 (Sunday)
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  
  return monday;
};

// Format week string from date: YYYY-MM-DD (Monday of the week)
const formatWeekString = (date) => {
  const monday = getWeekStartDate(date);
  const formattedDate = monday.toISOString().split('T')[0];
  
  return formattedDate;
};

// Helper function to get next week's start and end date
const getNextWeekDates = () => {
  const today = new Date();
  
  // Add 7 days to today to get to next week
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  // Get Monday of next week (start date)
  const startDate = getWeekStartDate(nextWeek);
  
  // Get Sunday of next week (end date) - add 6 days to Monday
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate };
};

// Helper function to check if a date is within next week
const isDateInNextWeek = (date) => {
  const { startDate, endDate } = getNextWeekDates();
  const checkDate = new Date(date);
  
  return checkDate >= startDate && checkDate <= endDate;
};

// Get all shift requests with filters
// GET /api/shift-requests?week=2025-06-16&userId=xxx&status=pending
router.get('/', auth, async (req, res) => {
  try {
    const { week, userId, status, weekStart, weekEnd } = req.query;
    
    // Build query
    const query = {};
    
    // For regular CTV, bypass week filter and just get all their requests
    if (req.user.roles && req.user.roles.includes('CTV') && !req.user.roles.includes('Admin')) {
      query.userId = req.user._id;
      // Only apply status filter if provided, ignore week filter for staff viewing their own requests
      if (status) {
        query.status = status;
      }
    } else {
      // For admin users, apply all filters
      if (week) {
        query.week = week;
      } else if (weekStart && weekEnd) {
        // Alternative date range query using start and end dates
        const startDate = new Date(weekStart);
        const endDate = new Date(weekEnd);
        endDate.setHours(23, 59, 59, 999); // End of day
        
        query.date = { $gte: startDate, $lte: endDate };
      }
      
      if (userId) {
        query.userId = userId;
      }
      
      if (status) {
        query.status = status;
      }
    }
      const requests = await ShiftRequest.find(query)
      .populate('userId', 'full_name email username phone_number')
      .sort({ date: 1, timeSlot: 1 })
      .lean();
    
    res.json({
      success: true,
      data: requests
    });
  } catch (err) {
    console.error('Error fetching shift requests:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching shift requests',
      error: err.message
    });
  }
});

// Create a new shift request
// POST /api/shift-requests
router.post('/', auth, requirePermission(PERMISSIONS.SHIFT_REQUESTS_CREATE), async (req, res) => {
  try {
    const { date, timeSlot } = req.body;
    
    if (!date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Date and timeSlot are required'
      });
    }
    
    // Ensure date is properly formatted
    const parsedDate = new Date(date);
    
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    // Check if the date is in next week
    if (!isDateInNextWeek(parsedDate)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ được đăng ký lịch trực cho tuần kế tiếp'
      });
    }
    
    // Use the parsed date to get the week string to ensure consistency
    const weekString = formatWeekString(parsedDate);
    
    // Create a new Date object for comparison to avoid modifying parsedDate
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Check if the same user has already requested this shift - using simpler query
    const existingRequest = await ShiftRequest.findOne({
      userId: req.user._id,
      timeSlot,
      $or: [
        // Try both date comparison methods to ensure we catch any format issues
        { date: { $gte: startOfDay, $lt: endOfDay } },
        { date: new Date(date) }
      ]
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested this shift'
      });
    }
    
    // Create new request - allow multiple users to register for the same slot
    const shiftRequest = new ShiftRequest({
      userId: req.user._id,
      date: parsedDate,
      timeSlot,
      week: weekString,
      status: 'pending'
    });
    
    await shiftRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Shift request created successfully',
      data: shiftRequest
    });
  } catch (err) {
    console.error('Error creating shift request:', err);
    res.status(500).json({
      success: false,
      message: 'Error creating shift request',
      error: err.message
    });
  }
});

// Approve a shift request
// PUT /api/shift-requests/:id/approve
router.put('/:id/approve', auth, requirePermission(PERMISSIONS.SHIFT_REQUESTS_APPROVE), async (req, res) => {
  try {
    const { id } = req.params;
    
    const shiftRequest = await ShiftRequest.findById(id);
    
    if (!shiftRequest) {
      return res.status(404).json({
        success: false,
        message: 'Shift request not found'
      });
    }
    
    // Check if the date is in next week
    if (!isDateInNextWeek(shiftRequest.date)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ được duyệt lịch trực cho tuần kế tiếp'
      });
    }
    
    if (shiftRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve a request that is already ${shiftRequest.status}`
      });
    }
    
    shiftRequest.status = 'approved';
    shiftRequest.updatedAt = Date.now();
    
    await shiftRequest.save();
    
    res.json({
      success: true,
      message: 'Shift request approved successfully',
      data: shiftRequest
    });
  } catch (err) {
    console.error('Error approving shift request:', err);
    res.status(500).json({
      success: false,
      message: 'Error approving shift request',
      error: err.message
    });
  }
});

// Reject a shift request
// PUT /api/shift-requests/:id/reject
router.put('/:id/reject', auth, requirePermission(PERMISSIONS.SHIFT_REQUESTS_APPROVE), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const shiftRequest = await ShiftRequest.findById(id);
    
    if (!shiftRequest) {
      return res.status(404).json({
        success: false,
        message: 'Shift request not found'
      });
    }
    
    // Check if the date is in next week
    if (!isDateInNextWeek(shiftRequest.date)) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ được xử lý lịch trực cho tuần kế tiếp'
      });
    }
    
    if (shiftRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a request that is already ${shiftRequest.status}`
      });
    }
    
    shiftRequest.status = 'rejected';
    shiftRequest.reason = reason || 'No reason provided';
    shiftRequest.updatedAt = Date.now();
    
    await shiftRequest.save();
    
    res.json({
      success: true,
      message: 'Shift request rejected successfully',
      data: shiftRequest
    });
  } catch (err) {
    console.error('Error rejecting shift request:', err);
    res.status(500).json({
      success: false,
      message: 'Error rejecting shift request',
      error: err.message
    });
  }
});

// Update week for a shift request
// PUT /api/shift-requests/:id/update-week
router.put('/:id/update-week', auth, requirePermission(PERMISSIONS.SHIFT_REQUESTS_MANAGE), async (req, res) => {
  try {
    const { id } = req.params;
    const { week } = req.body;
    
    if (!week) {
      return res.status(400).json({
        success: false,
        message: 'Week parameter is required'
      });
    }
    
    console.log(`Updating week for shift request ${id} to ${week}`);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request ID'
      });
    }
    
    const shiftRequest = await ShiftRequest.findById(id);
    
    if (!shiftRequest) {
      return res.status(404).json({
        success: false,
        message: 'Shift request not found'
      });
    }
    
    // Cập nhật trường week
    const oldWeek = shiftRequest.week;
    shiftRequest.week = week;
    shiftRequest.updatedAt = Date.now();
    
    await shiftRequest.save();
    
    res.json({
      success: true,
      message: `Week updated successfully from ${oldWeek} to ${week}`,
      data: shiftRequest
    });
  } catch (err) {
    console.error('Error updating week for shift request:', err);
    res.status(500).json({
      success: false,
      message: 'Error updating week for shift request: ' + err.message,
      error: err.message
    });
  }
});

// DEBUG ENDPOINT: View all shift requests
// GET /api/shift-requests/view-all
router.get('/view-all', auth, async (req, res) => {
  try {
    // Only allow admin users
    if (!req.user.roles || !req.user.roles.includes('Admin')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Admin access required.'
      });
    }
    
    const totalCount = await ShiftRequest.countDocuments();
    const pendingCount = await ShiftRequest.countDocuments({ status: 'pending' });
    const approvedCount = await ShiftRequest.countDocuments({ status: 'approved' });
    const rejectedCount = await ShiftRequest.countDocuments({ status: 'rejected' });
    
    // Get all weeks in the system
    const distinctWeeks = await ShiftRequest.distinct('week');
      // Get a sample of the most recent requests (limit to 20)
    const recentRequests = await ShiftRequest.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('userId', 'full_name email username phone_number')
      .lean();
    
    // Get all requests for the current week (today)
    const currentWeek = formatWeekString(new Date());
    const currentWeekCount = await ShiftRequest.countDocuments({ week: currentWeek });
    
    // Count requests by week
    const weekCounts = await Promise.all(
      distinctWeeks.map(async (week) => {
        const count = await ShiftRequest.countDocuments({ week });
        return { week, count };
      })
    );
    
    res.json({
      success: true,
      data: {
        totalCount,
        pendingCount,
        approvedCount,
        rejectedCount,
        distinctWeeks,
        currentWeek,
        currentWeekCount,
        weekCounts,
        recentRequests
      }
    });
  } catch (err) {
    console.error('Error viewing all shift requests:', err);
    res.status(500).json({
      success: false,
      message: 'Error viewing all shift requests',
      error: err.message
    });
  }
});

// DEBUG ENDPOINT: Check permissions
// GET /api/shift-requests/check-permissions
router.get('/check-permissions', auth, async (req, res) => {
  try {
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      roles: req.user.roles || []
    };
    
    // Get all permissions for the user
    const permissions = [];
    
    if (req.user.roles) {
      if (req.user.roles.includes('Admin')) {
        permissions.push('Can view all shift requests');
        permissions.push('Can approve/reject shift requests');
        permissions.push('Can finalize schedule');
      }
      
      if (req.user.roles.includes('CTV')) {
        permissions.push('Can create shift requests');
        permissions.push('Can view own shift requests');
      }
    }
    
    res.json({
      success: true,
      data: {
        user,
        permissions,
        hasAdminRole: req.user.roles && req.user.roles.includes('Admin'),
        hasCTVRole: req.user.roles && req.user.roles.includes('CTV')
      }
    });
  } catch (err) {
    console.error('Error checking permissions:', err);
    res.status(500).json({
      success: false,
      message: 'Error checking permissions',
      error: err.message
    });
  }
});

// Clear all shift requests for the current user
// DELETE /api/shift-requests/clear-my-requests
router.delete('/clear-my-requests', auth, async (req, res) => {
  try {
    const result = await ShiftRequest.deleteMany({ userId: req.user._id });
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} shift requests`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error clearing shift requests:', err);
    res.status(500).json({
      success: false,
      message: 'Error clearing shift requests',
      error: err.message
    });
  }
});

// Delete a shift request (CTV can delete their own pending requests)
// DELETE /api/shift-requests/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const shiftRequest = await ShiftRequest.findById(id);
    
    if (!shiftRequest) {
      return res.status(404).json({
        success: false,
        message: 'Shift request not found'
      });
    }
    
    // Check permissions - only owner can delete their pending requests or admin can delete any
    if ((!req.user.roles || !req.user.roles.includes('Admin')) && 
        (shiftRequest.userId.toString() !== req.user._id.toString() || 
         shiftRequest.status !== 'pending')) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this request'
      });
    }
    
    await ShiftRequest.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Shift request deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting shift request:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting shift request',
      error: err.message
    });
  }
});

// DEBUG ENDPOINT: Check week format issues
// GET /api/shift-requests/debug-week?date=2025-06-20
router.get('/debug-week', auth, async (req, res) => {
  try {
    // Only allow admin users to access this endpoint
    if (!req.user.roles || !req.user.roles.includes('Admin')) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Admin access required.'
      });
    }
    
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    // Parse date from query param
    const parsedDate = new Date(date);
    
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }
    
    // Get week using our utility function
    const weekStart = getWeekStartDate(parsedDate);
    const weekString = formatWeekString(parsedDate);
    
    // Check if any shift requests exist with this week string
    const requestsCount = await ShiftRequest.countDocuments({ week: weekString });
    
    // Get all distinct weeks in the database
    const allWeeks = await ShiftRequest.distinct('week');
      // Get some sample shift requests for comparison
    const sampleRequests = await ShiftRequest.find().limit(5).populate('userId', 'full_name email username phone_number').lean();
    
    res.json({
      success: true,
      data: {
        inputDate: date,
        parsedDate: parsedDate.toISOString(),
        calculatedWeekStart: weekStart.toISOString(),
        weekString: weekString,
        requestsWithThisWeek: requestsCount,
        allWeeksInDatabase: allWeeks,
        sampleRequests: sampleRequests
      }
    });
  } catch (err) {
    console.error('Error in debug-week endpoint:', err);
    res.status(500).json({
      success: false,
      message: 'Error in debug-week endpoint',
      error: err.message
    });
  }
});

module.exports = router;
