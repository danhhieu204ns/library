import React, { useState, useRef } from 'react';
import { Book, Search, Filter, Edit, Trash, Plus, Upload, Camera } from 'lucide-react';

const BooksTab = ({
  books = [],
  loading = false,
  onUpdateBook,
  onDeleteBook,
  searchTerm = '',
  onSearchChange,
  onUploadCover
}) => {
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category: '',
    copies: 0,
    cover_image_url: ''
  });
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    category: '',
    copies: 0,
    cover_image_url: ''
  });
  const fileInputRef = useRef(null);
  const newBookFileInputRef = useRef(null);

  // Initialize edit form with selected book data
  const handleEditClick = (book) => {
    setSelectedBook(book);
    setEditForm({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      description: book.description || '',
      category: book.category || '',
      copies: book.copies?.length || 0,
      cover_image_url: book.cover_image_url || ''
    });
    setShowEditModal(true);
  };

  // Handle delete book
  const handleDeleteBook = () => {
    onDeleteBook && onDeleteBook(selectedBook._id);
    setShowDeleteModal(false);
    setSelectedBook(null);
  };

  // Handle update book
  const handleUpdateBook = () => {
    onUpdateBook && onUpdateBook(selectedBook._id, editForm);
    setShowEditModal(false);
    setSelectedBook(null);
  };

  // Handle cover image upload
  const handleCoverImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh');
      return;
    }

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước tệp quá lớn. Giới hạn là 5MB.');
      return;
    }

    try {
      // Call the parent component's upload handler
      if (onUploadCover) {
        const imageUrl = await onUploadCover(selectedBook._id, file);
        if (imageUrl) {
          // Update the form with the new image URL
          setEditForm({
            ...editForm,
            cover_image_url: imageUrl
          });
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert('Đã xảy ra lỗi khi tải lên ảnh');
    }
  };

  // Handle new book cover image upload
  const handleNewBookCoverUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn một tệp hình ảnh');
      return;
    }

    // Validate file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước tệp quá lớn. Giới hạn là 5MB.');
      return;
    }

    try {
      // Call the parent component's upload handler for a temporary image
      if (onUploadCover) {
        const imageUrl = await onUploadCover(null, file); // null bookId for temporary upload
        if (imageUrl) {
          // Update the form with the new image URL
          setNewBookForm({
            ...newBookForm,
            cover_image_url: imageUrl
          });
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert('Đã xảy ra lỗi khi tải lên ảnh');
    }
  };

  if (loading) {
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

  // Filter books based on search
  const filteredBooks = books.filter(book =>
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Quản Lý Sách</h2>
      
      {/* Search and Add Button */}
      <div className="flex flex-col md:flex-row justify-between space-y-2 md:space-y-0 mb-4">
        <div className="relative w-full md:w-1/2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Tìm kiếm theo tên sách, tác giả, ISBN..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
        <button 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-5 w-5 mr-2" />
          Thêm sách mới
        </button>
      </div>
      
      {/* Books List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sách
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tác giả
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ISBN
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số bản sao
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <tr key={book._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                        {book.cover_image ? (
                          <img 
                            src={book.cover_image} 
                            alt={book.title} 
                            className="h-10 w-10 object-cover rounded" 
                          />
                        ) : (
                          <Book className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {book.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.isbn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{book.copies?.length || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      onClick={() => handleEditClick(book)}
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-900"
                      onClick={() => {
                        setSelectedBook(book);
                        setShowDeleteModal(true);
                      }}
                    >
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                  Không tìm thấy sách nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Book Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xác nhận xóa sách</h3>
            <p className="mb-4">Bạn có chắc chắn muốn xóa sách: <span className="font-medium">{selectedBook?.title}</span>?</p>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedBook(null);
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={handleDeleteBook}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh sửa thông tin sách</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sách</label>
                <input
                  type="text"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa sách</label>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-40 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {editForm.cover_image_url ? (
                      <img 
                        src={editForm.cover_image_url} 
                        alt="Book cover" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Book className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleCoverImageUpload}
                    />
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Tải lên ảnh bìa
                    </button>
                    {editForm.cover_image_url && (
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2"
                        onClick={() => setEditForm({...editForm, cover_image_url: ''})}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                <input
                  type="text"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  value={editForm.author}
                  onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input
                  type="text"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  value={editForm.isbn}
                  onChange={(e) => setEditForm({...editForm, isbn: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <input
                  type="text"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  rows="3"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBook(null);
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleUpdateBook}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm sách mới</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sách</label>
                <input
                  type="text"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  value={newBookForm.title}
                  onChange={(e) => setNewBookForm({...newBookForm, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa sách</label>
                <div className="flex items-center space-x-4">
                  <div className="w-32 h-40 border rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    {newBookForm.cover_image_url ? (
                      <img 
                        src={newBookForm.cover_image_url} 
                        alt="Book cover" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Book className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={newBookFileInputRef}
                      onChange={handleNewBookCoverUpload}
                    />
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => newBookFileInputRef.current.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Tải lên ảnh bìa
                    </button>
                    {newBookForm.cover_image_url && (
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2"
                        onClick={() => setNewBookForm({...newBookForm, cover_image_url: ''})}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                <input
                  type="text"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  value={newBookForm.author}
                  onChange={(e) => setNewBookForm({...newBookForm, author: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input
                  type="text"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  value={newBookForm.isbn}
                  onChange={(e) => setNewBookForm({...newBookForm, isbn: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <input
                  type="text"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  value={newBookForm.category}
                  onChange={(e) => setNewBookForm({...newBookForm, category: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  rows="3"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  value={newBookForm.description}
                  onChange={(e) => setNewBookForm({...newBookForm, description: e.target.value})}
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  setShowAddModal(false);
                  setNewBookForm({
                    title: '',
                    author: '',
                    isbn: '',
                    description: '',
                    category: '',
                    copies: 0,
                    cover_image_url: ''
                  });
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  onUpdateBook && onUpdateBook(null, newBookForm); // null ID means create new
                  setShowAddModal(false);
                  setNewBookForm({
                    title: '',
                    author: '',
                    isbn: '',
                    description: '',
                    category: '',
                    copies: 0,
                    cover_image_url: ''
                  });
                }}
              >
                Thêm sách
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksTab;
