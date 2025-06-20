import React from 'react';
import { Eye } from 'lucide-react';
import BookManagement from '../../components/management/BookManagement';
import ManagementLayout from '../../components/layout/ManagementLayout';
import { usePermissions } from '../../hooks/usePermissions';
import withRoleAccess from '../../hoc/withRoleAccess';

const BooksManagementPage = () => {
  const { userRole } = usePermissions('books');

  const handleBookAction = ({ action, book }) => {
    switch (action) {
      case 'add':
        // Navigate to add book page
        window.location.href = '/books/add';
        break;
      case 'edit':
        // Navigate to edit book page
        window.location.href = `/books/edit/${book.id}`;
        break;
      case 'view':
        // Navigate to view book page
        window.location.href = `/books/${book.id}`;
        break;
      case 'copy':
        // Navigate to copy book page
        window.location.href = `/books/copy/${book.id}`;
        break;
      case 'details':
        // Navigate to detailed book page
        window.location.href = `/books/details/${book.id}`;
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
        onClick: (book) => {
          window.location.href = `/audit/books/${book.id}`;
        },
        requiredAction: 'view',
        className: 'text-gray-500 hover:text-indigo-600'
      }
    );
  }

  const breadcrumb = [
    { name: 'Books', href: '/books' }
  ];

  return (
    <ManagementLayout 
      title={`Book Management - ${userRole} View`}
      breadcrumb={breadcrumb}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BookManagement
          showTitle={false}
          onBookSelect={handleBookAction}
          additionalActions={additionalActions}
        />
      </div>
    </ManagementLayout>
  );
};

export default withRoleAccess(BooksManagementPage, [
  { resource: 'books', action: 'view' }
]);
