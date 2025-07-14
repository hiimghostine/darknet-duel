import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

/**
 * A wrapper component for routes that require authentication
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loadUser } = useAuthStore();

  useEffect(() => {
    // Verify authentication status on protected route access
    loadUser();
  }, [loadUser]);

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
};

export default ProtectedRoute;
