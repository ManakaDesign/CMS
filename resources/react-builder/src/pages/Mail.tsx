import React from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { FiMail, FiSettings } from 'react-icons/fi';

export const Mail: React.FC = () => {
  return (
    <MainLayout>
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-light-text">Mail</h1>
          <p className="text-sm text-light-muted mt-1">E-Mail-Einstellungen und SMTP-Konfiguration</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Quick Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* SMTP Configuration */}
          <div className="bg-dark-panel border border-dark-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiSettings className="text-brand-primary" size={24} />
              <h2 className="text-lg font-semibold text-light-text">SMTP-Konfiguration</h2>
            </div>
            <p className="text-sm text-light-muted mb-4">
              Konfiguriere deinen SMTP-Server für den E-Mail-Versand
            </p>
            <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
              SMTP einrichten
            </button>
          </div>

          {/* Mail Templates */}
          <div className="bg-dark-panel border border-dark-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiMail className="text-green-400" size={24} />
              <h2 className="text-lg font-semibold text-light-text">E-Mail-Vorlagen</h2>
            </div>
            <p className="text-sm text-light-muted mb-4">
              Verwalte E-Mail-Vorlagen für verschiedene Benachrichtigungen
            </p>
            <button className="px-4 py-2 bg-dark-surface border border-dark-border text-light-text rounded-lg hover:bg-dark-hover transition-colors text-sm">
              Vorlagen bearbeiten
            </button>
          </div>
        </div>

        {/* Detailed Settings */}
        <div className="bg-dark-panel border border-dark-border rounded-lg p-12 text-center">
          <FiMail className="mx-auto text-light-muted mb-4" size={64} />
          <h2 className="text-xl font-semibold text-light-text mb-2">E-Mail-Verwaltung</h2>
          <p className="text-light-muted mb-4">
            Konfiguriere E-Mail-Einstellungen, SMTP und Vorlagen
          </p>
          <p className="text-sm text-light-muted">
            Features: SMTP-Konfiguration, E-Mail-Vorlagen, Versandprotokoll
          </p>
          <p className="text-sm text-light-muted mt-2">Wird in Kürze implementiert</p>
        </div>
      </main>
    </MainLayout>
  );
};
