import React, { useState, useEffect } from 'react';
import { X, User, Book, Calendar, Clock, FileText, Search } from 'lucide-react';

const BorrowingForm = ({ 
  borrowing = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  mode = 'borrow', // 'borrow', 'return', 'extend'
  users = [],
  books = []
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    book_id: '',
    borrow_date: new Date().toISOString().split('T')[0],
    due_date: '',
    return_date: '',
    notes: '',
    late_fee: 0,
    condition_before: 'good',
    condition_after: 'good'
  });

  const [searchUsers, setSearchUsers] = useState('');
  const [searchBooks, setSearchBooks] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    if (borrowing) {
      setFormData({
        user_id: borrowing.user_id || '',
        book_id: borrowing.book_id || '',
        borrow_date: borrowing.borrow_date ? borrowing.borrow_date.split('T')[0] : '',
        due_date: borrowing.due_date ? borrowing.due_date.split('T')[0] : '',
        return_date: borrowing.return_date ? borrowing.return_date.split('T')[0] : '',
        notes: borrowing.notes || '',
        late_fee: borrowing.late_fee || 0,
        condition_before: borrowing.condition_before || 'good',
        condition_after: borrowing.condition_after || 'good'
      });
      
      // Set selected user and book based on borrowing data
      if (borrowing.user) {
        setSelectedUser(borrowing.user);
      }
      if (borrowing.book) {
        setSelectedBook(borrowing.book);
      }
    } else {
      // Set default due date (14 days from borrow date)
      const borrowDate = new Date();
      const dueDate = new Date(borrowDate);
      dueDate.setDate(dueDate.getDate() + 14);
      setFormData(prev => ({
        ...prev,
        due_date: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [borrowing]);

  useEffect(() => {
    // Filter users based on search
    if (searchUsers) {
      const filtered = users.filter(user => 
        user.full_name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchUsers.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchUsers.toLowerCase())
      );
      setFilteredUsers(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredUsers([]);
    }
  }, [searchUsers, users]);

  useEffect(() => {
    // Filter books based on search
    if (searchBooks) {
      const filtered = books.filter(book => 
        book.title?.toLowerCase().includes(searchBooks.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchBooks.toLowerCase()) ||
        book.isbn?.includes(searchBooks)
      );
      setFilteredBooks(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredBooks([]);
    }
  }, [searchBooks, books]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormData(prev => ({ ...prev, user_id: user._id }));
    setSearchUsers('');
    setFilteredUsers([]);
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setFormData(prev => ({ ...prev, book_id: book._id }));
    setSearchBooks('');
    setFilteredBooks([]);
  };

  const calculateLateFee = () => {
    if (mode === 'return' && formData.return_date && formData.due_date) {
      const returnDate = new Date(formData.return_date);
      const dueDate = new Date(formData.due_date);
      
      if (returnDate > dueDate) {
        const diffTime = Math.abs(returnDate - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const lateFee = diffDays * 5000; // 5000 VND per day
        setFormData(prev => ({ ...prev, late_fee: lateFee }));
      } else {
        setFormData(prev => ({ ...prev, late_fee: 0 }));
      }
    }
  };

  useEffect(() => {
    calculateLateFee();
  }, [formData.return_date, formData.due_date, mode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.user_id) {
      alert('Please select a user');
      return;
    }
    
    if (!formData.book_id) {
      alert('Please select a book');
      return;
    }

    if (mode === 'borrow' && !formData.borrow_date) {
      alert('Please select a borrow date');
      return;
    }

    if (mode === 'return' && !formData.return_date) {
      alert('Please select a return date');
      return;
    }

    onSubmit({
      ...formData,
      mode
    });
  };

  const getTitle = () => {
    switch (mode) {
      case 'borrow': return 'Borrow Book';
      case 'return': return 'Return Book';
      case 'extend': return 'Extend Borrowing';
      default: return 'Borrowing Form';
    }
  };

  const conditionOptions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'damaged', label: 'Damaged' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {getTitle()}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User *
            </label>
            {selectedUser ? (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-blue-600 mr-2" />
                  <div>
                    <p className="font-medium text-blue-900">{selectedUser.full_name}</p>
                    <p className="text-sm text-blue-600">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setFormData(prev => ({ ...prev, user_id: '' }));
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search users by name, username, or email"
                />
                {filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredUsers.map(user => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                      >
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Book Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Book *
            </label>
            {selectedBook ? (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <Book className="h-4 w-4 text-green-600 mr-2" />
                  <div>
                    <p className="font-medium text-green-900">{selectedBook.title}</p>
                    <p className="text-sm text-green-600">by {selectedBook.author}</p>
                    <p className="text-xs text-green-500">ISBN: {selectedBook.isbn}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBook(null);
                    setFormData(prev => ({ ...prev, book_id: '' }));
                  }}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchBooks}
                  onChange={(e) => setSearchBooks(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search books by title, author, or ISBN"
                />
                {filteredBooks.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredBooks.map(book => (
                      <button
                        key={book._id}
                        type="button"
                        onClick={() => handleBookSelect(book)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                        disabled={book.available_copies <= 0}
                      >
                        <Book className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="flex-1">
                          <p className="font-medium">{book.title}</p>
                          <p className="text-sm text-gray-500">by {book.author}</p>
                          <p className="text-xs text-gray-400">
                            Available: {book.available_copies} / {book.total_copies}
                          </p>
                        </div>
                        {book.available_copies <= 0 && (
                          <span className="text-xs text-red-600">Not Available</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Borrow Date */}
            {(mode === 'borrow' || mode === 'extend') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Borrow Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="borrow_date"
                    value={formData.borrow_date}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Return Date */}
            {mode === 'return' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="date"
                    name="return_date"
                    value={formData.return_date}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {/* Late Fee */}
            {mode === 'return' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Late Fee (VND)
                </label>
                <input
                  type="number"
                  name="late_fee"
                  value={formData.late_fee}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="1000"
                />
              </div>
            )}

            {/* Condition Before (for new borrowings) */}
            {mode === 'borrow' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Book Condition
                </label>
                <select
                  name="condition_before"
                  value={formData.condition_before}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {conditionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Condition After (for returns) */}
            {mode === 'return' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Book Condition on Return
                </label>
                <select
                  name="condition_after"
                  value={formData.condition_after}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {conditionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter any additional notes"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : mode === 'borrow' ? 'Borrow Book' : mode === 'return' ? 'Return Book' : 'Extend Borrowing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BorrowingForm;
