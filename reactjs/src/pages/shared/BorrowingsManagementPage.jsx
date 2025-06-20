import React from 'react';
import { BookOpen } from 'lucide-react';
import BorrowingManagement from '../../components/management/BorrowingManagement';
import ManagementLayout from '../../components/layout/ManagementLayout';
import { usePermissions } from '../../hooks/usePermissions';
import withRoleAccess from '../../hoc/withRoleAccess';

const BorrowingsManagementPage = () => {
  const { userRole } = usePermissions('borrowings');

  const handleBorrowingAction = ({ action, borrowing }) => {
    switch (action) {
      case 'add':
        // Navigate to add borrowing page
        window.location.href = '/borrowings/add';
        break;
      case 'edit':
        // Navigate to edit borrowing page
        window.location.href = `/borrowings/edit/${borrowing.id}`;
        break;
      case 'view':
        // Navigate to view borrowing page
        window.location.href = `/borrowings/${borrowing.id}`;
        break;
      case 'reminder':
        // Handle sending reminder
        console.log('Sending reminder for borrowing:', borrowing.id);
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
        key: 'history',
        icon: <BookOpen className="w-4 h-4" />,
        title: 'View History',
        onClick: (borrowing) => {
          window.location.href = `/borrowings/${borrowing.id}/history`;
        },
        requiredAction: 'view',
        className: 'text-gray-500 hover:text-indigo-600'
      }
    );
  }

  const breadcrumb = [
    { name: 'Borrowings', href: '/borrowings' }
  ];

  return (
    <ManagementLayout 
      title={`Borrowing Management - ${userRole} View`}
      breadcrumb={breadcrumb}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BorrowingManagement
          showTitle={false}
          onBorrowingSelect={handleBorrowingAction}
          additionalActions={additionalActions}
        />
      </div>
    </ManagementLayout>
  );
};

export default withRoleAccess(BorrowingsManagementPage, [
  { resource: 'borrowings', action: 'view' }
]);
