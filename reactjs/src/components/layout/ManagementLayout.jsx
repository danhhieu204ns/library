import React, { useState } from 'react';
import { 
  Menu,
  X,
  BookOpen,
  Users,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Bell,
  Search,
  ChevronDown,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import PermissionGuard from '../common/PermissionGuard';

const ManagementLayout = ({ children, title, breadcrumb = [] }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { userRole } = usePermissions();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      permission: null // Available to all authenticated users
    },
    {
      name: 'Books',
      href: '/books',
      icon: BookOpen,
      permission: 'books:view'
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      permission: 'users:view'
    },
    {
      name: 'Borrowings',
      href: '/borrowings',
      icon: FileText,
      permission: 'borrowings:view'
    },
    {
      name: 'Schedules',
      href: '/schedules',
      icon: Calendar,
      permission: 'schedules:view'
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: BarChart3,
      permission: 'reports:view'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      permission: 'system:settings'
    }
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const NavItem = ({ item }) => (
    <PermissionGuard permission={item.permission}>
      <a
        href={item.href}
        className="text-gray-300 hover:bg-gray-700 hover:text-white group flex items-center px-2 py-2 text-sm font-medium rounded-md"
      >
        <item.icon
          className="text-gray-400 group-hover:text-gray-300 mr-3 flex-shrink-0 h-6 w-6"
          aria-hidden="true"
        />
        {item.name}
      </a>
    </PermissionGuard>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-white" />
            <span className="ml-2 text-white text-lg font-semibold">Yen Library</span>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </nav>

        {/* User info in sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900">
          <div className="flex items-center">
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={user?.avatar || '/default-avatar.png'}
              alt={user?.name}
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <button
                  className="lg:hidden text-gray-500 hover:text-gray-700"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                {/* Breadcrumb */}
                <nav className="hidden sm:flex ml-4" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-4">
                    <li>
                      <div>
                        <a href="/dashboard" className="text-gray-400 hover:text-gray-500">
                          <Home className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
                          <span className="sr-only">Home</span>
                        </a>
                      </div>
                    </li>
                    {breadcrumb.map((item, index) => (
                      <li key={item.name}>
                        <div className="flex items-center">
                          <svg
                            className="flex-shrink-0 h-5 w-5 text-gray-300"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                          </svg>
                          {index === breadcrumb.length - 1 ? (
                            <span className="ml-4 text-sm font-medium text-gray-500">
                              {item.name}
                            </span>
                          ) : (
                            <a
                              href={item.href}
                              className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                            >
                              {item.name}
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>

              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
                    />
                  </div>
                </div>

                {/* Notifications */}
                <button className="text-gray-400 hover:text-gray-500 relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User menu */}
                <div className="relative">
                  <button
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={user?.avatar || '/default-avatar.png'}
                      alt={user?.name}
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                    <span className="hidden md:block ml-2 text-gray-700">{user?.name}</span>
                    <ChevronDown className="hidden md:block ml-1 h-4 w-4 text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        Signed in as <span className="font-medium text-gray-900">{user?.role}</span>
                      </div>
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Profile
                      </a>
                      <a
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Settings
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page header */}
        {title && (
          <div className="bg-white shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* User menu overlay */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default ManagementLayout;
