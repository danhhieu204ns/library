import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const roleAPI = {
  // Get all roles
  getAllRoles: async () => {
    const response = await axios.get(`${API_URL}/roles`, {
      withCredentials: true
    });
    return response;
  },
  
  // Create new role
  createRole: async (roleData) => {
    const response = await axios.post(`${API_URL}/roles`, roleData, {
      withCredentials: true
    });
    return response;
  },
  
  // Get role by ID
  getRoleById: async (id) => {
    const response = await axios.get(`${API_URL}/roles/${id}`, {
      withCredentials: true
    });
    return response;
  },
  
  // Update role
  updateRole: async (id, roleData) => {
    const response = await axios.put(`${API_URL}/roles/${id}`, roleData, {
      withCredentials: true
    });
    return response;
  },
  
  // Delete role
  deleteRole: async (id) => {
    const response = await axios.delete(`${API_URL}/roles/${id}`, {
      withCredentials: true
    });
    return response;
  },
  
  // Update user role
  updateUserRole: async (userId, roleId) => {
    const response = await axios.put(`${API_URL}/user-roles/${userId}/role`, { roleId }, {
      withCredentials: true
    });
    return response;
  }
};

export default roleAPI;
