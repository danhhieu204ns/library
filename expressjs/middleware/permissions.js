const { hasPermission, getPermissionsForRole } = require('../config/permissions');

// Middleware to check if user has required permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    const { user } = req;
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized' 
      });
    }
    
    // Check if user has Admin role, which has all permissions
    if (user.roles && user.roles.includes('Admin')) {
      return next();
    }
    
    // For other roles, check specific permissions
    if (!user.roles || !user.roles.some(role => hasPermission(role, permission))) {
      return res.status(403).json({ 
        success: false,
        message: `Permission ${permission} required`,
        error: 'Forbidden',
        userRoles: user.roles,
        requiredPermission: permission
      });
    }
    
    next();
  };
};

// Middleware to check if user has any of the required permissions
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    const { user } = req;
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized' 
      });
    }
    
    const userPermissions = getPermissionsForRole(user.role);
    const hasAnyPermission = permissions.some(perm => 
      userPermissions.includes(perm)
    );
    
    if (!hasAnyPermission) {
      return res.status(403).json({ 
        success: false,
        message: `One of these permissions required: ${permissions.join(', ')}`,
        error: 'Forbidden',
        userRole: user.role,
        requiredPermissions: permissions
      });
    }
    
    next();
  };
};

// Middleware to check if user has all required permissions
const requireAllPermissions = (permissions) => {
  return (req, res, next) => {
    const { user } = req;
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized' 
      });
    }
    
    const userPermissions = getPermissionsForRole(user.role);
    const hasAllPermissions = permissions.every(perm => 
      userPermissions.includes(perm)
    );
    
    if (!hasAllPermissions) {
      const missingPermissions = permissions.filter(perm => 
        !userPermissions.includes(perm)
      );
      
      return res.status(403).json({ 
        success: false,
        message: `Missing permissions: ${missingPermissions.join(', ')}`,
        error: 'Forbidden',
        userRole: user.role,
        missingPermissions: missingPermissions
      });
    }
    
    next();
  };
};

// Middleware to add user permissions to request object
const addUserPermissions = (req, res, next) => {
  if (req.user) {
    req.userPermissions = getPermissionsForRole(req.user.role);
  }
  next();
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  addUserPermissions
};
