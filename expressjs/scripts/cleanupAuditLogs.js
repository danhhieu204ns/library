const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const { auditLogger } = require('../middleware/auditLog');
require('dotenv').config();

/**
 * Script để xóa các audit logs cũ
 * Mặc định giữ lại logs trong 90 ngày
 * Có thể chạy định kỳ bằng cron job
 */
async function cleanupOldAuditLogs(retentionDays = 90) {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/community_library');
    console.log('Connected to MongoDB');
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    // Đếm số lượng records sẽ bị xóa
    const count = await AuditLog.countDocuments({
      $or: [
        { createdAt: { $lt: cutoffDate } },
        { timestamp: { $lt: cutoffDate } }
      ]
    });
    
    if (count === 0) {
      console.log('No audit logs to delete');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`Found ${count} audit logs older than ${retentionDays} days to delete`);
    
    // Xóa records
    const result = await AuditLog.deleteMany({
      $or: [
        { createdAt: { $lt: cutoffDate } },
        { timestamp: { $lt: cutoffDate } }
      ]
    });
    
    // Log kết quả
    await auditLogger.logSystem({
      action: 'DELETE',
      resourceType: 'SYSTEM',
      description: `Deleted ${result.deletedCount} audit logs older than ${retentionDays} days`,
      details: {
        deletedCount: result.deletedCount,
        retentionPolicy: `${retentionDays} days`,
        executionTime: new Date().toISOString()
      }
    });
    
    console.log(`Successfully deleted ${result.deletedCount} audit logs`);
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    
    try {
      // Log lỗi
      await auditLogger.logSystem({
        action: 'DELETE',
        resourceType: 'SYSTEM',
        description: 'Failed to clean up audit logs',
        details: { error: error.message },
        status: 'FAILURE'
      });
    } catch (err) {
      console.error('Failed to log error:', err);
    }
    
    // Disconnect from database
    try {
      await mongoose.disconnect();
    } catch (err) {
      console.error('Error disconnecting from MongoDB:', err);
    }
    process.exit(1);
  }
}

// Lấy số ngày giữ lại từ command line arguments hoặc dùng mặc định 90 ngày
const retentionDays = process.argv[2] ? parseInt(process.argv[2], 10) : 90;
cleanupOldAuditLogs(retentionDays);
