import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Home from './Page/Home';
import Login from './Page/Login';
import Applications from './Page/Applications';
import Settings from './Page/Settings';

// Helper protection route for the admin panel
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Admin Routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="requests" element={<Applications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
