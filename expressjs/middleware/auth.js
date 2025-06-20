const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const { getPermissionsForRole, getFrontendRole } = require('../config/permissions');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password_hash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (user.status !== 'Active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active.'
      });
    }    // Add user permissions to request object
    req.user = user;
    req.userPermissions = getPermissionsForRole(user.role);
    req.frontendRole = getFrontendRole(user.role);
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Authorization middleware - check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Not authenticated.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Check if user is admin or CTV (staff)
const isStaff = (req, res, next) => {
  if (!req.user || !['Admin', 'CTV'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Staff privileges required.'
    });
  }
  next();
};

// Check if user can access their own data or is staff
const canAccessUserData = (req, res, next) => {
  const userId = req.params.userId || req.params.id;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Not authenticated.'
    });
  }

  // Admin and CTV can access any user data
  if (['Admin', 'CTV'].includes(req.user.role)) {
    return next();
  }

  // Users can only access their own data
  if (req.user._id.toString() === userId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. You can only access your own data.'
  });
};

module.exports = {
  auth,
  authorize,
  isAdmin,
  isStaff,
  canAccessUserData
};
