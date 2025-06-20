import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Camera, XCircle, Save } from 'lucide-react';
import { usersAPI } from '../../../services/api';

const UserProfileTab = () => {
  const { user, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        // Fetch user's profile from API using the usersAPI service
        const response = await usersAPI.getUser(user.id);
        const data = response.data.data;
        
        setProfile({
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          avatarUrl: data.avatarUrl || '',
        });
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.response?.data?.message || 'Không thể tải thông tin tài khoản');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserProfile();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('fullName', profile.fullName);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      formData.append('address', profile.address);
      
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      // Update user profile using the usersAPI service
      const response = await usersAPI.updateUser(user.id, formData);
      const updatedProfile = response.data;
      
      // Update local state and context
      setProfile({
        fullName: updatedProfile.fullName || '',
        email: updatedProfile.email || '',
        phone: updatedProfile.phone || '',
        address: updatedProfile.address || '',
        avatarUrl: updatedProfile.avatarUrl || '',
      });
      
      setAvatarFile(null);
      setAvatarPreview(null);
      setSuccess(true);
      
      // Update auth context with new user data if needed
      if (updateUserProfile) {
        updateUserProfile(updatedProfile);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Không thể cập nhật thông tin tài khoản');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Thông tin tài khoản</h1>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Thông tin tài khoản</h1>
        
        {error && (
          <div className="mt-4 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Đã xảy ra lỗi</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mt-4 bg-green-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <Save className="h-5 w-5 text-green-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Thành công</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Đã cập nhật thông tin tài khoản</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit}>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-6">
                {/* Avatar */}
                <div className="sm:col-span-6">
                  <div className="flex items-center">
                    <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                      ) : profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="User avatar" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-200">
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-5">
                      <div className="relative bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm flex items-center cursor-pointer hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                        <label
                          htmlFor="avatar-upload"
                          className="relative text-sm font-medium text-indigo-600 cursor-pointer"
                        >
                          <span>Thay đổi ảnh đại diện</span>
                          <input
                            id="avatar-upload"
                            name="avatar-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleAvatarChange}
                          />
                        </label>
                        <Camera className="ml-2 h-4 w-4 text-gray-400" />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Full Name */}
                <div className="sm:col-span-3">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Họ và tên
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      value={profile.fullName}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Họ và tên của bạn"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="sm:col-span-3">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="sm:col-span-3">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Số điện thoại của bạn"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-6">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Địa chỉ
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={profile.address}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Địa chỉ của bạn"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserProfileTab;
