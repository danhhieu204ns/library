import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Barcode,
  Package
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { booksAPI } from '../../services/api';

const AdminCopyManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCopies, setSelectedCopies] = useState([]);
  const queryClient = useQueryClient();

  // Mock data for demonstration - replace with actual API calls
  const { data: copiesData, isLoading } = useQuery({
    queryKey: ['book-copies', currentPage, searchTerm, filterStatus, filterLocation],
    queryFn: () => ({
      data: [
        {
          _id: '1',
          copy_id: 'BK001-001',
          book: {
            _id: 'book1',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            isbn: '9780743273565'
          },
          status: 'Available',
          condition: 'Good',
          location: 'A-1-001',
          acquisition_date: '2024-01-15',
          last_borrowed: '2024-10-20',
          notes: 'Regular copy'
        },
        {
          _id: '2',
          copy_id: 'BK001-002',
          book: {
            _id: 'book1',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            isbn: '9780743273565'
          },
          status: 'Borrowed',
          condition: 'Fair',
          location: 'A-1-001',
          acquisition_date: '2024-01-15',
          last_borrowed: '2024-11-01',
          current_borrower: 'John Doe',
          due_date: '2024-12-01',
          notes: 'Cover slightly worn'
        },
        {
          _id: '3',
          copy_id: 'BK002-001',
          book: {
            _id: 'book2',
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            isbn: '9780061120084'
          },
          status: 'Maintenance',
          condition: 'Poor',
          location: 'REPAIR',
          acquisition_date: '2023-06-10',
          last_borrowed: '2024-10-15',
          notes: 'Pages loose, needs rebinding'
        }
      ],
      pagination: {
        current_page: 1,
        total_pages: 5,
        total_records: 50,
        per_page: 10
      }
    }),
    enabled: user?.role === 'Admin'
  });

  // Mock mutations
  const updateCopyMutation = useMutation({
    mutationFn: ({ id, copyData }) => Promise.resolve({ success: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['book-copies']);
      alert('Copy updated successfully!');
    },
    onError: (error) => {
      alert('Failed to update copy');
    }
  });

  const deleteCopyMutation = useMutation({
    mutationFn: (id) => Promise.resolve({ success: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['book-copies']);
      alert('Copy deleted successfully!');
    },
    onError: (error) => {
      alert('Failed to delete copy');
    }
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

  const handleCopySelection = (copyId) => {
    setSelectedCopies(prev => 
      prev.includes(copyId) 
        ? prev.filter(id => id !== copyId)
        : [...prev, copyId]
    );
  };

  const handleBulkAction = (action) => {
    if (selectedCopies.length === 0) {
      alert('Please select copies to perform bulk actions.');
      return;
    }

    if (window.confirm(`Are you sure you want to ${action} ${selectedCopies.length} copy(ies)?`)) {
      selectedCopies.forEach(copyId => {
        if (action === 'delete') {
          deleteCopyMutation.mutate(copyId);
        } else if (action === 'maintenance') {
          updateCopyMutation.mutate({ id: copyId, copyData: { status: 'Maintenance' } });
        } else if (action === 'available') {
          updateCopyMutation.mutate({ id: copyId, copyData: { status: 'Available' } });
        }
      });
      setSelectedCopies([]);
    }
  };

  const handleStatusChange = (copyId, newStatus) => {
    updateCopyMutation.mutate({ id: copyId, copyData: { status: newStatus } });
  };

  const handleDelete = (copyId) => {
    if (window.confirm('Are you sure you want to delete this copy?')) {
      deleteCopyMutation.mutate(copyId);
    }
  };

  const copies = copiesData?.data || [];
  const pagination = copiesData?.pagination || {};

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Borrowed':
        return 'bg-blue-100 text-blue-800';
      case 'Reserved':
        return 'bg-yellow-100 text-yellow-800';
      case 'Maintenance':
        return 'bg-red-100 text-red-800';
      case 'Lost':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'Excellent':
        return 'text-green-600';
      case 'Good':
        return 'text-blue-600';
      case 'Fair':
        return 'text-yellow-600';
      case 'Poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Copy Management</h1>
                  <p className="text-gray-600">Manage book copies and inventory</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link
                  to="/admin"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Dashboard
                </Link>
                <Link
                  to="/admin/books/new-copy"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Copy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by book title, copy ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Borrowed">Borrowed</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Lost">Lost</option>
            </select>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="A-1">Section A-1</option>
              <option value="A-2">Section A-2</option>
              <option value="B-1">Section B-1</option>
              <option value="REPAIR">Repair Area</option>
              <option value="STORAGE">Storage</option>
            </select>
            <div className="flex space-x-2">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCopies.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedCopies.length} copy(ies) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('available')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Available
                </button>
                <button
                  onClick={() => handleBulkAction('maintenance')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Mark Maintenance
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Copies Table */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-200 h-4 w-4 rounded"></div>
                    <div className="bg-gray-200 h-6 w-20 rounded"></div>
                    <div className="bg-gray-200 h-4 flex-1 rounded"></div>
                    <div className="bg-gray-200 h-4 w-24 rounded"></div>
                    <div className="bg-gray-200 h-4 w-16 rounded"></div>
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
                      <input
                        type="checkbox"
                        checked={selectedCopies.length === copies.length && copies.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCopies(copies.map(copy => copy._id));
                          } else {
                            setSelectedCopies([]);
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Copy Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Condition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {copies.map((copy) => (
                    <tr key={copy._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCopies.includes(copy._id)}
                          onChange={() => handleCopySelection(copy._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Barcode className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {copy.copy_id}
                            </div>
                            <div className="text-sm text-gray-500">
                              Added: {new Date(copy.acquisition_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {copy.book.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            by {copy.book.author}
                          </div>
                          <div className="text-xs text-gray-400">
                            ISBN: {copy.book.isbn}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(copy.status)}`}>
                          {copy.status}
                        </span>
                        {copy.status === 'Borrowed' && copy.current_borrower && (
                          <div className="text-xs text-gray-500 mt-1">
                            {copy.current_borrower}
                            <br />
                            Due: {new Date(copy.due_date).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          {copy.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getConditionColor(copy.condition)}`}>
                          {copy.condition}
                        </span>
                        {copy.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {copy.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <select
                            value={copy.status}
                            onChange={(e) => handleStatusChange(copy._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Available">Available</option>
                            <option value="Borrowed">Borrowed</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Lost">Lost</option>
                          </select>
                          <Link
                            to={`/admin/copies/${copy._id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/copies/${copy._id}/edit`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(copy._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

export default AdminCopyManagement;
