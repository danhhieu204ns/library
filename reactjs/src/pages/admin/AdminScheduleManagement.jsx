import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminScheduleManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedules');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Mock data for staff schedules
  const mockSchedules = [
    {
      id: 1,
      staffId: 'STF001',
      staffName: 'Alice Johnson',
      email: 'alice.johnson@yenlibrary.com',
      role: 'Librarian',
      week: '2024-01-15',
      shifts: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', status: 'confirmed' },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', status: 'confirmed' },
        { day: 'Wednesday', startTime: '13:00', endTime: '21:00', status: 'confirmed' },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', status: 'pending' },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', status: 'confirmed' }
      ],
      totalHours: 40,
      status: 'active'
    },
    {
      id: 2,
      staffId: 'STF002',
      staffName: 'Bob Smith',
      email: 'bob.smith@yenlibrary.com',
      role: 'Assistant',
      week: '2024-01-15',
      shifts: [
        { day: 'Monday', startTime: '13:00', endTime: '21:00', status: 'confirmed' },
        { day: 'Tuesday', startTime: '13:00', endTime: '21:00', status: 'confirmed' },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', status: 'requested' },
        { day: 'Saturday', startTime: '10:00', endTime: '18:00', status: 'confirmed' },
        { day: 'Sunday', startTime: '12:00', endTime: '18:00', status: 'confirmed' }
      ],
      totalHours: 38,
      status: 'active'
    },
    {
      id: 3,
      staffId: 'STF003',
      staffName: 'Carol Davis',
      email: 'carol.davis@yenlibrary.com',
      role: 'Security',
      week: '2024-01-15',
      shifts: [
        { day: 'Friday', startTime: '18:00', endTime: '06:00', status: 'confirmed' },
        { day: 'Saturday', startTime: '18:00', endTime: '06:00', status: 'confirmed' },
        { day: 'Sunday', startTime: '18:00', endTime: '06:00', status: 'confirmed' }
      ],
      totalHours: 36,
      status: 'active'
    }
  ];

  // Mock data for shift templates
  const mockShiftTemplates = [
    {
      id: 1,
      name: 'Morning Shift',
      startTime: '09:00',
      endTime: '17:00',
      duration: 8,
      roles: ['Librarian', 'Assistant'],
      description: 'Standard morning shift for weekdays'
    },
    {
      id: 2,
      name: 'Evening Shift',
      startTime: '13:00',
      endTime: '21:00',
      duration: 8,
      roles: ['Librarian', 'Assistant'],
      description: 'Evening shift covering afternoon and night hours'
    },
    {
      id: 3,
      name: 'Night Security',
      startTime: '18:00',
      endTime: '06:00',
      duration: 12,
      roles: ['Security'],
      description: 'Overnight security shift'
    },
    {
      id: 4,
      name: 'Weekend Day',
      startTime: '10:00',
      endTime: '18:00',
      duration: 8,
      roles: ['Librarian', 'Assistant'],
      description: 'Weekend day shift'
    }
  ];

  // Helper function to get current week
  function getCurrentWeek() {
    const today = new Date();
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return monday.toISOString().split('T')[0];
  }

  // Format week display
  const formatWeekDisplay = (weekStart) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      requested: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return `px-2 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.pending}`;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'requested':
        return <AlertTriangle className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  // Filter schedules
  const filteredSchedules = mockSchedules.filter(schedule => {
    const matchesSearch = schedule.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    const matchesWeek = schedule.week === selectedWeek;
    
    return matchesSearch && matchesStatus && matchesWeek;
  });

  if (!user || user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
              <p className="mt-2 text-gray-600">Manage staff schedules and shift assignments</p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'schedules', label: 'Weekly Schedules', icon: Calendar },
              { id: 'templates', label: 'Shift Templates', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {activeTab === 'schedules' && (
          <>
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Staff
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, email, or role..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Week
                  </label>
                  <input
                    type="date"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-end">
                  <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Week Display */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex items-center justify-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Week of {formatWeekDisplay(selectedWeek)}
                </h2>
              </div>
            </div>

            {/* Schedules Grid */}
            <div className="space-y-6">
              {filteredSchedules.map((schedule) => (
                <div key={schedule.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 p-2 rounded-full mr-4">
                          <Users className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{schedule.staffName}</h3>
                          <p className="text-sm text-gray-600">{schedule.role} • {schedule.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">
                          {schedule.totalHours} hours/week
                        </span>
                        <span className={getStatusBadge(schedule.status)}>
                          {schedule.status}
                        </span>
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Shifts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                        const shift = schedule.shifts.find(s => s.day === day);
                        return (
                          <div key={day} className="border rounded-lg p-3">
                            <div className="text-sm font-medium text-gray-900 mb-2">{day}</div>
                            {shift ? (
                              <div className="space-y-2">
                                <div className="text-sm text-gray-600">
                                  {shift.startTime} - {shift.endTime}
                                </div>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(shift.status)}
                                  <span className="text-xs text-gray-500 capitalize">{shift.status}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400">No shift</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'templates' && (
          <>
            {/* Shift Templates */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Shift Templates</h2>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Template
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockShiftTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {template.startTime} - {template.endTime} ({template.duration}h)
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {template.roles.join(', ')}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* No results */}
        {activeTab === 'schedules' && filteredSchedules.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters.'
                : 'No schedules have been created for this week yet.'
              }
            </p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminScheduleManagement;
