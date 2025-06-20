// Configuration for role-based permissions
export const PERMISSIONS = {
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
  
  // Report permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  
  // System permissions
  SYSTEM_SETTINGS: 'system:settings',
  AUDIT_LOGS: 'system:audit_logs'
};

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
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
export const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.User;
};

// Helper function to check if a role has a specific permission
export const hasPermission = (userRole, permission) => {
  const rolePermissions = getPermissionsForRole(userRole);
  return rolePermissions.includes(permission);
};
