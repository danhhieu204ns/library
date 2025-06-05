import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Book, 
  User, 
  Calendar, 
  MapPin, 
  Star, 
  Heart, 
  BookOpen, 
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { booksAPI, borrowingsAPI, reservationsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');
  // Fetch book details with optimized caching
  const { data: bookData, isLoading, error } = useQuery({
    queryKey: ['book', id],
    queryFn: () => booksAPI.getBook(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    retry: (failureCount, error) => {
      // Don't retry on 429 errors
      if (error?.status === 429) return false;
      return failureCount < 1;
    },
    refetchInterval: false, // Disable automatic refetching
  });

  // Borrow book mutation with better error handling
  const borrowMutation = useMutation({
    mutationFn: (borrowData) => borrowingsAPI.borrowBook(borrowData),
    onSuccess: () => {
      queryClient.invalidateQueries(['book', id]);
      alert('Book borrowed successfully!');
    },
    onError: (error) => {
      const message = error.response?.status === 429 
        ? 'Too many requests. Please wait a moment and try again.'
        : error.response?.data?.message || 'Failed to borrow book';
      alert(message);
    }
  });

  // Reserve book mutation with better error handling
  const reserveMutation = useMutation({
    mutationFn: (reservationData) => reservationsAPI.reserveBook(reservationData),
    onSuccess: () => {
      queryClient.invalidateQueries(['book', id]);
      alert('Book reserved successfully!');
    },
    onError: (error) => {
      const message = error.response?.status === 429 
        ? 'Too many requests. Please wait a moment and try again.'
        : error.response?.data?.message || 'Failed to reserve book';
      alert(message);
    }
  });
  const handleBorrow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Prevent multiple simultaneous requests
    if (borrowMutation.isLoading) return;
    
    borrowMutation.mutate({
      book_id: id,
      user_id: user.id
    });
  };

  const handleReserve = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Prevent multiple simultaneous requests
    if (reserveMutation.isLoading) return;
    
    reserveMutation.mutate({
      book_id: id,
      user_id: user.id
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 w-32 rounded mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="bg-gray-200 w-full lg:w-80 h-96 rounded"></div>
                <div className="flex-1">
                  <div className="bg-gray-200 h-8 w-3/4 rounded mb-4"></div>
                  <div className="bg-gray-200 h-6 w-1/2 rounded mb-4"></div>
                  <div className="bg-gray-200 h-4 w-full rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 w-full rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">
            {error.status === 429 ? 'Too many requests' : 'Error loading book'}
          </div>
          <p className="text-gray-600 mb-4">
            {error.status === 429 
              ? 'Please wait a moment before trying again.' 
              : error.message
            }
          </p>
          <button
            onClick={() => navigate('/books')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }  const book = bookData?.data?.book;
  const availableCopies = bookData?.data?.available_copies || [];

  // Debug logging
  console.log('Book ID from URL:', id);
  console.log('Book Data Response:', bookData);
  console.log('Extracted Book:', book);

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-xl mb-2">Book not found</div>
          <p className="text-gray-600 mb-4">
            Book ID: {id}
            {bookData && (
              <span className="block text-sm mt-2">
                API Response: {JSON.stringify(bookData, null, 2)}
              </span>
            )}
          </p>
          <button
            onClick={() => navigate('/books')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/books')}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Books
        </button>

        {/* Book Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Book Cover */}
              <div className="w-full lg:w-80 flex-shrink-0">
                {book.cover_image_url ? (
                  <img
                    src={book.cover_image_url}
                    alt={book.title}
                    className="w-full h-96 object-cover rounded-lg shadow-md"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
                    <Book className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Book Information */}
              <div className="flex-1">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {book.title}
                  </h1>
                  
                  <div className="flex items-center text-lg text-gray-600 mb-4">
                    <User className="h-5 w-5 mr-2" />
                    <span>{book.author}</span>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    {book.genre && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {book.genre.genre_name}
                      </span>
                    )}
                    {book.language && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {book.language.language_name}
                      </span>
                    )}
                    {book.publication_year && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{book.publication_year}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-6 mb-6">
                    <div className="flex items-center">
                      <Star className="h-5 w-5 text-yellow-400 mr-1" />
                      <span className="text-lg font-medium">
                        {book.average_rating ? book.average_rating.toFixed(1) : 'No ratings'}
                      </span>
                      {book.total_reviews > 0 && (
                        <span className="text-gray-500 ml-1">
                          ({book.total_reviews} reviews)
                        </span>
                      )}
                    </div>

                    <div className={`flex items-center text-lg font-medium ${
                      book.available_copies > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {book.available_copies > 0 ? (
                        <CheckCircle className="h-5 w-5 mr-1" />
                      ) : (
                        <XCircle className="h-5 w-5 mr-1" />
                      )}
                      <span>
                        {book.available_copies > 0 
                          ? `${book.available_copies} available`
                          : 'Not available'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4">
                    {book.available_copies > 0 ? (
                      <button
                        onClick={handleBorrow}
                        disabled={borrowMutation.isLoading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        {borrowMutation.isLoading ? 'Borrowing...' : 'Borrow Now'}
                      </button>
                    ) : (
                      <button
                        onClick={handleReserve}
                        disabled={reserveMutation.isLoading}
                        className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {reserveMutation.isLoading ? 'Reserving...' : 'Reserve'}
                      </button>
                    )}
                    
                    <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center">
                      <Heart className="h-4 w-4 mr-2" />
                      Add to Wishlist
                    </button>
                  </div>
                </div>

                {/* Book Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {book.isbn && (
                    <div>
                      <span className="font-medium text-gray-700">ISBN:</span>
                      <span className="ml-2 text-gray-600">{book.isbn}</span>
                    </div>
                  )}
                  {book.publisher && (
                    <div>
                      <span className="font-medium text-gray-700">Publisher:</span>
                      <span className="ml-2 text-gray-600">{book.publisher.publisher_name}</span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Total Copies:</span>
                    <span className="ml-2 text-gray-600">{book.total_copies}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Available:</span>
                    <span className="ml-2 text-gray-600">{book.available_copies}</span>
                  </div>
                </div>

                {/* Tags */}
                {book.tags && book.tags.length > 0 && (
                  <div className="mt-4">
                    <span className="font-medium text-gray-700 block mb-2">Tags:</span>
                    <div className="flex flex-wrap gap-2">
                      {book.tags.map(tag => (
                        <span
                          key={tag._id}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                        >
                          {tag.tag_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'details', name: 'Details', icon: Book },
                { id: 'copies', name: 'Available Copies', icon: MapPin },
                { id: 'reviews', name: 'Reviews', icon: Star }
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                {book.description ? (
                  <p className="text-gray-700 leading-relaxed">
                    {book.description}
                  </p>
                ) : (
                  <p className="text-gray-500 italic">No description available.</p>
                )}
              </div>
            )}

            {activeTab === 'copies' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Available Copies ({availableCopies.length})
                </h3>
                {availableCopies.length > 0 ? (
                  <div className="space-y-3">
                    {availableCopies.map((copy) => (
                      <div key={copy._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              Copy ID: {copy._id}
                            </div>
                            {copy.location && (
                              <div className="text-sm text-gray-600 mt-1 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                Shelf {copy.location.shelf_number}, 
                                Row {copy.location.row_number}, 
                                Level {copy.location.level_number}
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium text-green-600">
                            Available
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No copies currently available.</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Reviews & Ratings
                </h3>
                <div className="text-center py-8">
                  <Star className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Be the first to review this book
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
