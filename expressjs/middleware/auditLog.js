const AuditLog = require('../models/AuditLog');

// Middleware to log API actions for audit purposes
const auditLog = (action) => {
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
          userId: req.user._id,
          userRole: req.user.role,
          action: action,
          resource: req.route?.path || req.path,
          resourceId: req.params?.id || null,
          method: req.method,
          endpoint: req.originalUrl,
          success: responseSuccess,
          statusCode: res.statusCode,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent') || '',
          requestData: ['GET', 'DELETE'].includes(req.method) ? req.query : req.body,
          responseMessage: responseData?.message || '',
          error: responseSuccess ? null : (responseData?.error || responseData?.message),
          duration: duration
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
        action: action,
        resource: 'auth',
        resourceId: null,
        method: req.method,
        endpoint: req.originalUrl,
        success: success,
        statusCode: res.statusCode,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent') || '',
        requestData: { username: req.body?.username, email: req.body?.email },
        responseMessage: data.message || '',
        error: success ? null : (data.error || data.message),
        duration: duration
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
};

module.exports = {
  auditLog,
  auditAuth,
  saveAuditLog
};
