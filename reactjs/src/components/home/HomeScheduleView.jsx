import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import api from '../../services/api';
import { formatDate, getWeekStartDate, getWeekDates } from '../../utils/dateUtils';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Days of the week
const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const HomeScheduleView = () => {
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
  
  // Check if library is open on a specific date
  const isLibraryOpen = (date) => {
    if (!finalSchedule || !finalSchedule.shifts) return false;
    
    return finalSchedule.shifts.some(
      shift => formatDate(shift.date, 'YYYY-MM-DD') === formatDate(date, 'YYYY-MM-DD')
    );
  };
  
  // Get active time slots for a specific date
  const getActiveTimeSlots = (date) => {
    if (!finalSchedule || !finalSchedule.shifts) return [];
    
    return finalSchedule.shifts
      .filter(shift => formatDate(shift.date, 'YYYY-MM-DD') === formatDate(date, 'YYYY-MM-DD'))
      .map(shift => shift.timeSlot)
      .sort();
  };
  
  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <Calendar className="mr-2 text-primary" />
          <h3 className="text-xl font-semibold">Lịch mở cửa thư viện</h3>
        </div>
        <div className="flex justify-center py-4">
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <Calendar className="mr-2 text-primary" />
        <h3 className="text-xl font-semibold">Lịch mở cửa thư viện</h3>
      </div>
      
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handlePreviousWeek}
          className="px-3 py-1 text-sm bg-gray-200 rounded-md"
        >
          Tuần trước
        </button>
        
        <div className="text-sm font-medium">
          {formatDate(selectedWeek, 'DD/MM/YYYY')} - {formatDate(new Date(selectedWeek.getTime() + 6 * 24 * 60 * 60 * 1000), 'DD/MM/YYYY')}
        </div>
        
        <button
          onClick={handleNextWeek}
          className="px-3 py-1 text-sm bg-gray-200 rounded-md"
        >
          Tuần sau
        </button>
      </div>
      
      {!finalSchedule ? (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Lịch trực cho tuần này chưa được cập nhật.</p>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, index) => {
            const isOpen = isLibraryOpen(date);
            const timeSlots = getActiveTimeSlots(date);
            
            return (
              <div 
                key={index} 
                className={`p-2 rounded-lg text-center ${
                  isOpen ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="font-medium mb-1">{DAYS_OF_WEEK[index]}</div>
                <div className="text-sm mb-2">{formatDate(date, 'DD/MM')}</div>
                
                {isOpen ? (
                  <div className="flex flex-col space-y-1">
                    {timeSlots.map((slot, i) => (
                      <div key={i} className="text-xs flex items-center justify-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{slot}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">Đóng cửa</div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>Xem lịch trực chi tiết <a href="/schedule" className="text-blue-600 hover:underline">tại đây</a></p>
      </div>
    </div>
  );
};

export default HomeScheduleView;
