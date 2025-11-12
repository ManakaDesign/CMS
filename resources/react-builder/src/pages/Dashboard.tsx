import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiEye,
  FiEyeOff,
  FiLogOut,
  FiGlobe,
} from 'react-icons/fi';
import { pagesApi } from '../api/services';
import { removeAuthToken } from '../api/client';
import type { Page } from '../types';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await pagesApi.list();
      setPages(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Laden der Seiten');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  const handleOpenBuilder = (pageId: number) => {
    navigate(`/builder/${pageId}`);
  };

  const handlePublish = async (page: Page) => {
    try {
      if (page.status === 'published') {
        await pagesApi.unpublish(page.id);
      } else {
        await pagesApi.publish(page.id);
      }
      await loadPages();
    } catch (err: any) {
      alert('Fehler: ' + (err.response?.data?.message || 'Unbekannter Fehler'));
    }
  };

  const handleDuplicate = async (page: Page) => {
    try {
      await pagesApi.duplicate(page.id);
      await loadPages();
    } catch (err: any) {
      alert('Fehler: ' + (err.response?.data?.message || 'Unbekannter Fehler'));
    }
  };

  const handleDelete = async (page: Page) => {
    if (!confirm(`Möchtest du die Seite "${page.title}" wirklich löschen?`)) {
      return;
    }

    try {
      await pagesApi.delete(page.id);
      await loadPages();
    } catch (err: any) {
      alert('Fehler: ' + (err.response?.data?.message || 'Unbekannter Fehler'));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-light-text">CMS Dashboard</h1>
              <p className="text-sm text-light-muted mt-1">Verwalte deine Seiten</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-light-text hover:text-white hover:bg-dark-hover rounded-lg transition-colors"
            >
              <FiLogOut size={18} />
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-light-text">Alle Seiten</h2>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <FiPlus size={18} />
            Neue Seite
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-light-muted">Lade Seiten...</p>
          </div>
        )}

        {/* Pages List */}
        {!loading && pages.length === 0 && (
          <div className="text-center py-12 bg-dark-panel rounded-lg border border-dark-border">
            <FiGlobe className="mx-auto text-light-muted mb-4" size={48} />
            <p className="text-light-text mb-4">Noch keine Seiten erstellt</p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <FiPlus size={18} />
              Erste Seite erstellen
            </button>
          </div>
        )}

        {!loading && pages.length > 0 && (
          <div className="bg-dark-panel rounded-lg border border-dark-border overflow-hidden">
            <table className="min-w-full divide-y divide-dark-border">
              <thead className="bg-dark-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light-muted uppercase tracking-wider">
                    Titel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light-muted uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light-muted uppercase tracking-wider">
                    Aktualisiert
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-light-muted uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-dark-panel divide-y divide-dark-divider">
                {pages.map((page) => (
                  <tr key={page.id} className="hover:bg-dark-hover transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-light-text">{page.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-light-muted">/{page.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          page.status === 'published'
                            ? 'bg-green-900/30 text-green-300 border border-green-700'
                            : 'bg-yellow-900/30 text-yellow-300 border border-yellow-700'
                        }`}
                      >
                        {page.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-light-muted">
                      {formatDate(page.updated_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenBuilder(page.id)}
                          className="p-2 text-brand-primary hover:text-primary-400 hover:bg-dark-hover rounded-lg transition-colors"
                          title="Im Builder bearbeiten"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => handlePublish(page)}
                          className="p-2 text-light-text hover:text-white hover:bg-dark-hover rounded-lg transition-colors"
                          title={
                            page.status === 'published' ? 'Veröffentlichung zurücknehmen' : 'Veröffentlichen'
                          }
                        >
                          {page.status === 'published' ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                        <button
                          onClick={() => handleDuplicate(page)}
                          className="p-2 text-light-text hover:text-white hover:bg-dark-hover rounded-lg transition-colors"
                          title="Duplizieren"
                        >
                          <FiCopy size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(page)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Create Page Dialog */}
      {showCreateDialog && (
        <CreatePageDialog
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </div>
  );
};

// Create Page Dialog Component
interface CreatePageDialogProps {
  onClose: () => void;
}

const CreatePageDialog: React.FC<CreatePageDialogProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate slug from title
    const generatedSlug = value
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await pagesApi.create({
        title,
        slug,
        status: 'draft',
      });

      // Redirect to builder with new page
      navigate(`/builder/${response.page.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Erstellen der Seite');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-dark-surface rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-light-text mb-4">Neue Seite erstellen</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-light-text mb-1">
              Titel
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="block w-full px-3 py-2 bg-dark-panel border border-dark-border text-light-text placeholder-light-muted rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="z.B. Startseite"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-light-text mb-1">
              URL-Slug
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="block w-full px-3 py-2 border border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="z.B. startseite"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Die Seite wird unter /{slug} erreichbar sein</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-light-text hover:bg-dark-hover rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Erstelle...' : 'Erstellen & Öffnen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
