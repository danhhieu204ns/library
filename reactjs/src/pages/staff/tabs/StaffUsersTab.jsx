import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { usersAPI } from '../../../services/api';
import UsersTab from '../../../components/tabs/UsersTab';

const StaffUsersTab = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-staff'],
    queryFn: () => usersAPI.getUsers({ limit: 50 }),
    enabled: user?.role === 'CTV' || user?.role === 'Admin'
  });

  // Update user mutation (Staff can update but not delete users)
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users-staff']);
      alert('User updated successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to update user');
    }
  });

  // Handle search change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  // Handle update user
  const handleUpdateUser = (id, data) => {
    updateUserMutation.mutate({ id, data });
  };

  const users = usersData?.data?.data?.users || [];

  return (
    <UsersTab
      users={users}
      loading={usersLoading}
      onUpdateUser={handleUpdateUser}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
    />
  );
};

export default StaffUsersTab;
