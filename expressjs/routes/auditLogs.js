const express = require('express');
const { auth } = require('../middleware/auth');
const { requirePermission, addUserPermissions } = require('../middleware/permissions');
const { auditLog } = require('../middleware/auditLog');
const { PERMISSIONS } = require('../config/permissions');
const { query, validationResult } = require('express-validator');
const AuditLog = require('../models/AuditLog');
const router = express.Router();

// Get audit logs (Admin only)
router.get('/', 
  auth, 
  requirePermission(PERMISSIONS.AUDIT_LOGS),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('userId').optional().isMongoId().withMessage('Invalid user ID'),
    query('action').optional().isString().withMessage('Action must be a string'),
    query('resource').optional().isString().withMessage('Resource must be a string'),
    query('success').optional().isBoolean().withMessage('Success must be a boolean'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
  ],
  auditLog('VIEW_AUDIT_LOGS'),
  async (req, res) => {
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
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;
      
      const { userId, action, resource, success, startDate, endDate } = req.query;
      const filter = {};
      
      if (userId) filter.userId = userId;
      if (action) filter.action = { $regex: action, $options: 'i' };
      if (resource) filter.resource = { $regex: resource, $options: 'i' };
      if (success !== undefined) filter.success = success === 'true';
      
      // Date range filter
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      const logs = await AuditLog.find(filter)
        .populate('userId', 'username full_name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await AuditLog.countDocuments(filter);

      // Transform logs to include user info
      const transformedLogs = logs.map(log => ({
        ...log,
        user: log.userId || null
      }));

      res.json({
        success: true,
        data: {
          logs: transformedLogs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// Get audit log statistics
router.get('/stats', 
  auth, 
  requirePermission(PERMISSIONS.AUDIT_LOGS),
  auditLog('VIEW_AUDIT_STATS'),
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const dateFilter = {};
      
      if (startDate || endDate) {
        dateFilter.createdAt = {};
        if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
        if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
      }

      // Aggregate statistics
      const stats = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalActions: { $sum: 1 },
            successfulActions: { $sum: { $cond: ['$success', 1, 0] } },
            failedActions: { $sum: { $cond: ['$success', 0, 1] } },
            avgDuration: { $avg: '$duration' }
          }
        }
      ]);

      // Actions by type
      const actionStats = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$action',
            count: { $sum: 1 },
            successCount: { $sum: { $cond: ['$success', 1, 0] } },
            avgDuration: { $avg: '$duration' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);

      // Users activity
      const userStats = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: '$userId',
            actionCount: { $sum: 1 },
            lastActivity: { $max: '$createdAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            username: '$user.username',
            full_name: '$user.full_name',
            role: '$user.role',
            actionCount: 1,
            lastActivity: 1
          }
        },
        { $sort: { actionCount: -1 } },
        { $limit: 10 }
      ]);

      // Daily activity
      const dailyStats = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalActions: { $sum: 1 },
            successfulActions: { $sum: { $cond: ['$success', 1, 0] } }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
        { $limit: 30 }
      ]);

      res.json({
        success: true,
        data: {
          overview: stats[0] || {
            totalActions: 0,
            successfulActions: 0,
            failedActions: 0,
            avgDuration: 0
          },
          actionStats,
          userStats,
          dailyStats
        }
      });

    } catch (error) {
      console.error('Get audit stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// Get audit logs for specific user
router.get('/user/:userId', 
  auth, 
  requirePermission(PERMISSIONS.AUDIT_LOGS),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  auditLog('VIEW_USER_AUDIT_LOGS'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { userId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const logs = await AuditLog.find({ userId })
        .populate('userId', 'username full_name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await AuditLog.countDocuments({ userId });

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get user audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

// Delete old audit logs (Admin only, for cleanup)
router.delete('/cleanup', 
  auth, 
  requirePermission(PERMISSIONS.AUDIT_LOGS),
  [
    query('days').isInt({ min: 1 }).withMessage('Days must be a positive integer')
  ],
  auditLog('CLEANUP_AUDIT_LOGS'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { days } = req.query;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

      const result = await AuditLog.deleteMany({
        createdAt: { $lt: cutoffDate }
      });

      res.json({
        success: true,
        message: `Deleted ${result.deletedCount} audit logs older than ${days} days`,
        data: {
          deletedCount: result.deletedCount,
          cutoffDate
        }
      });

    } catch (error) {
      console.error('Cleanup audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

module.exports = router;
