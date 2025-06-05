import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, Filter, Book, Star, User, Calendar } from 'lucide-react';
import { booksAPI } from '../../services/api';

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const BooksPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    language: '',
    author: '',
    available: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search query and author filter to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const debouncedAuthorFilter = useDebounce(filters.author, 500);

  // Create memoized filters object with debounced author
  const debouncedFilters = useMemo(() => ({
    ...filters,
    author: debouncedAuthorFilter
  }), [filters.genre, filters.language, debouncedAuthorFilter, filters.available]);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, debouncedFilters]);

  // Check if we're currently debouncing (for loading state)
  const isSearching = searchQuery !== debouncedSearchQuery || filters.author !== debouncedAuthorFilter;  // Fetch books with optimized configuration
  const { data: booksData, isLoading: booksLoading, error: booksError } = useQuery({
    queryKey: ['books', currentPage, debouncedSearchQuery, debouncedFilters],
    queryFn: () => booksAPI.getBooks({
      page: currentPage,
      limit: 12,
      search: debouncedSearchQuery,
      ...debouncedFilters
    }),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: (failureCount, error) => {
      // Don't retry on 429 errors or client errors (4xx)
      if (error?.status >= 400 && error?.status < 500) return false;
      return failureCount < 2; // Increase retry count for server errors
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchInterval: false, // Disable automatic refetching
    keepPreviousData: true, // Keep previous data during loading states
  });
  // Fetch metadata for filters with optimized caching
  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: booksAPI.getGenres,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false
  });

  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: booksAPI.getLanguages,
    staleTime: 30 * 60 * 1000, // 30 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false
  });
  const handleSearch = (e) => {
    e.preventDefault();
    // No need to set currentPage here as useEffect handles it
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    // No need to set currentPage here as useEffect handles it
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      language: '',
      author: '',
      available: false
    });
    setSearchQuery('');
    setCurrentPage(1);
  };  if (booksError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-xl mb-2">
            {booksError.status === 429 
              ? '⚠️ Too Many Requests' 
              : booksError.status >= 500
              ? '🔧 Server Error'
              : '❌ Error Loading Books'
            }
          </div>
          <p className="text-gray-600 mb-4">
            {booksError.status === 429 
              ? 'You\'re searching too quickly. Please wait a moment before trying again.' 
              : booksError.status >= 500
              ? 'Our servers are experiencing issues. Please try again later.'
              : booksError.message || 'An unexpected error occurred.'
            }
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  // console.log('Books Data:', booksData);
  const books = booksData?.data?.data?.books || [];
  // console.log('Books:', books);
  const pagination = booksData?.data?.data?.pagination || {};
  // console.log('Pagination:', pagination);
  const genres = genresData?.data?.data?.genres || [];
  // console.log('Genres:', genres);
  const languages = languagesData?.data?.data?.languages || [];
  // console.log('Languages:', languages);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Book className="mr-3 h-8 w-8 text-blue-600" />
                Library Books
              </h1>
              <p className="text-gray-600 mt-1">
                Browse our collection of {pagination.total || 0} books
              </p>
            </div>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="flex">                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    ) : (
                      <Search className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Search books, authors, genres..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-700 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Filter Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            {(searchQuery || Object.values(filters).some(f => f)) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genre
                  </label>
                  <select
                    value={filters.genre}
                    onChange={(e) => handleFilterChange('genre', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Genres</option>
                    {genres.map(genre => (
                      <option key={genre._id} value={genre._id}>
                        {genre.genre_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={filters.language}
                    onChange={(e) => handleFilterChange('language', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Languages</option>
                    {languages.map(language => (
                      <option key={language._id} value={language._id}>
                        {language.language_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={filters.author}
                    onChange={(e) => handleFilterChange('author', e.target.value)}
                    placeholder="Filter by author"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    checked={filters.available}
                    onChange={(e) => handleFilterChange('available', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="available" className="ml-2 text-sm text-gray-700">
                    Available only
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Books Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {booksLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <Book className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link
                key={book._id}
                to={`/books/${book._id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="aspect-w-3 aspect-h-4">
                  {book.cover_image_url ? (
                    <img
                      src={book.cover_image_url}
                      alt={book.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Book className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {book.title}
                  </h3>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <User className="h-4 w-4 mr-1" />
                    <span className="truncate">{book.author}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{book.genre?.genre_name}</span>
                    {book.publication_year && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{book.publication_year}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {book.average_rating ? book.average_rating.toFixed(1) : 'No ratings'}
                      </span>
                    </div>
                    
                    <div className={`text-sm font-medium ${
                      book.available_copies > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {book.available_copies > 0 
                        ? `${book.available_copies} available`
                        : 'Not available'
                      }
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={pagination.page <= 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pageNum = i + Math.max(1, pagination.page - 2);
                if (pageNum > pagination.pages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 border rounded-md text-sm font-medium ${
                      pageNum === pagination.page
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksPage;
