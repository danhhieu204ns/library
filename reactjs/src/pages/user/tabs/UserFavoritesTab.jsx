import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Heart, BookOpen, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../../../services/api';

const UserFavoritesTab = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        // Fetch user's favorites from API using the booksAPI service
        const response = await booksAPI.getBooks({ 
          favorite: true,
          userId: user.id 
        });
        console.log('Favorites response:', response);
        setFavorites(response.data.data.books);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError(err.response?.data?.message || 'Không thể tải danh sách yêu thích');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFavorites();
    }
  }, [user]);
  const removeFromFavorites = async (bookId) => {
    try {
      await booksAPI.updateBook(bookId, { favorite: false });
      
      // Update the UI by removing the book from favorites
      setFavorites(favorites.filter(book => book.id !== bookId));
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError(err.response?.data?.message || 'Không thể xóa khỏi danh sách yêu thích');
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Sách yêu thích</h1>
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
          <h1 className="text-2xl font-semibold text-gray-900">Sách yêu thích</h1>
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
        <h1 className="text-2xl font-semibold text-gray-900">Sách yêu thích</h1>
        
        {favorites.length === 0 ? (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
            Bạn chưa có sách yêu thích nào
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((book) => (
              <div key={book.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-16 w-12">
                        {book.coverImage ? (
                          <img
                            className="h-16 w-12 object-cover"
                            src={book.coverImage}
                            alt={book.title}
                          />
                        ) : (
                          <div className="h-16 w-12 bg-gray-200 flex items-center justify-center text-gray-500">
                            <BookOpen className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <Link to={`/books/${book.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                          {book.title}
                        </Link>
                        <div className="text-sm text-gray-500">
                          {book.author}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromFavorites(book.id)}
                      className="inline-flex items-center p-1.5 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Xóa khỏi yêu thích"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 line-clamp-3">
                      {book.description || 'Không có mô tả.'}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/books/${book.id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFavoritesTab;
