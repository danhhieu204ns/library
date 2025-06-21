import React, { useState, useEffect } from 'react';
import { formatDate, getWeekDates, getWeekStartDate } from '../../utils/dateUtils';
import api from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

// Time slots for the schedule
const TIME_SLOTS = [
  '7:00 - 10:30', 
  '10:30 - 14:00', 
  '14:00 - 17:30', 
  '17:30 - 21:00'
];

// Days of the week
const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const FinalScheduleView = () => {
  const [selectedWeek, setSelectedWeek] = useState(getWeekStartDate(new Date()));
  const [finalSchedule, setFinalSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get week dates based on selected week
  const weekDates = getWeekDates(selectedWeek);
  
  // Format week string for API (YYYY-MM-DD of Monday)
  const weekString = formatDate(selectedWeek, 'YYYY-MM-DD');
  
  useEffect(() => {
    fetchFinalSchedule();
  }, [selectedWeek]);
  
  const fetchFinalSchedule = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/schedule/final?week=${weekString}`);
      setFinalSchedule(response.data.data);
    } catch (error) {
      console.error('Error fetching finalized schedule:', error);
      setFinalSchedule(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePreviousWeek = () => {
    const prevWeek = new Date(selectedWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setSelectedWeek(prevWeek);
  };
  
  const handleNextWeek = () => {
    const nextWeek = new Date(selectedWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSelectedWeek(nextWeek);
  };
  
  // Get staff name assigned to a specific slot
  const getAssignedStaff = (date, timeSlot) => {
    if (!finalSchedule || !finalSchedule.shifts) return null;
    
    const shift = finalSchedule.shifts.find(
      s => formatDate(s.date, 'YYYY-MM-DD') === formatDate(date, 'YYYY-MM-DD') && 
           s.timeSlot === timeSlot
    );
    
    return shift ? shift.userId : null;
  };
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lịch trực thư viện</h2>
      
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handlePreviousWeek}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Tuần trước
        </button>
        
        <div className="text-lg font-semibold">
          Tuần {formatDate(selectedWeek, 'DD/MM/YYYY')} - {formatDate(new Date(selectedWeek.getTime() + 6 * 24 * 60 * 60 * 1000), 'DD/MM/YYYY')}
        </div>
        
        <button
          onClick={handleNextWeek}
          className="px-4 py-2 bg-gray-200 rounded-md"
        >
          Tuần sau
        </button>
      </div>
      
      {!finalSchedule ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600">Lịch trực cho tuần này chưa được chốt.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Ca trực</th>
                {weekDates.map((date, index) => (
                  <th key={index} className="border p-2">
                    <div>{DAYS_OF_WEEK[index]}</div>
                    <div>{formatDate(date, 'DD/MM')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((timeSlot, timeIndex) => (
                <tr key={timeIndex}>
                  <td className="border p-2 font-medium">{timeSlot}</td>
                  {weekDates.map((date, dateIndex) => {
                    const staff = getAssignedStaff(date, timeSlot);
                    return (
                      <td key={dateIndex} className="border p-2 h-16">
                        {staff ? (
                          <div className="p-2 bg-green-50 rounded">
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-xs text-gray-500">CTV</div>
                          </div>
                        ) : (
                          <div className="text-gray-400 text-center">Chưa có người trực</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FinalScheduleView;
