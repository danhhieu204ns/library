import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';

const PermissionGuard = ({ 
  children, 
  permission, 
  resource, 
  action, 
  fallback = null,
  requireAll = false 
}) => {
  const { hasPermission, hasResourcePermission } = usePermissions(resource);

  const checkAccess = () => {
    // If specific permission is provided
    if (permission) {
      if (Array.isArray(permission)) {
        return requireAll 
          ? permission.every(p => hasPermission(p))
          : permission.some(p => hasPermission(p));
      }
      return hasPermission(permission);
    }

    // If resource and action are provided
    if (resource && action) {
      if (Array.isArray(action)) {
        return requireAll
          ? action.every(a => hasResourcePermission(a))
          : action.some(a => hasResourcePermission(a));
      }
      return hasResourcePermission(action);
    }

    return false;
  };

  if (!checkAccess()) {
    return fallback;
  }

  return <>{children}</>;
};

export default PermissionGuard;
