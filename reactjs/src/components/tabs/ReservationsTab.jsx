import React, { useState } from 'react';
import { Calendar, CheckCircle, Search, Filter, AlertTriangle, Clock } from 'lucide-react';

const ReservationsTab = ({
  reservations = [],
  loading = false,
  onFulfillReservation,
  searchTerm = '',
  onSearchChange,
  filterStatus = 'all',
  onFilterChange
}) => {
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [copyId, setCopyId] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Handle fulfill reservation
  const handleFulfillReservation = () => {
    onFulfillReservation && onFulfillReservation(selectedReservation._id, { copy_id: copyId });
    setShowModal(false);
    setSelectedReservation(null);
    setCopyId('');
  };

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

  // Filter reservations based on search and status
  const filteredReservations = reservations.filter(r => {
    const matchesSearch = 
      r.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || 
      r.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Quản Lý Đặt Trước Sách</h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mb-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Tìm kiếm theo tên sách, người dùng..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            value={filterStatus}
            onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Pending">Đang chờ</option>
            <option value="Ready">Sẵn sàng</option>
            <option value="Fulfilled">Đã xử lý</option>
            <option value="Cancelled">Đã hủy</option>
          </select>
        </div>
      </div>
      
      {/* Reservations List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sách
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Người đặt
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày đặt
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hạn nhận
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.length > 0 ? (
              filteredReservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.book?.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.book?._id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservation.user?.name}</div>
                    <div className="text-sm text-gray-500">{reservation.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(reservation.reservation_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {reservation.expiry_date && new Date(reservation.expiry_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${reservation.status === 'Pending' 
                        ? 'bg-yellow-100 text-yellow-800'
                        : reservation.status === 'Ready'
                          ? 'bg-green-100 text-green-800'
                          : reservation.status === 'Fulfilled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'}`}>
                      {reservation.status === 'Pending' 
                        ? 'Đang chờ'
                        : reservation.status === 'Ready'
                          ? 'Sẵn sàng'
                          : reservation.status === 'Fulfilled'
                            ? 'Đã xử lý'
                            : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {reservation.status === 'Pending' && (
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        onClick={() => {
                          setSelectedReservation(reservation);
                          setShowModal(true);
                        }}
                      >
                        Xử lý
                      </button>
                    )}
                    <button className="text-gray-600 hover:text-gray-900">
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                  Không tìm thấy dữ liệu đặt trước sách
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Fulfill Reservation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Xử lý đặt trước sách</h3>
            <p className="mb-2">Sách: <span className="font-medium">{selectedReservation?.book?.title}</span></p>
            <p className="mb-4">Người đặt: <span className="font-medium">{selectedReservation?.user?.name}</span></p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã bản sao</label>
              <input
                type="text"
                className="shadow-sm block w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md p-2"
                placeholder="Nhập mã bản sao sách..."
                value={copyId}
                onChange={(e) => setCopyId(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => {
                  setShowModal(false);
                  setSelectedReservation(null);
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleFulfillReservation}
                disabled={!copyId}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsTab;
