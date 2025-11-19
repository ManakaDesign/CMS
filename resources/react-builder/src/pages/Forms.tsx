import React from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { FiClipboard, FiPlus } from 'react-icons/fi';

export const Forms: React.FC = () => {
  return (
    <MainLayout>
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-light-text">Formulare</h1>
          <p className="text-sm text-light-muted mt-1">Erstelle und verwalte Formulare</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Action Bar */}
        <div className="mb-6">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
            <FiPlus size={18} />
            Neues Formular
          </button>
        </div>

        <div className="bg-dark-panel border border-dark-border rounded-lg p-12 text-center">
          <FiClipboard className="mx-auto text-light-muted mb-4" size={64} />
          <h2 className="text-xl font-semibold text-light-text mb-2">Formular-Editor</h2>
          <p className="text-light-muted mb-4">
            Erstelle Kontaktformulare, Umfragen und mehr
          </p>
          <p className="text-sm text-light-muted">
            Features: Drag & Drop Editor, Feldtypen, Validierung, E-Mail-Benachrichtigungen
          </p>
          <p className="text-sm text-light-muted mt-2">Wird in Kürze implementiert</p>
        </div>
      </main>
    </MainLayout>
  );
};
