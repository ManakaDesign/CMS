import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Builder } from './pages/Builder';
import { ProtectedRoute } from './components/ProtectedRoute';
import { isAuthenticated } from './api/client';

function App() {
  console.log('[DEBUG] ===== APP VERSION: BUILD-2025-11-06-23:30 =====');
  console.log('[DEBUG] App loaded with basename: /public/admin');
  console.log('[DEBUG] Current URL:', window.location.href);
  console.log('[DEBUG] Current pathname:', window.location.pathname);

  return (
    <BrowserRouter basename="/public/admin">
      <Routes>
        {/* Redirect root to dashboard or login */}
        <Route
          path="/"
          element={
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder/:pageId"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
