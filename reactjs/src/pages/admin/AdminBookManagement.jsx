import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Filter,
  BookPlus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  MoreVertical,
  Copy,
  AlertCircle
} from 'lucide-react';
import { booksAPI } from '../../services/api';

const AdminBookManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const queryClient = useQueryClient();

  const { data: booksData, isLoading, error } = useQuery({
    queryKey: ['admin-books', searchTerm, filterStatus],
    queryFn: () => booksAPI.getBooks({ 
      search: searchTerm || undefined,
      status: filterStatus || undefined,
      page: 1,
      limit: 20
    })
  });

  const deleteBookMutation = useMutation({
    mutationFn: booksAPI.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-books']);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (bookIds) => {
      return Promise.all(bookIds.map(id => booksAPI.deleteBook(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-books']);
      setSelectedBooks([]);
      setShowBulkActions(false);
    }
  });

  const books = booksData?.data || [];
  const pagination = booksData?.pagination || {};

  const handleSelectBook = (bookId) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBooks.length === books.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(books.map(book => book._id));
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBookMutation.mutateAsync(bookId);
      } catch (error) {
        alert('Failed to delete book: ' + error.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedBooks.length} books?`)) {
      try {
        await bulkDeleteMutation.mutateAsync(selectedBooks);
      } catch (error) {
        alert('Failed to delete books: ' + error.message);
      }
    }
  };

  const getAvailableCopies = (book) => {
    const totalCopies = book.copies?.length || 0;
    const availableCopies = book.copies?.filter(copy => copy.status === 'Available').length || 0;
    return { total: totalCopies, available: availableCopies };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Book Management</h1>
                  <p className="text-gray-600">Manage your library's book collection</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </button>
                <Link
                  to="/admin/books/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <BookPlus className="h-4 w-4 mr-2" />
                  Add Book
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search books by title, author, ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="Available">Available</option>
                <option value="Borrowed">Borrowed</option>
                <option value="Reserved">Reserved</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedBooks.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                {selectedBooks.length} book{selectedBooks.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedBooks([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Books Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {isLoading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="bg-gray-200 h-4 w-4 rounded"></div>
                    <div className="bg-gray-200 h-16 w-12 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-gray-200 h-4 rounded"></div>
                      <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading books</h3>
              <p className="mt-1 text-sm text-gray-500">{error.message}</p>
            </div>
          ) : books.length === 0 ? (
            <div className="p-6 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first book'}
              </p>
              <div className="mt-6">
                <Link
                  to="/admin/books/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <BookPlus className="h-4 w-4 mr-2" />
                  Add Book
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedBooks.length === books.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Select All ({books.length})
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-gray-200">
                {books.map((book) => {
                  const { total, available } = getAvailableCopies(book);
                  return (
                    <li key={book._id} className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedBooks.includes(book._id)}
                          onChange={() => handleSelectBook(book._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                        />
                        
                        {/* Book Cover */}
                        <div className="flex-shrink-0 h-16 w-12 bg-gray-200 rounded overflow-hidden mr-4">
                          {book.image_url ? (
                            <img
                              src={book.image_url}
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Book Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <Link
                                to={`/books/${book._id}`}
                                className="text-sm font-medium text-gray-900 hover:text-blue-600"
                              >
                                {book.title}
                              </Link>
                              <p className="text-sm text-gray-500">
                                by {book.author} • {book.publication_year}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                ISBN: {book.isbn} • {book.genre?.name}
                              </p>
                              <div className="flex items-center mt-2 space-x-4">
                                <span className="text-xs text-gray-500">
                                  Copies: {available}/{total} available
                                </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  available > 0 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {available > 0 ? 'Available' : 'Not Available'}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2 ml-4">
                              <Link
                                to={`/books/${book._id}`}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                to={`/admin/books/${book._id}/edit`}
                                className="text-blue-400 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <Link
                                to={`/admin/books/${book._id}/copies`}
                                className="text-green-400 hover:text-green-600"
                              >
                                <Copy className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteBook(book._id)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <div className="relative">
                                <button className="text-gray-400 hover:text-gray-600">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Previous
              </button>
              <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total_records)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total_records}</span> books
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Previous
                  </button>
                  {/* Page numbers would go here */}
                  <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookManagement;
