import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { booksAPI } from '../../../services/api';
import BooksTab from '../../../components/tabs/BooksTab';
import ImportBooks from '../../../components/tabs/ImportBooks';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminBooksTab = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch books
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['books-admin'],
    queryFn: () => booksAPI.getBooks({ limit: 50 }),
    enabled: user?.role === 'Admin'
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: (bookId) => booksAPI.deleteBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries(['books-admin']);
      alert('Book deleted successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete book');
    }
  });

  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }) => booksAPI.updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['books-admin']);
      alert('Book updated successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update book');
    }
  });

  // Import books mutation
  const importBooks = async (file) => {
    setImportLoading(true);
    try {
      const formData = new FormData();
      formData.append('excelFile', file);
      const res = await fetch(`${API_BASE_URL}/import/books`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const result = await res.json();
      // Log chi tiết kết quả import ra console
      console.log('Import books result:', result);
      if (result.debug) {
        console.log('Created:', result.debug.createdDetails);
        console.log('Updated:', result.debug.updatedDetails);
        console.log('Failures:', result.debug.failures);
        if (result.debug.failures && result.debug.failures.length > 0) {
          const errorMsg = result.debug.failures.map((f, idx) => {
            const rowInfo = [
              f.row.title ? `Tiêu đề: ${f.row.title}` : '',
              f.row.ISBN ? `ISBN: ${f.row.ISBN}` : '',
              f.row.publisher ? `NXB: ${f.row.publisher}` : '',
              f.row.genre ? `Thể loại: ${f.row.genre}` : ''
            ].filter(Boolean).join(' | ');
            return `#${idx + 1}:\nLỗi: ${f.error}\n${rowInfo}`;
          }).join('\n\n---------------------\n');
          alert('Một số bản ghi import bị lỗi:\n\n' + errorMsg);
        }
      }
      queryClient.invalidateQueries(['books-admin']);
      alert('Import sách thành công!');
    } catch (err) {
      alert('Import sách thất bại!');
    } finally {
      setImportLoading(false);
    }
  };

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle delete book
  const handleDeleteBook = (bookId) => {
    deleteBookMutation.mutate(bookId);
  };

  // Handle update book
  const handleUpdateBook = (id, data) => {
    updateBookMutation.mutate({ id, data });
  };

  const books = booksData?.data?.data?.books || [];

  return (
    <div>
      <ImportBooks
        onImport={importBooks}
        templateUrl={`${API_BASE_URL}/import/books/template`}
        loading={importLoading}
      />
      <BooksTab
        books={books}
        loading={booksLoading}
        onDeleteBook={handleDeleteBook}
        onUpdateBook={handleUpdateBook}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />
    </div>
  );
};

export default AdminBooksTab;
