import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  User, 
  LogOut, 
  Home, 
  Search,
  Calendar,
  Settings,
  Menu,
  X
} from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-gray-800">
            <BookOpen className="h-8 w-8 text-yellow-400" style={{ color: "var(--primary-color)" }} />
            <span>Không gian đọc Yên</span>
          </Link>          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 hover:underline decoration-yellow-400 decoration-2 underline-offset-4 transition-colors" style={{ textDecorationColor: "var(--primary-color)" }}>
              <Home className="h-4 w-4" />
              <span>Trang chủ</span>
            </Link>
            <Link to="/books" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 hover:underline decoration-yellow-400 decoration-2 underline-offset-4 transition-colors" style={{ textDecorationColor: "var(--primary-color)" }}>
              <Search className="h-4 w-4" />
              <span>Tìm sách</span>
            </Link>
            {isAuthenticated && (
              <>                
                {user?.role === 'DocGia' && (<Link to="/dashboard" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 hover:underline decoration-yellow-400 decoration-2 underline-offset-4 transition-colors" style={{ textDecorationColor: "var(--primary-color)" }}>
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>)}
                {user?.role === 'CTV' && (
                  <Link to="/staff" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 hover:underline decoration-yellow-400 decoration-2 underline-offset-4 transition-colors" style={{ textDecorationColor: "var(--primary-color)" }}>
                    <Calendar className="h-4 w-4" />
                    <span>Nhân viên</span>
                  </Link>
                )}
                {user?.role === 'Admin' && (
                  <Link to="/admin" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 hover:underline decoration-yellow-400 decoration-2 underline-offset-4 transition-colors" style={{ textDecorationColor: "var(--primary-color)" }}>
                    <Settings className="h-4 w-4" />
                    <span>Quản trị</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">                
              <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
                  <User className="h-4 w-4" />
                  <span>{user?.full_name || user?.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-gray-900 transition-colors">
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                  style={{ backgroundColor: "var(--primary-color)", color: "var(--text-on-primary)" }}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>          
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className="flex items-center space-x-2 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Trang chủ</span>
              </Link>
              <Link 
                to="/books" 
                className="flex items-center space-x-2 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                <span>Tìm sách</span>
              </Link>              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-2 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  {user?.role === 'CTV' && (
                    <Link 
                      to="/staff" 
                      className="flex items-center space-x-2 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Nhân viên</span>
                    </Link>
                  )}
                  {user?.role === 'Admin' && (
                    <Link 
                      to="/admin" 
                      className="flex items-center space-x-2 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Quản trị</span>
                    </Link>
                  )}
                  <Link 
                    to="/profile" 
                    className="flex items-center space-x-2 py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Hồ sơ: {user?.full_name || user?.username}</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 py-2 px-2 text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="py-2 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors block"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link 
                    to="/register" 
                    className="py-2 px-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-md transition-colors block font-medium"
                    style={{ backgroundColor: "var(--primary-color)", color: "var(--text-on-primary)" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
