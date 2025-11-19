import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pages } from './pages/Pages';
import { Menu } from './pages/Menu';
import { Media } from './pages/Media';
import { Plugins } from './pages/Plugins';
import { Users } from './pages/Users';
import { Mail } from './pages/Mail';
import { Forms } from './pages/Forms';
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
          path="/pages"
          element={
            <ProtectedRoute>
              <Pages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/media"
          element={
            <ProtectedRoute>
              <Media />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plugins"
          element={
            <ProtectedRoute>
              <Plugins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mail"
          element={
            <ProtectedRoute>
              <Mail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forms"
          element={
            <ProtectedRoute>
              <Forms />
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
