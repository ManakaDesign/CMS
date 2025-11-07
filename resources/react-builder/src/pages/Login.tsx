import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiAlertCircle } from 'react-icons/fi';
import { authApi } from '../api/services';
import { setAuthToken } from '../api/client';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });

      // Store token
      setAuthToken(response.token);

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login fehlgeschlagen. Bitte überprüfe deine Zugangsdaten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-light-text mb-2">CMS Builder</h1>
          <p className="text-light-muted">Melde dich an, um fortzufahren</p>
        </div>

        {/* Login Card */}
        <div className="bg-dark-surface rounded-lg shadow-xl p-8 border border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 flex items-start gap-3">
                <FiAlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={20} />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-light-text mb-2">
                E-Mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-light-muted" size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-dark-panel border border-dark-border rounded-lg text-light-text placeholder-light-muted focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="admin@example.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-light-text mb-2">
                Passwort
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-light-muted" size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-dark-panel border border-dark-border rounded-lg text-light-text placeholder-light-muted focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-primary text-white py-2 px-4 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-dark-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Anmeldung läuft...' : 'Anmelden'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-light-muted">
          <p>Noch kein Account? Nutze den Installer um einen Admin-Benutzer zu erstellen.</p>
        </div>
      </div>
    </div>
  );
};
