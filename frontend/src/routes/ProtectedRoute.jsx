import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the appropriate home page for the user's role
    if (user.role === 'SYSTEM_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'STORE_OWNER') {
      return <Navigate to="/owner/dashboard" replace />;
    } else {
      return <Navigate to="/stores" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
