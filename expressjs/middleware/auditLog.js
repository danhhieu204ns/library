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

// Danh sách các public endpoints không cần ghi log
const PUBLIC_ENDPOINTS = [
  { path: '/api/health', method: 'GET' },
  { path: '/api/docs', method: 'GET' },
  { path: '/api/auth/login', method: 'POST' },
  { path: '/api/auth/register', method: 'POST' },
  { path: '/api/auth/forgot-password', method: 'POST' },
  { path: '/api/auth/reset-password', method: 'POST' },
  { path: '/api/books', method: 'GET', exactMatch: false },
  { path: '/api/reviews', method: 'GET', exactMatch: false }
];

// Kiểm tra xem endpoint có là public không
const isPublicEndpoint = (path, method) => {
  return PUBLIC_ENDPOINTS.some(endpoint => {
    // Kiểm tra endpoint chính xác
    if (endpoint.exactMatch !== false && endpoint.path === path && endpoint.method === method) {
      return true;
    }
    
    // Kiểm tra endpoint bắt đầu bằng path
    if (endpoint.exactMatch === false && 
        path.startsWith(endpoint.path) && 
        endpoint.method === method) {
      return true;
    }
    
    return false;
  });
};

// Xác định loại resource từ URL
const getResourceTypeFromPath = (path) => {
  const pathParts = path.split('/').filter(part => part);
  
  if (pathParts.length < 2) return 'SYSTEM';
  
  const resourceMap = {
    'users': 'USER',
    'books': 'BOOK',
    'borrowings': 'BORROWING',
    'reservations': 'RESERVATION',
    'schedules': 'SCHEDULE',
    'schedule': 'SCHEDULE',
    'reviews': 'REVIEW',
    'roles': 'ROLE',
    'user-roles': 'ROLE',
    'shift-requests': 'SHIFT_REQUEST',
    'upload': 'FILE',
    'import': 'BOOK',
    'auth': 'USER',
    'admin': 'SYSTEM',
    'audit-logs': 'SYSTEM'
  };
  
  // Kiểm tra resourceType cho các endpoint đặc biệt
  if (pathParts[1] === 'auth') {
    if (pathParts[2] === 'login' || pathParts[2] === 'register' || 
        pathParts[2] === 'forgot-password' || pathParts[2] === 'reset-password') {
      return 'USER';
    }
  }
  
  return resourceMap[pathParts[1]] || 'OTHER';
};

// Xác định action từ method
const getActionFromMethod = (method, path) => {
  // Xử lý các trường hợp đặc biệt
  if (path.includes('/auth/login')) return 'LOGIN';
  if (path.includes('/auth/logout')) return 'LOGOUT';
  if (path.includes('/admin')) return 'ADMIN_ACTION';
  if (path.includes('/import')) return 'IMPORT_BOOKS';
  if (path.includes('/borrowings') && method === 'POST') return 'BORROW';
  if (path.includes('/borrowings') && method === 'PUT' && path.includes('/return')) return 'RETURN';
  if (path.includes('/reservations') && method === 'POST') return 'RESERVE';
  if (path.includes('/reservations') && method === 'DELETE') return 'CANCEL_RESERVATION';
  
  // Xử lý các trường hợp thông thường
  switch (method) {
    case 'GET': return 'READ';
    case 'POST': return 'CREATE';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return 'OTHER';
  }
};

// Middleware để tự động ghi log cho tất cả các API requests
const autoAuditLogger = (req, res, next) => {
  // Bỏ qua public endpoints
  if (isPublicEndpoint(req.originalUrl, req.method)) {
    return next();
  }
  
  const startTime = Date.now();
  
  // Lưu lại responseBody
  const originalJson = res.json;
  let responseData;
  
  res.json = function(data) {
    responseData = data;
    const result = originalJson.call(this, data);
    
    // Thực hiện ghi log sau khi response đã được gửi
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400 && (data?.success !== false);
    const status = success ? 'SUCCESS' : 'FAILURE';
    
    // Xác định resource type và action
    const resourceType = getResourceTypeFromPath(req.originalUrl);
    const action = getActionFromMethod(req.method, req.originalUrl);
    
    // Lấy ID của resource (nếu có)
    let resourceId = req.params?.id || null;
    
    // Lọc thông tin nhạy cảm từ requestBody
    let requestData = null;
    if (!['GET', 'DELETE'].includes(req.method) && req.body) {
      requestData = { ...req.body };
      
      // Xóa các trường nhạy cảm
      if (requestData.password) requestData.password = '[REDACTED]';
      if (requestData.currentPassword) requestData.currentPassword = '[REDACTED]';
      if (requestData.newPassword) requestData.newPassword = '[REDACTED]';
      if (requestData.token) requestData.token = '[REDACTED]';
    } else {
      requestData = req.query;
    }
    
    // Tạo log entry
    const logData = {
      // Legacy fields
      userId: req.user?._id,
      userRole: req.user?.role,
      // New format
      user: req.user ? {
        userId: req.user._id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role
      } : null,
      action: action,
      // Legacy field
      resource: resourceType,
      // New field
      resourceType: resourceType,
      resourceId: resourceId,
      method: req.method,
      endpoint: req.originalUrl,
      description: `${action} ${resourceType}${resourceId ? ` ID: ${resourceId}` : ''}`,
      details: {
        path: req.path,
        query: req.query,
        params: req.params
      },
      success: success,
      status: status,
      statusCode: res.statusCode,
      ip: req.ip || req.connection.remoteAddress,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent') || '',
      requestData: requestData,
      responseMessage: responseData?.message || '',
      error: success ? null : (responseData?.error || responseData?.message),
      duration: duration,
      timestamp: new Date()
    };
    
    // Lưu log vào database (async, không block response)
    saveAuditLog(logData).catch(err => {
      console.error('Failed to save auto audit log:', err);
    });
    
    return result;
  };
  
  next();
};

module.exports = {
  auditLog,
  auditAuth,
  saveAuditLog,
  auditLogger,
  autoAuditLogger
};
