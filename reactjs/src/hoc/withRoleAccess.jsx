import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

const withRoleAccess = (WrappedComponent, requiredPermissions = []) => {
  return function RoleAccessComponent(props) {
    const { user, isAuthenticated } = useAuth();
    const { hasPermission } = usePermissions();

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-600 mb-4">
                Please log in to access this page.
              </p>
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Check permissions if specified
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.some(permission => {
        if (typeof permission === 'string') {
          return hasPermission(permission);
        }
        if (permission.resource && permission.action) {
          return hasPermission(`${permission.resource}:${permission.action}`);
        }
        return false;
      });

      if (!hasRequiredPermissions) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.662-.833-2.532 0L5.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Access Denied
                </h3>
                <p className="text-gray-600 mb-4">
                  You don't have permission to access this page.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Current role: <span className="font-medium">{user.role}</span>
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        );
      }
    }

    // Pass user and role information as props
    return (
      <WrappedComponent 
        {...props} 
        currentUser={user} 
        userRole={user.role}
      />
    );
  };
};

export default withRoleAccess;
