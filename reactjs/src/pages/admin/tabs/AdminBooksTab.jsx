import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { booksAPI } from '../../../services/api';
import BooksTab from '../../../components/tabs/BooksTab';

const AdminBooksTab = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
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
    <BooksTab
      books={books}
      loading={booksLoading}
      onDeleteBook={handleDeleteBook}
      onUpdateBook={handleUpdateBook}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
    />
  );
};

export default AdminBooksTab;
