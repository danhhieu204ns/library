import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { usersAPI } from '../../../services/api';
import UsersTab from '../../../components/tabs/UsersTab';

const AdminUsersTab = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-admin'],
    queryFn: () => usersAPI.getUsers({ limit: 50 }),
    enabled: user?.role === 'Admin'
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => usersAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['users-admin']);
      alert('User deleted successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users-admin']);
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

  // Handle delete user
  const handleDeleteUser = (userId) => {
    deleteUserMutation.mutate(userId);
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
      onDeleteUser={handleDeleteUser}
      onUpdateUser={handleUpdateUser}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
    />
  );
};

export default AdminUsersTab;
