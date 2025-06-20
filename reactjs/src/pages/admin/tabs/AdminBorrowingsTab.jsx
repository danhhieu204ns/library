import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { borrowingsAPI } from '../../../services/api';
import BorrowingsTab from '../../../components/tabs/BorrowingsTab';

const AdminBorrowingsTab = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  // Fetch borrowings
  const { data: borrowingsData, isLoading: borrowingsLoading } = useQuery({
    queryKey: ['borrowings-admin'],
    queryFn: () => borrowingsAPI.getBorrowings({ limit: 50 }),
    enabled: user?.role === 'Admin'
  });

  // Return book mutation
  const returnBookMutation = useMutation({
    mutationFn: ({ id, notes }) => borrowingsAPI.returnBook(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['borrowings-admin']);
      alert('Book returned successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to return book');
    }
  });

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle filter change
  const handleFilterChange = (value) => {
    setFilterStatus(value);
  };

  // Handle return book
  const handleReturnBook = (id, data) => {
    returnBookMutation.mutate({ id, notes: data.notes });
  };

  const borrowings = borrowingsData?.data?.data?.borrowings || [];

  return (
    <BorrowingsTab
      borrowings={borrowings}
      loading={borrowingsLoading}
      onReturnBook={handleReturnBook}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      filterStatus={filterStatus}
      onFilterChange={handleFilterChange}
    />
  );
};

export default AdminBorrowingsTab;
