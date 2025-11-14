import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Page } from '../types';
import { pagesApi } from '../api/services';

interface PageSettingsModalProps {
  page: Page;
  onClose: () => void;
  onSave: () => void;
}

export const PageSettingsModal: React.FC<PageSettingsModalProps> = ({ page, onClose, onSave }) => {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await pagesApi.update(page.id, { title, slug });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Speichern');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-dark-surface rounded-lg shadow-xl w-full max-w-md border border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-light-text">Seiteneinstellungen</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dark-hover rounded transition-colors"
          >
            <X className="w-5 h-5 text-light-muted" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded p-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Page Title */}
          <div>
            <label htmlFor="page-title" className="block text-sm font-medium text-light-text mb-2">
              Seitentitel
            </label>
            <input
              id="page-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              placeholder="z.B. Startseite"
              required
            />
          </div>

          {/* URL Slug */}
          <div>
            <label htmlFor="page-slug" className="block text-sm font-medium text-light-text mb-2">
              URL-Slug
            </label>
            <input
              id="page-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              placeholder="z.B. startseite"
              required
            />
            <p className="text-xs text-light-muted mt-1">Die Seite wird unter /{slug} erreichbar sein</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-light-text bg-dark-panel hover:bg-dark-hover rounded transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-brand-primary hover:bg-primary-600 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Speichern...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
