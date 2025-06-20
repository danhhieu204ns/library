import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Bookmark, 
  RotateCcw, 
  Users, 
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';

import LoadingSkeleton from '../common/LoadingSkeleton';

const OverviewTab = ({
  todaySchedule,
  borrowings,
  reservations,
  borrowingsLoading,
  reservationsLoading,
  handleReturnBook,
  handleFulfillReservation
}) => {
  const todayDate = new Date().toDateString();
  
  return (
    <div className="space-y-6">
      {/* Today's schedule */}
      {todaySchedule && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-md font-medium text-green-800">Ca trực hôm nay</h3>
              <p className="text-sm text-green-700">
                {todaySchedule.shift_type?.shift_name} • {todaySchedule.shift_type?.start_time} - {todaySchedule.shift_type?.end_time}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Books */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sách quá hạn</h3>
          {borrowingsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse border rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 h-10 w-10 rounded"></div>
                    <div className="flex-1">
                      <div className="bg-gray-200 h-4 rounded mb-2"></div>
                      <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {borrowings
                .filter(b => b.status === 'Borrowed' && new Date(b.due_date) < new Date())
                .slice(0, 5)
                .map((borrowing) => (
                  <div key={borrowing._id} className="border border-red-200 bg-red-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded">
                          <BookOpen className="h-4 w-4 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {borrowing.copy?.book?.title || 'Unknown Book'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Mượn bởi: {borrowing.user?.full_name || borrowing.user?.username}
                          </p>
                          <p className="text-xs text-red-600">
                            Hạn trả: {new Date(borrowing.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleReturnBook(borrowing._id)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Trả sách
                      </button>
                    </div>
                  </div>
                ))}
              {borrowings.filter(b => b.status === 'Borrowed' && new Date(b.due_date) < new Date()).length === 0 && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Không có sách quá hạn</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pending Reservations */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Đặt trước đang chờ</h3>
          {reservationsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse border rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 h-10 w-10 rounded"></div>
                    <div className="flex-1">
                      <div className="bg-gray-200 h-4 rounded mb-2"></div>
                      <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {reservations.filter(r => r.status === 'Pending').slice(0, 5).map((reservation) => (
                <div key={reservation._id} className="border border-orange-200 bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 rounded">
                        <Bookmark className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {reservation.book?.title || 'Unknown Book'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Đặt bởi: {reservation.user?.full_name || reservation.user?.username}
                        </p>
                        <p className="text-xs text-orange-600">
                          Thứ tự: #{reservation.queue_position}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFulfillReservation(reservation._id)}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Xác nhận
                    </button>
                  </div>
                </div>
              ))}
              {reservations.filter(r => r.status === 'Pending').length === 0 && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Không có đặt trước đang chờ</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/staff/borrowing/new"
            className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Tạo phiếu mượn</p>
              <p className="text-sm text-gray-500">Xử lý mượn sách mới</p>
            </div>
          </Link>

          <Link
            to="/staff/return"
            className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <RotateCcw className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Trả sách</p>
              <p className="text-sm text-gray-500">Xử lý trả sách</p>
            </div>
          </Link>

          <Link
            to="/staff/user-search"
            className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Users className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Tìm người dùng</p>
              <p className="text-sm text-gray-500">Tra cứu thông tin người dùng</p>
            </div>
          </Link>

          <Link
            to="/staff/schedules/register"
            className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <Calendar className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Đăng ký ca trực</p>
              <p className="text-sm text-gray-500">Đăng ký lịch làm việc</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hoạt động hôm nay</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Mượn mới</p>
            <p className="text-2xl font-bold text-gray-900">
              {borrowings.filter(b => 
                new Date(b.created_at).toDateString() === todayDate
              ).length}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Đã trả</p>
            <p className="text-2xl font-bold text-gray-900">
              {borrowings.filter(b => 
                b.status === 'Returned' && 
                b.return_date && 
                new Date(b.return_date).toDateString() === todayDate
              ).length}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Đặt trước mới</p>
            <p className="text-2xl font-bold text-gray-900">
              {reservations.filter(r => 
                new Date(r.created_at).toDateString() === todayDate
              ).length}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Đặt trước đã xác nhận</p>
            <p className="text-2xl font-bold text-gray-900">
              {reservations.filter(r => 
                r.status === 'Ready' && 
                new Date(r.updated_at).toDateString() === todayDate
              ).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
