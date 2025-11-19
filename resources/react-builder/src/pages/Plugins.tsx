import React from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { FiPackage } from 'react-icons/fi';

export const Plugins: React.FC = () => {
  return (
    <MainLayout>
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-light-text">Plugins</h1>
          <p className="text-sm text-light-muted mt-1">Aktiviere und verwalte Plugins</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="bg-dark-panel border border-dark-border rounded-lg p-12 text-center">
          <FiPackage className="mx-auto text-light-muted mb-4" size={64} />
          <h2 className="text-xl font-semibold text-light-text mb-2">Plugin-Verwaltung</h2>
          <p className="text-light-muted mb-4">
            Installiere und aktiviere Plugins um das CMS zu erweitern
          </p>
          <p className="text-sm text-light-muted">
            Features: Plugin-Liste, Aktivierung/Deaktivierung, Konfiguration
          </p>
          <p className="text-sm text-light-muted mt-2">Wird in Kürze implementiert</p>
        </div>
      </main>
    </MainLayout>
  );
};
