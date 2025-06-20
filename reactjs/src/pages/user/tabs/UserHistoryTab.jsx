import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { borrowingsAPI } from '../../../services/api';

const UserHistoryTab = () => {
  const { user } = useAuth();
  const [borrowHistory, setBorrowHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchBorrowHistory = async () => {
      try {
        setLoading(true);
        // Fetch user's borrow history from API using the borrowingsAPI service
        const response = await borrowingsAPI.getBorrowings({ 
          userId: user.id, 
          status: 'completed,returned,overdue',
          sort: '-borrowDate'
        });
        console.log('Borrow history response:', response);
        setBorrowHistory(response.data.data);
      } catch (err) {
        console.error('Error fetching borrow history:', err);
        setError(err.response?.data?.message || 'Không thể tải lịch sử mượn sách');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchBorrowHistory();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'returned':
        return (
          <span className="flex items-center px-2 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Đã trả
          </span>
        );
      case 'overdue':
        return (
          <span className="flex items-center px-2 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Quá hạn
          </span>
        );
      default:
        return (
          <span className="flex items-center px-2 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
            <Clock className="w-4 h-4 mr-1" />
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Lịch sử mượn sách</h1>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Lịch sử mượn sách</h1>
          <div className="mt-4 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Đã xảy ra lỗi</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Lịch sử mượn sách</h1>
        
        {borrowHistory.length === 0 ? (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
            Bạn chưa có lịch sử mượn sách nào
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {borrowHistory.map((transaction) => (
                <li key={transaction.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {transaction.book?.coverImage ? (
                            <img
                              className="h-12 w-12 rounded-md object-cover"
                              src={transaction.book.coverImage}
                              alt={transaction.book.title}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                            {transaction.book?.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.book?.author}
                          </div>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span>Mượn: {new Date(transaction.borrowDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span>Trả: {transaction.returnDate ? new Date(transaction.returnDate).toLocaleDateString('vi-VN') : 'Chưa trả'}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHistoryTab;
