import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, Plus, Edit, Trash2, Save, X, CheckCircle, AlertTriangle
} from 'lucide-react';
import { rolesAPI, usersAPI } from '../../services/api';
import EmptyState from '../common/EmptyState';

const ManageRolesTab = () => {
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState(null);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] });
  const [isAddingRole, setIsAddingRole] = useState(false);
  // Fetch roles
  const { 
    data: rolesData, 
    isLoading: rolesLoading, 
    error: rolesError 
  } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesAPI.getAllRoles
  });

  // Fetch users
  const { 
    data: usersData, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery({
    queryKey: ['users-admin'],
    queryFn: usersAPI.getUsers
  });
  
  // Available permissions
  const availablePermissions = [
    { id: 'books:view', name: 'Xem sách' },
    { id: 'books:create', name: 'Thêm sách' },
    { id: 'books:edit', name: 'Sửa sách' },
    { id: 'books:delete', name: 'Xóa sách' },
    { id: 'books:bulk', name: 'Thao tác hàng loạt với sách' },
    { id: 'users:view', name: 'Xem người dùng' },
    { id: 'users:create', name: 'Thêm người dùng' },
    { id: 'users:edit', name: 'Sửa người dùng' },
    { id: 'users:delete', name: 'Xóa người dùng' },
    { id: 'users:bulk', name: 'Thao tác hàng loạt với người dùng' },
    { id: 'users:change_role', name: 'Thay đổi vai trò người dùng' },
    { id: 'roles:view', name: 'Xem vai trò' },
    { id: 'roles:create', name: 'Thêm vai trò' },
    { id: 'roles:edit', name: 'Sửa vai trò' },
    { id: 'roles:delete', name: 'Xóa vai trò' },
    { id: 'borrowings:view', name: 'Xem mượn trả' },
    { id: 'borrowings:create', name: 'Thêm mượn trả' },
    { id: 'borrowings:edit', name: 'Sửa mượn trả' },
    { id: 'borrowings:delete', name: 'Xóa mượn trả' },
    { id: 'borrowings:approve', name: 'Phê duyệt mượn trả' },
    { id: 'schedules:view', name: 'Xem lịch' },
    { id: 'schedules:create', name: 'Thêm lịch' },
    { id: 'schedules:edit', name: 'Sửa lịch' },
    { id: 'schedules:delete', name: 'Xóa lịch' },
    { id: 'reports:view', name: 'Xem báo cáo' },
    { id: 'reports:export', name: 'Xuất báo cáo' },
    { id: 'system:settings', name: 'Cài đặt hệ thống' },
    { id: 'system:audit_logs', name: 'Xem nhật ký hệ thống' }
  ];  // Create role mutation  
  const createRoleMutation = useMutation({
    mutationFn: rolesAPI.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsAddingRole(false);
      setNewRole({ name: '', description: '', permissions: [] });
      alert('Tạo vai trò mới thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Không thể tạo vai trò mới');
    }
  });
  
  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }) => rolesAPI.updateRole(id, data),    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setEditingRole(null);
      alert('Cập nhật vai trò thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Không thể cập nhật vai trò');
    }
  });
  
  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: rolesAPI.deleteRole,    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      alert('Xóa vai trò thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Không thể xóa vai trò');
    }
  });
  
  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }) => rolesAPI.updateUserRole(userId, roleId),    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-admin'] });
      alert('Cập nhật vai trò người dùng thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Không thể cập nhật vai trò người dùng');
    }
  });
  
  const roles = rolesData?.data?.data?.roles || [];
  const users = usersData?.data?.data?.users || [];
  
  // Handle role edit
  const handleEditRole = (role) => {
    setEditingRole({
      ...role,
      permissions: role.permissions || []
    });
  };
  
  // Handle role update
  const handleUpdateRole = () => {
    updateRoleMutation.mutate({
      id: editingRole._id,
      data: editingRole
    });
  };
  
  // Handle role delete
  const handleDeleteRole = (roleId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
      deleteRoleMutation.mutate(roleId);
    }
  };
  
  // Handle create role
  const handleCreateRole = (e) => {
    e.preventDefault();
    createRoleMutation.mutate(newRole);
  };
  
  // Handle permission toggle
  const handlePermissionToggle = (permissionId) => {
    if (editingRole) {
      // For editing existing role
      const updatedPermissions = editingRole.permissions.includes(permissionId)
        ? editingRole.permissions.filter(p => p !== permissionId)
        : [...editingRole.permissions, permissionId];
        
      setEditingRole({
        ...editingRole,
        permissions: updatedPermissions
      });
    } else {
      // For new role
      const updatedPermissions = newRole.permissions.includes(permissionId)
        ? newRole.permissions.filter(p => p !== permissionId)
        : [...newRole.permissions, permissionId];
        
      setNewRole({
        ...newRole,
        permissions: updatedPermissions
      });
    }
  };
  
  // Handle user role change
  const handleUserRoleChange = (userId, roleId) => {
    updateUserRoleMutation.mutate({ userId, roleId });
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Quản lý vai trò</h2>
        {!isAddingRole && (
          <button
            onClick={() => setIsAddingRole(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Thêm vai trò mới
          </button>
        )}
      </div>
      
      {/* Role Management Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Danh sách vai trò</h3>
        </div>
        
        {rolesLoading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : rolesError ? (
          <div className="p-6">
            <EmptyState
              type="error"
              title="Lỗi tải dữ liệu"
              description="Không thể tải danh sách vai trò. Vui lòng thử lại sau."
              icon={<AlertTriangle className="h-12 w-12 text-red-500" />}
            />
          </div>
        ) : roles.length === 0 ? (
          <div className="p-6">
            <EmptyState
              type="empty"
              title="Chưa có vai trò nào"
              description="Bắt đầu bằng cách thêm vai trò mới cho hệ thống."
              icon={<Users className="h-12 w-12 text-gray-400" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quyền hạn
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isAddingRole && (
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Tên vai trò"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Mô tả vai trò"
                        value={newRole.description}
                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {availablePermissions.map((permission) => (
                          <label
                            key={permission.id}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              newRole.permissions.includes(permission.id)
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            } cursor-pointer`}
                          >
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={newRole.permissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                            />
                            {permission.name}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleCreateRole}
                          className="text-blue-600 hover:text-blue-900"
                          disabled={createRoleMutation.isLoading}
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingRole(false);
                            setNewRole({ name: '', description: '', permissions: [] });
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                
                {roles.map((role) => (
                  <tr key={role._id} className={editingRole?._id === role._id ? 'bg-yellow-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingRole?._id === role._id ? (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={editingRole.name}
                          onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                        />
                      ) : (
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingRole?._id === role._id ? (
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={editingRole.description}
                          onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                        />
                      ) : (
                        <div className="text-sm text-gray-500">{role.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingRole?._id === role._id ? (
                        <div className="flex flex-wrap gap-2">
                          {availablePermissions.map((permission) => (
                            <label
                              key={permission.id}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                editingRole.permissions.includes(permission.id)
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              } cursor-pointer`}
                            >
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={editingRole.permissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                              />
                              {permission.name}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(role.permissions || []).map((permissionId) => {
                            const permission = availablePermissions.find(p => p.id === permissionId);
                            return permission ? (
                              <span
                                key={permissionId}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {permission.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingRole?._id === role._id ? (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleUpdateRole}
                            className="text-green-600 hover:text-green-900"
                            disabled={updateRoleMutation.isLoading}
                          >
                            <Save className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setEditingRole(null)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role._id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteRoleMutation.isLoading}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* User Role Assignment Section */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Phân quyền người dùng</h3>
        </div>
        
        {usersLoading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : usersError ? (
          <div className="p-6">
            <EmptyState
              type="error"
              title="Lỗi tải dữ liệu"
              description="Không thể tải danh sách người dùng. Vui lòng thử lại sau."
              icon={<AlertTriangle className="h-12 w-12 text-red-500" />}
            />
          </div>
        ) : users.length === 0 ? (
          <div className="p-6">
            <EmptyState
              type="empty"
              title="Chưa có người dùng nào"
              description="Hệ thống chưa có người dùng nào để phân quyền."
              icon={<Users className="h-12 w-12 text-gray-400" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò hiện tại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thay đổi vai trò
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.full_name || user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'Admin' 
                          ? 'bg-red-100 text-red-800' 
                          : user.role === 'CTV' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'DocGia'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={user.roleId || ''}
                        onChange={(e) => handleUserRoleChange(user._id, e.target.value)}
                        disabled={updateUserRoleMutation.isLoading}
                      >
                        <option value="">Chọn vai trò</option>
                        {roles.map((role) => (
                          <option key={role._id} value={role._id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRolesTab;
