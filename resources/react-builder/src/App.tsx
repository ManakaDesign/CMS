import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Builder } from './pages/Builder';
import { BuilderDemo } from './pages/BuilderDemo';
import { ProtectedRoute } from './components/ProtectedRoute';
import { isAuthenticated } from './api/client';

function App() {
  // Use environment variable for base path (set during build)
  // For GitHub Pages demo: VITE_BASE_PATH=/CMS/
  // For Laravel production: /public/admin/
  const basename = import.meta.env.VITE_BASE_PATH || '/public/admin';
  const isDemoMode = basename === '/CMS/';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Redirect root - for demo mode go directly to demo, otherwise to dashboard/login */}
        <Route
          path="/"
          element={
            isDemoMode ? <Navigate to="/demo" replace /> :
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/demo" element={<BuilderDemo />} />

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
