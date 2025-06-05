import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Database,
  Mail,
  Clock,
  Shield,
  Book,
  Users,
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminSystemSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      libraryName: 'Yen Library',
      libraryDescription: 'A modern digital library management system',
      contactEmail: 'admin@yenlibrary.com',
      address: '123 Library Street, City, Country',
      phone: '+1 234 567 8900',
      website: 'https://yenlibrary.com',
      timezone: 'UTC+7',
      language: 'en',
    },
    borrowing: {
      defaultBorrowDuration: 14, // days
      maxBorrowsPerUser: 5,
      renewalDuration: 7, // days
      maxRenewals: 2,
      gracePeriod: 3, // days
      enableReservations: true,
      maxReservationsPerUser: 3,
      reservationHoldDuration: 3, // days
    },
    notifications: {
      enableEmailNotifications: true,
      enableSMSNotifications: false,
      dueDateReminderDays: 3,
      overdueReminderFrequency: 7, // days
      reservationReadyNotification: true,
      newBookNotifications: true,
      maintenanceNotifications: true,
    },
    security: {
      passwordMinLength: 8,
      requireSpecialCharacters: true,
      sessionTimeout: 30, // minutes
      maxLoginAttempts: 5,
      lockoutDuration: 15, // minutes
      enableTwoFactorAuth: false,
      enableAuditLog: true,
    },
    system: {
      backupFrequency: 'daily',
      backupRetention: 30, // days
      maintenanceMode: false,
      debugMode: false,
      cacheTimeout: 3600, // seconds
      maxFileUploadSize: 10, // MB
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings) => {
      // Simulate API call
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, data: newSettings };
    },
    onSuccess: () => {
      setMessage({ type: 'success', content: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', content: '' }), 3000);
    },
    onError: (error) => {
      setMessage({ type: 'error', content: 'Failed to save settings' });
      setTimeout(() => setMessage({ type: '', content: '' }), 3000);
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'borrowing', name: 'Borrowing Rules', icon: Book },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database },
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
                <Settings className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                  <p className="text-gray-600">Configure library system parameters</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveSettings}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Alert */}
        {message.content && (
          <div className={`mb-6 rounded-md p-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400" />
              )}
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tabs */}
        <div className="bg-white rounded-lg shadow">
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

          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Library Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Library Name
                      </label>
                      <input
                        type="text"
                        value={settings.general.libraryName}
                        onChange={(e) => handleInputChange('general', 'libraryName', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={settings.general.contactEmail}
                        onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={settings.general.libraryDescription}
                        onChange={(e) => handleInputChange('general', 'libraryDescription', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={settings.general.phone}
                        onChange={(e) => handleInputChange('general', 'phone', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={settings.general.website}
                        onChange={(e) => handleInputChange('general', 'website', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      <textarea
                        value={settings.general.address}
                        onChange={(e) => handleInputChange('general', 'address', e.target.value)}
                        rows={2}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Borrowing Rules */}
            {activeTab === 'borrowing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Borrowing Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Borrow Duration (days)
                      </label>
                      <input
                        type="number"
                        value={settings.borrowing.defaultBorrowDuration}
                        onChange={(e) => handleInputChange('borrowing', 'defaultBorrowDuration', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Borrows Per User
                      </label>
                      <input
                        type="number"
                        value={settings.borrowing.maxBorrowsPerUser}
                        onChange={(e) => handleInputChange('borrowing', 'maxBorrowsPerUser', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Renewal Duration (days)
                      </label>
                      <input
                        type="number"
                        value={settings.borrowing.renewalDuration}
                        onChange={(e) => handleInputChange('borrowing', 'renewalDuration', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Renewals
                      </label>
                      <input
                        type="number"
                        value={settings.borrowing.maxRenewals}
                        onChange={(e) => handleInputChange('borrowing', 'maxRenewals', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Reservations</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.borrowing.enableReservations}
                        onChange={(e) => handleInputChange('borrowing', 'enableReservations', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Enable book reservations
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Reservations Per User
                        </label>
                        <input
                          type="number"
                          value={settings.borrowing.maxReservationsPerUser}
                          onChange={(e) => handleInputChange('borrowing', 'maxReservationsPerUser', parseInt(e.target.value))}
                          disabled={!settings.borrowing.enableReservations}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hold Duration (days)
                        </label>
                        <input
                          type="number"
                          value={settings.borrowing.reservationHoldDuration}
                          onChange={(e) => handleInputChange('borrowing', 'reservationHoldDuration', parseInt(e.target.value))}
                          disabled={!settings.borrowing.enableReservations}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.enableEmailNotifications}
                        onChange={(e) => handleInputChange('notifications', 'enableEmailNotifications', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Email notifications
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.notifications.enableSMSNotifications}
                        onChange={(e) => handleInputChange('notifications', 'enableSMSNotifications', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        SMS notifications
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Due Date Reminder (days before)
                      </label>
                      <input
                        type="number"
                        value={settings.notifications.dueDateReminderDays}
                        onChange={(e) => handleInputChange('notifications', 'dueDateReminderDays', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overdue Reminder Frequency (days)
                      </label>
                      <input
                        type="number"
                        value={settings.notifications.overdueReminderFrequency}
                        onChange={(e) => handleInputChange('notifications', 'overdueReminderFrequency', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Password Policy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.sessionTimeout}
                        onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.security.requireSpecialCharacters}
                        onChange={(e) => handleInputChange('security', 'requireSpecialCharacters', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Require special characters in passwords
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lockout Duration (minutes)
                      </label>
                      <input
                        type="number"
                        value={settings.security.lockoutDuration}
                        onChange={(e) => handleInputChange('security', 'lockoutDuration', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Backup & Maintenance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={settings.system.backupFrequency}
                        onChange={(e) => handleInputChange('system', 'backupFrequency', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Retention (days)
                      </label>
                      <input
                        type="number"
                        value={settings.system.backupRetention}
                        onChange={(e) => handleInputChange('system', 'backupRetention', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.system.maintenanceMode}
                        onChange={(e) => handleInputChange('system', 'maintenanceMode', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Maintenance mode
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.system.debugMode}
                        onChange={(e) => handleInputChange('system', 'debugMode', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Debug mode
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Database className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Backup Now</span>
                    </button>
                    <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <RefreshCw className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Clear Cache</span>
                    </button>
                    <button className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <Download className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm font-medium">Export Logs</span>
                    </button>
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

export default AdminSystemSettings;
