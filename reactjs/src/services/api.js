import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.get('/auth/verify'),
};

// Users API calls
export const usersAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/me', userData),
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Books API calls
export const booksAPI = {
  getBooks: (params) => api.get('/books', { params }),
  getBook: (id) => api.get(`/books/${id}`),
  createBook: (bookData) => api.post('/books', bookData),
  updateBook: (id, bookData) => api.put(`/books/${id}`, bookData),
  deleteBook: (id) => api.delete(`/books/${id}`),
  getGenres: () => api.get('/books/meta/genres'),
  getLanguages: () => api.get('/books/meta/languages'),
  getPublishers: () => api.get('/books/meta/publishers'),
};

// Borrowings API calls
export const borrowingsAPI = {
  getBorrowings: (params) => api.get('/borrowings', { params }),
  getBorrowing: (id) => api.get(`/borrowings/${id}`),
  borrowBook: (borrowData) => api.post('/borrowings', borrowData),
  returnBook: (id, returnData) => api.put(`/borrowings/${id}/return`, returnData),
};

// Reservations API calls
export const reservationsAPI = {
  getReservations: (params) => api.get('/reservations', { params }),
  getReservation: (id) => api.get(`/reservations/${id}`),
  reserveBook: (reservationData) => api.post('/reservations', reservationData),
  cancelReservation: (id) => api.delete(`/reservations/${id}`),
  fulfillReservation: (id, data) => api.put(`/reservations/${id}/fulfill`, data),
};

// Reviews API calls
export const reviewsAPI = {
  getReviews: (params) => api.get('/reviews', { params }),
  getReview: (id) => api.get(`/reviews/${id}`),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// Schedules API calls
export const schedulesAPI = {
  getSchedules: (params) => api.get('/schedules', { params }),
  getSchedule: (id) => api.get(`/schedules/${id}`),
  createSchedule: (scheduleData) => api.post('/schedules', scheduleData),
  updateSchedule: (id, scheduleData) => api.put(`/schedules/${id}`, scheduleData),
  deleteSchedule: (id) => api.delete(`/schedules/${id}`),
  approveSchedule: (id) => api.put(`/schedules/${id}/approve`),
  rejectSchedule: (id, data) => api.put(`/schedules/${id}/reject`, data),
};

// User API calls (additional to usersAPI)
export const userAPI = {
  getUserStatistics: () => api.get('/users/statistics'),
  getUserReports: (params) => api.get('/users/reports', { params }),
};

// Reports API calls
export const reportsAPI = {
  getUserReports: (params) => api.get('/reports/users', { params }),
  getBookReports: (params) => api.get('/reports/books', { params }),
  getBorrowingReports: (params) => api.get('/reports/borrowings', { params }),
  getSystemReports: (params) => api.get('/reports/system', { params }),
};

export default api;
