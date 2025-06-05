import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { schedulesAPI } from '../../services/api';

const StaffSchedulesPage = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Get schedules for staff
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['staff-schedules', statusFilter, dateFilter, searchTerm],
    queryFn: () => schedulesAPI.getSchedules({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      date: dateFilter !== 'all' ? dateFilter : undefined,
      search: searchTerm,
    }),
  });

  // Register for schedule mutation
  const registerMutation = useMutation({
    mutationFn: (scheduleId) => schedulesAPI.registerForSchedule(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-schedules']);
    },
  });

  // Cancel registration mutation
  const cancelMutation = useMutation({
    mutationFn: (scheduleId) => schedulesAPI.cancelScheduleRegistration(scheduleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-schedules']);
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'cancelled': return 'Đã hủy';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  const getShiftColor = (shift) => {
    switch (shift) {
      case 'morning': return 'bg-orange-100 text-orange-800';
      case 'afternoon': return 'bg-blue-100 text-blue-800';
      case 'evening': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getShiftText = (shift) => {
    switch (shift) {
      case 'morning': return 'Ca sáng (8:00-12:00)';
      case 'afternoon': return 'Ca chiều (13:00-17:00)';
      case 'evening': return 'Ca tối (18:00-22:00)';
      default: return shift;
    }
  };

  const handleRegister = async (scheduleId) => {
    try {
      await registerMutation.mutateAsync(scheduleId);
    } catch (error) {
      console.error('Error registering for schedule:', error);
    }
  };

  const handleCancel = async (scheduleId) => {
    try {
      await cancelMutation.mutateAsync(scheduleId);
    } catch (error) {
      console.error('Error cancelling registration:', error);
    }
  };

  const isDatePassed = (date) => {
    return new Date(date) < new Date();
  };

  const canRegister = (schedule) => {
    return !isDatePassed(schedule.date) && 
           schedule.status === 'pending' && 
           !schedule.isRegistered &&
           schedule.currentStaff < schedule.maxStaff;
  };

  const canCancel = (schedule) => {
    return !isDatePassed(schedule.date) && 
           schedule.isRegistered &&
           schedule.status !== 'cancelled';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Lịch Trực</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Đăng ký ca trực mới
        </Button>
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
                  <SelectItem value="pending">Chờ xác nhận</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
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
                  <SelectItem value="tomorrow">Ngày mai</SelectItem>
                  <SelectItem value="week">Tuần này</SelectItem>
                  <SelectItem value="month">Tháng này</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="search">Tìm kiếm</Label>
              <Input
                id="search"
                placeholder="Tìm theo ghi chú hoặc mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedules List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Đang tải lịch trực...</span>
        </div>
      ) : schedules?.data && schedules.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.data.map((schedule) => (
            <Card key={schedule.id} className={`${isDatePassed(schedule.date) ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {new Date(schedule.date).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge className={getStatusColor(schedule.status)}>
                        {getStatusText(schedule.status)}
                      </Badge>
                      <Badge className={getShiftColor(schedule.shift)}>
                        {getShiftText(schedule.shift)}
                      </Badge>
                    </div>
                  </div>
                  {isDatePassed(schedule.date) && (
                    <Badge variant="secondary">Đã qua</Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Staff Info */}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>
                    {schedule.currentStaff || 0}/{schedule.maxStaff} nhân viên
                  </span>
                  {schedule.currentStaff >= schedule.maxStaff && (
                    <Badge variant="secondary" className="ml-2">Đầy</Badge>
                  )}
                </div>

                {/* Time Info */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{getShiftText(schedule.shift)}</span>
                </div>

                {/* Description */}
                {schedule.description && (
                  <div className="text-sm text-gray-600">
                    <p className="line-clamp-2">{schedule.description}</p>
                  </div>
                )}

                {/* Registration Status */}
                {schedule.isRegistered && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Bạn đã đăng ký ca trực này
                    </AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {canRegister(schedule) && (
                    <Button
                      onClick={() => handleRegister(schedule.id)}
                      disabled={registerMutation.isPending}
                      className="flex-1 flex items-center gap-2"
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Đăng ký
                    </Button>
                  )}

                  {canCancel(schedule) && (
                    <Button
                      variant="outline"
                      onClick={() => handleCancel(schedule.id)}
                      disabled={cancelMutation.isPending}
                      className="flex-1 flex items-center gap-2"
                    >
                      {cancelMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Hủy đăng ký
                    </Button>
                  )}

                  {!canRegister(schedule) && !canCancel(schedule) && (
                    <Button
                      variant="outline"
                      disabled
                      className="flex-1 flex items-center gap-2"
                    >
                      <AlertCircle className="h-4 w-4" />
                      {isDatePassed(schedule.date) ? 'Đã qua' :
                       schedule.currentStaff >= schedule.maxStaff ? 'Đã đầy' :
                       schedule.status === 'cancelled' ? 'Đã hủy' : 'Không khả dụng'}
                    </Button>
                  )}
                </div>

                {/* Staff List */}
                {schedule.registeredStaff && schedule.registeredStaff.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-sm font-medium mb-2">Nhân viên đã đăng ký:</p>
                    <div className="space-y-1">
                      {schedule.registeredStaff.map((staff) => (
                        <div key={staff.id} className="text-sm text-gray-600">
                          {staff.fullName}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không có lịch trực nào.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffSchedulesPage;
