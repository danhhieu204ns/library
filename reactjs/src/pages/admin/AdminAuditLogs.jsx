import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  Search, 
  Filter,
  Download,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminAuditLogs = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for demonstration
  const { data: logsData, isLoading } = useQuery({
    queryKey: ['audit-logs', currentPage, searchTerm, filterAction, filterUser, filterLevel, dateRange],
    queryFn: () => ({
      data: [
        {
          _id: '1',
          timestamp: '2024-12-05T10:30:00Z',
          user: {
            _id: 'user1',
            username: 'admin',
            full_name: 'System Administrator',
            role: 'Admin'
          },
          action: 'USER_CREATED',
          resource: 'User',
          resource_id: 'user123',
          details: {
            target_user: 'john.doe@example.com',
            assigned_role: 'DocGia'
          },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          level: 'INFO',
          status: 'SUCCESS'
        },
        {
          _id: '2',
          timestamp: '2024-12-05T10:25:00Z',
          user: {
            _id: 'user2',
            username: 'staff.member',
            full_name: 'Staff Member',
            role: 'CTV'
          },
          action: 'BOOK_BORROWED',
          resource: 'Borrowing',
          resource_id: 'borrow456',
          details: {
            book_title: 'The Great Gatsby',
            book_id: 'book123',
            borrower: 'jane.smith@example.com',
            due_date: '2024-12-19'
          },
          ip_address: '192.168.1.101',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          level: 'INFO',
          status: 'SUCCESS'
        },
        {
          _id: '3',
          timestamp: '2024-12-05T10:20:00Z',
          user: {
            _id: 'user3',
            username: 'john.doe',
            full_name: 'John Doe',
            role: 'DocGia'
          },
          action: 'LOGIN_FAILED',
          resource: 'Authentication',
          resource_id: null,
          details: {
            reason: 'Invalid password',
            attempts: 3
          },
          ip_address: '192.168.1.102',
          user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          level: 'WARNING',
          status: 'FAILED'
        },
        {
          _id: '4',
          timestamp: '2024-12-05T10:15:00Z',
          user: {
            _id: 'user1',
            username: 'admin',
            full_name: 'System Administrator',
            role: 'Admin'
          },
          action: 'SYSTEM_SETTINGS_UPDATED',
          resource: 'Settings',
          resource_id: 'settings1',
          details: {
            setting: 'borrowing_duration',
            old_value: '14 days',
            new_value: '21 days'
          },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          level: 'INFO',
          status: 'SUCCESS'
        },
        {
          _id: '5',
          timestamp: '2024-12-05T10:10:00Z',
          user: {
            _id: 'user4',
            username: 'jane.smith',
            full_name: 'Jane Smith',
            role: 'DocGia'
          },
          action: 'BOOK_RESERVED',
          resource: 'Reservation',
          resource_id: 'reserve789',
          details: {
            book_title: 'To Kill a Mockingbird',
            book_id: 'book456',
            queue_position: 1
          },
          ip_address: '192.168.1.103',
          user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
          level: 'INFO',
          status: 'SUCCESS'
        },
        {
          _id: '6',
          timestamp: '2024-12-05T10:05:00Z',
          user: {
            _id: 'user1',
            username: 'admin',
            full_name: 'System Administrator',
            role: 'Admin'
          },
          action: 'BOOK_DELETED',
          resource: 'Book',
          resource_id: 'book789',
          details: {
            book_title: 'Deprecated Manual',
            reason: 'Outdated content'
          },
          ip_address: '192.168.1.100',
          user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          level: 'WARNING',
          status: 'SUCCESS'
        }
      ],
      pagination: {
        current_page: 1,
        total_pages: 10,
        total_records: 100,
        per_page: 10
      }
    }),
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

  const logs = logsData?.data || [];
  const pagination = logsData?.pagination || {};

  const getLevelIcon = (level) => {
    switch (level) {
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'INFO':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'SUCCESS':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'INFO':
        return 'bg-blue-100 text-blue-800';
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action) => {
    if (action.includes('CREATED') || action.includes('SUCCESS')) {
      return 'bg-green-100 text-green-800';
    } else if (action.includes('DELETED') || action.includes('FAILED')) {
      return 'bg-red-100 text-red-800';
    } else if (action.includes('UPDATED') || action.includes('MODIFIED')) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActionName = (action) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleExport = () => {
    // Mock export functionality
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                  <p className="text-gray-600">Monitor system activities and user actions</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  to="/admin"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Dashboard
                </Link>
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="USER_CREATED">User Created</option>
              <option value="USER_UPDATED">User Updated</option>
              <option value="USER_DELETED">User Deleted</option>
              <option value="BOOK_BORROWED">Book Borrowed</option>
              <option value="BOOK_RETURNED">Book Returned</option>
              <option value="BOOK_RESERVED">Book Reserved</option>
              <option value="LOGIN_SUCCESS">Login Success</option>
              <option value="LOGIN_FAILED">Login Failed</option>
              <option value="SYSTEM_SETTINGS_UPDATED">Settings Updated</option>
            </select>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users</option>
              <option value="Admin">Admins</option>
              <option value="CTV">Staff</option>
              <option value="DocGia">Readers</option>
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
              <option value="SUCCESS">Success</option>
            </select>
            <div className="flex space-x-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Logs Table */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 h-4 w-4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-32 rounded"></div>
                    <div className="bg-gray-200 h-4 flex-1 rounded"></div>
                    <div className="bg-gray-200 h-4 w-24 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.user.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {log.user.username} ({log.user.role})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                          {formatActionName(log.action)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{log.resource}</div>
                          {log.resource_id && (
                            <div className="text-xs text-gray-500">
                              ID: {log.resource_id}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getLevelIcon(log.level)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}>
                            {log.level}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ip_address}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {log.details && (
                            <div className="text-sm text-gray-900">
                              {Object.entries(log.details).map(([key, value]) => (
                                <div key={key} className="mb-1">
                                  <span className="font-medium text-gray-600">
                                    {key.replace(/_/g, ' ')}:
                                  </span>{' '}
                                  <span className="text-gray-900">{value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                    disabled={currentPage === pagination.total_pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * 10, pagination.total_records)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{pagination.total_records}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {[...Array(Math.min(5, pagination.total_pages))].map((_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                        disabled={currentPage === pagination.total_pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogs;
