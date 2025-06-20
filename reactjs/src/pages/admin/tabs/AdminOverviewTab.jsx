import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { usersAPI, borrowingsAPI, reservationsAPI, booksAPI } from '../../../services/api';
import OverviewTab from '../../../components/tabs/OverviewTab';

const AdminOverviewTab = () => {
  const { user } = useAuth();

  // Fetch overview data
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-all'],
    queryFn: () => usersAPI.getUsers({ limit: 10 }),
    enabled: user?.role === 'Admin'
  });

  const { data: borrowingsData, isLoading: borrowingsLoading } = useQuery({
    queryKey: ['borrowings-all'],
    queryFn: () => borrowingsAPI.getBorrowings({ limit: 10 }),
    enabled: user?.role === 'Admin'
  });

  const { data: reservationsData, isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations-all'],
    queryFn: () => reservationsAPI.getReservations({ limit: 10 }),
    enabled: user?.role === 'Admin'
  });

  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['books-stats'],
    queryFn: () => booksAPI.getBooks({ limit: 1 }),
    enabled: user?.role === 'Admin'
  });

  if (usersLoading || borrowingsLoading || reservationsLoading || booksLoading) {
    return <OverviewTab loading={true} />;
  }

  const users = usersData?.data?.data?.users || [];
  const borrowings = borrowingsData?.data?.data?.borrowings || [];
  const reservations = reservationsData?.data?.data?.reservations || [];
  const totalBooks = booksData?.data?.data?.pagination?.total || 0;
  const totalUsers = usersData?.data?.data?.pagination?.total || 0;

  // Calculate stats
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const activeBorrowings = borrowings.filter(b => b.status === 'Borrowed').length;
  const pendingReservations = reservations.filter(r => r.status === 'Pending').length;
  const readyReservations = reservations.filter(r => r.status === 'Ready').length;
  const overdueBorrowings = borrowings.filter(b => 
    b.status === 'Borrowed' && new Date(b.due_date) < new Date()
  ).length;

  return (
    <OverviewTab 
      stats={{
        totalBooks,
        totalUsers,
        activeBorrowings,
        overdueBorrowings,
        pendingReservations,
        readyReservations
      }}
    />
  );
};

export default AdminOverviewTab;
