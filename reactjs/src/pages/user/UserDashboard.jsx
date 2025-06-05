import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  User, 
  BookOpen, 
  Clock, 
  Calendar, 
  Star, 
  History,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { borrowingsAPI, reservationsAPI } from '../../services/api';
import RatingModal from '../../components/common/RatingModal';

const UserDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('borrowed');
  const [ratingModal, setRatingModal] = useState({ isOpen: false, book: null });

  // Fetch user's borrowed books
  const { data: borrowingsData, isLoading: borrowingsLoading } = useQuery({
    queryKey: ['borrowings', user?.id],
    queryFn: () => borrowingsAPI.getBorrowings({ user_id: user?.id }),
    enabled: !!user
  });

  // Fetch user's reservations
  const { data: reservationsData, isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations', user?.id],
    queryFn: () => reservationsAPI.getReservations({ user_id: user?.id }),
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

  // Cancel reservation mutation
  const cancelReservationMutation = useMutation({
    mutationFn: (reservationId) => reservationsAPI.cancelReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations', user?.id]);
      alert('Reservation canceled successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to cancel reservation');
    }
  });

  const handleReturnBook = (borrowingId) => {
    if (window.confirm('Are you sure you want to return this book?')) {
      returnBookMutation.mutate(borrowingId);
    }
  };

  const handleCancelReservation = (reservationId) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      cancelReservationMutation.mutate(reservationId);
    }
  };

  const handleRateBook = (book) => {
    setRatingModal({ isOpen: true, book });
  };

  const closeRatingModal = () => {
    setRatingModal({ isOpen: false, book: null });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Please log in</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need to be logged in to view your dashboard
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    );  }
  
  const borrowings = borrowingsData?.data.data || [];
  // console.log('Borrowings:', borrowings);
  const reservations = reservationsData?.data.data || [];
  // console.log('Reservations:', reservations);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user.full_name || user.username}!
                </h1>
                <p className="text-gray-600">Manage your books and library activities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Currently Borrowed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {borrowings.filter(b => b.status === 'borrowed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Reservations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservations.filter(r => r.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <History className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Books Read</p>
                <p className="text-2xl font-bold text-gray-900">
                  {borrowings.filter(b => b.status === 'returned').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'borrowed', name: 'Currently Borrowed', icon: BookOpen },
                { id: 'reservations', name: 'Reservations', icon: Clock },
                { id: 'history', name: 'Reading History', icon: History }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Currently Borrowed Books */}
            {activeTab === 'borrowed' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Currently Borrowed Books</h3>
                {borrowingsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-200 h-16 w-12 rounded"></div>
                          <div className="flex-1">
                            <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                            <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : borrowings.filter(b => b.status === 'borrowed').length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No borrowed books</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Browse our collection to find books to borrow
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/books"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Browse Books
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {borrowings.filter(b => b.status === 'borrowed').map((borrowing) => (
                      <div key={borrowing._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {borrowing.book?.title || 'Book Title'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                by {borrowing.book?.author || 'Unknown Author'}
                              </p>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Due: {new Date(borrowing.due_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/books/${borrowing.book?._id}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>                            <button 
                              onClick={() => handleReturnBook(borrowing._id)}
                              disabled={returnBookMutation.isLoading}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                            >
                              {returnBookMutation.isLoading ? 'Returning...' : 'Return Book'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reservations */}
            {activeTab === 'reservations' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Active Reservations</h3>
                {reservationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-200 h-16 w-12 rounded"></div>
                          <div className="flex-1">
                            <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                            <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reservations.filter(r => r.status === 'active').length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No active reservations</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Reserve books that are currently unavailable
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations.filter(r => r.status === 'active').map((reservation) => (
                      <div key={reservation._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {reservation.book?.title || 'Book Title'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                by {reservation.book?.author || 'Unknown Author'}
                              </p>
                              <div className="flex items-center mt-1 text-sm text-orange-600">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Reserved on {new Date(reservation.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/books/${reservation.book?._id}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>                            <button 
                              onClick={() => handleCancelReservation(reservation._id)}
                              disabled={cancelReservationMutation.isLoading}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                            >
                              {cancelReservationMutation.isLoading ? 'Canceling...' : 'Cancel'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reading History */}
            {activeTab === 'history' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reading History</h3>
                {borrowingsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-200 h-16 w-12 rounded"></div>
                          <div className="flex-1">
                            <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                            <div className="bg-gray-200 h-3 w-1/2 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : borrowings.filter(b => b.status === 'returned').length === 0 ? (
                  <div className="text-center py-8">
                    <History className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No reading history</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start borrowing books to build your reading history
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {borrowings.filter(b => b.status === 'returned').map((borrowing) => (
                      <div key={borrowing._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">
                                {borrowing.book?.title || 'Book Title'}
                              </h4>
                              <p className="text-sm text-gray-600">
                                by {borrowing.book?.author || 'Unknown Author'}
                              </p>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Returned: {new Date(borrowing.return_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Link
                              to={`/books/${borrowing.book?._id}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>                            <button 
                              onClick={() => handleRateBook(borrowing.book)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                              <Star className="h-4 w-4 mr-1" />
                              Rate
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={ratingModal.isOpen}
        onClose={closeRatingModal}
        book={ratingModal.book}
        user={user}
      />
    </div>
  );
};

export default UserDashboard;
