import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle, Eye } from 'lucide-react';

import TabHeader from '../common/TabHeader';
import LoadingSkeleton from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';
import StatusBadge from '../common/StatusBadge';

const ReservationsTab = ({
  reservations,
  isLoading,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  handleFulfillReservation,
  fulfillReservationMutation
}) => {
  // Filter the reservations based on search term and status
  const filteredReservations = reservations.filter(reservation => {
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      reservation.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <TabHeader 
        title="Quản lý đặt trước"
        searchPlaceholder="Tìm kiếm đặt trước..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        filterOptions={[
          { value: 'all', label: 'Tất cả trạng thái' },
          { value: 'Pending', label: 'Đang chờ' },
          { value: 'Ready', label: 'Sẵn sàng' },
          { value: 'Fulfilled', label: 'Đã xử lý' },
          { value: 'Expired', label: 'Hết hạn' },
          { value: 'Cancelled', label: 'Đã hủy' }
        ]}
      />

      {isLoading ? (
        <LoadingSkeleton count={5} />
      ) : filteredReservations.length === 0 ? (
        <EmptyState 
          icon="Bookmark"
          title="Không tìm thấy đặt trước"
          description="Không có đặt trước nào phù hợp với tìm kiếm của bạn."
        />
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredReservations.map((reservation) => {
              const isExpiringSoon = reservation.status === 'Ready' && 
                reservation.expires_at && 
                new Date(reservation.expires_at) <= new Date(Date.now() + 24 * 60 * 60 * 1000);
              
              return (
                <li key={reservation._id}>
                  <div className={`px-4 py-4 ${isExpiringSoon ? 'bg-yellow-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            reservation.status === 'Pending' ? 'bg-yellow-100' :
                            reservation.status === 'Ready' ? 'bg-green-100' :
                            reservation.status === 'Fulfilled' ? 'bg-blue-100' :
                            reservation.status === 'Expired' ? 'bg-red-100' :
                            'bg-gray-100'
                          }`}>
                            <Bookmark className={`h-5 w-5 ${
                              reservation.status === 'Pending' ? 'text-yellow-600' :
                              reservation.status === 'Ready' ? 'text-green-600' :
                              reservation.status === 'Fulfilled' ? 'text-blue-600' :
                              reservation.status === 'Expired' ? 'text-red-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {reservation.book?.title || 'Unknown Book'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Đặt bởi: {reservation.user?.full_name || reservation.user?.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {reservation.queue_position && reservation.status === 'Pending' && (
                              <span>Thứ tự: #{reservation.queue_position} • </span>
                            )}
                            {reservation.status === 'Ready' && (
                              <span className={`${isExpiringSoon ? 'text-yellow-600 font-medium' : ''}`}>
                                Hết hạn: {new Date(reservation.expires_at).toLocaleDateString()}
                                {isExpiringSoon && ' (Sắp hết hạn)'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <StatusBadge status={reservation.status} type="reservation" />
                        {reservation.status === 'Pending' && (
                          <button
                            onClick={() => handleFulfillReservation(reservation._id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                            disabled={fulfillReservationMutation.isLoading}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Xác nhận
                          </button>
                        )}
                        <Link
                          to={`/staff/reservations/${reservation._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReservationsTab;
