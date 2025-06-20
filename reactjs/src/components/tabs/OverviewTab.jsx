import React from 'react';
import { BarChart3, BookOpen, Calendar, Users, AlertTriangle } from 'lucide-react';

const OverviewTab = ({ 
  stats = { 
    totalBooks: 0, 
    totalUsers: 0, 
    activeBorrowings: 0, 
    overdueBorrowings: 0, 
    pendingReservations: 0,
    readyReservations: 0
  },
  loading = false
}) => {
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
      <h2 className="text-2xl font-semibold mb-6">Tổng Quan Thư Viện</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Books Stats */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-600">Tổng Số Sách</h3>
              <p className="text-2xl font-bold">{stats.totalBooks}</p>
            </div>
          </div>
        </div>

        {/* Users Stats */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-600">Người Dùng</h3>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Borrowing Stats */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-600">Sách Đang Mượn</h3>
              <p className="text-2xl font-bold">{stats.activeBorrowings}</p>
            </div>
          </div>
        </div>

        {/* Overdue Stats */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-600">Sách Quá Hạn</h3>
              <p className="text-2xl font-bold">{stats.overdueBorrowings}</p>
            </div>
          </div>
        </div>

        {/* Pending Reservations */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full bg-amber-100 p-3">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-600">Đặt Trước Đang Chờ</h3>
              <p className="text-2xl font-bold">{stats.pendingReservations}</p>
            </div>
          </div>
        </div>

        {/* Ready Reservations */}
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center">
            <div className="rounded-full bg-teal-100 p-3">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-600">Đặt Trước Sẵn Sàng</h3>
              <p className="text-2xl font-bold">{stats.readyReservations}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
