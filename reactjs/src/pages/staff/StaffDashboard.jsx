import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  UserCheck,
  BookOpen,
  Calendar,
  Search,
  XCircle,
  BarChart3,
  Clock,
  Book,
  Users,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { borrowingsAPI, reservationsAPI, schedulesAPI, booksAPI, usersAPI } from '../../services/api';

// Import tab components
import OverviewTab from './components/tabs/OverviewTab';
import BorrowingsTab from './components/tabs/BorrowingsTab';
import ReservationsTab from './components/tabs/ReservationsTab';
import SchedulesTab from './components/tabs/SchedulesTab';
import BooksTab from './components/tabs/BooksTab';
import UsersTab from './components/tabs/UsersTab';
import ReportsTab from './components/tabs/ReportsTab';
import UnderDevelopmentTab from './components/tabs/UnderDevelopmentTab';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const queryClient = useQueryClient();

  // Fetch staff data
  const { data: borrowingsData, isLoading: borrowingsLoading } = useQuery({
    queryKey: ['borrowings-staff'],
    queryFn: () => borrowingsAPI.getBorrowings({ limit: 20 }),
    enabled: user?.role === 'CTV' || user?.role === 'Admin'
  });
  const { data: reservationsData, isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations-staff'],
    queryFn: () => reservationsAPI.getReservations({ limit: 20 }),
    enabled: user?.role === 'CTV' || user?.role === 'Admin'
  });
  const { data: schedulesData, isLoading: schedulesLoading } = useQuery({
    queryKey: ['schedules-staff'],
    queryFn: () => schedulesAPI.getSchedules({ user_id: user?.role === 'CTV' ? user._id : undefined, limit: 20 }),
    enabled: user?.role === 'CTV' || user?.role === 'Admin'
  });
  
  const { data: booksData, isLoading: booksLoading } = useQuery({
    queryKey: ['books-staff'],
    queryFn: () => booksAPI.getBooks({ limit: 20 }),
    enabled: user?.role === 'CTV' || user?.role === 'Admin'
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-staff'],
    queryFn: () => usersAPI.getUsers({ limit: 20 }),
    enabled: user?.role === 'CTV' || user?.role === 'Admin'
  });

  // Return book mutation
  const returnBookMutation = useMutation({
    mutationFn: ({ id, notes }) => borrowingsAPI.returnBook(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['borrowings-staff']);
      alert('Trả sách thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Không thể trả sách');
    }
  });

  // Fulfill reservation mutation
  const fulfillReservationMutation = useMutation({
    mutationFn: ({ id, copy_id }) => reservationsAPI.fulfillReservation(id, { copy_id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations-staff']);
      alert('Đặt trước đã được xác nhận!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Không thể xác nhận đặt trước');
    }
  });
  
  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: (scheduleData) => schedulesAPI.createSchedule(scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules-staff']);
      alert('Đăng ký ca trực thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Không thể đăng ký ca trực');
    }
  });
  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: (bookId) => booksAPI.deleteBook(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries(['books-staff']);
      alert('Sách đã được xóa thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Không thể xóa sách.');
    }
  });

  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }) => booksAPI.updateBook(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['books-staff']);
      alert('Sách đã được cập nhật thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Không thể cập nhật sách.');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => usersAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries(['users-staff']);
      alert('Xóa người dùng thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Không thể xóa người dùng');
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users-staff']);
      alert('Cập nhật người dùng thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Không thể cập nhật người dùng');
    }
  });

  // Check if user is staff
  if (!user || !['CTV', 'Admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need staff privileges to access this page
          </p>
        </div>
      </div>
    );
  }

  const borrowings = borrowingsData?.data?.data?.borrowings || [];
  const reservations = reservationsData?.data?.data?.reservations || [];
  const schedules = schedulesData?.data?.data?.schedules || [];
  const books = booksData?.data?.data?.books || [];
  const users = usersData?.data?.data?.users || [];
  const totalBooks = booksData?.data?.data?.pagination?.total || 0;
  const totalUsers = usersData?.data?.data?.pagination?.total || 0;

  // Calculate stats
  const activeBorrowings = borrowings.filter(b => b.status === 'Borrowed').length;
  const overdueBorrowings = borrowings.filter(b => 
    b.status === 'Borrowed' && new Date(b.due_date) < new Date()
  ).length;
  const pendingReservations = reservations.filter(r => r.status === 'Pending').length;
  const readyReservations = reservations.filter(r => r.status === 'Ready').length;

  // Handle return book
  const handleReturnBook = (borrowingId) => {
    const notes = prompt('Thêm ghi chú cho lần trả này (tùy chọn):');
    returnBookMutation.mutate({ id: borrowingId, notes: notes || '' });
  };

  // Handle fulfill reservation
  const handleFulfillReservation = (reservationId) => {
    const copy_id = prompt('Nhập ID bản sao để gán:');
    if (copy_id) {
      fulfillReservationMutation.mutate({ id: reservationId, copy_id });
    }
  };

  // Get today's schedule
  const todaySchedule = schedules.find(s => 
    new Date(s.shift_date).toDateString() === new Date().toDateString()
  );

  const tabs = [
    { id: 'overview', name: 'Tổng Quan', icon: BarChart3 },
    { id: 'borrowings', name: 'Quản Lý Mượn Trả', icon: BookOpen },
    { id: 'reservations', name: 'Quản Lý Đặt Trước', icon: Calendar },
    { id: 'schedules', name: 'Quản Lý Lịch Trực', icon: Clock },
    { id: 'books', name: 'Quản Lý Sách', icon: Book },
    { id: 'users', name: 'Quản Lý Người Dùng', icon: Users },
  ];

  // Handle user search
  const handleUserSearch = () => {
    alert('Tính năng tìm kiếm người dùng đang được phát triển');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Bảng Điều Khiển Nhân Viên</h1>
                  <p className="text-gray-600">Quản lý mượn trả và hoạt động thư viện</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  to="/staff/borrowing/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Tạo phiếu mượn
                </Link>
                <Link
                  to="/staff/books/search"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Tìm kiếm sách
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đang Mượn</p>
                <p className="text-2xl font-bold text-gray-900">{activeBorrowings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đã Sẵn Sàng</p>
                <p className="text-2xl font-bold text-gray-900">{readyReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Đặt Trước</p>
                <p className="text-2xl font-bold text-gray-900">{pendingReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Quá Hạn</p>
                <p className="text-2xl font-bold text-gray-900">{overdueBorrowings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab 
                todaySchedule={todaySchedule}
                borrowings={borrowings}
                reservations={reservations}
                borrowingsLoading={borrowingsLoading}
                reservationsLoading={reservationsLoading}
                handleReturnBook={handleReturnBook}
                handleFulfillReservation={handleFulfillReservation}
              />
            )}

            {activeTab === 'borrowings' && (
              <BorrowingsTab 
                borrowings={borrowings}
                isLoading={borrowingsLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                handleReturnBook={handleReturnBook}
                returnBookMutation={returnBookMutation}
              />
            )}

            {activeTab === 'reservations' && (
              <ReservationsTab 
                reservations={reservations}
                isLoading={reservationsLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                handleFulfillReservation={handleFulfillReservation}
                fulfillReservationMutation={fulfillReservationMutation}
              />
            )}

            {activeTab === 'schedules' && (
              <SchedulesTab 
                schedules={schedules}
                isLoading={schedulesLoading}
              />
            )}            {activeTab === 'books' && (
              <BooksTab 
                books={books}
                isLoading={booksLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                totalBooks={totalBooks}
                activeBorrowings={activeBorrowings}
                deleteBookMutation={deleteBookMutation}
                updateBookMutation={updateBookMutation}
              />
            )}

            {activeTab === 'users' && (
              <UsersTab
                users={users}
                isLoading={usersLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                totalUsers={totalUsers}
                deleteUserMutation={deleteUserMutation}
                updateUserMutation={updateUserMutation}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsTab />
            )}

            {!['overview', 'borrowings', 'reservations', 'books', 'schedules', 'users', 'reports'].includes(activeTab) && (
              <UnderDevelopmentTab 
                tabName={tabs.find(t => t.id === activeTab)?.name || 'Unknown'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;