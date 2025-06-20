import React from 'react';
import { Settings, Database, Flag, Shield, Book } from 'lucide-react';

const AdminSettingsTab = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Cài Đặt Hệ Thống</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Library Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Book className="h-6 w-6 text-indigo-600 mr-3" />
            <h3 className="text-lg font-medium">Cài đặt thư viện</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số ngày mượn tối đa
              </label>
              <input 
                type="number" 
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue={14}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số sách mượn tối đa
              </label>
              <input 
                type="number" 
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue={5}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phí phạt mỗi ngày quá hạn (VNĐ)
              </label>
              <input 
                type="number" 
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue={5000}
              />
            </div>
          </div>
        </div>
        
        {/* Database Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-indigo-600 mr-3" />
            <h3 className="text-lg font-medium">Cài đặt cơ sở dữ liệu</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tạo sao lưu tự động
              </label>
              <select className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md">
                <option>Hàng ngày</option>
                <option>Hàng tuần</option>
                <option>Hàng tháng</option>
                <option>Không tự động</option>
              </select>
            </div>
            <div className="flex items-center">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Tạo sao lưu ngay
              </button>
            </div>
          </div>
        </div>
        
        {/* Notification Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Flag className="h-6 w-6 text-indigo-600 mr-3" />
            <h3 className="text-lg font-medium">Cài đặt thông báo</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="email-notifications"
                name="email-notifications"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-900">
                Gửi thông báo qua email
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="reminder-notifications"
                name="reminder-notifications"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="reminder-notifications" className="ml-2 block text-sm text-gray-900">
                Gửi nhắc nhở trước hạn
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số ngày nhắc trước hạn
              </label>
              <input 
                type="number" 
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue={2}
              />
            </div>
          </div>
        </div>
        
        {/* Security Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-indigo-600 mr-3" />
            <h3 className="text-lg font-medium">Cài đặt bảo mật</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="two-factor"
                name="two-factor"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="two-factor" className="ml-2 block text-sm text-gray-900">
                Bật xác thực hai yếu tố
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian hết hạn phiên đăng nhập (phút)
              </label>
              <input 
                type="number" 
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue={30}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới hạn số lần đăng nhập thất bại
              </label>
              <input 
                type="number" 
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                defaultValue={5}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
        >
          Đặt lại
        </button>
        <button
          type="button"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsTab;
