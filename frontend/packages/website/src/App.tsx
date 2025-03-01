import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../shared/utils/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import AuthCallback from './pages/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Root redirect component that checks auth state
const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // If still loading, show nothing (Landing will handle loading state)
  if (isLoading) {
    return null;
  }
  
  // If authenticated, redirect to dashboard, otherwise show landing page
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
