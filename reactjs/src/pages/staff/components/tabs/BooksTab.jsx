import React, { useState, useEffect, useRef } from 'react';
import { Book, Eye, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

import TabHeader from '../common/TabHeader';
import LoadingSkeleton from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';
import BookForm from '../../../../components/forms/BookForm';
import { booksAPI } from '../../../../services/api';

// Add CSS for animations
const modalStyles = `  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { 
      opacity: 0; 
      transform: translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes scaleIn {
    from { 
      opacity: 0; 
      transform: scale(0.95); 
    }
    to { 
      opacity: 1; 
      transform: scale(1); 
    }
  }
  
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(2px);
    z-index: 50;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease-out;
  }
  
  .modal-content {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 48rem;
    margin: 1rem;
    position: relative;
    z-index: 51;
    animation: slideIn 0.3s ease-out forwards;
  }
`;

const BooksTab = ({
  books,
  isLoading,
  searchTerm,
  setSearchTerm,
  totalBooks,
  activeBorrowings,
  deleteBookMutation,
  updateBookMutation
}) => {  // console.log("BooksTab rendered with books:", books);  // State for modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Get query client for cache invalidation
  const queryClient = useQueryClient();
  
  // State for image upload
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  // Refs for form inputs
  const titleRef = useRef(null);
  const authorRef = useRef(null);
  const isbnRef = useRef(null);
  const descriptionRef = useRef(null);
  const publicationDateRef = useRef(null);
  const genreRef = useRef(null);
    // State for user feedback
  const [feedback, setFeedback] = useState({ message: '', type: '' });
    // State for add book modal
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [isAddBookLoading, setIsAddBookLoading] = useState(false);
  
  // Function to show feedback message
  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
  };

  // Filtered books based on search term
  const filteredBooks = books.filter(book => 
    searchTerm === '' || 
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Apply modal animation styles
  useEffect(() => {
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = modalStyles;
    document.head.appendChild(styleElement);

    // Clean up
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  // Fetch categories when add book modal opens
  useEffect(() => {
    if (isAddModalOpen) {
      const fetchCategories = async () => {
        try {
          const genresResponse = await booksAPI.getGenres();
          const languagesResponse = await booksAPI.getLanguages();
          
          if (genresResponse.data && genresResponse.data.success) {
            // Store the full genre objects with IDs
            setCategories(genresResponse.data.data.genres);
          }
          
          if (languagesResponse.data && languagesResponse.data.success) {
            // Store the full language objects with IDs
            setLanguages(languagesResponse.data.data.languages);
          }
        } catch (error) {
          console.error('Error fetching categories or languages:', error);
          showFeedback('Không thể tải danh mục hoặc ngôn ngữ sách. Vui lòng thử lại sau.', 'error');
        }
      };

      fetchCategories();
    }
  }, [isAddModalOpen]);

  // Handle modal actions
  const handleViewBook = (book) => {
    setSelectedBook(book);
    setIsViewModalOpen(true);
  };  const handleEditBook = (book) => {
    setSelectedBook(book);
    setPreviewImage(book.cover_image_url || null);
    setUploadedImage(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteBook = (book) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showFeedback('Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 5MB.', 'error');
        return;
      }
      
      // Check file type
      if (!file.type.match('image.*')) {
        showFeedback('Vui lòng chọn file hình ảnh.', 'error');
        return;
      }
      
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        showFeedback('Ảnh đã được tải lên thành công. Nhấn "Lưu thay đổi" để cập nhật.', 'success');
      };
      reader.readAsDataURL(file);
    }
  };
  const handleImageUpload = async (bookId) => {
    if (!uploadedImage) return null;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadedImage);
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload/book-cover/${bookId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      );
      
      showFeedback('Ảnh bìa sách đã được tải lên thành công', 'success');
      return response.data.data.cover_image_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error.response?.data?.message || 'Không thể tải lên ảnh. Vui lòng thử lại sau.';
      showFeedback(errorMessage, 'error');
      return null;
    }
  };  const handleBookUpdate = async () => {
    // Validate required fields
    if (!titleRef.current.value.trim()) {
      alert('Tiêu đề sách không được để trống');
      titleRef.current.focus();
      return;
    }
    
    if (!authorRef.current.value.trim()) {
      alert('Tác giả không được để trống');
      authorRef.current.focus();
      return;
    }
    
    // Collect form data
    const updatedBookData = {
      title: titleRef.current.value.trim(),
      author: authorRef.current.value.trim(),
      isbn: isbnRef.current.value.trim(),
      description: descriptionRef.current.value.trim(),
    };
    
    if (publicationDateRef.current.value) {
      updatedBookData.publication_date = publicationDateRef.current.value;
    }
    
    try {
      // Start loading state
      setIsUploading(true);
      
      // First upload image if there's a new one
      let coverImageUrl = null;
      if (uploadedImage) {
        coverImageUrl = await handleImageUpload(selectedBook._id);
        if (coverImageUrl) {
          updatedBookData.cover_image_url = coverImageUrl;
        }
      }
      
      // Then update book data
      await updateBookMutation.mutateAsync({
        id: selectedBook._id,
        data: updatedBookData
      });
      
      // Reset states
      setIsUploading(false);
      setUploadedImage(null);
      setPreviewImage(null);
      setIsEditModalOpen(false);
      
      // Show success message
      showFeedback('Cập nhật sách thành công!');
      
      // Refetch books data
      queryClient.invalidateQueries(['books-staff']);
    } catch (error) {
      console.error('Error updating book:', error);
      setIsUploading(false);
      alert('Có lỗi xảy ra khi cập nhật sách: ' + (error.response?.data?.message || error.message));
    }
  };
  const confirmDeleteBook = () => {
    if (selectedBook && selectedBook._id) {
      deleteBookMutation.mutate(selectedBook._id, {
        onSuccess: () => {
          showFeedback(`Sách "${selectedBook.title}" đã được xóa thành công`, 'success');
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.message || 'Không thể xóa sách. Vui lòng thử lại sau.';
          showFeedback(errorMessage, 'error');
        }
      });
      setIsDeleteModalOpen(false);
    }
  };  // Handle adding a new book
  const handleAddBook = async (formData) => {
    setIsAddBookLoading(true);
    
    try {
      // Debug form data content
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
      }
      
      // The form data is already properly formatted in the BookForm component
      // Just pass it directly to the API
      const response = await booksAPI.createBook(formData);
      
      if (response.data && response.data.success) {
        showFeedback('Thêm sách thành công!', 'success');
        
        // Close modal and refresh book list
        setIsAddModalOpen(false);
        queryClient.invalidateQueries(['books-staff']);
      }
    } catch (error) {
      console.error('Error creating book:', error);
      showFeedback(
        error.response?.data?.message || 'Có lỗi xảy ra khi thêm sách. Vui lòng thử lại sau.',
        'error'
      );
    } finally {
      setIsAddBookLoading(false);
    }
  };
  // Render the loading skeleton
  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div>
      {/* Feedback message */}
      {feedback.message && (
        <div 
          className={`mb-4 p-4 rounded-md ${
            feedback.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
          }`}
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {feedback.type === 'error' ? (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{feedback.message}</p>
            </div>
          </div>
        </div>
      )}      <TabHeader 
        title="Quản lý sách"
        searchPlaceholder="Tìm kiếm sách..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actionButton={{
          icon: 'BookPlus',
          label: 'Thêm sách',
          onClick: () => setIsAddModalOpen(true)
        }}
      />

      {/* Stats Cards */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{totalBooks}</div>
            <div className="text-sm text-gray-500">Tổng số sách</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{activeBorrowings}</div>
            <div className="text-sm text-gray-500">Đang được mượn</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{totalBooks - activeBorrowings}</div>
            <div className="text-sm text-gray-500">Có sẵn</div>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">        {filteredBooks.length === 0 ? (
          <EmptyState 
            icon="Book"
            title="Không tìm thấy sách nào"
            description="Không có sách nào phù hợp với từ khóa tìm kiếm của bạn"
            actionButton={{
              icon: 'BookPlus',
              label: 'Thêm sách mới',
              onClick: () => setIsAddModalOpen(true)
            }}
          />
        ) : (
          <div className="overflow-x-auto">
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
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số bản sao
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                          <Book className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{book.title}</div>
                          <div className="text-sm text-gray-500">{book.genre.genre_name || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{book.author || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{book.isbn || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge 
                        status={book.status || 'Active'} 
                        type="default" 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {book.copies?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewBook(book)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1 hover:bg-blue-50 rounded-full"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditBook(book)}
                          className="text-amber-600 hover:text-amber-900 transition-colors duration-200 p-1 hover:bg-amber-50 rounded-full"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>      {/* View Book Modal */}
      {isViewModalOpen && selectedBook && (
        <div className="modal-overlay">
          <div className="modal-content md:mx-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Chi tiết sách
              </h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div><div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Book Image */}                
                <div className="flex flex-col items-center">
                  <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                    {selectedBook.cover_image_url ? (
                      <img 
                        src={selectedBook.cover_image_url} 
                        alt={selectedBook.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                        <Book className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 text-center">Ảnh bìa sách</p>
                </div>
                
                {/* Book Details - Column 1 */}
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Tiêu đề</p>
                    <p className="text-base text-gray-900">{selectedBook.title}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Tác giả</p>
                    <p className="text-base text-gray-900">{selectedBook.author || 'N/A'}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">ISBN</p>
                    <p className="text-base text-gray-900">{selectedBook.isbn || 'N/A'}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Danh mục</p>
                    <p className="text-base text-gray-900">{selectedBook.genre?.genre_name || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Book Details - Column 2 */}
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Mô tả</p>
                    <p className="text-base text-gray-900">{selectedBook.description || 'Không có mô tả'}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Số bản sao</p>
                    <p className="text-base text-gray-900">{selectedBook.copies?.length || 0}</p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Ngày xuất bản</p>
                    <p className="text-base text-gray-900">
                      {selectedBook.publication_date 
                        ? new Date(selectedBook.publication_date).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Display copy information if available */}
              {selectedBook.copies && selectedBook.copies.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Thông tin bản sao</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID Bản sao
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vị trí
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedBook.copies.map((copy) => (
                          <tr key={copy._id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {copy._id}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <StatusBadge 
                                status={copy.status || 'Available'} 
                                type="default" 
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {copy.location || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>            <div className="px-4 py-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2 transition-colors duration-200"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditBook(selectedBook);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Chỉnh sửa
              </button>            
              </div>
          </div>
        </div>
      )}      
      {/* Edit Book Modal */}
      {isEditModalOpen && selectedBook && (
        <div className="modal-overlay">
          <div className="modal-content md:mx-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Chỉnh sửa sách
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div><div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Image Upload Section */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Ảnh bìa sách
                  </label>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                      {previewImage ? (
                        <img 
                          src={previewImage} 
                          alt="Book preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                          <Book className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label 
                      htmlFor="image-upload" 
                      className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors duration-200"
                    >
                      Chọn ảnh mới
                    </label>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    {previewImage && (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Book Details Form - First Column */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Tiêu đề
                    </label>                    
                    <input
                      type="text"
                      id="title"
                      ref={titleRef}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue={selectedBook.title}
                    />
                  </div>
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                      Tác giả
                    </label>                    
                    <input
                      type="text"
                      id="author"
                      ref={authorRef}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue={selectedBook.author}
                    />
                  </div>
                  <div>
                    <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                      ISBN
                    </label>
                    <input
                      type="text"                      
                      id="isbn"
                      ref={isbnRef}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue={selectedBook.isbn}
                    />
                  </div>
                </div>
                
                {/* Book Details Form - Second Column */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                      Thể loại
                    </label>
                    <input
                      type="text"                      
                      id="genre"
                      ref={genreRef}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue={selectedBook.genre?.genre_name}
                      disabled
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Mô tả
                    </label>                    
                    <textarea
                      id="description"
                      ref={descriptionRef}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue={selectedBook.description}
                    />
                  </div>
                  <div>
                    <label htmlFor="publication_date" className="block text-sm font-medium text-gray-700">
                      Ngày xuất bản
                    </label>
                    <input                      
                    type="date"
                      id="publication_date"
                      ref={publicationDateRef}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      defaultValue={selectedBook.publication_date 
                        ? new Date(selectedBook.publication_date).toISOString().split('T')[0]
                        : ''}
                    />
                  </div>
                </div>
              </div>
            </div><div className="px-4 py-3 border-t bg-gray-50 flex justify-end">              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2 transition-colors duration-200"
                disabled={isUploading}
              >
                Hủy
              </button>
              <button
                onClick={handleBookUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
                disabled={isUploading || updateBookMutation.isLoading}
              >
                {(isUploading || updateBookMutation.isLoading) && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Lưu thay đổi
              </button>            
              </div>
          </div>
        </div>
      )}      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedBook && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md md:mx-auto">
            <div className="p-6">
              <div className="text-center">
                <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Xác nhận xóa sách
                </h3>
                <p className="text-gray-500">
                  Bạn có chắc chắn muốn xóa sách "{selectedBook.title}"? Hành động này không thể hoàn tác.
                </p>
              </div>
            </div><div className="px-4 py-3 border-t bg-gray-50 flex justify-end">              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2 transition-colors duration-200"
                disabled={deleteBookMutation.isLoading}
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteBook}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center"
                disabled={deleteBookMutation.isLoading}
              >
                {deleteBookMutation.isLoading && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>      )}

      {/* Add Book Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content md:mx-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Thêm sách mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>            <div className="p-6">
              <BookForm
                onSubmit={handleAddBook}
                onCancel={() => setIsAddModalOpen(false)}
                isLoading={isAddBookLoading}
                categories={categories}
                authors={languages}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksTab;
