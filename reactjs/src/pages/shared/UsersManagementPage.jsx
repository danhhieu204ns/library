import React from 'react';
import { Eye } from 'lucide-react';
import UserManagement from '../../components/management/UserManagement';
import ManagementLayout from '../../components/layout/ManagementLayout';
import { usePermissions } from '../../hooks/usePermissions';
import withRoleAccess from '../../hoc/withRoleAccess';

const UsersManagementPage = () => {
  const { userRole } = usePermissions('users');

  const handleUserAction = ({ action, user }) => {
    switch (action) {
      case 'add':
        // Navigate to add user page
        window.location.href = '/users/add';
        break;
      case 'edit':
        // Navigate to edit user page
        window.location.href = `/users/edit/${user.id}`;
        break;
      case 'view':
        // Navigate to view user page
        window.location.href = `/users/${user.id}`;
        break;
      case 'email':
        // Open email composition
        window.location.href = `mailto:${user.email}`;
        break;
      default:
        break;
    }
  };

  // Additional actions based on user role
  const additionalActions = [];
  
  if (userRole === 'Admin') {
    additionalActions.push(
      {
        key: 'audit',
        icon: <Eye className="w-4 h-4" />,
        title: 'View Audit Log',
        onClick: (user) => {
          window.location.href = `/audit/users/${user.id}`;
        },
        requiredAction: 'view',
        className: 'text-gray-500 hover:text-indigo-600'
      },
      {
        key: 'login-history',
        icon: <Eye className="w-4 h-4" />,
        title: 'Login History',
        onClick: (user) => {
          window.location.href = `/users/${user.id}/login-history`;
        },
        requiredAction: 'view',
        className: 'text-gray-500 hover:text-green-600'
      }
    );
  }

  const breadcrumb = [
    { name: 'Users', href: '/users' }
  ];

  return (
    <ManagementLayout 
      title={`User Management - ${userRole} View`}
      breadcrumb={breadcrumb}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserManagement
          showTitle={false}
          onUserSelect={handleUserAction}
          additionalActions={additionalActions}
        />
      </div>
    </ManagementLayout>
  );
};

export default withRoleAccess(UsersManagementPage, [
  { resource: 'users', action: 'view' }
]);
