import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Settings, 
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  BookPlus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, borrowingsAPI, reservationsAPI, booksAPI } from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Fetch overview data
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['users-all'],
    queryFn: () => usersAPI.getUsers({ limit: 10 }),
    enabled: user?.role === 'Admin'
  });

  const { data: borrowingsData, isLoading: borrowingsLoading } = useQuery({
    queryKey: ['borrowings-all'],
    queryFn: () => borrowingsAPI.getBorrowings({ limit: 10 }),
    enabled: user?.role === 'Admin'
  });

  const { data: reservationsData, isLoading: reservationsLoading } = useQuery({
    queryKey: ['reservations-all'],
    queryFn: () => reservationsAPI.getReservations({ limit: 10 }),
    enabled: user?.role === 'Admin'
  });

  const { data: booksData } = useQuery({
    queryKey: ['books-stats'],
    queryFn: () => booksAPI.getBooks({ limit: 1 }),
    enabled: user?.role === 'Admin'
  });

  // Check if user is admin
  if (!user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need administrator privileges to access this page
          </p>
        </div>
      </div>
    );
  }
  const users = usersData?.data?.data?.users || [];
  // console.log('Users:', users);
  const borrowings = borrowingsData?.data?.data?.borrowings || [];
  const reservations = reservationsData?.data?.data?.reservations || [];
  // console.log('Books:', booksData);
  const totalBooks = booksData?.data?.data?.pagination?.total || 0;

  // Calculate stats
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const activeBorrowings = borrowings.filter(b => b.status === 'Borrowed').length;
  const pendingReservations = reservations.filter(r => r.status === 'Pending').length;
  const overdueBorrowings = borrowings.filter(b => 
    b.status === 'Borrowed' && new Date(b.due_date) < new Date()
  ).length;
  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'borrowings', name: 'Borrowings', icon: BookOpen },
    { id: 'reservations', name: 'Reservations', icon: Calendar },
    { id: 'books', name: 'Books', icon: BookPlus },
    { id: 'management', name: 'Management', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-600">Manage your library system</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  to="/admin/users/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Link>
                <Link
                  to="/admin/books/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <BookPlus className="h-4 w-4 mr-2" />
                  Add Book
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
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Borrowings</p>
                <p className="text-2xl font-bold text-gray-900">{activeBorrowings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reservations</p>
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
                <p className="text-sm font-medium text-gray-600">Overdue Books</p>
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
                        ? 'border-blue-500 text-blue-600'
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
                  {/* Recent Borrowings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Borrowings</h3>
                    {borrowingsLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse border rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gray-200 h-10 w-10 rounded"></div>
                              <div className="flex-1">
                                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                                <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {borrowings.slice(0, 5).map((borrowing) => (
                          <div key={borrowing._id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded">
                                  <BookOpen className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {borrowing.copy?.book?.title || 'Unknown Book'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Borrowed by {borrowing.user?.full_name || borrowing.user?.username}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  Due: {new Date(borrowing.due_date).toLocaleDateString()}
                                </p>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  borrowing.status === 'Borrowed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {borrowing.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Reservations */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Reservations</h3>
                    {reservationsLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse border rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gray-200 h-10 w-10 rounded"></div>
                              <div className="flex-1">
                                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                                <div className="bg-gray-200 h-3 w-2/3 rounded"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {reservations.filter(r => r.status === 'Pending').slice(0, 5).map((reservation) => (
                          <div key={reservation._id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-orange-100 rounded">
                                  <Calendar className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {reservation.book?.title || 'Unknown Book'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Reserved by {reservation.user?.full_name || reservation.user?.username}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-500">
                                  Queue: #{reservation.queue_position}
                                </p>
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                  {reservation.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                      to="/admin/users"
                      className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <Users className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">User Management</p>
                        <p className="text-sm text-gray-500">Manage users and roles</p>
                      </div>
                    </Link>

                    <Link
                      to="/admin/reports"
                      className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Reports</p>
                        <p className="text-sm text-gray-500">View analytics and reports</p>
                      </div>
                    </Link>

                    <Link
                      to="/admin/settings"
                      className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <Settings className="h-8 w-8 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">System Settings</p>
                        <p className="text-sm text-gray-500">Configure library settings</p>
                      </div>
                    </Link>

                    <button
                      onClick={() => setActiveTab('management')}
                      className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    >
                      <Calendar className="h-8 w-8 text-orange-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">More Tools</p>
                        <p className="text-sm text-gray-500">Access all admin tools</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                  <Link
                    to="/admin/users/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </Link>
                </div>

                {usersLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse border rounded-lg p-4">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-200 h-12 w-12 rounded-full"></div>
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
                      {users.map((user) => (
                        <li key={user._id}>
                          <div className="px-4 py-4 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Users className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.full_name || user.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email} • {user.role}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                user.status === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.status}
                              </span>
                              <div className="flex space-x-2">
                                <Link
                                  to={`/admin/users/${user._id}`}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                                <Link
                                  to={`/admin/users/${user._id}/edit`}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Edit className="h-4 w-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}            {/* Borrowings Tab */}
            {activeTab === 'borrowings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Borrowing Management</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="">All Status</option>
                      <option value="Borrowed">Borrowed</option>
                      <option value="Returned">Returned</option>
                      <option value="Overdue">Overdue</option>
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
                      {borrowings.map((borrowing) => {
                        const isOverdue = borrowing.status === 'Borrowed' && new Date(borrowing.due_date) < new Date();
                        return (
                          <li key={borrowing._id}>
                            <div className="px-4 py-4">
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
                                      Borrowed by {borrowing.user?.full_name || borrowing.user?.username}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Due: {new Date(borrowing.due_date).toLocaleDateString()}
                                      {isOverdue && (
                                        <span className="ml-2 text-red-500 font-medium">
                                          (Overdue)
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    borrowing.status === 'Borrowed' 
                                      ? isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {isOverdue ? 'Overdue' : borrowing.status}
                                  </span>
                                  {borrowing.status === 'Borrowed' && (
                                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                      Process Return
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
            )}

            {/* Reservations Tab */}
            {activeTab === 'reservations' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Reservation Management</h3>
                  <div className="flex space-x-2">
                    <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Ready">Ready</option>
                      <option value="Fulfilled">Fulfilled</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>                {reservationsLoading ? (
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
                      {reservations.map((reservation) => {
                        const isExpired = reservation.status === 'Ready' && 
                          reservation.expires_at && 
                          new Date(reservation.expires_at) < new Date();
                        return (
                          <li key={reservation._id}>
                            <div className="px-4 py-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                      reservation.status === 'Ready' 
                                        ? 'bg-green-100' 
                                        : reservation.status === 'Pending'
                                        ? 'bg-yellow-100'
                                        : 'bg-gray-100'
                                    }`}>
                                      <Calendar className={`h-5 w-5 ${
                                        reservation.status === 'Ready' 
                                          ? 'text-green-600' 
                                          : reservation.status === 'Pending'
                                          ? 'text-yellow-600'
                                          : 'text-gray-600'
                                      }`} />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {reservation.book?.title || 'Unknown Book'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Reserved by {reservation.user?.full_name || reservation.user?.username}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Queue Position: {reservation.queue_position}
                                      {reservation.expires_at && (
                                        <span className="ml-2">
                                          • Expires: {new Date(reservation.expires_at).toLocaleDateString()}
                                          {isExpired && (
                                            <span className="ml-1 text-red-500 font-medium">
                                              (Expired)
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    reservation.status === 'Ready' 
                                      ? isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                      : reservation.status === 'Pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {isExpired ? 'Expired' : reservation.status}
                                  </span>
                                  {reservation.status === 'Ready' && !isExpired && (
                                    <button className="text-green-600 hover:text-green-900 text-sm font-medium">
                                      Mark as Picked Up
                                    </button>
                                  )}
                                  {reservation.status === 'Pending' && (
                                    <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                      Cancel
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
            )}
                  
            {/* Books Tab */}
            {activeTab === 'books' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Book Management</h3>
                  <div className="flex space-x-3">
                    <Link
                      to="/admin/books/import"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Import Books
                    </Link>
                    <Link
                      to="/admin/books/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <BookPlus className="h-4 w-4 mr-2" />
                      Add Book
                    </Link>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">{totalBooks}</div>
                      <div className="text-sm text-gray-500">Total Books</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{activeBorrowings}</div>
                      <div className="text-sm text-gray-500">Currently Borrowed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{totalBooks - activeBorrowings}</div>
                      <div className="text-sm text-gray-500">Available</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Link
                      to="/books"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      View All Books
                    </Link>
                  </div>
                </div>
              </div>            )}

            {/* Management Tab */}
            {activeTab === 'management' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">System Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link
                    to="/admin/users"
                    className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white group-hover:bg-blue-600 transition-colors">
                          <Users className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          User Management
                        </h4>
                        <p className="text-sm text-gray-500">
                          Manage users, roles, and permissions
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/admin/reports"
                    className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white group-hover:bg-green-600 transition-colors">
                          <BarChart3 className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                          Reports & Analytics
                        </h4>
                        <p className="text-sm text-gray-500">
                          View detailed reports and statistics
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/admin/settings"
                    className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white group-hover:bg-purple-600 transition-colors">
                          <Settings className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                          System Settings
                        </h4>
                        <p className="text-sm text-gray-500">
                          Configure library settings and policies
                        </p>
                      </div>
                    </div>
                  </Link>                  <Link
                    to="/admin/copies"
                    className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white group-hover:bg-orange-600 transition-colors">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                          Copy Management
                        </h4>
                        <p className="text-sm text-gray-500">
                          Manage book copies and inventory
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/admin/categories"
                    className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white group-hover:bg-indigo-600 transition-colors">
                          <Settings className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                          Category Management
                        </h4>
                        <p className="text-sm text-gray-500">
                          Manage categories, genres, and publishers
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/admin/schedule"
                    className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white group-hover:bg-yellow-600 transition-colors">
                          <Calendar className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900 group-hover:text-yellow-600 transition-colors">
                          Schedule Management
                        </h4>
                        <p className="text-sm text-gray-500">
                          Manage staff schedules and shifts
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/admin/audit"
                    className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white group-hover:bg-red-600 transition-colors">
                          <Eye className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                          Audit Logs
                        </h4>
                        <p className="text-sm text-gray-500">
                          View system activity and audit trails
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow opacity-50">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-400 text-white">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">
                          Event Management
                        </h4>
                        <p className="text-sm text-gray-500">
                          Manage library events (Coming Soon)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="group relative bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow opacity-50">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-400 text-white">
                          <Settings className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">
                          Advanced Settings
                        </h4>
                        <p className="text-sm text-gray-500">
                          Additional system configuration (Coming Soon)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs placeholder */}
            {!['overview', 'users', 'borrowings', 'reservations', 'books', 'management'].includes(activeTab) && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Settings className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {tabs.find(t => t.id === activeTab)?.name} Management
                </h3>
                <p className="text-gray-500">This section is under development.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
