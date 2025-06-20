import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, RotateCcw, Eye } from 'lucide-react';

import TabHeader from '../common/TabHeader';
import LoadingSkeleton from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';

const BorrowingsTab = ({
  borrowings,
  isLoading,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  handleReturnBook,
  returnBookMutation
}) => {
  // Filter the borrowings based on search term and status
  const filteredBorrowings = borrowings.filter(borrowing => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      borrowing.copy?.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      borrowing.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const isOverdue = borrowing.status === 'Borrowed' && new Date(borrowing.due_date) < new Date();
    const matchesStatus = filterStatus === 'all' || 
      borrowing.status === filterStatus ||
      (filterStatus === 'Overdue' && isOverdue);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <TabHeader 
        title="Quản lý mượn trả"
        searchPlaceholder="Tìm kiếm phiếu mượn..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        filterOptions={[
          { value: 'all', label: 'Tất cả trạng thái' },
          { value: 'Borrowed', label: 'Đang mượn' },
          { value: 'Returned', label: 'Đã trả' },
          { value: 'Overdue', label: 'Quá hạn' }
        ]}
        actionButton={{
          icon: 'BookOpen',
          label: 'Tạo phiếu mượn',
          to: '/staff/borrowing/new'
        }}
      />

      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : filteredBorrowings.length === 0 ? (
        <EmptyState 
          icon="BookOpen"
          title="Không tìm thấy phiếu mượn"
          description="Không có phiếu mượn nào phù hợp với tìm kiếm của bạn."
          actionButton={{
            icon: 'BookOpen',
            label: 'Tạo phiếu mượn',
            to: '/staff/borrowing/new'
          }}
        />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredBorrowings.map((borrowing) => {
              const isOverdue = borrowing.status === 'Borrowed' && new Date(borrowing.due_date) < new Date();
              return (
                <li key={borrowing._id}>
                  <div className={`px-4 py-4 ${isOverdue ? 'bg-red-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isOverdue ? 'bg-red-100' : 
                            borrowing.status === 'Borrowed' ? 'bg-green-100' : 
                            'bg-gray-100'
                          }`}>
                            <BookOpen className={`h-5 w-5 ${
                              isOverdue ? 'text-red-600' : 
                              borrowing.status === 'Borrowed' ? 'text-green-600' : 
                              'text-gray-600'
                            }`} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {borrowing.copy?.book?.title || 'Unknown Book'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Mượn bởi: {borrowing.user?.full_name || borrowing.user?.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            Ngày mượn: {new Date(borrowing.borrow_date).toLocaleDateString()}
                            <span className="mx-1">•</span>
                            Hạn trả: {new Date(borrowing.due_date).toLocaleDateString()}
                            {isOverdue && (
                              <span className="ml-2 text-red-600 font-medium">
                                (Quá hạn)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <StatusBadge 
                          status={borrowing.status} 
                          type="borrowing" 
                          isOverdue={isOverdue}
                        />
                        {borrowing.status === 'Borrowed' && (
                          <button
                            onClick={() => handleReturnBook(borrowing._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            disabled={returnBookMutation.isLoading}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Trả sách
                          </button>
                        )}
                        <Link
                          to={`/staff/borrowings/${borrowing._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BorrowingsTab;
