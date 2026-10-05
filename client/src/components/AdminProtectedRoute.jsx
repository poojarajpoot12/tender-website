import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children, user }) => {
  // Token check (localStorage or sessionStorage)
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // User check (Props or local storage fallback)
  let currentUser = user;
  if (!currentUser) {
    try {
      currentUser = JSON.parse(
        localStorage.getItem('user') || sessionStorage.getItem('user') || '{}'
      );
    } catch (e) {
      currentUser = {};
    }
  }

  // Check if token exists and user is logged in
  if (!token || !currentUser || !currentUser.email) {
    return <Navigate to="/login" replace />;
  }

  // Admin access validation
  const isAdmin =
    currentUser.role === 'admin' || currentUser.email === 'admin@tender.com';

  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return children;
};

export default AdminProtectedRoute;