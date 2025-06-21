// Configuration for role-based permissions
const PERMISSIONS = {
  // Book permissions
  BOOKS_VIEW: 'books:view',
  BOOKS_CREATE: 'books:create', 
  BOOKS_EDIT: 'books:edit',
  BOOKS_DELETE: 'books:delete',
  BOOKS_BULK_ACTIONS: 'books:bulk',
  
  // User permissions
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit', 
  USERS_DELETE: 'users:delete',
  USERS_BULK_ACTIONS: 'users:bulk',
  USERS_CHANGE_ROLE: 'users:change_role',
  
  // Role permissions
  ROLES_VIEW: 'roles:view',
  ROLES_CREATE: 'roles:create',
  ROLES_EDIT: 'roles:edit',
  ROLES_DELETE: 'roles:delete',
  
  // Borrowing permissions
  BORROWINGS_VIEW: 'borrowings:view',
  BORROWINGS_CREATE: 'borrowings:create',
  BORROWINGS_EDIT: 'borrowings:edit',
  BORROWINGS_DELETE: 'borrowings:delete',
  BORROWINGS_APPROVE: 'borrowings:approve',
  
  // Schedule permissions
  SCHEDULES_VIEW: 'schedules:view',
  SCHEDULES_CREATE: 'schedules:create',
  SCHEDULES_EDIT: 'schedules:edit',
  SCHEDULES_DELETE: 'schedules:delete',
  
  // Shift request permissions
  SHIFT_REQUESTS_VIEW: 'shift_requests:view',
  SHIFT_REQUESTS_CREATE: 'shift_requests:create',
  SHIFT_REQUESTS_APPROVE: 'shift_requests:approve',
  SHIFT_REQUESTS_FINALIZE: 'shift_requests:finalize',
  
  // Report permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  
  // System permissions
  SYSTEM_SETTINGS: 'system:settings',
  AUDIT_LOGS: 'system:audit_logs'
};

// Role-based permission mapping
// Mapping backend roles to frontend roles
const ROLE_MAPPING = {
  'Admin': 'Admin',
  'CTV': 'Staff',      // CTV (Cộng tác viên) -> Staff
  'DocGia': 'User'     // DocGia (Độc giả) -> User
};

const ROLE_PERMISSIONS = {
  Admin: [
    // Full permissions for admin
    ...Object.values(PERMISSIONS)
  ],
  
  Staff: [
    // Book management
    PERMISSIONS.BOOKS_VIEW,
    PERMISSIONS.BOOKS_CREATE,
    PERMISSIONS.BOOKS_EDIT,
    
    // User management (limited)
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_EDIT,
    
    // Borrowing management
    PERMISSIONS.BORROWINGS_VIEW,
    PERMISSIONS.BORROWINGS_CREATE,
    PERMISSIONS.BORROWINGS_EDIT,
    PERMISSIONS.BORROWINGS_APPROVE,
    
    // Schedule management
    PERMISSIONS.SCHEDULES_VIEW,
    PERMISSIONS.SCHEDULES_CREATE,
    PERMISSIONS.SCHEDULES_EDIT,
    
    // Shift requests
    PERMISSIONS.SHIFT_REQUESTS_VIEW,
    PERMISSIONS.SHIFT_REQUESTS_CREATE,
    
    // Basic reports
    PERMISSIONS.REPORTS_VIEW
  ],
  
  User: [
    // View only permissions
    PERMISSIONS.BOOKS_VIEW,
    PERMISSIONS.BORROWINGS_VIEW,
    PERMISSIONS.SCHEDULES_VIEW
  ]
};

// Helper function to get permissions for a role
const getPermissionsForRole = (role) => {
  // Map backend role to frontend role
  const frontendRole = ROLE_MAPPING[role] || 'User';
  return ROLE_PERMISSIONS[frontendRole] || ROLE_PERMISSIONS.User;
};

// Helper function to check if a role has a specific permission
const hasPermission = (role, permission) => {
  // If role is Admin, they have all permissions
  if (role === 'Admin') {
    return true;
  }
  
  const rolePermissions = getPermissionsForRole(role);
  return rolePermissions.includes(permission);
};

// Helper function to get frontend role from backend role
const getFrontendRole = (backendRole) => {
  return ROLE_MAPPING[backendRole] || 'User';
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_MAPPING,
  getPermissionsForRole,
  hasPermission,
  getFrontendRole
};
