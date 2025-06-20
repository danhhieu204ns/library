import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Trash2, PenSquare, Plus, AlertTriangle, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Types
interface Role {
  id: string;
  name: string;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// RoleForm Component
const RoleForm: React.FC<{
  role: Role | null;
  onSubmit: (role: { name: string; description: string }) => void;
  onCancel: () => void;
}> = ({ role, onSubmit, onCancel }) => {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [errors, setErrors] = useState({ name: '', description: '' });

  const validate = () => {
    const newErrors = { name: '', description: '' };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Tên vai trò không được để trống';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ name, description });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-medium mb-4">{role ? 'Cập nhật vai trò' : 'Thêm vai trò mới'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên vai trò</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {role ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </form>
    </div>
  );
};

// RoleTable Component
const RoleTable: React.FC<{
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}> = ({ roles, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên vai trò</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {roles.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                Không có vai trò nào
              </td>
            </tr>
          ) : (
            roles.map((role) => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(role)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <PenSquare className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(role)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// UserRoleRow Component
const UserRoleRow: React.FC<{
  user: User;
  roles: Role[];
  onRoleChange: (userId: string, roleId: string) => void;
  isUpdating: boolean;
}> = ({ user, roles, onRoleChange, isUpdating }) => {
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        <div className="flex items-center">
          <select
            value={user.role}
            onChange={(e) => onRoleChange(user.id, e.target.value)}
            disabled={isUpdating}
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {isUpdating && <Loader2 className="ml-2 h-4 w-4 animate-spin text-indigo-600" />}
        </div>
      </td>
    </tr>
  );
};

// Confirmation Modal
const ConfirmationModal: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
        <div className="flex items-start mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <X className="h-5 w-5 mr-2" />
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
          >
            <Check className="h-5 w-5 mr-2" />
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// Toast Notification
const Toast: React.FC<{
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-md shadow-md ${
      type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <div className="flex items-center">
        {type === 'success' ? (
          <Check className="h-5 w-5 mr-2" />
        ) : (
          <AlertTriangle className="h-5 w-5 mr-2" />
        )}
        <p>{message}</p>
        <button onClick={onClose} className="ml-4">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Custom hooks
const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRoles = async () => {
    try {
      setLoading(true);
      // Replace with your API endpoint
      const response = await axios.get('/api/roles');
      setRoles(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch roles');
      console.error(err);
      // For development, use mock data if API fails
      setRoles([
        { id: '1', name: 'Admin', description: 'Full access to all features' },
        { id: '2', name: 'CTV', description: 'Staff member with limited access' },
        { id: '3', name: 'User', description: 'Regular user with basic permissions' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: { name: string; description: string }) => {
    try {
      setLoading(true);
      // Replace with your API endpoint
      const response = await axios.post('/api/roles', roleData);
      setRoles([...roles, response.data]);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Failed to create role' };
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id: string, roleData: { name: string; description: string }) => {
    try {
      setLoading(true);
      // Replace with your API endpoint
      const response = await axios.put(`/api/roles/${id}`, roleData);
      setRoles(roles.map(role => role.id === id ? response.data : role));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Failed to update role' };
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id: string) => {
    try {
      setLoading(true);
      // Replace with your API endpoint
      await axios.delete(`/api/roles/${id}`);
      setRoles(roles.filter(role => role.id !== id));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Failed to delete role' };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return { roles, loading, error, fetchRoles, createRole, updateRole, deleteRole };
};

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingUsers, setUpdatingUsers] = useState<Record<string, boolean>>({});

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Replace with your API endpoint
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
      // For development, use mock data if API fails
      setUsers([
        { id: '1', name: 'John Doe', email: 'john@example.com', role: '1' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: '2' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: '3' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, roleId: string) => {
    try {
      setUpdatingUsers(prev => ({ ...prev, [userId]: true }));
      // Replace with your API endpoint
      await axios.put(`/api/users/${userId}/role`, { roleId });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: roleId } : user
      ));
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, error: 'Failed to update user role' };
    } finally {
      setUpdatingUsers(prev => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { 
    users, 
    loading, 
    error, 
    fetchUsers, 
    updateUserRole,
    isUpdatingUser: (userId: string) => updatingUsers[userId] || false
  };
};

// Main Component
const ManageRolesTab: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Custom hooks
  const { 
    roles, 
    loading: rolesLoading, 
    error: rolesError, 
    createRole, 
    updateRole, 
    deleteRole 
  } = useRoles();
  
  const { 
    users, 
    loading: usersLoading, 
    error: usersError, 
    updateUserRole,
    isUpdatingUser
  } = useUsers();

  // Check if user is admin
  if (!user || user.role !== 'Admin') {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h2>
        <p className="text-gray-600">Bạn không có quyền truy cập trang này</p>
      </div>
    );
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const handleRoleSubmit = async (roleData: { name: string; description: string }) => {
    if (selectedRole) {
      // Update existing role
      const result = await updateRole(selectedRole.id, roleData);
      if (result.success) {
        showToast('Cập nhật vai trò thành công', 'success');
      } else {
        showToast(result.error || 'Có lỗi xảy ra', 'error');
      }
    } else {
      // Create new role
      const result = await createRole(roleData);
      if (result.success) {
        showToast('Thêm vai trò mới thành công', 'success');
      } else {
        showToast(result.error || 'Có lỗi xảy ra', 'error');
      }
    }
    setShowRoleForm(false);
    setSelectedRole(null);
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (roleToDelete) {
      const result = await deleteRole(roleToDelete.id);
      if (result.success) {
        showToast('Xóa vai trò thành công', 'success');
      } else {
        showToast(result.error || 'Có lỗi xảy ra', 'error');
      }
      setShowConfirmation(false);
      setRoleToDelete(null);
    }
  };

  const handleRoleChange = async (userId: string, roleId: string) => {
    const result = await updateUserRole(userId, roleId);
    if (result.success) {
      showToast('Cập nhật vai trò người dùng thành công', 'success');
    } else {
      showToast(result.error || 'Có lỗi xảy ra', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý vai trò</h1>
      
      {/* Tab Buttons */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`${
              activeTab === 'roles'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Danh sách vai trò
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Gán vai trò cho người dùng
          </button>
        </nav>
      </div>

      {/* Roles Management */}
      {activeTab === 'roles' && (
        <div>
          {!showRoleForm && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setShowRoleForm(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Thêm vai trò mới
              </button>
            </div>
          )}

          {rolesLoading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
              <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : rolesError ? (
            <div className="text-center py-10 text-red-500">
              <p>{rolesError}</p>
            </div>
          ) : showRoleForm ? (
            <RoleForm
              role={selectedRole}
              onSubmit={handleRoleSubmit}
              onCancel={() => {
                setShowRoleForm(false);
                setSelectedRole(null);
              }}
            />
          ) : (
            <RoleTable
              roles={roles}
              onEdit={(role) => {
                setSelectedRole(role);
                setShowRoleForm(true);
              }}
              onDelete={handleDeleteClick}
            />
          )}
        </div>
      )}

      {/* User Role Assignment */}
      {activeTab === 'users' && (
        <div>
          {usersLoading ? (
            <div className="text-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto" />
              <p className="mt-2 text-gray-600">Đang tải dữ liệu người dùng...</p>
            </div>
          ) : usersError ? (
            <div className="text-center py-10 text-red-500">
              <p>{usersError}</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên người dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <UserRoleRow
                      key={user.id}
                      user={user}
                      roles={roles}
                      onRoleChange={handleRoleChange}
                      isUpdating={isUpdatingUser(user.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && roleToDelete && (
        <ConfirmationModal
          title="Xác nhận xóa vai trò"
          message={`Bạn có chắc chắn muốn xóa vai trò "${roleToDelete.name}"? Hành động này không thể hoàn tác.`}
          onConfirm={confirmDelete}
          onCancel={() => setShowConfirmation(false)}
        />
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default ManageRolesTab;