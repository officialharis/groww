import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-groww-primary"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to home page
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
