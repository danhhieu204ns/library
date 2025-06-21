import React, { useState, useEffect } from 'react';
import { useToast } from '../../../contexts/ToastContext';
import { 
  formatDate, 
  getWeekDates, 
  getWeekStartDate, 
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

const ApproveShiftTab = () => {
  // Initialize with next week's start date instead of current date
  const [selectedWeek, setSelectedWeek] = useState(getNextWeekStartDate());
  const [shiftRequests, setShiftRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    userId: '',
    status: ''
  });
  const [users, setUsers] = useState([]);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  // State for managing the modal showing shift request details
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  const { showToast } = useToast();
  
  // Get week dates based on selected week
  const weekDates = getWeekDates(selectedWeek);
  
  // Format week string for API (YYYY-MM-DD of Monday)
  // First make sure we have the correct start of week (Monday)
  const weekStartDate = getWeekStartDate(selectedWeek);
  const weekString = formatDate(weekStartDate, 'YYYY-MM-DD');

  useEffect(() => {
    fetchShiftData();
    fetchUsers();
    checkScheduleStatus();
  }, [selectedWeek, filters]);  const fetchShiftData = async () => {
    setIsLoading(true);    try {
      let url = `/shift-requests?week=${weekString}`;
      
      if (filters.userId) {
        url += `&userId=${filters.userId}`;
      }
      
      if (filters.status) {
        url += `&status=${filters.status}`;
      }
      
      const response = await api.get(url);
        // If there are no shift requests with the week filter, try getting all requests
      if (!response.data.data || response.data.data.length === 0) {
        try {
          const allResponse = await api.get('/shift-requests');
          
          if (allResponse.data.data && allResponse.data.data.length > 0) {
            
            // Fix: Try to identify shifts that should be in this week but have incorrect week value
            const shiftsForThisWeek = allResponse.data.data.filter(req => {
              // Check if the date falls within the current week
              if (!req.date) return false;
              
              const reqDate = new Date(req.date);
              return isDateInCurrentWeek(reqDate, selectedWeek);
            });
            
            if (shiftsForThisWeek.length > 0) {
              // If we found shifts that should be in this week, use those
              setShiftRequests(shiftsForThisWeek);            } else {
              // Otherwise use all shifts
              setShiftRequests(allResponse.data.data || []);
            }
          } else {
            setShiftRequests([]);
          }
        } catch (fallbackError) {
          console.error('Error fetching all shift requests:', fallbackError);
          setShiftRequests([]);        }
      } else {
        setShiftRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching shift requests:', error);
      showToast('error', 'Không thể tải dữ liệu đăng ký ca trực. Vui lòng thử lại sau.');
      
      // In case of error, still try to get all data
      try {
        const fallbackResponse = await api.get('/shift-requests');
        if (fallbackResponse.data.data && fallbackResponse.data.data.length > 0) {
          setShiftRequests(fallbackResponse.data.data);
        } else {
          setShiftRequests([]);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        setShiftRequests([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users?role=CTV');
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('error', 'Không thể tải danh sách CTV. Vui lòng thử lại sau.');
    }
  };

  const checkScheduleStatus = async () => {
    try {
      const response = await api.get(`/schedule/final?week=${weekString}`);
      setIsFinalized(!!response.data.data);
    } catch (error) {
      setIsFinalized(false);
    }
  };

  const handlePreviousWeek = () => {
    // Check if previous week would be the current week or earlier
    const prevWeek = new Date(selectedWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    
    // Don't allow navigation to current week or earlier
    const nextWeekStart = getNextWeekStartDate();
    if (prevWeek < nextWeekStart) {
      showToast('warning', 'Chỉ được duyệt lịch trực cho tuần kế tiếp');
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
      showToast('warning', 'Chỉ được duyệt lịch trực cho tuần kế tiếp');
      return;
    }
    
    setSelectedWeek(nextWeek);
  };
  const handleApprove = async (requestId) => {
    setIsSubmitting(true);
    try {
      // Find the request to check its date
      const request = shiftRequests.find(req => req._id === requestId);
      
      if (request) {
        const requestDate = new Date(request.date);
        
        // Verify date is in next week
        if (!isDateInNextWeek(requestDate)) {
          showToast('warning', 'Chỉ được duyệt lịch trực cho tuần kế tiếp');
          setIsSubmitting(false);
          return;
        }
      }
      
      const response = await api.put(`/shift-requests/${requestId}/approve`);
      showToast('success', 'Đã duyệt yêu cầu thành công');
      await fetchShiftData();
      // Đóng modal sau khi duyệt thành công
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error approving request:', error);
      showToast('error', 'Không thể duyệt yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (requestId) => {
    // Find the request to check its date
    const request = shiftRequests.find(req => req._id === requestId);
    
    if (request) {
      const requestDate = new Date(request.date);
      
      // Verify date is in next week
      if (!isDateInNextWeek(requestDate)) {
        showToast('warning', 'Chỉ được xử lý lịch trực cho tuần kế tiếp');
        return;
      }
    }
    
    const reason = prompt('Lý do từ chối (không bắt buộc):');
    
    setIsSubmitting(true);    
    try {
      const response = await api.put(`/shift-requests/${requestId}/reject`, { reason });
      showToast('success', 'Đã từ chối yêu cầu thành công');
      await fetchShiftData();
      // Đóng modal sau khi từ chối thành công
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToast('error', 'Không thể từ chối yêu cầu. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };  const handleFinalizeSchedule = async () => {
    // Check if the selected week is next week
    const nextWeekStart = getNextWeekStartDate();
    if (formatDate(selectedWeek) !== formatDate(nextWeekStart)) {
      showToast('warning', 'Chỉ được chốt lịch trực cho tuần kế tiếp');
      return;
    }
    
    // First, find all approved requests whose dates fall within the current week, regardless of week field
    const approvedRequestsInThisWeekByDate = shiftRequests.filter(req => 
      req.status === 'approved' && 
      isDateInCurrentWeek(new Date(req.date), selectedWeek)
    );
    
    // Then, find requests that have the correct week string value
    const approvedRequestsWithCorrectWeekString = shiftRequests.filter(req => 
      req.status === 'approved' && req.week === weekString
    );
    
    // Combine both methods to get all approved requests for this week
    // Use Set to avoid duplicates
    const combinedApprovedRequests = [...new Set([
      ...approvedRequestsInThisWeekByDate, 
      ...approvedRequestsWithCorrectWeekString
    ])];
    
    if (combinedApprovedRequests.length === 0) {
      // Kiểm tra chi tiết hơn để cung cấp thông báo lỗi cụ thể
      const anyApproved = shiftRequests.some(req => req.status === 'approved');
      const anyForThisWeek = shiftRequests.some(req => 
        isDateInCurrentWeek(new Date(req.date), selectedWeek) || req.week === weekString
      );      
      let errorMessage = 'Không thể chốt lịch trực. ';
      if (!anyApproved) {
        errorMessage += 'Chưa có ca trực nào được duyệt.';
      } else if (!anyForThisWeek) {
        errorMessage += 'Không có ca trực nào cho tuần này.';
      } else {
        errorMessage += 'Không có ca trực nào đã duyệt cho tuần này.';
      }
      
      showToast('error', errorMessage);
      return;
    }
    
    // Ask if we should sync the week value for shifts before finalizing
    if (approvedRequestsInThisWeekByDate.length > 0 && 
        approvedRequestsInThisWeekByDate.some(req => req.week !== weekString)) {
      
      const shouldSync = window.confirm(
        'Phát hiện có ca trực đã duyệt thuộc tuần này nhưng chưa được đồng bộ giá trị tuần. ' +
        'Bạn có muốn đồng bộ tuần trước khi chốt lịch không?'
      );
      
      if (shouldSync) {
        // Sync week values for all approved shifts in this week
        const syncPromises = approvedRequestsInThisWeekByDate          .filter(req => req.week !== weekString)
          .map(async (request) => {
            try {
              await api.put(`/shift-requests/${request._id}/update-week`, { 
                week: weekString 
              });
              return true;
            } catch (error) {
              console.error(`Failed to update week for request ${request._id}:`, error);
              return false;
            }
          });
        
        await Promise.allSettled(syncPromises);
        // Refresh data after syncing
        await fetchShiftData();
        
        showToast('success', 'Đã đồng bộ tuần cho các ca trực đã duyệt.');
      }
    }
    
    if (!window.confirm('Bạn có chắc chắn muốn chốt lịch trực cho tuần này? Hành động này sẽ đăng lịch công khai cho tất cả mọi người.')) {
      return;
    }
      setIsFinalizing(true);
    try {
      const response = await api.post('/schedule/finalize', { week: weekString });
      showToast('success', 'Đã chốt lịch trực tuần thành công');
      setIsFinalized(true);
      
      // Refresh data after finalizing
      await fetchShiftData();
      await checkScheduleStatus();
    } catch (error) {
      console.error('Error finalizing schedule:', error);
      
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = 'Không thể chốt lịch trực. ';
      if (error.response) {
        errorMessage += error.response.data?.message || 'Vui lòng thử lại sau.';
      } else {
        errorMessage += 'Vui lòng thử lại sau.';
      }
      
      showToast('error', errorMessage);
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      userId: '',
      status: ''
    });
  };

  // Group requests by date and time slot for table view
  const getRequestsForSlot = (date, timeSlot) => {
    // If there are no shift requests, return an empty array
    if (!shiftRequests || !Array.isArray(shiftRequests) || shiftRequests.length === 0) {
      return [];
    }
    
    const dateStr = formatDate(date, 'YYYY-MM-DD');
    
    const matchingRequests = shiftRequests.filter(req => {
      // Make sure req is not null or undefined
      if (!req || !req.date || !req.timeSlot) {
        return false;
      }
      
      // Handle different date formats that might come from the server
      let reqDate;
      
      if (typeof req.date === 'string') {
        // If it's an ISO string like "2025-06-20T00:00:00.000Z"
        reqDate = req.date.split('T')[0]; // Get just the date part
      } else if (req.date instanceof Date) {
        reqDate = formatDate(req.date, 'YYYY-MM-DD');
      } else {
        // Fallback for any other format
        try {
          reqDate = formatDate(new Date(req.date), 'YYYY-MM-DD');
        } catch (error) {
          return false;
        }
      }
      
      const isDateMatch = reqDate === dateStr;
      const isTimeSlotMatch = req.timeSlot === timeSlot;
      
      return isDateMatch && isTimeSlotMatch;
    });
    
    return matchingRequests;
  };

  // Modal to show all shift requests for a specific slot
  const ShiftRequestsModal = ({ slot, onClose, onApprove, onReject, isSubmitting }) => {
    if (!slot) return null;
    
    const { date, timeSlot, requests } = slot;
    
    // Hàm trích xuất tên từ email
    const extractNameFromEmail = (email) => {
      if (!email) return "Không có thông tin";
      
      // Lấy phần trước @ trong email
      const localPart = email.split('@')[0];
      
      // Chuyển đổi thành tên hiển thị đẹp hơn
      // Ví dụ: nguyen.van.a -> Nguyen Van A
      return localPart
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Chi tiết đăng ký ca trực: {formatDate(date, 'DD/MM/YYYY')} | {timeSlot}
            </h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-8rem)]">
            <div className="space-y-4">
              {requests.map(request => (
                <div 
                  key={request._id} 
                  className={`p-3 rounded border ${
                    request.status === 'pending' 
                      ? 'bg-yellow-50 border-yellow-200' 
                      : request.status === 'approved'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>                      <div className="font-medium text-lg">
                        {request.userId && request.userId.full_name 
                          ? request.userId.full_name 
                          : request.userId && request.userId.email 
                            ? extractNameFromEmail(request.userId.email)
                            : "Không xác định"}
                      </div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status === 'pending' ? 'Chờ duyệt' : 
                           request.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                        </span>
                      </div>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onApprove(request._id)}
                          disabled={isSubmitting}
                          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                        >
                          Duyệt
                        </button>
                        <button
                          onClick={() => onReject(request._id)}
                          disabled={isSubmitting}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                        >
                          Từ chối
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {request.reason && (
                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                      <div className="font-medium">Lý do từ chối:</div>
                      <div>{request.reason}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };  // Hàm kiểm tra xem một ngày có thuộc tuần hiện tại không
  const isDateInCurrentWeek = (date, weekStart) => {
    if (!date || !weekStart) return false;
    
    try {
      // Ensure date is a Date object
      const checkDate = date instanceof Date ? date : new Date(date);
      if (isNaN(checkDate.getTime())) return false;
      
      // Ensure weekStart is a Date object (Monday of the week)
      const startOfWeek = weekStart instanceof Date ? new Date(weekStart) : new Date(weekStart);
      if (isNaN(startOfWeek.getTime())) return false;
      
      // Make sure startOfWeek is the start of the week (Monday)
      startOfWeek.setHours(0, 0, 0, 0);
        // Calculate end of week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Check if date is within the week
      return checkDate >= startOfWeek && checkDate <= endOfWeek;
    } catch (error) {
      console.error('Error in isDateInCurrentWeek:', error);
      return false;
    }
  };// Thêm hàm mới để giúp đồng bộ hóa các ca trực cho tuần hiện tại
  const handleSyncShiftsForCurrentWeek = async () => {
    // console.log('handleSyncShiftsForCurrentWeek called');
    try {
      // Lấy tất cả các ca trực có ngày thuộc tuần hiện tại, bất kể trạng thái và giá trị tuần
      const shiftsInCurrentWeek = shiftRequests.filter(req => 
        isDateInCurrentWeek(new Date(req.date), selectedWeek)
      );
      
      // Lọc ra những ca cần cập nhật tuần (có ngày thuộc tuần hiện tại nhưng giá trị tuần không đúng)
      const shiftsNeedingUpdate = shiftsInCurrentWeek.filter(req => 
        req.week !== weekString
      );
      
    //   console.log('shiftsInCurrentWeek:', shiftsInCurrentWeek.length);
    //   console.log('shiftsNeedingUpdate:', shiftsNeedingUpdate.length);
    //   console.log('selectedWeek:', selectedWeek);
    //   console.log('weekString for sync:', weekString);
      
      if (shiftsNeedingUpdate.length === 0) {
        showToast('info', 'Không có ca trực nào cần đồng bộ cho tuần này. Tất cả đã có giá trị tuần chính xác.');
        return;
      }
      
      if (!window.confirm(`Đã tìm thấy ${shiftsNeedingUpdate.length} ca trực cần đồng bộ tuần. Bạn có chắc muốn cập nhật tuần cho các ca trực này không?`)) {
        return;
      }
      
      showToast('info', `Đang đồng bộ ${shiftsNeedingUpdate.length} ca trực cho tuần này...`);
      
      // Tạo mảng các promises để xử lý đồng thời
      const updatePromises = shiftsNeedingUpdate.map(async (request) => {
        try {
          console.log(`Updating week for request ${request._id} from ${request.week} to ${weekString}`);
          const response = await api.put(`/shift-requests/${request._id}/update-week`, { 
            week: weekString 
          });
          console.log('Update response:', response.data);
          return true;
        } catch (error) {
          console.error(`Failed to update week for request ${request._id}:`, error);
          return false;
        }
      });
      
      // Đợi tất cả cập nhật hoàn thành
      const results = await Promise.allSettled(updatePromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
      
      // Làm mới dữ liệu
      await fetchShiftData();
      
      showToast('success', `Đã đồng bộ ${successCount}/${shiftsNeedingUpdate.length} ca trực cho tuần này.`);
    } catch (error) {
      console.error('Error syncing shifts:', error);
      showToast('error', 'Không thể đồng bộ ca trực. Vui lòng thử lại sau.');
    }
  };// Tách thành component riêng để tránh vấn đề với re-render
  const ScheduleActionButtons = React.memo(({ 
    isFinalized, 
    isFinalizing,
    onFinalize,
    onSyncWeek
  }) => {
    // console.log('ScheduleActionButtons rendered, handlers:', { onFinalize, onSyncWeek });
    
    const handleFinalizeClick = () => {
    //   console.log('Chốt lịch tuần button clicked');
      if (typeof onFinalize === 'function') {
        onFinalize();
      } else {
        console.error('onFinalize is not a function:', onFinalize);
      }
    };
    
    const handleSyncClick = () => {
    //   console.log('Đồng bộ tuần button clicked');
      if (typeof onSyncWeek === 'function') {
        onSyncWeek();
      } else {
        console.error('onSyncWeek is not a function:', onSyncWeek);
      }
    };
    
    return (
      <div className="flex space-x-4 mb-2">
        <button
          onClick={handleFinalizeClick}
          disabled={isFinalizing || isFinalized}
          className={`px-6 py-2 rounded-md ${
            isFinalizing || isFinalized
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isFinalizing ? 'Đang xử lý...' : isFinalized ? 'Đã chốt lịch' : 'Chốt lịch tuần'}
        </button>
        
        {!isFinalized && (
          <button
            onClick={handleSyncClick}
            className="px-6 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white"
            title="Đồng bộ tuần cho các ca trực"
          >
            Đồng bộ tuần
          </button>
        )}
      </div>
    );
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Duyệt lịch trực</h2>
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
      
      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Bộ lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">CTV</label>
            <select
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Tất cả CTV</option>
              {users.map(user => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
          
          <div className="flex items-end">            <button
              onClick={() => {
                // console.log('Reset filters button clicked');
                resetFilters();
              }}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Xóa bộ lọc
            </button>
          
            <button
              onClick={() => {
                // console.log('Reload data button clicked');
                fetchShiftData();
              }}
              className="px-4 py-2 bg-blue-200 rounded-md ml-2"
            >
              Tải lại dữ liệu
            </button>
          </div>
        </div>
      </div>      {/* Finalize Button */}
      <div className="mb-6">
        {/* Debugging message
        <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-100 rounded">
          <p>Week string: {weekString}</p>
          <p>
            Shift Requests: {shiftRequests.length} total, 
            {shiftRequests.filter(req => req.status === 'approved').length} approved, 
            {shiftRequests.filter(req => req.status === 'approved' && req.week === weekString).length} approved with correct week,
            {shiftRequests.filter(req => isDateInCurrentWeek(new Date(req.date), selectedWeek)).length} in current week by date
          </p>
        </div> */}
        
        <ScheduleActionButtons 
          isFinalized={isFinalized}
          isFinalizing={isFinalizing}
          onFinalize={handleFinalizeSchedule}
          onSyncWeek={handleSyncShiftsForCurrentWeek}
        />
        
        {isFinalized && (
          <span className="ml-2 text-green-600">
            Lịch trực tuần này đã được chốt và công khai
          </span>
        )}
        {!isFinalized && (
          <div className="mt-2 text-gray-600">
            <p>Lưu ý: Nhiều CTV có thể đăng ký trùng ca trực. Admin có quyền quyết định ai sẽ được nhận ca trực bằng cách duyệt hoặc từ chối các yêu cầu.</p>
            <p>Chỉ các ca đã được duyệt sẽ được đưa vào lịch chính thức khi chốt lịch.</p>
            <p className="text-blue-600">Nếu không thể chốt lịch, hãy sử dụng chức năng "Đồng bộ tuần" để cập nhật thông tin tuần cho các ca trực.</p>
          </div>
        )}
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
                  const requests = getRequestsForSlot(date, timeSlot);
                  return (
                    <td key={dateIndex} className="border p-2 min-h-16">
                      {requests.length > 0 ? (
                        <div 
                          className={`p-2 rounded cursor-pointer hover:bg-gray-50 text-center ${
                            requests.some(r => r.status === 'pending') 
                              ? 'bg-yellow-100' 
                              : requests.some(r => r.status === 'approved')
                              ? 'bg-green-100'
                              : 'bg-red-100'
                          }`}
                          onClick={() => setSelectedSlot({ date, timeSlot, requests })}
                        >
                          <div className="font-medium">
                            {requests.length} CTV đăng ký
                          </div>
                          <div className="text-xs space-x-1 mt-1">
                            {requests.filter(r => r.status === 'pending').length > 0 && 
                              <span className="inline-block px-1 bg-yellow-200 rounded">
                                {requests.filter(r => r.status === 'pending').length} chờ duyệt
                              </span>
                            }
                            {requests.filter(r => r.status === 'approved').length > 0 && 
                              <span className="inline-block px-1 bg-green-200 rounded">
                                {requests.filter(r => r.status === 'approved').length} đã duyệt
                              </span>
                            }
                            {requests.filter(r => r.status === 'rejected').length > 0 && 
                              <span className="inline-block px-1 bg-red-200 rounded">
                                {requests.filter(r => r.status === 'rejected').length} từ chối
                              </span>
                            }
                          </div>
                          <div className="mt-1 text-xs text-blue-600">
                            Click để xem chi tiết
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-center">Không có yêu cầu</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Shift Requests Modal - for detailed view and actions on a specific slot */}
      {selectedSlot && (
        <ShiftRequestsModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default ApproveShiftTab;
