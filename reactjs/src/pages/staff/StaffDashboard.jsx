import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  RotateCcw,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { borrowingsAPI, reservationsAPI, usersAPI, schedulesAPI } from '../../services/api';

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

  // Return book mutation
  const returnBookMutation = useMutation({
    mutationFn: ({ id, notes }) => borrowingsAPI.returnBook(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['borrowings-staff']);
      alert('Book returned successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to return book');
    }
  });

  // Fulfill reservation mutation
  const fulfillReservationMutation = useMutation({
    mutationFn: ({ id, copy_id }) => reservationsAPI.fulfillReservation(id, { copy_id }),
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations-staff']);
      alert('Reservation marked as ready for pickup!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to fulfill reservation');
    }
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: (scheduleData) => schedulesAPI.createSchedule(scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries(['schedules-staff']);
      alert('Schedule registered successfully!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to register schedule');
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

  // Calculate stats
  const activeBorrowings = borrowings.filter(b => b.status === 'Borrowed').length;
  const overdueBorrowings = borrowings.filter(b => 
    b.status === 'Borrowed' && new Date(b.due_date) < new Date()
  ).length;
  const pendingReservations = reservations.filter(r => r.status === 'Pending').length;
  const readyReservations = reservations.filter(r => r.status === 'Ready').length;

  const handleReturnBook = (borrowingId) => {
    const notes = prompt('Add any notes for this return (optional):');
    returnBookMutation.mutate({ id: borrowingId, notes: notes || '' });
  };

  const handleFulfillReservation = (reservationId) => {
    const copy_id = prompt('Enter Copy ID to assign (optional):');
    fulfillReservationMutation.mutate({ id: reservationId, copy_id });
  };
  const tabs = [
    { id: 'overview', name: 'Overview', icon: Calendar },
    { id: 'borrowings', name: 'Borrowings', icon: BookOpen },
    { id: 'reservations', name: 'Reservations', icon: Clock },
    { id: 'schedules', name: 'Schedules', icon: Calendar },
    { id: 'users', name: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
                <p className="text-gray-600">Manage borrowings, returns, and reservations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/staff/borrow" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition-colors">
            <BookOpen className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold">Cho Mượn Sách</h3>
            <p className="text-sm opacity-90">Thực hiện cho mượn</p>
          </Link>
          
          <Link to="/staff/return" className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 text-center transition-colors">
            <RotateCcw className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold">Trả Sách</h3>
            <p className="text-sm opacity-90">Xử lý trả sách</p>
          </Link>
          
          <Link to="/staff/user-search" className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 text-center transition-colors">
            <Search className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold">Tìm Người Dùng</h3>
            <p className="text-sm opacity-90">Tra cứu thông tin</p>
          </Link>
          
          <Link to="/staff/schedules" className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 text-center transition-colors">
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold">Lịch Trực</h3>
            <p className="text-sm opacity-90">Đăng ký ca trực</p>
          </Link>
          
          <Link to="/staff/borrowings" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 text-center transition-colors">
            <BookOpen className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold">Quản Lý Mượn</h3>
            <p className="text-sm opacity-90">Danh sách mượn sách</p>
          </Link>
          
          <Link to="/staff/reservations" className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg p-4 text-center transition-colors">
            <Clock className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold">Đặt Trước</h3>
            <p className="text-sm opacity-90">Quản lý đặt trước</p>
          </Link>
          
          <Link to="/staff/users" className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg p-4 text-center transition-colors">
            <Users className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold">Người Dùng</h3>
            <p className="text-sm opacity-90">Quản lý người dùng</p>
          </Link>
          
          <Link to="/staff/schedule-reports" className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg p-4 text-center transition-colors">
            <Calendar className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-semibold">Báo Cáo</h3>
            <p className="text-sm opacity-90">Báo cáo lịch trình</p>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Borrowings</p>
                <p className="text-2xl font-bold text-gray-900">{activeBorrowings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Books</p>
                <p className="text-2xl font-bold text-gray-900">{overdueBorrowings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reservations</p>
                <p className="text-2xl font-bold text-gray-900">{pendingReservations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ready for Pickup</p>
                <p className="text-2xl font-bold text-gray-900">{readyReservations}</p>
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
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Overdue Books */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                      Overdue Books
                    </h3>
                    <div className="space-y-3">
                      {borrowings
                        .filter(b => b.status === 'Borrowed' && new Date(b.due_date) < new Date())
                        .slice(0, 5)
                        .map((borrowing) => (
                          <div key={borrowing._id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {borrowing.copy?.book?.title || 'Unknown Book'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Borrowed by: {borrowing.user?.full_name || borrowing.user?.username}
                                </p>
                                <p className="text-sm text-red-600">
                                  Due: {new Date(borrowing.due_date).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => handleReturnBook(borrowing._id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                disabled={returnBookMutation.isLoading}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Return
                              </button>
                            </div>
                          </div>
                        ))}
                      {borrowings.filter(b => b.status === 'Borrowed' && new Date(b.due_date) < new Date()).length === 0 && (
                        <p className="text-gray-500 text-center py-4">No overdue books</p>
                      )}
                    </div>
                  </div>

                  {/* Ready Reservations */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Ready for Pickup
                    </h3>
                    <div className="space-y-3">
                      {reservations
                        .filter(r => r.status === 'Ready')
                        .slice(0, 5)
                        .map((reservation) => (
                          <div key={reservation._id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {reservation.book?.title || 'Unknown Book'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Reserved by: {reservation.user?.full_name || reservation.user?.username}
                                </p>
                                <p className="text-sm text-green-600">
                                  Expires: {new Date(reservation.expiry_date).toLocaleDateString()}
                                </p>
                              </div>
                              <Link
                                to={`/staff/reservations/${reservation._id}`}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </div>
                          </div>
                        ))}
                      {reservations.filter(r => r.status === 'Ready').length === 0 && (
                        <p className="text-gray-500 text-center py-4">No reservations ready for pickup</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      to="/staff/borrow"
                      className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Borrow Book</p>
                        <p className="text-sm text-gray-500">Process new borrowing</p>
                      </div>
                    </Link>

                    <Link
                      to="/staff/return"
                      className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <RotateCcw className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Return Book</p>
                        <p className="text-sm text-gray-500">Process book return</p>
                      </div>
                    </Link>

                    <Link
                      to="/staff/search-user"
                      className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <Search className="h-8 w-8 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Search User</p>
                        <p className="text-sm text-gray-500">Find user information</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Borrowings Tab */}
            {activeTab === 'borrowings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Active Borrowings</h3>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search borrowings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Status</option>
                      <option value="Borrowed">Borrowed</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>
                </div>

                {borrowingsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-200 h-12 w-12 rounded"></div>
                          <div className="flex-1">
                            <div className="bg-gray-200 h-4 rounded mb-2"></div>
                            <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {borrowings
                        .filter(borrowing => {
                          const matchesSearch = searchTerm === '' || 
                            borrowing.copy?.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            borrowing.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            borrowing.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
                          
                          const matchesStatus = filterStatus === 'all' || 
                            borrowing.status === filterStatus ||
                            (filterStatus === 'Overdue' && borrowing.status === 'Borrowed' && new Date(borrowing.due_date) < new Date());
                          
                          return matchesSearch && matchesStatus;
                        })
                        .map((borrowing) => {
                          const isOverdue = borrowing.status === 'Borrowed' && new Date(borrowing.due_date) < new Date();
                          return (
                            <li key={borrowing._id}>
                              <div className={`px-4 py-4 ${isOverdue ? 'bg-red-50' : ''}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                        isOverdue ? 'bg-red-100' : 'bg-blue-100'
                                      }`}>
                                        <BookOpen className={`h-5 w-5 ${
                                          isOverdue ? 'text-red-600' : 'text-blue-600'
                                        }`} />
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {borrowing.copy?.book?.title || 'Unknown Book'}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Borrowed by: {borrowing.user?.full_name || borrowing.user?.username}
                                      </div>
                                      <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                                        Due: {new Date(borrowing.due_date).toLocaleDateString()}
                                        {isOverdue && ' (OVERDUE)'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      borrowing.status === 'Borrowed' 
                                        ? isOverdue 
                                          ? 'bg-red-100 text-red-800' 
                                          : 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {isOverdue ? 'Overdue' : borrowing.status}
                                    </span>
                                    {borrowing.status === 'Borrowed' && (
                                      <button
                                        onClick={() => handleReturnBook(borrowing._id)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                        disabled={returnBookMutation.isLoading}
                                      >
                                        <RotateCcw className="h-4 w-4 mr-1" />
                                        Return
                                      </button>
                                    )}
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
            )}            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Reservation Management</h3>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search reservations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Ready">Ready</option>
                      <option value="Fulfilled">Fulfilled</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {reservationsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-200 h-12 w-12 rounded"></div>
                          <div className="flex-1">
                            <div className="bg-gray-200 h-4 rounded mb-2"></div>
                            <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {reservations
                        .filter(reservation => {
                          const matchesSearch = searchTerm === '' || 
                            reservation.book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reservation.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reservation.user?.username?.toLowerCase().includes(searchTerm.toLowerCase());
                          
                          const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
                          
                          return matchesSearch && matchesStatus;
                        })
                        .map((reservation) => {
                          const isExpiringSoon = reservation.status === 'Ready' && 
                            new Date(reservation.expiry_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000);
                          
                          return (
                            <li key={reservation._id}>
                              <div className={`px-4 py-4 ${isExpiringSoon ? 'bg-orange-50' : ''}`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                        reservation.status === 'Pending' ? 'bg-yellow-100' :
                                        reservation.status === 'Ready' ? 'bg-green-100' :
                                        reservation.status === 'Fulfilled' ? 'bg-blue-100' : 'bg-gray-100'
                                      }`}>
                                        <Clock className={`h-5 w-5 ${
                                          reservation.status === 'Pending' ? 'text-yellow-600' :
                                          reservation.status === 'Ready' ? 'text-green-600' :
                                          reservation.status === 'Fulfilled' ? 'text-blue-600' : 'text-gray-600'
                                        }`} />
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {reservation.book?.title || 'Unknown Book'}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Reserved by: {reservation.user?.full_name || reservation.user?.username}
                                      </div>
                                      <div className={`text-sm ${isExpiringSoon ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                                        {reservation.status === 'Ready' ? 'Expires' : 'Reserved'}: {new Date(reservation.expiry_date).toLocaleDateString()}
                                        {isExpiringSoon && ' (Expiring Soon)'}
                                      </div>
                                      {reservation.queue_position && (
                                        <div className="text-sm text-blue-600">
                                          Queue position: #{reservation.queue_position}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      reservation.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                      reservation.status === 'Ready' ? 'bg-green-100 text-green-800' :
                                      reservation.status === 'Fulfilled' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {reservation.status}
                                    </span>
                                    {reservation.status === 'Pending' && (
                                      <button
                                        onClick={() => handleFulfillReservation(reservation._id)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                        disabled={fulfillReservationMutation.isLoading}
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Mark Ready
                                      </button>
                                    )}
                                    <Link
                                      to={`/staff/reservations/${reservation._id}`}
                                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
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
            )}

            {/* Schedules Tab */}
            {activeTab === 'schedules' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Schedule Management</h3>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search schedules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>

                {schedulesLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-200 h-12 w-12 rounded"></div>
                          <div className="flex-1">
                            <div className="bg-gray-200 h-4 rounded mb-2"></div>
                            <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {schedulesData?.data && schedulesData.data.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {schedulesData.data
                          .filter(schedule => {
                            const matchesSearch = searchTerm === '' || 
                              schedule.shift_type?.shift_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              new Date(schedule.shift_date).toLocaleDateString().includes(searchTerm);
                            const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
                            return matchesSearch && matchesStatus;
                          })
                          .map((schedule) => {
                            const shiftDate = new Date(schedule.shift_date);
                            const isToday = shiftDate.toDateString() === new Date().toDateString();
                            const isPast = shiftDate < new Date() && !isToday;
                            const isUpcoming = shiftDate > new Date();

                            return (
                              <li key={schedule._id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                      <div className={`p-2 rounded-lg ${
                                        schedule.status === 'Pending' ? 'bg-yellow-100' :
                                        schedule.status === 'Approved' ? 'bg-green-100' :
                                        schedule.status === 'Rejected' ? 'bg-red-100' :
                                        schedule.status === 'Completed' ? 'bg-blue-100' : 'bg-gray-100'
                                      }`}>
                                        <Calendar className={`h-5 w-5 ${
                                          schedule.status === 'Pending' ? 'text-yellow-600' :
                                          schedule.status === 'Approved' ? 'text-green-600' :
                                          schedule.status === 'Rejected' ? 'text-red-600' :
                                          schedule.status === 'Completed' ? 'text-blue-600' : 'text-gray-600'
                                        }`} />
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {schedule.shift_type?.shift_name || 'Unknown Shift'}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {shiftDate.toLocaleDateString('en-US', { 
                                          weekday: 'long', 
                                          year: 'numeric', 
                                          month: 'long', 
                                          day: 'numeric' 
                                        })}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {schedule.shift_type?.start_time} - {schedule.shift_type?.end_time}
                                        {isToday && <span className="ml-2 text-blue-600 font-medium">(Today)</span>}
                                        {isPast && <span className="ml-2 text-gray-500">(Past)</span>}
                                        {isUpcoming && <span className="ml-2 text-green-600">(Upcoming)</span>}
                                      </div>
                                      {schedule.notes && (
                                        <div className="text-sm text-gray-500 mt-1">
                                          Notes: {schedule.notes}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      schedule.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                      schedule.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                      schedule.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                      schedule.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {schedule.status}
                                    </span>
                                    <div className="flex space-x-2">
                                      {schedule.status === 'Approved' && isToday && (
                                        <button
                                          onClick={() => {
                                            // TODO: Implement check-in/check-out functionality
                                            alert('Check-in/Check-out feature coming soon!');
                                          }}
                                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                          <Clock className="h-4 w-4 mr-1" />
                                          {schedule.check_in_time ? 'Check Out' : 'Check In'}
                                        </button>
                                      )}
                                      {schedule.status === 'Pending' && isUpcoming && (
                                        <button
                                          onClick={() => {
                                            // TODO: Implement cancel schedule functionality
                                            if (confirm('Are you sure you want to cancel this schedule request?')) {
                                              alert('Cancel functionality coming soon!');
                                            }
                                          }}
                                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                          <XCircle className="h-4 w-4 mr-1" />
                                          Cancel
                                        </button>
                                      )}
                                      <Link
                                        to={`/staff/schedules/${schedule._id}`}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                      >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                      </ul>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <Calendar className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Schedules Found</h3>
                        <p className="text-gray-500 mb-4">
                          {filterStatus !== 'all' || searchTerm 
                            ? 'No schedules match your current filters.' 
                            : 'You don\'t have any schedules yet.'}
                        </p>
                        <button
                          onClick={() => {
                            // TODO: Implement schedule registration
                            alert('Schedule registration coming soon!');
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Register for Schedule
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Actions for Schedules */}
                <div className="mt-6 bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => {
                        // TODO: Implement schedule registration
                        alert('Schedule registration feature coming soon!');
                      }}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Register New Schedule
                    </button>
                    <Link
                      to="/staff/schedule-calendar"
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Calendar
                    </Link>
                    <Link
                      to="/staff/schedule-reports"
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule Reports
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="overdue">Has Overdue</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Users className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                    <p className="text-gray-500 mb-4">Search and manage library users</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                      <Link
                        to="/staff/user-search"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Search Users
                      </Link>
                      <Link
                        to="/staff/user-reports"
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        User Reports
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
