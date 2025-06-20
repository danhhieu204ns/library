import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const usersAPI = {
  // Get all users
  getAllUsers: async (page = 1, limit = 10, search = '') => {
    const response = await axios.get(`${API_URL}/users`, {
      params: { page, limit, search },
      withCredentials: true
    });
    return response;
  },
  
  // Get user by ID
  getUserById: async (id) => {
    const response = await axios.get(`${API_URL}/users/${id}`, {
      withCredentials: true
    });
    return response;
  },
  
  // Create new user
  createUser: async (userData) => {
    const response = await axios.post(`${API_URL}/users`, userData, {
      withCredentials: true
    });
    return response;
  },
  
  // Update user
  updateUser: async (id, userData) => {
    const response = await axios.put(`${API_URL}/users/${id}`, userData, {
      withCredentials: true
    });
    return response;
  },
  
  // Delete user
  deleteUser: async (id) => {
    const response = await axios.delete(`${API_URL}/users/${id}`, {
      withCredentials: true
    });
    return response;
  },
  
  // Get current user profile
  getCurrentUser: async () => {
    const response = await axios.get(`${API_URL}/users/me`, {
      withCredentials: true
    });
    return response;
  },
  
  // Update current user profile
  updateCurrentUser: async (userData) => {
    const response = await axios.put(`${API_URL}/users/me`, userData, {
      withCredentials: true
    });
    return response;
  }
};

export default usersAPI;
