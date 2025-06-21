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
  return monday.toISOString().split('T')[0];
};

// Get final schedule for a week
// GET /api/schedule/final?week=2025-06-16
router.get('/final', async (req, res) => {
  try {
    const { week } = req.query;
    let weekString = week;
    
    if (!weekString) {
      // If no week provided, default to current week
      weekString = formatWeekString(new Date());
    }
    
    const finalSchedule = await FinalSchedule.findOne({ 
      week: weekString,
      isFinalized: true
    }).populate('shifts.userId', 'name email avatar');
    
    if (!finalSchedule) {
      return res.status(200).json({
        success: true,
        message: 'No finalized schedule found for this week',
        data: null
      });
    }
    
    res.json({
      success: true,
      data: finalSchedule
    });
  } catch (err) {
    console.error('Error fetching final schedule:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching final schedule',
      error: err.message
    });
  }
});

// Finalize schedule for a week
// POST /api/schedule/finalize
router.post('/finalize', auth, requirePermission(PERMISSIONS.SHIFT_REQUESTS_FINALIZE), async (req, res) => {
  try {
    const { week } = req.body;
    
    if (!week) {
      return res.status(400).json({
        success: false,
        message: 'Week parameter is required'
      });
    }
    
    console.log('Finalizing schedule for week:', week);
    
    // Get the date range for the week
    const weekStartDate = new Date(week);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);
    
    console.log('Week date range:', {
      start: weekStartDate.toISOString(),
      end: weekEndDate.toISOString()
    });
    
    // Get approved shift requests in two ways:
    // 1. By week field
    // 2. By date range (in case week field is incorrect)
    const approvedShiftsByWeek = await ShiftRequest.find({
      week,
      status: 'approved'
    }).populate('userId', 'name email full_name');
    
    const approvedShiftsByDate = await ShiftRequest.find({
      date: { $gte: weekStartDate, $lte: weekEndDate },
      status: 'approved',
      week: { $ne: week } // Don't include those already matched by week
    }).populate('userId', 'name email full_name');
    
    console.log('Found approved shifts by week:', approvedShiftsByWeek.length);
    console.log('Found approved shifts by date:', approvedShiftsByDate.length);
    
    // Combine both sets of shifts
    const allApprovedShifts = [...approvedShiftsByWeek, ...approvedShiftsByDate];
    
    if (allApprovedShifts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No approved shifts found for this week'
      });
    }
    
    // Update the week field for any shifts that have the correct date but wrong week
    if (approvedShiftsByDate.length > 0) {
      const updatePromises = approvedShiftsByDate.map(async (shift) => {
        shift.week = week;
        return shift.save();
      });
      
      await Promise.all(updatePromises);
      console.log(`Updated week field for ${approvedShiftsByDate.length} shifts`);
    }
    
    // Format the shifts for the FinalSchedule model
    const formattedShifts = allApprovedShifts.map(shift => ({
      userId: shift.userId._id,
      date: shift.date,
      timeSlot: shift.timeSlot
    }));
    
    // Check if a final schedule already exists for this week
    let finalSchedule = await FinalSchedule.findOne({ week });
    
    if (finalSchedule) {
      // Update existing schedule
      finalSchedule.shifts = formattedShifts;
      finalSchedule.isFinalized = true;
      finalSchedule.finalizedAt = Date.now();
      finalSchedule.finalizedBy = req.user._id;
      finalSchedule.updatedAt = Date.now();
    } else {
      // Create new schedule
      finalSchedule = new FinalSchedule({
        week,
        shifts: formattedShifts,
        isFinalized: true,
        finalizedAt: Date.now(),
        finalizedBy: req.user._id
      });
    }
    
    await finalSchedule.save();
    
    res.json({
      success: true,
      message: 'Schedule has been finalized successfully',
      data: finalSchedule
    });
  } catch (err) {
    console.error('Error finalizing schedule:', err);
    res.status(500).json({
      success: false,
      message: 'Error finalizing schedule: ' + err.message,
      error: err.message
    });
  }
});

// Get upcoming schedules for current user
// GET /api/schedule/me
router.get('/me', auth, async (req, res) => {
  try {
    // Get current date
    const now = new Date();
      // Find all finalized schedules where user has shifts after now
    const schedules = await FinalSchedule.find({
      isFinalized: true,
      'shifts.userId': req.user._id,
      'shifts.date': { $gte: now }
    }).sort({ 'shifts.date': 1 });
      // Extract only relevant shifts
    const upcomingShifts = schedules.flatMap(schedule => 
      schedule.shifts
        .filter(shift => 
          shift.userId.toString() === req.user._id.toString() && 
          new Date(shift.date) >= now
        )
        .map(shift => ({
          ...shift.toObject(),
          week: schedule.week
        }))
    );
    
    res.json({
      success: true,
      data: upcomingShifts
    });
  } catch (err) {
    console.error('Error fetching user schedules:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching user schedules',
      error: err.message
    });
  }
});

module.exports = router;
