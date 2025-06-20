import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { reservationsAPI } from '../../../services/api';
import ReservationsTab from '../../../components/tabs/ReservationsTab';

const AdminReservationsTab = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  // Fetch reservations
  const { data: reservationsData, isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations-admin'],
    queryFn: () => reservationsAPI.getReservations({ limit: 50 }),
    enabled: user?.role === 'Admin'
  });

  // Fulfill reservation mutation
  const fulfillReservationMutation = useMutation({
    mutationFn: ({ id, copy_id }) => reservationsAPI.fulfillReservation(id, { copy_id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations-admin']);
      alert('Reservation fulfilled successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to fulfill reservation');
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

  // Handle fulfill reservation
  const handleFulfillReservation = (id, data) => {
    fulfillReservationMutation.mutate({ id, copy_id: data.copy_id });
  };

  const reservations = reservationsData?.data?.data?.reservations || [];

  return (
    <ReservationsTab
      reservations={reservations}
      loading={reservationsLoading}
      onFulfillReservation={handleFulfillReservation}
      searchTerm={searchTerm}
      onSearchChange={handleSearchChange}
      filterStatus={filterStatus}
      onFilterChange={handleFilterChange}
    />
  );
};

export default AdminReservationsTab;
