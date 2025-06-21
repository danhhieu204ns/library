const express = require('express');
const { auth, authenticate } = require('../middleware/auth');
const { requirePermission, addUserPermissions, hasPermission } = require('../middleware/permissions');
const { auditLog, auditLogger } = require('../middleware/auditLog');
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
      }      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;
      
      const { userId, action, resource, resourceType, success, startDate, endDate, status } = req.query;
      const filter = {};
      
      if (userId) {
        filter.$or = [
          { userId: userId },
          { 'user.userId': userId }
        ];
      }
      if (action) filter.action = { $regex: action, $options: 'i' };
      if (resource) filter.resource = { $regex: resource, $options: 'i' };
      if (resourceType) filter.resourceType = resourceType;
      if (success !== undefined) filter.success = success === 'true';
      if (status) filter.status = status;
      
      // Date range filter
      if (startDate || endDate) {
        const dateField = filter.timestamp ? 'timestamp' : 'createdAt';
        filter[dateField] = {};
        if (startDate) filter[dateField].$gte = new Date(startDate);
        if (endDate) {
          const endDateObj = new Date(endDate);
          endDateObj.setHours(23, 59, 59, 999);
          filter[dateField].$lte = endDateObj;
        }
      }      const logs = await AuditLog.find(filter)
        .populate('userId', 'username full_name email role')
        .populate('user.userId', 'username full_name email role')
        .sort({ createdAt: -1, timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await AuditLog.countDocuments(filter);

      // Transform logs to include user info
      const transformedLogs = logs.map(log => {
        // Handle both old and new user data format
        const userInfo = log.user?.userId || log.userId || null;
        return {
          ...log,
          user: userInfo
        };
      });

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
      }      // Aggregate statistics
      const stats = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            totalActions: { $sum: 1 },
            successfulActions: { $sum: { $cond: [{ $or: [{ $eq: ['$success', true] }, { $in: ['$status', ['SUCCESS', 'INFO']] }] }, 1, 0] } },
            failedActions: { $sum: { $cond: [{ $or: [{ $eq: ['$success', false] }, { $in: ['$status', ['FAILURE', 'WARNING']] }] }, 1, 0] } },
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
            successCount: { $sum: { $cond: [{ $or: [{ $eq: ['$success', true] }, { $in: ['$status', ['SUCCESS', 'INFO']] }] }, 1, 0] } },
            avgDuration: { $avg: '$duration' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);      const userStats = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { 
              $cond: [{ $ifNull: ['$user.userId', false] }, '$user.userId', '$userId'] 
            },
            actionCount: { $sum: 1 },
            lastActivity: { $max: { $ifNull: ['$timestamp', '$createdAt'] } }
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
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            username: { $ifNull: ['$user.username', 'System'] },
            full_name: { $ifNull: ['$user.full_name', 'System'] },
            role: { $ifNull: ['$user.role', 'System'] },
            actionCount: 1,
            lastActivity: 1
          }
        },
        { $sort: { actionCount: -1 } },
        { $limit: 10 }
      ]);      // Daily activity
      const dailyStats = await AuditLog.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: { $ifNull: ['$timestamp', '$createdAt'] } },
              month: { $month: { $ifNull: ['$timestamp', '$createdAt'] } },
              day: { $dayOfMonth: { $ifNull: ['$timestamp', '$createdAt'] } }
            },
            totalActions: { $sum: 1 },
            successfulActions: { $sum: { $cond: [{ $or: [{ $eq: ['$success', true] }, { $in: ['$status', ['SUCCESS', 'INFO']] }] }, 1, 0] } }
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
      const skip = (page - 1) * limit;      const logs = await AuditLog.find({ 
        $or: [
          { userId },
          { 'user.userId': userId }
        ]
      })
        .populate('userId', 'username full_name email role')
        .populate('user.userId', 'username full_name email role')
        .sort({ createdAt: -1, timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await AuditLog.countDocuments({ 
        $or: [
          { userId },
          { 'user.userId': userId }
        ]
      });

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

      const { days } = req.query;      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

      const result = await AuditLog.deleteMany({
        $or: [
          { createdAt: { $lt: cutoffDate } },
          { timestamp: { $lt: cutoffDate } }
        ]
      });
      
      // Log the cleanup activity
      await auditLogger.logSystem({
        action: 'DELETE',
        resourceType: 'SYSTEM',
        description: `Deleted ${result.deletedCount} audit logs older than ${days} days`,
        details: {
          deletedCount: result.deletedCount,
          retentionPolicy: `${days} days`,
          executionTime: new Date().toISOString()
        }
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
