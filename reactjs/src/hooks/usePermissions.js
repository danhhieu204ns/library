import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPermissionsForRole, hasPermission as checkPermission } from '../config/permissions';

export const usePermissions = (resource) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (user?.role) {
      const userPermissions = getPermissionsForRole(user.role);
      setPermissions(userPermissions);
    }
  }, [user?.role]);

  const hasPermission = (permission) => {
    return checkPermission(user?.role, permission);
  };

  const hasResourcePermission = (action) => {
    const permission = `${resource}:${action}`;
    return hasPermission(permission);
  };

  return {
    permissions,
    hasPermission,
    hasResourcePermission,
    userRole: user?.role,
    // Convenience methods for common actions
    canView: hasResourcePermission('view'),
    canCreate: hasResourcePermission('create'),
    canEdit: hasResourcePermission('edit'),
    canDelete: hasResourcePermission('delete'),
    canBulk: hasResourcePermission('bulk'),
    canApprove: hasResourcePermission('approve'),
    canExport: hasResourcePermission('export')
  };
};
