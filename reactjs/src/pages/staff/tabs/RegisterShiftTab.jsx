import React, { useState, useEffect } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { 
  formatDate, 
  getWeekDates, 
  getWeekStartDate, 
  formatTimeSlot, 
  getNextWeekStartDate,
  isDateInNextWeek
} from '../../../utils/dateUtils';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

// Time slots for the schedule
const TIME_SLOTS = [
  '7:00 - 10:30', 
  '10:30 - 14:00', 
  '14:00 - 17:30', 
  '17:30 - 21:00'
];

// Days of the week
const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const RegisterShiftTab = () => {
  // Initialize with next week's start date instead of current week
  const [selectedWeek, setSelectedWeek] = useState(getNextWeekStartDate());
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [existingRequests, setExistingRequests] = useState([]);
  const [approvedShifts, setApprovedShifts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  // Get week dates based on selected week
  const weekDates = getWeekDates(selectedWeek);
  
  // Format week string for API (YYYY-MM-DD of Monday)
  const weekString = formatDate(selectedWeek, 'YYYY-MM-DD');

  useEffect(() => {
    fetchShiftData();
  }, [selectedWeek]);  const fetchShiftData = async () => {
    setIsLoading(true);
    try {
      // Fetch my existing shift requests for this week
      const myRequestsResponse = await api.get(`/shift-requests?week=${weekString}`);
      const myRequests = myRequestsResponse.data.data || [];
      setExistingRequests(myRequests);
      
      // Fetch approved shifts for the week
      const approvedResponse = await api.get(`/shift-requests?week=${weekString}&status=approved`);
      const approved = approvedResponse.data.data || [];
      setApprovedShifts(approved);
    } catch (error) {
      console.error('Error fetching shift data:', error);
      showToast('error', 'Không thể tải dữ liệu lịch trực. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    // Check if previous week would be the current week or earlier
    const prevWeek = new Date(selectedWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    
    // Don't allow navigation to current week or earlier
    const nextWeekStart = getNextWeekStartDate();
    if (prevWeek < nextWeekStart) {
      showToast('warning', 'Chỉ được đăng ký lịch trực cho tuần kế tiếp');
      return;
    }
    
    setSelectedWeek(prevWeek);
  };

  const handleNextWeek = () => {
    // Only allow navigation to the next week, not further
    const nextWeek = new Date(selectedWeek);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Don't allow navigation beyond next week
    const nextWeekStart = getNextWeekStartDate();
    if (formatDate(selectedWeek) !== formatDate(nextWeekStart)) {
      showToast('warning', 'Chỉ được đăng ký lịch trực cho tuần kế tiếp');
      return;
    }
    
    setSelectedWeek(nextWeek);
  };  const handleSlotClick = (date, timeSlot) => {
    const dateStr = formatDate(date, 'YYYY-MM-DD');
    const slotKey = `${dateStr}_${timeSlot}`;
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);
    
    if (slotDate < today) {
      showToast('warning', 'Không thể đăng ký ca trực cho ngày trong quá khứ');
      return;
    }
    
    // Check if date is in next week
    if (!isDateInNextWeek(slotDate)) {
      showToast('warning', 'Chỉ được đăng ký lịch trực cho tuần kế tiếp');
      return;
    }
    
    // Check if the current user already has a request for this slot
    // Try different date formats for comparison
    const existingRequest = existingRequests.find(req => {
      // Format both dates to strings for comparison
      const reqDateStr = typeof req.date === 'string' ? 
        req.date.split('T')[0] : formatDate(new Date(req.date), 'YYYY-MM-DD');
      
      return reqDateStr === dateStr && req.timeSlot === timeSlot;
    });
    
    if (existingRequest) {
      // If we have a pending request, ask if user wants to delete it
      if (existingRequest.status === 'pending') {
        if (window.confirm('Bạn đã đăng ký ca trực này. Bạn có muốn hủy đăng ký không?')) {
          handleDeleteRequest(existingRequest._id);
        }
      } else if (existingRequest.status === 'approved') {
        showToast('info', 'Ca trực này đã được phê duyệt cho bạn');
      } else if (existingRequest.status === 'rejected') {
        showToast('info', 'Ca trực này đã bị từ chối. Nhưng bạn có thể đăng ký lại nếu muốn');
        // Toggle selection to allow re-registering after rejection
        if (selectedSlots.includes(slotKey)) {
          setSelectedSlots(selectedSlots.filter(slot => slot !== slotKey));
        } else {
          setSelectedSlots([...selectedSlots, slotKey]);
        }
      }
      return;
    }

    // Toggle selection
    if (selectedSlots.includes(slotKey)) {
      setSelectedSlots(selectedSlots.filter(slot => slot !== slotKey));
    } else {
      setSelectedSlots([...selectedSlots, slotKey]);
    }
  };const handleDeleteRequest = async (requestId) => {
    try {
      await api.delete(`/shift-requests/${requestId}`);
      showToast('success', 'Đã hủy đăng ký ca trực thành công');
      
      // Remove from local state immediately
      setExistingRequests(prevRequests => 
        prevRequests.filter(req => req._id !== requestId)
      );
      
      // Add a small delay before fetching to ensure database is updated
      setTimeout(() => {
        fetchShiftData();
      }, 500);
    } catch (error) {
      console.error('Error deleting request:', error);
      showToast('error', 'Không thể hủy đăng ký. Vui lòng thử lại sau.');
    }
  };  const handleSubmit = async () => {
    if (selectedSlots.length === 0) {
      showToast('warning', 'Vui lòng chọn ít nhất một ca trực');
      return;
    }
    
    // Verify all selected slots are for next week
    const invalidSlots = selectedSlots.filter(slot => {
      const [dateStr] = slot.split('_');
      const slotDate = new Date(dateStr);
      return !isDateInNextWeek(slotDate);
    });
    
    if (invalidSlots.length > 0) {
      showToast('warning', 'Chỉ được đăng ký lịch trực cho tuần kế tiếp');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create requests for each selected slot
      const requests = selectedSlots.map(slot => {
        const [dateStr, timeSlot] = slot.split('_');
        return {
          date: dateStr,
          timeSlot
        };
      });
      
      // Track successful requests
      let successCount = 0;
      let duplicateCount = 0;
      let errorCount = 0;
      
      // Submit requests one by one
      for (const request of requests) {
        try {
          await api.post('/shift-requests', request);
          successCount++;
        } catch (error) {
          if (error.response && error.response.status === 400 && 
              error.response.data.message === 'You have already requested this shift') {
            duplicateCount++;
          } else {
            errorCount++;
          }
        }
      }
      
      // Show appropriate toast message
      if (successCount > 0 && duplicateCount > 0) {
        showToast('success', `Đăng ký ${successCount} ca trực thành công! (${duplicateCount} ca đã được đăng ký trước đó)`);
      } else if (successCount > 0) {
        showToast('success', 'Đăng ký ca trực thành công!');
      } else if (duplicateCount > 0) {
        showToast('warning', 'Tất cả ca trực đã được đăng ký trước đó!');
      } else if (errorCount > 0) {
        showToast('error', 'Có lỗi xảy ra khi đăng ký ca trực. Vui lòng thử lại sau.');
      }
      
      setSelectedSlots([]);
      
      // Add a small delay before fetching to ensure database is updated
      setTimeout(() => {
        fetchShiftData();
      }, 500);
      
    } catch (error) {
      console.error('Error submitting shift requests:', error);
      showToast('error', 'Không thể đăng ký ca trực. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };  const getSlotStatus = (date, timeSlot) => {
    const dateStr = formatDate(date, 'YYYY-MM-DD');
    const slotKey = `${dateStr}_${timeSlot}`;
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slotDate = new Date(date);
    slotDate.setHours(0, 0, 0, 0);
    
    if (slotDate < today) {
      return 'past';
    }
    
    // Check selected in current session
    if (selectedSlots.includes(slotKey)) {
      return 'selected';
    }
    
    // Check existing requests from current user - try multiple ways to match dates
    const myRequest = existingRequests.find(req => {
      // Try different ways to compare dates - MongoDB might return date as string or Date object
      let reqDateStr;
      
      if (typeof req.date === 'string') {
        // If it's a string, get just the date part
        reqDateStr = req.date.split('T')[0];
      } else if (req.date instanceof Date) {
        // If it's a Date object, format it
        reqDateStr = formatDate(req.date, 'YYYY-MM-DD');
      } else if (req.date && req.date.$date) {
        // If it's a MongoDB date object
        reqDateStr = formatDate(new Date(req.date.$date), 'YYYY-MM-DD');
      } else {
        // Try to parse whatever we have
        reqDateStr = formatDate(new Date(req.date), 'YYYY-MM-DD');
      }
      
      // See if this matches our date and time slot
      return reqDateStr === dateStr && req.timeSlot === timeSlot;
    });
    
    if (myRequest) {
      return myRequest.status; // 'pending', 'approved', or 'rejected'
    }
    
    // Always return available since we allow multiple registrations
    return 'available';
  };
  const getSlotStyle = (status) => {
    switch (status) {
      case 'selected':
        return 'bg-blue-100 border-blue-500 cursor-pointer';
      case 'pending':
        return 'bg-yellow-100 border-yellow-500 cursor-pointer';
      case 'approved':
        return 'bg-green-100 border-green-500 cursor-pointer';
      case 'rejected':
        return 'bg-red-100 border-red-500 cursor-pointer';
      case 'past':
        return 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed';
      default:
        return 'bg-white hover:bg-gray-100 cursor-pointer';
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Đăng ký lịch trực</h2>
      
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
        {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-white border border-gray-300 mr-2"></div>
          <span>Trống</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 border border-blue-500 mr-2"></div>
          <span>Đã chọn</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 mr-2"></div>
          <span>Chờ duyệt</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 border border-green-500 mr-2"></div>
          <span>Đã duyệt</span>
        </div>        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 border border-red-500 mr-2"></div>
          <span>Đã từ chối</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 border border-gray-300 mr-2"></div>
          <span>Ca trong quá khứ</span>
        </div>
      </div>
      
      {/* Schedule Table */}
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
                  const status = getSlotStatus(date, timeSlot);
                  return (
                    <td 
                      key={dateIndex}
                      onClick={() => handleSlotClick(date, timeSlot)}
                      className={`border p-2 h-16 text-center ${getSlotStyle(status)}`}
                    >                      {status === 'pending' && <div className="text-xs">Chờ duyệt</div>}
                      {status === 'approved' && <div className="text-xs">Đã duyệt</div>}
                      {status === 'rejected' && <div className="text-xs">Đã từ chối</div>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>      {/* Submit Button */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedSlots.length === 0}
          className={`px-6 py-2 rounded-md ${
            isSubmitting || selectedSlots.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đăng ký ca trực'}
        </button>
          <button
          onClick={async () => {
            if (window.confirm('Xóa tất cả yêu cầu đăng ký ca trực của bạn?')) {
              try {
                // console.log('Sending request to clear all shift requests...');
                const response = await api.delete('/shift-requests/clear-my-requests');
                // console.log('Clear requests response:', response);
                showToast('success', 'Đã xóa tất cả yêu cầu đăng ký');
                fetchShiftData();
              } catch (error) {
                console.error('Error clearing requests:', error);
                if (error.response) {
                  console.error('Error response:', error.response.status, error.response.data);
                }
                showToast('error', 'Không thể xóa yêu cầu. Vui lòng thử lại sau.');
              }
            }
          }}
          className="px-6 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
        >
          Xóa tất cả yêu cầu
        </button>
      </div>
    </div>
  );
};

export default RegisterShiftTab;
