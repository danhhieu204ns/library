import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI } from '../../services/api';
import { UserCircle, Key, Mail, Phone, MapPin, Save, AlertCircle, CheckCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, changePassword } = useAuth();
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await usersAPI.updateProfile(profileData);
      if (response.data.success) {
        updateUser(response.data.data.user);
        setMessage({ 
          type: 'success', 
          text: 'Thông tin cá nhân đã được cập nhật thành công!' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin.' 
      });
    } finally {
      setLoading(false);
    }
  };
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ 
        type: 'error', 
        text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' 
      });
      setPasswordLoading(false);
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.success) {
        setPasswordMessage({ 
          type: 'success', 
          text: result.message || 'Mật khẩu đã được thay đổi thành công!' 
        });
        // Reset password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setPasswordMessage({ 
          type: 'error', 
          text: result.error || 'Có lỗi xảy ra khi thay đổi mật khẩu.' 
        });
      }
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.message || 'Có lỗi xảy ra khi thay đổi mật khẩu.' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Information Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <UserCircle className="h-8 w-8 mr-2 text-yellow-400" style={{ color: "var(--primary-color)" }} />
            <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
          </div>
          
          {message.text && (
            <div className={`mb-4 p-3 rounded-md ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="inline-block h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="inline-block h-4 w-4 mr-2" />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit}>
            <div className="mb-4">
              <label htmlFor="full_name" className="block text-gray-700 font-medium mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={profileData.full_name}
                onChange={handleProfileChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-colors"
                style={{ "--tw-ring-color": "var(--primary-color)" }}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email
              </label>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-colors"
                  style={{ "--tw-ring-color": "var(--primary-color)" }}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone_number" className="block text-gray-700 font-medium mb-2">
                Số điện thoại
              </label>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  id="phone_number"
                  name="phone_number"
                  value={profileData.phone_number}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-colors"
                  style={{ "--tw-ring-color": "var(--primary-color)" }}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                Địa chỉ
              </label>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-3" />
                <textarea
                  id="address"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-colors"
                  style={{ "--tw-ring-color": "var(--primary-color)" }}
                ></textarea>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm w-full"
              style={{ backgroundColor: "var(--primary-color)", color: "var(--text-on-primary)" }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Lưu thông tin
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Change Password Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-6">
            <Key className="h-8 w-8 mr-2 text-yellow-400" style={{ color: "var(--primary-color)" }} />
            <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
          </div>
          
          {passwordMessage.text && (
            <div className={`mb-4 p-3 rounded-md ${
              passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {passwordMessage.type === 'success' ? (
                <CheckCircle className="inline-block h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="inline-block h-4 w-4 mr-2" />
              )}
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-colors"
                style={{ "--tw-ring-color": "var(--primary-color)" }}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-colors"
                style={{ "--tw-ring-color": "var(--primary-color)" }}
                minLength="6"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Mật khẩu phải có ít nhất 6 ký tự
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-colors"
                style={{ "--tw-ring-color": "var(--primary-color)" }}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm w-full"
              style={{ backgroundColor: "var(--primary-color)", color: "var(--text-on-primary)" }}
            >
              {passwordLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <Key className="h-5 w-5 mr-2" />
                  Đổi mật khẩu
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
