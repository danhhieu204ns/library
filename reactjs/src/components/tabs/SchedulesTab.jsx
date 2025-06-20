import React, { useState } from 'react';
import { Calendar, Clock, Check, X, Plus } from 'lucide-react';

const SchedulesTab = ({
  schedules = [],
  loading = false,
  onCreateSchedule
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    shift_date: '',
    shift_start: '',
    shift_end: '',
    notes: ''
  });

  const handleCreateSchedule = () => {
    onCreateSchedule && onCreateSchedule(createForm);
    setShowCreateModal(false);
    setCreateForm({
      shift_date: '',
      shift_start: '',
      shift_end: '',
      notes: ''
    });
  };

  // Get today's schedule
  const todaySchedule = schedules.find(s => 
    new Date(s.shift_date).toDateString() === new Date().toDateString()
  );

  // Group schedules by month and day
  const groupedSchedules = schedules.reduce((groups, schedule) => {
    const date = new Date(schedule.shift_date);
    const month = date.toLocaleString('default', { month: 'long' });
    const day = date.getDate();
    
    if (!groups[month]) {
      groups[month] = {};
    }
    
    if (!groups[month][day]) {
      groups[month][day] = [];
    }
    
    groups[month][day].push(schedule);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Quản Lý Lịch Trực</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 col-span-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Lịch trực hôm nay
          </h3>
          
          {todaySchedule ? (
            <div className="space-y-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-600" />
                <span className="text-gray-700">
                  {new Date(todaySchedule.shift_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  {new Date(todaySchedule.shift_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {todaySchedule.notes && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Ghi chú:</span> {todaySchedule.notes}
                </p>
              )}
              <div className="mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Đã xác nhận
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">
              Bạn không có lịch trực hôm nay
            </div>
          )}
          
          <button 
            className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Đăng ký lịch mới
          </button>
        </div>
        
        {/* Upcoming Schedules */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200 col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Lịch trực sắp tới
          </h3>
          
          {Object.keys(groupedSchedules).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedSchedules).map(([month, days]) => (
                <div key={month} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <h4 className="text-md font-medium text-gray-700 mb-2">{month}</h4>
                  <div className="space-y-3">
                    {Object.entries(days).map(([day, daySchedules]) => (
                      <div key={`${month}-${day}`} className="border-l-2 border-blue-500 pl-3">
                        <div className="text-sm font-medium text-gray-800">
                          {new Date(daySchedules[0].shift_date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric' })}
                        </div>
                        <div className="space-y-2 mt-1">
                          {daySchedules.map((schedule) => (
                            <div key={schedule._id} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-gray-600" />
                                <span className="text-gray-700">
                                  {new Date(schedule.shift_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                  {new Date(schedule.shift_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  Đã xác nhận
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Chưa có lịch trực nào được đăng ký
            </div>
          )}
        </div>
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Đăng ký lịch trực mới</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày trực</label>
                <input
                  type="date"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  value={createForm.shift_date}
                  onChange={(e) => setCreateForm({...createForm, shift_date: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                    value={createForm.shift_start}
                    onChange={(e) => setCreateForm({...createForm, shift_start: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
                  <input
                    type="time"
                    className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                    value={createForm.shift_end}
                    onChange={(e) => setCreateForm({...createForm, shift_end: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  rows="3"
                  className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                  placeholder="Thông tin bổ sung (nếu có)..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                ></textarea>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({
                    shift_date: '',
                    shift_start: '',
                    shift_end: '',
                    notes: ''
                  });
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleCreateSchedule}
                disabled={!createForm.shift_date || !createForm.shift_start || !createForm.shift_end}
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulesTab;
