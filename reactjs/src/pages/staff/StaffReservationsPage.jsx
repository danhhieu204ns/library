import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BookOpen, User, Calendar, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { reservationsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StaffReservationsPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReservations, setSelectedReservations] = useState([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get reservations
  const { data: reservations, isLoading } = useQuery({
    queryKey: ['staff-reservations', statusFilter, dateFilter, searchTerm],
    queryFn: () => reservationsAPI.getReservations({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      date: dateFilter !== 'all' ? dateFilter : undefined,
      search: searchTerm,
    }),
  });

  // Approve reservation mutation
  const approveMutation = useMutation({
    mutationFn: (reservationId) => reservationsAPI.approveReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-reservations']);
      setSelectedReservations([]);
    },
  });

  // Cancel reservation mutation
  const cancelMutation = useMutation({
    mutationFn: (reservationId) => reservationsAPI.cancelReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-reservations']);
      setSelectedReservations([]);
    },
  });

  // Fulfill reservation mutation (convert to borrowing)
  const fulfillMutation = useMutation({
    mutationFn: (reservationId) => reservationsAPI.fulfillReservation(reservationId),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-reservations']);
      setSelectedReservations([]);
    },
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

  const handleBulkAction = async (action) => {
    if (selectedReservations.length === 0) return;

    try {
      for (const reservationId of selectedReservations) {
        switch (action) {
          case 'approve':
            await approveMutation.mutateAsync(reservationId);
            break;
          case 'cancel':
            await cancelMutation.mutateAsync(reservationId);
            break;
          case 'fulfill':
            await fulfillMutation.mutateAsync(reservationId);
            break;
        }
      }
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
    }
  };

  const toggleReservationSelection = (reservationId) => {
    setSelectedReservations(prev =>
      prev.includes(reservationId)
        ? prev.filter(id => id !== reservationId)
        : [...prev, reservationId]
    );
  };

  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản Lý Đặt Trước</h1>
        
        {selectedReservations.length > 0 && (
          <div className="flex gap-2">
            <Button
              onClick={() => handleBulkAction('approve')}
              disabled={approveMutation.isPending}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Duyệt ({selectedReservations.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction('fulfill')}
              disabled={fulfillMutation.isPending}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Hoàn thành ({selectedReservations.length})
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleBulkAction('cancel')}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-2"
            >
              <XCircle className="h-4 w-4" />
              Hủy ({selectedReservations.length})
            </Button>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                  <SelectItem value="fulfilled">Đã hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="expired">Đã hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Thời gian</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="week">Tuần này</SelectItem>
                  <SelectItem value="month">Tháng này</SelectItem>
                  <SelectItem value="expiring">Sắp hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="search">Tìm kiếm</Label>
              <Input
                id="search"
                placeholder="Tìm theo tên sách, người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Đang tải danh sách đặt trước...</span>
        </div>
      ) : reservations?.data && reservations.data.length > 0 ? (
        <div className="space-y-4">
          {reservations.data.map((reservation) => (
            <Card
              key={reservation.id}
              className={`${isExpired(reservation.expiryDate) ? 'opacity-60' : ''} ${
                isExpiringSoon(reservation.expiryDate) ? 'border-l-4 border-l-orange-500' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedReservations.includes(reservation.id)}
                      onChange={() => toggleReservationSelection(reservation.id)}
                      className="w-4 h-4 mt-1"
                    />

                    <div className="flex-1 space-y-3">
                      {/* Book and User Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">{reservation.book?.title}</h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Tác giả: {reservation.book?.author}</div>
                            <div>ISBN: {reservation.book?.isbn}</div>
                            <div>Số lượng có sẵn: {reservation.book?.availableCopies || 0}</div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{reservation.user?.fullName}</span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Email: {reservation.user?.email}</div>
                            <div>ID: {reservation.user?.id}</div>
                          </div>
                        </div>
                      </div>

                      {/* Reservation Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Ngày đặt:</span>
                          <p>{new Date(reservation.reservationDate).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                          <span className="font-medium">Hạn nhận:</span>
                          <p className={isExpired(reservation.expiryDate) ? 'text-red-600 font-medium' : 
                                      isExpiringSoon(reservation.expiryDate) ? 'text-orange-600 font-medium' : ''}>
                            {new Date(reservation.expiryDate).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Độ ưu tiên:</span>
                          <div className="mt-1">
                            <Badge className={getPriorityColor(reservation.priority)}>
                              {getPriorityText(reservation.priority)}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Trạng thái:</span>
                          <div className="mt-1">
                            <Badge className={getStatusColor(reservation.status)}>
                              {getStatusText(reservation.status)}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {reservation.notes && (
                        <div className="bg-blue-50 p-3 rounded">
                          <span className="font-medium text-sm">Ghi chú:</span>
                          <p className="text-sm mt-1">{reservation.notes}</p>
                        </div>
                      )}

                      {/* Warnings */}
                      {isExpiringSoon(reservation.expiryDate) && !isExpired(reservation.expiryDate) && (
                        <Alert className="border-orange-200 bg-orange-50">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <AlertDescription className="text-orange-800">
                            Đặt trước này sẽ hết hạn trong {Math.ceil((new Date(reservation.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} ngày.
                          </AlertDescription>
                        </Alert>
                      )}

                      {isExpired(reservation.expiryDate) && (
                        <Alert className="border-red-200 bg-red-50">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            Đặt trước này đã hết hạn.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/staff/reservations/${reservation.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Chi tiết
                    </Button>

                    {reservation.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutateAsync(reservation.id)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Duyệt
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => cancelMutation.mutateAsync(reservation.id)}
                          disabled={cancelMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </Button>
                      </>
                    )}

                    {reservation.status === 'approved' && reservation.book?.availableCopies > 0 && (
                      <Button
                        size="sm"
                        onClick={() => fulfillMutation.mutateAsync(reservation.id)}
                        disabled={fulfillMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <BookOpen className="h-4 w-4" />
                        Hoàn thành
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có đặt trước nào.</p>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tóm tắt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-bold text-yellow-600">
                {reservations?.data?.filter(r => r.status === 'pending').length || 0}
              </div>
              <div className="text-sm text-gray-600">Chờ duyệt</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {reservations?.data?.filter(r => r.status === 'approved').length || 0}
              </div>
              <div className="text-sm text-gray-600">Đã duyệt</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {reservations?.data?.filter(r => r.status === 'fulfilled').length || 0}
              </div>
              <div className="text-sm text-gray-600">Hoàn thành</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-bold text-red-600">
                {reservations?.data?.filter(r => r.status === 'cancelled').length || 0}
              </div>
              <div className="text-sm text-gray-600">Đã hủy</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <div className="text-2xl font-bold text-orange-600">
                {reservations?.data?.filter(r => isExpiringSoon(r.expiryDate)).length || 0}
              </div>
              <div className="text-sm text-gray-600">Sắp hết hạn</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffReservationsPage;
