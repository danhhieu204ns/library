import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';
import { schedulesAPI } from '../../../services/api';
import SchedulesTab from '../../../components/tabs/SchedulesTab';

const StaffSchedulesTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch schedules
  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ['schedules-staff'],
    queryFn: () => schedulesAPI.getSchedules({ 
      user_id: user?.role === 'CTV' ? user._id : undefined, 
      limit: 50 
    }),
    enabled: user?.role === 'CTV' || user?.role === 'Admin'
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: (scheduleData) => schedulesAPI.createSchedule(scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules-staff']);
      alert('Schedule created successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to create schedule');
    }
  });

  // Handle create schedule
  const handleCreateSchedule = (data) => {
    // Format date and time for API
    const formattedData = {
      ...data,
      user_id: user._id,
      shift_start: `${data.shift_date}T${data.shift_start}:00`,
      shift_end: `${data.shift_date}T${data.shift_end}:00`
    };
    
    createScheduleMutation.mutate(formattedData);
  };

  const schedules = schedulesData?.data?.data?.schedules || [];

  return (
    <SchedulesTab
      schedules={schedules}
      loading={schedulesLoading}
      onCreateSchedule={handleCreateSchedule}
    />
  );
};

export default StaffSchedulesTab;
