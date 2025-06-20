import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Book, Users, Clock, AlertTriangle } from 'lucide-react';

import TabHeader from '../common/TabHeader';

const ReportsTab = () => {
  return (
    <div>
      <TabHeader title="Báo cáo & Thống kê" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/staff/reports/borrowings" className="bg-white shadow overflow-hidden rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
            <h4 className="text-lg font-medium text-gray-900">Báo cáo mượn trả</h4>
          </div>
          <p className="text-gray-500">Xem báo cáo chi tiết về mượn trả sách</p>
        </Link>
        
        <Link to="/staff/reports/reservations" className="bg-white shadow overflow-hidden rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Calendar className="h-8 w-8 text-orange-600 mr-3" />
            <h4 className="text-lg font-medium text-gray-900">Báo cáo đặt trước</h4>
          </div>
          <p className="text-gray-500">Theo dõi xu hướng đặt trước và sách phổ biến</p>
        </Link>
        
        <Link to="/staff/reports/books" className="bg-white shadow overflow-hidden rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Book className="h-8 w-8 text-green-600 mr-3" />
            <h4 className="text-lg font-medium text-gray-900">Báo cáo sách</h4>
          </div>
          <p className="text-gray-500">Phân tích kho sách và độ phổ biến</p>
        </Link>
        
        <Link to="/staff/reports/users" className="bg-white shadow overflow-hidden rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Users className="h-8 w-8 text-indigo-600 mr-3" />
            <h4 className="text-lg font-medium text-gray-900">Báo cáo người dùng</h4>
          </div>
          <p className="text-gray-500">Phân tích hoạt động và mẫu mượn sách của người dùng</p>
        </Link>
        
        <Link to="/staff/reports/schedules" className="bg-white shadow overflow-hidden rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <Clock className="h-8 w-8 text-purple-600 mr-3" />
            <h4 className="text-lg font-medium text-gray-900">Báo cáo lịch trực</h4>
          </div>
          <p className="text-gray-500">Xem báo cáo về ca trực và lịch làm việc của nhân viên</p>
        </Link>
        
        <Link to="/staff/reports/overdue" className="bg-white shadow overflow-hidden rounded-lg p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <h4 className="text-lg font-medium text-gray-900">Báo cáo quá hạn</h4>
          </div>
          <p className="text-gray-500">Theo dõi sách quá hạn và trạng thái thông báo người dùng</p>
        </Link>
      </div>
    </div>
  );
};

export default ReportsTab;
