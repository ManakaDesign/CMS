import React from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { FiFileText, FiImage, FiUsers, FiPackage } from 'react-icons/fi';

export const Dashboard: React.FC = () => {
  // Placeholder stats - will be replaced with real data
  const stats = [
    { label: 'Seiten', value: '12', icon: FiFileText, color: 'text-blue-400' },
    { label: 'Media Dateien', value: '45', icon: FiImage, color: 'text-green-400' },
    { label: 'Benutzer', value: '3', icon: FiUsers, color: 'text-purple-400' },
    { label: 'Aktive Plugins', value: '8', icon: FiPackage, color: 'text-orange-400' },
  ];

  return (
    <MainLayout>
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-light-text">Dashboard</h1>
          <p className="text-sm text-light-muted mt-1">Willkommen im CMS Dashboard</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-dark-panel border border-dark-border rounded-lg p-6 hover:border-brand-primary transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`${stat.color}`} size={32} />
                </div>
                <div className="text-3xl font-bold text-light-text mb-1">{stat.value}</div>
                <div className="text-sm text-light-muted">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-panel border border-dark-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-light-text mb-4">Letzte Aktivitäten</h2>
          <div className="text-center py-12 text-light-muted">
            <p>Aktivitätsverlauf wird hier angezeigt</p>
            <p className="text-sm mt-2">Wird in späteren Versionen implementiert</p>
          </div>
        </div>
      </main>
    </MainLayout>
  );
};
