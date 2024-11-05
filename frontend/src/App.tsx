import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Auth from './pages/Auth';
//import AdminDashboard from './pages/AdminDashboard';
import DashboardLayout from './pages/DashboardLayout';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('editorToken');
  const location = useLocation();

  if (!token) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Auth Guard Component
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('editorToken');
 // const location = useLocation();

  if (token) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Auth Route - Redirects to dashboard if already logged in */}
        <Route 
          path="/login" 
          element={
            <AuthGuard>
              <Auth />
            </AuthGuard>
          } 
        />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {/* <AdminDashboard /> */}
              <DashboardLayout/>
            </ProtectedRoute>
          }
        />

        {/* Default Route - Redirect to login */}
        <Route 
          path="/" 
          element={<Navigate to="/login" replace />} 
        />

        {/* Catch all other routes and redirect to login */}
        <Route 
          path="*" 
          element={<Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
};

export default App;