import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import {
  FiMenu,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiSettings,
  FiEye,
  FiMoreVertical,
} from 'react-icons/fi';
import type { Menu as MenuType } from '../types';

type TabType = 'structure' | 'design';

export const Menu: React.FC = () => {
  const [menus, setMenus] = useState<MenuType[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuType | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('structure');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implement API call when backend is ready
      // const response = await menusApi.list();
      // setMenus(response.data);
      // if (response.data.length > 0) {
      //   setSelectedMenu(response.data[0]);
      // }
      setMenus([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Laden der Menüs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMenu = () => {
    setShowCreateDialog(true);
  };

  const handleSelectMenu = (menu: MenuType) => {
    setSelectedMenu(menu);
  };

  const handleDeleteMenu = async (menu: MenuType) => {
    if (!confirm(`Möchtest du das Menü "${menu.name}" wirklich löschen?`)) {
      return;
    }

    try {
      // TODO: Implement API call
      // await menusApi.delete(menu.id);
      await loadMenus();
    } catch (err: any) {
      alert('Fehler: ' + (err.response?.data?.message || 'Unbekannter Fehler'));
    }
  };

  const handleDuplicateMenu = async (menu: MenuType) => {
    try {
      // TODO: Implement API call
      // await menusApi.duplicate(menu.id);
      await loadMenus();
    } catch (err: any) {
      alert('Fehler: ' + (err.response?.data?.message || 'Unbekannter Fehler'));
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="bg-dark-surface border-b border-dark-border">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-light-text">Menü</h1>
            <p className="text-sm text-light-muted mt-1">
              Erstelle und verwalte Navigationsmenüs
            </p>
          </div>
          <button
            onClick={handleCreateMenu}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <FiPlus size={18} />
            Neues Menü
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Menu List */}
        <aside className="w-64 bg-dark-surface border-r border-dark-border overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-light-muted uppercase tracking-wider mb-3">
              Menüs
            </h2>
            {loading ? (
              <div className="text-light-muted text-sm">Laden...</div>
            ) : error ? (
              <div className="text-red-400 text-sm">{error}</div>
            ) : menus.length === 0 ? (
              <div className="text-light-muted text-sm">
                Keine Menüs vorhanden.
                <br />
                Erstelle dein erstes Menü!
              </div>
            ) : (
              <div className="space-y-2">
                {menus.map((menu) => (
                  <div
                    key={menu.id}
                    className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedMenu?.id === menu.id
                        ? 'bg-brand-primary/10 border border-brand-primary/30'
                        : 'bg-dark-panel border border-dark-border hover:bg-dark-hover'
                    }`}
                    onClick={() => handleSelectMenu(menu)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-light-text truncate">
                        {menu.name}
                      </h3>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-hover rounded transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Show context menu
                        }}
                      >
                        <FiMoreVertical size={16} className="text-light-muted" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-light-muted">
                      <span>{menu.location || 'Kein Standort'}</span>
                      <span>•</span>
                      <span className={menu.is_active ? 'text-green-400' : 'text-gray-400'}>
                        {menu.is_active ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedMenu ? (
            <>
              {/* Tabs */}
              <div className="bg-dark-surface border-b border-dark-border">
                <div className="px-6">
                  <nav className="flex gap-4">
                    <button
                      onClick={() => setActiveTab('structure')}
                      className={`px-4 py-3 border-b-2 font-medium transition-colors ${
                        activeTab === 'structure'
                          ? 'border-brand-primary text-brand-primary'
                          : 'border-transparent text-light-muted hover:text-light-text'
                      }`}
                    >
                      Menü-Struktur
                    </button>
                    <button
                      onClick={() => setActiveTab('design')}
                      className={`px-4 py-3 border-b-2 font-medium transition-colors ${
                        activeTab === 'design'
                          ? 'border-brand-primary text-brand-primary'
                          : 'border-transparent text-light-muted hover:text-light-text'
                      }`}
                    >
                      Menü-Design
                    </button>
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 flex overflow-hidden">
                {/* Editor Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {activeTab === 'structure' ? (
                    <div className="max-w-4xl">
                      <h2 className="text-xl font-semibold text-light-text mb-4">
                        Menü-Struktur
                      </h2>
                      <div className="bg-dark-panel border border-dark-border rounded-lg p-8 text-center">
                        <FiMenu className="mx-auto text-light-muted mb-3" size={48} />
                        <p className="text-light-muted">
                          Drag & Drop Tree wird implementiert...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-4xl">
                      <h2 className="text-xl font-semibold text-light-text mb-4">
                        Menü-Design
                      </h2>
                      <div className="bg-dark-panel border border-dark-border rounded-lg p-8 text-center">
                        <FiSettings className="mx-auto text-light-muted mb-3" size={48} />
                        <p className="text-light-muted">
                          Design-Optionen werden implementiert...
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Preview - Always Visible */}
                {showPreview && (
                  <aside className="w-96 bg-dark-surface border-l border-dark-border overflow-y-auto">
                    <div className="sticky top-0 bg-dark-surface border-b border-dark-border p-4 flex items-center justify-between">
                      <h3 className="font-semibold text-light-text">Vorschau</h3>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="p-1 hover:bg-dark-hover rounded transition-colors"
                      >
                        <FiEye size={18} className="text-light-muted" />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="bg-dark-panel border border-dark-border rounded-lg p-6 text-center">
                        <p className="text-light-muted text-sm">
                          Live-Vorschau wird hier angezeigt
                        </p>
                      </div>
                    </div>
                  </aside>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FiMenu className="mx-auto text-light-muted mb-4" size={64} />
                <h2 className="text-xl font-semibold text-light-text mb-2">
                  Kein Menü ausgewählt
                </h2>
                <p className="text-light-muted mb-6">
                  Wähle ein Menü aus der Liste oder erstelle ein neues
                </p>
                <button
                  onClick={handleCreateMenu}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <FiPlus size={18} />
                  Neues Menü erstellen
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </MainLayout>
  );
};
