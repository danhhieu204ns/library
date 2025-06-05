import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BookOpen, User, Calendar, Clock, ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { reservationsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const ReservationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get reservation details
  const { data: reservation, isLoading } = useQuery({
    queryKey: ['reservation-detail', id],
    queryFn: () => reservationsAPI.getReservation(id),
    enabled: !!id,
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'fulfilled': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'expired': return 'Đã hết hạn';
      default: return status;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Đang tải chi tiết đặt trước...</span>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy thông tin đặt trước.</p>
            <Button 
              onClick={() => navigate('/staff/reservations')} 
              className="mt-4"
            >
              Quay lại danh sách
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const reservationData = reservation.data || reservation;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/staff/reservations')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold">Chi Tiết Đặt Trước #{reservationData.id}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Book Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Thông Tin Sách
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reservationData.book?.coverImage && (
                  <div className="flex justify-center">
                    <img
                      src={reservationData.book.coverImage}
                      alt={reservationData.book.title}
                      className="w-48 h-64 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{reservationData.book?.title}</h2>
                    <p className="text-gray-600 text-lg">{reservationData.book?.author}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className="font-medium">ISBN:</span> {reservationData.book?.isbn}
                    </div>
                    <div>
                      <span className="font-medium">Thể loại:</span> {reservationData.book?.category?.name}
                    </div>
                    <div>
                      <span className="font-medium">Nhà xuất bản:</span> {reservationData.book?.publisher}
                    </div>
                    <div>
                      <span className="font-medium">Năm xuất bản:</span> {reservationData.book?.publishYear}
                    </div>
                    <div>
                      <span className="font-medium">Số trang:</span> {reservationData.book?.pages}
                    </div>
                    <div>
                      <span className="font-medium">Số lượng có sẵn:</span>{' '}
                      <span className={reservationData.book?.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}>
                        {reservationData.book?.availableCopies || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {reservationData.book?.description && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Mô tả:</h3>
                  <p className="text-gray-700">{reservationData.book.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Thông Tin Người Đặt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{reservationData.user?.fullName}</h3>
                    <p className="text-gray-600">{reservationData.user?.email}</p>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">ID người dùng:</span> {reservationData.user?.id}
                    </div>
                    {reservationData.user?.phone && (
                      <div>
                        <span className="font-medium">Điện thoại:</span> {reservationData.user.phone}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Loại tài khoản:</span>{' '}
                      <Badge variant="secondary">{reservationData.user?.role}</Badge>
                    </div>
                    <div>
                      <span className="font-medium">Ngày tham gia:</span>{' '}
                      {new Date(reservationData.user?.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>

                {/* User Statistics */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Thống kê người dùng</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {reservationData.user?.stats?.totalBorrowings || 0}
                      </div>
                      <div className="text-gray-600">Lần mượn</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {reservationData.user?.stats?.totalReservations || 0}
                      </div>
                      <div className="text-gray-600">Lần đặt trước</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline/History */}
          {reservationData.timeline && reservationData.timeline.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Lịch Sử Thay Đổi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reservationData.timeline.map((event, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{event.action}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        {event.note && (
                          <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                        )}
                        {event.staffMember && (
                          <p className="text-sm text-gray-500 mt-1">
                            Bởi: {event.staffMember.fullName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng Thái & Hành Động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Trạng thái:</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(reservationData.status)}>
                      {getStatusText(reservationData.status)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Độ ưu tiên:</label>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(reservationData.priority)}>
                      {getPriorityText(reservationData.priority)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t">
                {reservationData.status === 'pending' && (
                  <>
                    <Button className="w-full flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Duyệt Đặt Trước
                    </Button>
                    <Button variant="destructive" className="w-full flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Từ Chối
                    </Button>
                  </>
                )}

                {reservationData.status === 'approved' && reservationData.book?.availableCopies > 0 && (
                  <Button className="w-full flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Hoàn Thành (Cho Mượn)
                  </Button>
                )}

                <Button variant="outline" className="w-full">
                  Liên Hệ Người Dùng
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Reservation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Chi Tiết Đặt Trước</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Ngày đặt:</span>
                <p>{new Date(reservationData.reservationDate).toLocaleString('vi-VN')}</p>
              </div>
              
              <div>
                <span className="font-medium">Hạn nhận sách:</span>
                <p className={new Date(reservationData.expiryDate) < new Date() ? 'text-red-600' : ''}>
                  {new Date(reservationData.expiryDate).toLocaleString('vi-VN')}
                </p>
              </div>

              {reservationData.expectedPickupDate && (
                <div>
                  <span className="font-medium">Dự kiến nhận sách:</span>
                  <p>{new Date(reservationData.expectedPickupDate).toLocaleString('vi-VN')}</p>
                </div>
              )}

              {reservationData.notes && (
                <div>
                  <span className="font-medium">Ghi chú của người dùng:</span>
                  <p className="bg-gray-50 p-2 rounded mt-1">{reservationData.notes}</p>
                </div>
              )}

              {reservationData.staffNotes && (
                <div>
                  <span className="font-medium">Ghi chú của nhân viên:</span>
                  <p className="bg-blue-50 p-2 rounded mt-1">{reservationData.staffNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warnings */}
          {new Date(reservationData.expiryDate) < new Date() && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                Đặt trước này đã hết hạn và cần được xử lý.
              </AlertDescription>
            </Alert>
          )}

          {reservationData.book?.availableCopies === 0 && reservationData.status === 'approved' && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Hiện tại không có bản sao nào có sẵn để hoàn thành đặt trước này.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailPage;
