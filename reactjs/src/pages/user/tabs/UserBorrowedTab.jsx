import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { borrowingsAPI } from '../../../services/api';
import RatingModal from '../../../components/common/RatingModal';

const UserBorrowedTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [ratingModal, setRatingModal] = useState({ isOpen: false, book: null });

  // Fetch user's borrowed books
  const { data: borrowingsData, isLoading: borrowingsLoading } = useQuery({
    queryKey: ['borrowings', user?.id],
    queryFn: () => borrowingsAPI.getBorrowings({ user_id: user?.id }),
    enabled: !!user
  });

  // Return book mutation
  const returnBookMutation = useMutation({
    mutationFn: (borrowingId) => borrowingsAPI.returnBook(borrowingId, { return_date: new Date() }),
    onSuccess: () => {
      queryClient.invalidateQueries(['borrowings', user?.id]);
      alert('Book returned successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to return book');
    }
  });

  // Handle return book
  const handleReturnBook = (borrowingId) => {
    returnBookMutation.mutate(borrowingId);
  };

  if (borrowingsLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const borrowings = borrowingsData?.data?.data?.borrowings || [];
  const activeBorrowings = borrowings.filter(b => b.status === 'Borrowed');

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Sách đang mượn</h2>
      
      {activeBorrowings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeBorrowings.map((borrowing) => {
            const isOverdue = new Date(borrowing.due_date) < new Date();
            return (
              <div 
                key={borrowing._id} 
                className={`bg-white shadow rounded-lg overflow-hidden border ${
                  isOverdue ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                      {borrowing.book?.cover_image ? (
                        <img 
                          src={borrowing.book.cover_image} 
                          alt={borrowing.book.title} 
                          className="h-12 w-12 object-cover rounded" 
                        />
                      ) : (
                        <BookOpen className="h-6 w-6 text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {borrowing.book?.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {borrowing.book?.author}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Ngày mượn: {new Date(borrowing.borrow_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        Hạn trả: {new Date(borrowing.due_date).toLocaleDateString()}
                      </span>
                    </div>
                    {borrowing.copy_id && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500">Mã sách: {borrowing.copy_id}</span>
                      </div>
                    )}
                  </div>
                  
                  {isOverdue && (
                    <div className="bg-red-50 p-3 rounded-md mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Sách quá hạn
                          </h3>
                          <div className="mt-1 text-sm text-red-700">
                            <p>
                              Vui lòng trả sách ngay để tránh phí phạt.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleReturnBook(borrowing._id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Trả sách
                    </button>
                    <button
                      onClick={() => setRatingModal({ isOpen: true, book: borrowing.book })}
                      className="flex-1 bg-white hover:bg-gray-50 text-gray-700 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Đánh giá
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Bạn chưa mượn sách nào
          </h3>
          <p className="text-gray-500">
            Hãy đến thư viện để mượn sách hoặc đặt trước sách online.
          </p>
        </div>
      )}
      
      {/* Rating Modal */}
      {ratingModal.isOpen && (
        <RatingModal
          book={ratingModal.book}
          onClose={() => setRatingModal({ isOpen: false, book: null })}
        />
      )}
    </div>
  );
};

export default UserBorrowedTab;
