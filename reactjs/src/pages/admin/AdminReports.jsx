import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen,
  Calendar,
  Download,
  FileText,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, borrowingsAPI, reservationsAPI, booksAPI } from '../../services/api';

const AdminReports = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('7d');
  const [reportType, setReportType] = useState('overview');

  // Fetch analytics data
  const { data: usersData } = useQuery({
    queryKey: ['users-analytics', dateRange],
    queryFn: () => usersAPI.getUsers({ limit: 1000 }),
    enabled: user?.role === 'Admin'
  });

  const { data: borrowingsData } = useQuery({
    queryKey: ['borrowings-analytics', dateRange],
    queryFn: () => borrowingsAPI.getBorrowings({ limit: 1000 }),
    enabled: user?.role === 'Admin'
  });

  const { data: reservationsData } = useQuery({
    queryKey: ['reservations-analytics', dateRange],
    queryFn: () => reservationsAPI.getReservations({ limit: 1000 }),
    enabled: user?.role === 'Admin'
  });

  const { data: booksData } = useQuery({
    queryKey: ['books-analytics'],
    queryFn: () => booksAPI.getBooks({ limit: 1000 }),
    enabled: user?.role === 'Admin'
  });

  // Calculate statistics
  const users = usersData?.data?.data?.users || [];
  const borrowings = borrowingsData?.data?.data?.borrowings || [];
  const reservations = reservationsData?.data?.data?.reservations || [];
  const books = booksData?.data?.data?.books || [];
  console.log('Books:', booksData);

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    totalBooks: books.length,
    totalBorrowings: borrowings.length,
    activeBorrowings: borrowings.filter(b => b.status === 'Borrowed').length,
    overdueBorrowings: borrowings.filter(b => 
      b.status === 'Borrowed' && new Date(b.due_date) < new Date()
    ).length,
    totalReservations: reservations.length,
    pendingReservations: reservations.filter(r => r.status === 'Pending').length,
    readyReservations: reservations.filter(r => r.status === 'Ready').length,
  };

  // Popular books
  const borrowingsByBook = borrowings.reduce((acc, borrowing) => {
    const bookId = borrowing.copy?.book?._id || borrowing.book?._id;
    const bookTitle = borrowing.copy?.book?.title || borrowing.book?.title || 'Unknown';
    if (bookId) {
      acc[bookId] = {
        title: bookTitle,
        count: (acc[bookId]?.count || 0) + 1
      };
    }
    return acc;
  }, {});

  const popularBooks = Object.values(borrowingsByBook)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // User activity
  const userActivity = users.map(user => ({
    name: user.full_name || user.username,
    borrowings: borrowings.filter(b => b.user?._id === user._id).length,
    reservations: reservations.filter(r => r.user?._id === user._id).length
  })).sort((a, b) => (b.borrowings + b.reservations) - (a.borrowings + a.reservations)).slice(0, 10);

  // Monthly trends (mock data for demonstration)
  const monthlyData = [
    { month: 'Jan', borrowings: 45, reservations: 12, newUsers: 8 },
    { month: 'Feb', borrowings: 52, reservations: 18, newUsers: 12 },
    { month: 'Mar', borrowings: 38, reservations: 9, newUsers: 5 },
    { month: 'Apr', borrowings: 63, reservations: 22, newUsers: 15 },
    { month: 'May', borrowings: 71, reservations: 25, newUsers: 18 },
    { month: 'Jun', borrowings: 68, reservations: 19, newUsers: 11 },
  ];

  const reportTabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'books', name: 'Books', icon: BookOpen },
    { id: 'borrowings', name: 'Borrowings', icon: Calendar },
    { id: 'trends', name: 'Trends', icon: TrendingUp },
  ];

  if (!user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You need administrator privileges to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                  <p className="text-gray-600">Comprehensive library performance insights</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                  <option value="1y">Last year</option>
                </select>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-sm text-green-600">
                  {stats.activeUsers} active users
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
                <p className="text-sm text-blue-600">
                  {stats.activeBorrowings} currently borrowed
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Borrowings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBorrowings}</p>
                <p className="text-sm text-red-600">
                  {stats.overdueBorrowings} overdue
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reservations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReservations}</p>
                <p className="text-sm text-green-600">
                  {stats.readyReservations} ready for pickup
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {reportTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setReportType(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      reportType === tab.id
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

          <div className="p-6">
            {/* Overview Tab */}
            {reportType === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Library Status */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Library Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <span className="text-sm font-medium">Available Books</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {stats.totalBooks - stats.activeBorrowings}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium">Borrowed Books</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{stats.activeBorrowings}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                        <span className="text-sm font-medium">Overdue Books</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{stats.overdueBorrowings}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-orange-500 mr-2" />
                        <span className="text-sm font-medium">Pending Reservations</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{stats.pendingReservations}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Reports</h3>
                  <div className="space-y-3">
                    <Link
                      to="/admin/reports/overdue"
                      className="flex items-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                      <div>
                        <p className="font-medium text-red-900">Overdue Books Report</p>
                        <p className="text-sm text-red-600">{stats.overdueBorrowings} items need attention</p>
                      </div>
                    </Link>
                    <Link
                      to="/admin/reports/popular"
                      className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-900">Popular Books Report</p>
                        <p className="text-sm text-green-600">See what's trending</p>
                      </div>
                    </Link>
                    <Link
                      to="/admin/reports/users"
                      className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Users className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-blue-900">User Activity Report</p>
                        <p className="text-sm text-blue-600">Track user engagement</p>
                      </div>
                    </Link>
                    <Link
                      to="/admin/reports/inventory"
                      className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <FileText className="h-6 w-6 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium text-purple-900">Inventory Report</p>
                        <p className="text-sm text-purple-600">Complete book inventory</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Popular Books */}
            {reportType === 'books' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Most Popular Books</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-4">
                    {popularBooks.map((book, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{book.title}</p>
                            <p className="text-sm text-gray-500">{book.count} borrowings</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(book.count / popularBooks[0].count) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{book.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* User Activity */}
            {reportType === 'users' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Most Active Users</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-4">
                    {userActivity.map((user, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-green-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-sm text-gray-500">
                              {user.borrowings} borrowings • {user.reservations} reservations
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {user.borrowings + user.reservations} total
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Monthly Trends */}
            {reportType === 'trends' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {monthlyData.map((month, index) => (
                      <div key={index} className="bg-white rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">{month.month}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Borrowings:</span>
                            <span className="text-sm font-medium">{month.borrowings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Reservations:</span>
                            <span className="text-sm font-medium">{month.reservations}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">New Users:</span>
                            <span className="text-sm font-medium">{month.newUsers}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other tabs placeholder */}
            {!['overview', 'books', 'users', 'trends'].includes(reportType) && (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  {reportTabs.find(t => t.id === reportType)?.name} Report
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  This report section is under development.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
