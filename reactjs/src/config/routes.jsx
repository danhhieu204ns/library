import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Shared Pages (using new shared components)
import { 
  BooksManagementPage,
  UsersManagementPage,
  BorrowingsManagementPage
} from '../pages';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Other Pages
import HomePage from '../pages/HomePage';
import DashboardPage from '../pages/DashboardPage';

// HOC
import withRoleAccess from '../hoc/withRoleAccess';

// Route Protection Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />

        {/* Management Routes - Using Shared Components */}
        <Route 
          path="/books" 
          element={
            <ProtectedRoute>
              <BooksManagementPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <UsersManagementPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/borrowings" 
          element={
            <ProtectedRoute>
              <BorrowingsManagementPage />
            </ProtectedRoute>
          } 
        />

        {/* Form Routes (Add/Edit) */}
        <Route 
          path="/books/add" 
          element={
            <ProtectedRoute>
              {/* BookFormPage with permission check */}
              <div>Add Book Form (to be implemented)</div>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/books/edit/:id" 
          element={
            <ProtectedRoute>
              {/* BookFormPage with permission check */}
              <div>Edit Book Form (to be implemented)</div>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/users/add" 
          element={
            <ProtectedRoute>
              {/* UserFormPage with permission check */}
              <div>Add User Form (to be implemented)</div>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users/edit/:id" 
          element={
            <ProtectedRoute>
              {/* UserFormPage with permission check */}
              <div>Edit User Form (to be implemented)</div>
            </ProtectedRoute>
          } 
        />

        {/* Detail/View Routes */}
        <Route 
          path="/books/:id" 
          element={
            <ProtectedRoute>
              {/* BookDetailPage */}
              <div>Book Detail (to be implemented)</div>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users/:id" 
          element={
            <ProtectedRoute>
              {/* UserDetailPage */}
              <div>User Detail (to be implemented)</div>
            </ProtectedRoute>
          } 
        />

        {/* Admin-only Routes */}
        <Route 
          path="/audit/*" 
          element={
            <ProtectedRoute>
              {/* AuditPages with Admin permission check */}
              <div>Audit Logs (Admin only)</div>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              {/* SettingsPage with Admin permission check */}
              <div>System Settings (Admin only)</div>
            </ProtectedRoute>
          } 
        />

        {/* Reports Routes */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              {/* ReportsPage with appropriate permission check */}
              <div>Reports (Staff/Admin)</div>
            </ProtectedRoute>
          } 
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
