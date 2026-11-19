import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import UserStoresPage from './pages/user/UserStoresPage';
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingSpinner from './components/common/LoadingSpinner';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'SYSTEM_ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === 'STORE_OWNER') {
    return <Navigate to="/owner/dashboard" replace />;
  }

  return <Navigate to="/stores" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['SYSTEM_ADMIN']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Normal user routes */}
      <Route
        path="/stores"
        element={
          <ProtectedRoute allowedRoles={['NORMAL_USER', 'SYSTEM_ADMIN', 'STORE_OWNER']}>
            <UserStoresPage />
          </ProtectedRoute>
        }
      />

      {/* Store owner routes */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute allowedRoles={['STORE_OWNER']}>
            <OwnerDashboardPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
