import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import BooksPage from './pages/books/BooksPage';
import BookDetailPage from './pages/books/BookDetailPage';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminReports from './pages/admin/AdminReports';
import AdminSystemSettings from './pages/admin/AdminSystemSettings';
import AdminCopyManagement from './pages/admin/AdminCopyManagement';
import AdminCategoryManagement from './pages/admin/AdminCategoryManagement';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminScheduleManagement from './pages/admin/AdminScheduleManagement';
import StaffDashboard from './pages/staff/StaffDashboard';
import BorrowPage from './pages/staff/BorrowPage';
import ReturnPage from './pages/staff/ReturnPage';
import UserSearchPage from './pages/staff/UserSearchPage';
import StaffSchedulesPage from './pages/staff/StaffSchedulesPage';
import StaffReservationsPage from './pages/staff/StaffReservationsPage';
import ReservationDetailPage from './pages/staff/ReservationDetailPage';
import UserReportsPage from './pages/staff/UserReportsPage';
import StaffBorrowingsPage from './pages/staff/StaffBorrowingsPage';
import StaffUsersPage from './pages/staff/StaffUsersPage';
import ScheduleCalendarPage from './pages/staff/ScheduleCalendarPage';
import StaffScheduleReportsPage from './pages/staff/StaffScheduleReportsPage';
import ThemeSelector from './components/ThemeSelector';

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/theme" element={<ThemeSelector />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminUserManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminReports />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminSystemSettings />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/copies" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminCopyManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/categories" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminCategoryManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/audit" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminAuditLogs />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/schedule" element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminScheduleManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          
          {/* Staff Management Routes */}
          <Route path="/staff/borrowings" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <StaffBorrowingsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/staff/reservations" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <StaffReservationsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/staff/users" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <StaffUsersPage />
            </ProtectedRoute>
          } />
          
          <Route path="/staff/schedules" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <StaffSchedulesPage />
            </ProtectedRoute>
          } />
          
          <Route path="/staff/user-search" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <UserSearchPage />
            </ProtectedRoute>
          } />
          
          <Route path="/staff/user-reports" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <UserReportsPage />
            </ProtectedRoute>
          } />
          
          <Route path="/staff/schedule-calendar" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <ScheduleCalendarPage />
            </ProtectedRoute>
          } />
          
          <Route path="/staff/schedule-reports" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <StaffScheduleReportsPage />
            </ProtectedRoute>
          } />
          
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
          
          <Route path="/staff/reservations/:id" element={
            <ProtectedRoute allowedRoles={['Admin', 'CTV']}>
              <ReservationDetailPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
