import React from 'react';

const StatusBadge = ({ status, type = 'default', isOverdue = false }) => {
  // Define status configurations for different types
  const statusConfig = {
    // Borrowing statuses
    borrowing: {
      'Borrowed': { 
        bg: isOverdue ? 'bg-red-100' : 'bg-green-100', 
        text: isOverdue ? 'text-red-800' : 'text-green-800',
        label: isOverdue ? 'Quá hạn' : 'Đang mượn'
      },
      'Returned': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã trả' },
      'Overdue': { bg: 'bg-red-100', text: 'text-red-800', label: 'Quá hạn' },
    },
    // Reservation statuses
    reservation: {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang chờ' },
      'Ready': { bg: 'bg-green-100', text: 'text-green-800', label: 'Sẵn sàng' },
      'Fulfilled': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xử lý' },
      'Expired': { bg: 'bg-red-100', text: 'text-red-800', label: 'Hết hạn' },
      'Cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã hủy' },
    },
    // Schedule statuses
    schedule: {
      'Approved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ duyệt' },
      'Completed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã hoàn thành' },
      'Cancelled': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Đã hủy' },
    },
    // Default statuses
    default: {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang chờ' },
      'Active': { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoạt động' },
      'Inactive': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Không hoạt động' },
    }
  };

  // Get configuration for status
  const config = statusConfig[type]?.[status] || { 
    bg: 'bg-gray-100', 
    text: 'text-gray-800', 
    label: status 
  };

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
