import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Calendar, 
  BookPlus, 
  Settings,
  Menu,
  X,
  UserCog
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboardLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if user is admin
  if (!user || user.role !== 'Admin') {
    // Redirect to appropriate dashboard based on role
    if (user?.role === 'CTV') {
      navigate('/staff', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
    return null;
  }

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: BarChart3, path: '/admin' },
    { id: 'users', name: 'Người dùng', icon: Users, path: '/admin/users' },
    { id: 'roles', name: 'Quản lý vai trò', icon: UserCog, path: '/admin/roles' },
    { id: 'borrowings', name: 'Mượn trả', icon: BookOpen, path: '/admin/borrowings' },
    { id: 'reservations', name: 'Đặt trước', icon: Calendar, path: '/admin/reservations' },
    { id: 'books', name: 'Quản lý sách', icon: BookPlus, path: '/admin/books' },
    { id: 'settings', name: 'Cài đặt', icon: Settings, path: '/admin/settings' },
  ];

  // Find active tab based on current path
  const activeTab = tabs.find(tab => location.pathname === tab.path)?.id || 'overview';

  const handleTabClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col md:flex-row">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex flex-col flex-grow bg-white pt-5 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="mt-5 flex-1 flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() => handleTabClick(tab.path)}
                    className={`${
                      activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } cursor-pointer group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <tab.icon
                      className={`${
                        activeTab === tab.id
                          ? 'text-indigo-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    {tab.name}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden bg-white p-4 flex items-center justify-between shadow">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            {isMobileMenuOpen ? (
              <X className="block h-6 w-6" />
            ) : (
              <Menu className="block h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white w-full">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => handleTabClick(tab.path)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } cursor-pointer group flex items-center px-3 py-2 text-base font-medium rounded-md`}
                >
                  <tab.icon
                    className={`${
                      activeTab === tab.id
                        ? 'text-indigo-600'
                        : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 flex-shrink-0 h-6 w-6`}
                  />
                  {tab.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
