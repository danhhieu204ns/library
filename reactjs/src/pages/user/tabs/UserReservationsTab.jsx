import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Clock, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { reservationsAPI } from '../../../services/api';

const UserReservationsTab = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        // Fetch user's reservations from API using the reservationsAPI service
        const response = await reservationsAPI.getReservations({ userId: user.id });
        
        setReservations(response.data.data);
      } catch (err) {
        console.error('Error fetching reservations:', err);
        setError(err.response?.data?.message || 'Không thể tải danh sách đặt trước');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchReservations();
    }
  }, [user]);
  const cancelReservation = async (id) => {
    try {
      await reservationsAPI.cancelReservation(id);
      
      // Update the UI by removing the canceled reservation
      setReservations(reservations.filter(reservation => reservation.id !== id));
    } catch (err) {
      console.error('Error canceling reservation:', err);
      setError(err.response?.data?.message || 'Không thể hủy đặt trước');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center px-2 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-1" />
            Đang chờ
          </span>
        );
      case 'ready':
        return (
          <span className="flex items-center px-2 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Sẵn sàng
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center px-2 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Hết hạn
          </span>
        );
      default:
        return (
          <span className="flex items-center px-2 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Sách đặt trước</h1>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Sách đặt trước</h1>
          <div className="mt-4 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Đã xảy ra lỗi</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Sách đặt trước</h1>
        
        {reservations.length === 0 ? (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
            Bạn chưa có sách đặt trước nào
          </div>
        ) : (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {reservations.map((reservation) => (
                <li key={reservation.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {reservation.book?.coverImage ? (
                            <img
                              className="h-12 w-12 rounded-md object-cover"
                              src={reservation.book.coverImage}
                              alt={reservation.book.title}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                              <BookOpen className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                            {reservation.book?.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.book?.author}
                          </div>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(reservation.status)}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span>Ngày đặt: {new Date(reservation.reservationDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center">
                        {reservation.status !== 'expired' && (
                          <button
                            onClick={() => cancelReservation(reservation.id)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Hủy đặt trước
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReservationsTab;
