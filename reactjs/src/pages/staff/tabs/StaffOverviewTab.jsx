import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { borrowingsAPI, reservationsAPI, booksAPI, usersAPI } from '../../../services/api';
import OverviewTab from '../../../components/tabs/OverviewTab';

const StaffOverviewTab = () => {
  const { user } = useAuth();

  // Fetch staff data
  const { data: borrowingsData, isLoading: borrowingsLoading } = useQuery({
    queryKey: ['borrowings-staff'],
    queryFn: () => borrowingsAPI.getBorrowings({ limit: 20 }),
    enabled: user?.role === 'CTV' || user?.role === 'Admin'
  });
  
  const { data: reservationsData, isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations-staff'],
    queryFn: () => reservationsAPI.getReservations({ limit: 20 }),
    enabled: user?.role === 'CTV' || user?.role === 'Admin'
  });
  
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['books-staff'],
    queryFn: () => booksAPI.getBooks({ limit: 20 }),
    enabled: user?.role === 'CTV' || user?.role === 'Admin'
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-staff'],
    queryFn: () => usersAPI.getUsers({ limit: 20 }),
    enabled: user?.role === 'CTV' || user?.role === 'Admin'
  });

  if (borrowingsLoading || reservationsLoading || booksLoading || usersLoading) {
    return <OverviewTab loading={true} />;
  }

  const borrowings = borrowingsData?.data?.data?.borrowings || [];
  const reservations = reservationsData?.data?.data?.reservations || [];
  const totalBooks = booksData?.data?.data?.pagination?.total || 0;
  const totalUsers = usersData?.data?.data?.pagination?.total || 0;

  // Calculate stats
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

export default StaffOverviewTab;
