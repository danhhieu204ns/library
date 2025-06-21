const AuditLog = require('../models/AuditLog');

// Middleware to log API actions for audit purposes
const auditLog = (action, resourceType = 'OTHER') => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Store original res.json to capture response
    const originalJson = res.json;
    let responseData = null;
    let responseSuccess = true;
    
    res.json = function(data) {
      responseData = data;
      responseSuccess = res.statusCode < 400;
      return originalJson.call(this, data);
    };
    
    // Store original res.status to capture status changes
    const originalStatus = res.status;
    res.status = function(code) {
      responseSuccess = code < 400;
      return originalStatus.call(this, code);
    };
    
    // Override res.end to log after response is sent
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      const duration = Date.now() - startTime;
      
      // Log the action asynchronously to avoid blocking response
      if (req.user) {
        const logData = {
          // Legacy fields
          userId: req.user._id,
          userRole: req.user.role,
          // New format
          user: {
            userId: req.user._id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role
          },
          action: action,
          // Legacy field
          resource: req.route?.path || req.path,
          // New field
          resourceType: resourceType,
          resourceId: req.params?.id || null,
          method: req.method,
          endpoint: req.originalUrl,
          description: `${action} ${resourceType}${req.params?.id ? ` ID: ${req.params.id}` : ''}`,
          details: {
            path: req.path,
            query: req.query,
            params: req.params,
            body: ['GET', 'DELETE'].includes(req.method) ? {} : req.body
          },
          success: responseSuccess,
          status: responseSuccess ? 'SUCCESS' : 'FAILURE',
          statusCode: res.statusCode,
          ip: req.ip || req.connection.remoteAddress,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent') || '',
          requestData: ['GET', 'DELETE'].includes(req.method) ? req.query : req.body,
          responseMessage: responseData?.message || '',
          error: responseSuccess ? null : (responseData?.error || responseData?.message),
          duration: duration,
          timestamp: new Date()
        };
        
        // Save to audit log (async, don't block response)
        saveAuditLog(logData).catch(err => {
          console.error('Failed to save audit log:', err);
        });
      }
      
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  };
};

// Function to save audit log
const saveAuditLog = async (logData) => {
  try {
    const auditLog = new AuditLog(logData);
    await auditLog.save();
  } catch (error) {
    console.error('Audit log save error:', error);
  }
};

// Middleware to log authentication attempts
const auditAuth = (action) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    const originalJson = res.json;
    res.json = function(data) {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;
      
      // Log authentication attempt
      const logData = {
        userId: data.user?._id || null,
        userRole: data.user?.role || 'Unknown',
        // New format
        user: {
          userId: data.user?._id,
          username: data.user?.username || req.body?.username,
          email: data.user?.email || req.body?.email,
          role: data.user?.role || 'Unknown'
        },
        action: action,
        resource: 'auth',
        resourceType: 'USER',
        resourceId: data.user?._id || null,
        method: req.method,
        endpoint: req.originalUrl,
        description: `${action} attempt by ${req.body?.username || req.body?.email || 'unknown user'}`,
        details: {
          username: req.body?.username,
          email: req.body?.email,
          successful: success
        },
        success: success,
        status: success ? 'SUCCESS' : 'FAILURE',
        statusCode: res.statusCode,
        ip: req.ip || req.connection.remoteAddress,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || '',
        requestData: { username: req.body?.username, email: req.body?.email },
        responseMessage: data.message || '',
        error: success ? null : (data.error || data.message),
        duration: duration,
        timestamp: new Date()
      };
      };
        // For failed auth, we might not have userId, use a placeholder
      if (!logData.userId && req.body?.username) {
        logData.userId = null; // We'll track by username in requestData
      }
      
      saveAuditLog(logData).catch(err => {
        console.error('Failed to save auth audit log:', err);
      });
      
      return originalJson.call(this, data);
    };
    
    next();
};

/**
 * Utility để ghi log theo cách thủ công
 */
const auditLogger = {
  /**
   * Tạo bản ghi audit log
   * @param {Object} req - Express request object
   * @param {Object} options - Thông tin cần ghi log
   * @returns {Promise<Object>} - Bản ghi audit log đã tạo
   */
  async log(req, options) {
    try {
      const {
        action,
        resourceType,
        resourceId,
        description,
        details,
        status = 'SUCCESS',
      } = options;

      const user = req.user ? {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      } : null;

      const logEntry = new AuditLog({
        // Legacy format
        userId: req.user?._id,
        userRole: req.user?.role,
        action,
        resource: resourceType,
        resourceId,
        method: req.method,
        endpoint: req.originalUrl,
        success: status === 'SUCCESS' || status === 'INFO',
        statusCode: req.res?.statusCode || 200,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers?.['user-agent'],
        // New format
        user,
        resourceType,
        description,
        details,
        ipAddress: req.ip || req.connection?.remoteAddress,
        status,
        timestamp: new Date()
      });

      await logEntry.save();
      return logEntry;
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Không throw error để không ảnh hưởng đến luồng chính của ứng dụng
      return null;
    }
  },

  /**
   * Tạo log cho system events
   * @param {Object} options - Thông tin cần ghi log
   * @returns {Promise<Object>} - Bản ghi audit log đã tạo
   */
  async logSystem(options) {
    try {
      const {
        action,
        resourceType = 'SYSTEM',
        resourceId = null,
        description,
        details,
        status = 'INFO',
      } = options;

      const logEntry = new AuditLog({
        action,
        resource: resourceType,
        resourceType,
        resourceId,
        description,
        details,
        method: 'SYSTEM',
        endpoint: '/system',        success: status === 'SUCCESS' || status === 'INFO',
        statusCode: 200,
        status,
        timestamp: new Date()
      });

      await logEntry.save();
      return logEntry;
    } catch (error) {
      console.error('Error creating system audit log:', error);
      return null;
    }
  }
};

module.exports = {
  auditLog,
  auditAuth,
  saveAuditLog,
  auditLogger
};
