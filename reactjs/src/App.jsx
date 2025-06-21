import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BooksPage from './pages/books/BooksPage';
import BookDetailPage from './pages/books/BookDetailPage';
import ThemeSelector from './components/ThemeSelector';
import FinalScheduleView from './components/schedule/FinalScheduleView';

// Dashboard Layouts
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
import StaffDashboardLayout from './layouts/StaffDashboardLayout';
import UserDashboardLayout from './layouts/UserDashboardLayout';

// Admin Dashboard Tabs
import AdminOverviewTab from './pages/admin/tabs/AdminOverviewTab';
import AdminUsersTab from './pages/admin/tabs/AdminUsersTab';
import AdminBooksTab from './pages/admin/tabs/AdminBooksTab';
import AdminBorrowingsTab from './pages/admin/tabs/AdminBorrowingsTab';
import AdminReservationsTab from './pages/admin/tabs/AdminReservationsTab';
import AdminSettingsTab from './pages/admin/tabs/AdminSettingsTab';
import ManageRolesTab from './components/tabs/ManageRolesTab';
import ApproveShiftTab from './pages/admin/tabs/ApproveShiftTab';

// Staff Dashboard Tabs
import StaffOverviewTab from './pages/staff/tabs/StaffOverviewTab';
import StaffBooksTab from './pages/staff/tabs/StaffBooksTab';
import StaffBorrowingsTab from './pages/staff/tabs/StaffBorrowingsTab';
import StaffReservationsTab from './pages/staff/tabs/StaffReservationsTab';
import StaffSchedulesTab from './pages/staff/tabs/StaffSchedulesTab';
import StaffUsersTab from './pages/staff/tabs/StaffUsersTab';
import RegisterShiftTab from './pages/staff/tabs/RegisterShiftTab';

// User Dashboard Tabs
import UserBorrowedTab from './pages/user/tabs/UserBorrowedTab';
import UserHistoryTab from './pages/user/tabs/UserHistoryTab';
import UserReservationsTab from './pages/user/tabs/UserReservationsTab';
import UserFavoritesTab from './pages/user/tabs/UserFavoritesTab';
import UserProfileTab from './pages/user/tabs/UserProfileTab';

// Standalone Pages
import BorrowPage from './pages/staff/BorrowPage';
import ReturnPage from './pages/staff/ReturnPage';
import UserSearchPage from './pages/staff/UserSearchPage';
import ReservationDetailPage from './pages/staff/ReservationDetailPage';

function App() {  return (
    <AuthProvider>
      <ToastProvider>
        <Layout>
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/theme" element={<ThemeSelector />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          
          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminOverviewTab />} />
            <Route path="users" element={<AdminUsersTab />} />
            <Route path="roles" element={<ManageRolesTab />} />
            <Route path="borrowings" element={<AdminBorrowingsTab />} />
            <Route path="reservations" element={<AdminReservationsTab />} />
            <Route path="books" element={<AdminBooksTab />} />
            <Route path="settings" element={<AdminSettingsTab />} />
            <Route path="shift-approval" element={<ApproveShiftTab />} />
          </Route>
          
          {/* Staff Dashboard Routes */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <StaffDashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StaffOverviewTab />} />
            <Route path="books" element={<StaffBooksTab />} />
            <Route path="borrowings" element={<StaffBorrowingsTab />} />
            <Route path="reservations" element={<StaffReservationsTab />} />
            <Route path="schedules" element={<StaffSchedulesTab />} />
            <Route path="users" element={<StaffUsersTab />} />
            <Route path="shifts" element={<RegisterShiftTab />} />
          </Route>
          
          {/* User Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<UserBorrowedTab />} />
            <Route path="history" element={<UserHistoryTab />} />
            <Route path="reservations" element={<UserReservationsTab />} />
            <Route path="favorites" element={<UserFavoritesTab />} />
            <Route path="profile" element={<UserProfileTab />} />
          </Route>
          
          {/* Standalone Staff Pages */}
          <Route path="/staff/borrow" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <BorrowPage />
            </ProtectedRoute>
          } />
          
          <Route path="/staff/return" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <ReturnPage />
            </ProtectedRoute>
          } />
          
          <Route path="/staff/user-search" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <UserSearchPage />
            </ProtectedRoute>
          } />
          
          <Route path="/staff/reservations/:id" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <ReservationDetailPage />
            </ProtectedRoute>
          } />
          
          {/* Public Schedule View */}
          <Route path="/schedule" element={<FinalScheduleView />} />
        </Routes>
      </Layout>
    </ToastProvider>
  </AuthProvider>
  );
}

export default App;
