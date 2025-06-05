import React from 'react';
import { AlertCircle, Search } from 'lucide-react';

/**
 * EmptyState component for displaying empty states with different visualizations
 * @param {Object} props Component props
 * @param {string} props.type The type of empty state ('error', 'noResults', 'noBooks', etc)
 * @param {string} props.title The title message to display
 * @param {string} [props.description] Optional description text
 * @param {React.ReactNode} [props.action] Optional action button or link
 * @param {React.ReactNode} [props.icon] Optional custom icon to override the default
 */
const EmptyState = ({ 
  type = 'noResults', 
  title, 
  description, 
  action,
  icon
}) => {
  
  // Default icon based on type
  const getDefaultIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      case 'noResults':
      case 'noBooks':
      default:
        return <Search className="h-12 w-12 text-gray-400" />;
    }
  };
  
  // Default title based on type
  const defaultTitle = () => {
    switch (type) {
      case 'error':
        return 'Đã xảy ra lỗi';
      case 'noResults':
        return 'Không tìm thấy kết quả';
      case 'noBooks':
        return 'Không có sách nào';
      default:
        return 'Không có dữ liệu';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-gray-50 rounded-full p-4 mb-4">
        {icon || getDefaultIcon()}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title || defaultTitle()}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
