import React, { useState, useRef, useEffect } from 'react';
import { Users, Eye, Edit, Trash2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import TabHeader from '../common/TabHeader';
import LoadingSkeleton from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';
import UserForm from '../../../../components/forms/UserForm';
import { usersAPI } from '../../../../services/api';

// Modal animation styles (giống BooksTab)
const modalStyles = `  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(2px);
    z-index: 50;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease-out;
  }
  .modal-content {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    width: 100%;
    max-width: 32rem;
    margin: 1rem;
    position: relative;
    z-index: 51;
    animation: slideIn 0.3s ease-out forwards;
  }
`;

const UsersTab = ({
  users = [],
  isLoading = false,
  searchTerm,
  setSearchTerm,
  totalUsers = 0,
  deleteUserMutation,
  updateUserMutation
}) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [isAddUserLoading, setIsAddUserLoading] = useState(false);
  const queryClient = useQueryClient();
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const roleRef = useRef(null);
  const statusRef = useRef(null);

  // Inject modal CSS vào DOM (giống BooksTab)
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = modalStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: '', type: '' }), 5000);
  };

  const filteredUsers = users.filter(user =>
    searchTerm === '' ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user._id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  const handleUserUpdate = async () => {
    if (!nameRef.current.value.trim()) {
      alert('Tên người dùng không được để trống');
      nameRef.current.focus();
      return;
    }
    if (!emailRef.current.value.trim()) {
      alert('Email không được để trống');
      emailRef.current.focus();
      return;
    }
    const updatedUserData = {
      name: nameRef.current.value.trim(),
      email: emailRef.current.value.trim(),
      role: roleRef.current.value,
      status: statusRef.current.value
    };
    try {
      await updateUserMutation.mutateAsync({
        id: selectedUser._id,
        data: updatedUserData
      });
      setIsEditModalOpen(false);
      showFeedback('Cập nhật người dùng thành công!');
      queryClient.invalidateQueries(['users-staff']);
    } catch (error) {
      alert('Có lỗi xảy ra khi cập nhật người dùng: ' + (error.response?.data?.message || error.message));
    }
  };
  const confirmDeleteUser = () => {
    if (selectedUser && selectedUser._id) {
      deleteUserMutation.mutate(selectedUser._id, {
        onSuccess: () => {
          showFeedback(`Người dùng "${selectedUser.name}" đã được xóa thành công`, 'success');
        },
        onError: (error) => {
          const errorMessage = error.response?.data?.message || 'Không thể xóa người dùng. Vui lòng thử lại sau.';
          showFeedback(errorMessage, 'error');
        }
      });
      setIsDeleteModalOpen(false);
    }
  };
  const handleAddUser = async (formData) => {
    setIsAddUserLoading(true);
    try {
      const response = await usersAPI.createUser(formData);
      if (response.data && response.data.success) {
        showFeedback('Thêm người dùng thành công!', 'success');
        setIsAddModalOpen(false);
        queryClient.invalidateQueries(['users-staff']);
      }
    } catch (error) {
      showFeedback(error.response?.data?.message || 'Có lỗi xảy ra khi thêm người dùng.', 'error');
    } finally {
      setIsAddUserLoading(false);
    }
  };
  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }
  return (
    <div>
      {feedback.message && (
        <div className={`mb-4 p-4 rounded-md ${feedback.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}
          style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <div className="flex">
            <div className="flex-shrink-0">
              {feedback.type === 'error' ? (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{feedback.message}</p>
            </div>
          </div>
        </div>
      )}
      <TabHeader
        title="Quản lý người dùng"
        searchPlaceholder="Tìm kiếm người dùng..."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actionButton={{
          icon: 'UserPlus',
          label: 'Thêm người dùng',
          onClick: () => setIsAddModalOpen(true)
        }}
      />
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{totalUsers}</div>
            <div className="text-sm text-gray-500">Tổng số người dùng</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredUsers.length === 0 ? (
          <EmptyState
            icon="Users"
            title="Không tìm thấy người dùng nào"
            description="Không có người dùng nào phù hợp với từ khóa tìm kiếm của bạn"
            actionButton={{
              icon: 'UserPlus',
              label: 'Thêm người dùng mới',
              onClick: () => setIsAddModalOpen(true)
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.role}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.status || 'Active'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleViewUser(user)} className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1 hover:bg-blue-50 rounded-full"><Eye className="h-5 w-5" /></button>
                        <button onClick={() => handleEditUser(user)} className="text-amber-600 hover:text-amber-900 transition-colors duration-200 p-1 hover:bg-amber-50 rounded-full"><Edit className="h-5 w-5" /></button>
                        <button onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 hover:bg-red-50 rounded-full"><Trash2 className="h-5 w-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* View User Modal */}
      {isViewModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content md:mx-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Chi tiết người dùng</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors duration-200"><X className="h-6 w-6" /></button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Tên</p>
                <p className="text-base text-gray-900">{selectedUser.name}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                <p className="text-base text-gray-900">{selectedUser.email}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Vai trò</p>
                <p className="text-base text-gray-900">{selectedUser.role}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Trạng thái</p>
                <p className="text-base text-gray-900">{selectedUser.status || 'Active'}</p>
              </div>
            </div>
            <div className="px-4 py-3 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2 transition-colors duration-200">Đóng</button>
              <button onClick={() => { setIsViewModalOpen(false); handleEditUser(selectedUser); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">Chỉnh sửa</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content md:mx-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Chỉnh sửa người dùng</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors duration-200"><X className="h-6 w-6" /></button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tên</label>
                  <input type="text" id="name" ref={nameRef} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" defaultValue={selectedUser.name} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" id="email" ref={emailRef} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" defaultValue={selectedUser.email} />
                </div>
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Vai trò</label>
                  <select id="role" ref={roleRef} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" defaultValue={selectedUser.role}>
                    <option value="User">User</option>
                    <option value="CTV">CTV</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">Trạng thái</label>
                  <select id="status" ref={statusRef} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" defaultValue={selectedUser.status || 'Active'}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2 transition-colors duration-200">Hủy</button>
              <button onClick={handleUserUpdate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md md:mx-auto">
            <div className="p-6">
              <div className="text-center">
                <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Xác nhận xóa người dùng</h3>
                <p className="text-gray-500">Bạn có chắc chắn muốn xóa người dùng "{selectedUser.name}"? Hành động này không thể hoàn tác.</p>
              </div>
            </div>
            <div className="px-4 py-3 border-t bg-gray-50 flex justify-end">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-2 transition-colors duration-200">Hủy</button>
              <button onClick={confirmDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200">Xác nhận xóa</button>
            </div>
          </div>
        </div>
      )}
      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content md:mx-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Thêm người dùng mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500 transition-colors duration-200"><X className="h-6 w-6" /></button>
            </div>
            <div className="p-6">
              <UserForm onSubmit={handleAddUser} onCancel={() => setIsAddModalOpen(false)} isLoading={isAddUserLoading} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;
