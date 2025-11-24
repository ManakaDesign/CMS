import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import {
  FiMenu,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiMoreVertical,
  FiEye,
  FiEyeOff,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import { MenuNav, MenuDesignSettings } from '../types';
import { MenuDesignTab } from '../components/Menu/MenuDesignTab';
import { MenuPreview } from '../components/Menu/MenuPreview';
import api from '../services/api';

export const Menu: React.FC = () => {
  const [menus, setMenus] = useState<MenuNav[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<MenuNav | null>(null);
  const [activeTab, setActiveTab] = useState<'structure' | 'design'>('structure');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/menus');
      setMenus(response.data);
      if (response.data.length > 0 && !selectedMenu) {
        setSelectedMenu(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMenu = async () => {
    if (!newMenuName.trim()) return;

    try {
      const response = await api.post('/api/menus', {
        name: newMenuName,
        is_active: true,
      });
      setMenus([...menus, response.data]);
      setSelectedMenu(response.data);
      setNewMenuName('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create menu:', error);
    }
  };

  const handleDeleteMenu = async (menuId: number) => {
    if (!confirm('Möchten Sie dieses Menü wirklich löschen?')) return;

    try {
      await api.delete(`/api/menus/${menuId}`);
      setMenus(menus.filter((m) => m.id !== menuId));
      if (selectedMenu?.id === menuId) {
        setSelectedMenu(menus[0] || null);
      }
    } catch (error) {
      console.error('Failed to delete menu:', error);
    }
  };

  const handleDuplicateMenu = async (menuId: number) => {
    try {
      const response = await api.post(`/api/menus/${menuId}/duplicate`);
      setMenus([...menus, response.data]);
    } catch (error) {
      console.error('Failed to duplicate menu:', error);
    }
  };

  const handleUpdateMenuDesign = async (designSettings: Partial<MenuDesignSettings>) => {
    if (!selectedMenu) return;

    try {
      const response = await api.put(`/api/menus/${selectedMenu.id}`, {
        design_settings: {
          ...selectedMenu.design_settings,
          ...designSettings,
        },
      });
      setSelectedMenu(response.data);
      setMenus(menus.map((m) => (m.id === response.data.id ? response.data : m)));
    } catch (error) {
      console.error('Failed to update menu design:', error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-light-muted">Lade Menüs...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex h-full">
        {/* Left Sidebar - Menu List */}
        <div className="w-80 bg-dark-surface border-r border-dark-border flex flex-col">
          <div className="p-4 border-b border-dark-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-light-text">Menüs</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="p-2 bg-brand-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
                title="Neues Menü erstellen"
              >
                <FiPlus size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {menus.length === 0 ? (
              <div className="p-6 text-center text-light-muted">
                <FiMenu className="mx-auto mb-3" size={48} />
                <p>Keine Menüs vorhanden</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 bg-brand-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Erstes Menü erstellen
                </button>
              </div>
            ) : (
              <div className="p-2">
                {menus.map((menu) => (
                  <div
                    key={menu.id}
                    onClick={() => setSelectedMenu(menu)}
                    className={`
                      group p-3 mb-2 rounded-lg cursor-pointer transition-all
                      ${
                        selectedMenu?.id === menu.id
                          ? 'bg-brand-primary/10 border border-brand-primary'
                          : 'bg-dark-panel hover:bg-dark-panel/80 border border-dark-border'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-light-text truncate">
                            {menu.name}
                          </h3>
                          {!menu.is_active && (
                            <FiEyeOff className="text-light-muted flex-shrink-0" size={14} />
                          )}
                        </div>
                        {menu.location && (
                          <p className="text-xs text-light-muted mt-1">{menu.location}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateMenu(menu.id);
                          }}
                          className="p-1 hover:bg-dark-surface rounded transition-colors"
                          title="Duplizieren"
                        >
                          <FiCopy className="text-light-muted" size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMenu(menu.id);
                          }}
                          className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-colors"
                          title="Löschen"
                        >
                          <FiTrash2 className="text-light-muted" size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center - Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedMenu ? (
            <>
              {/* Header with Tabs */}
              <div className="bg-dark-surface border-b border-dark-border">
                <div className="px-6 py-4 border-b border-dark-border">
                  <h1 className="text-xl font-bold text-light-text">{selectedMenu.name}</h1>
                  {selectedMenu.description && (
                    <p className="text-sm text-light-muted mt-1">{selectedMenu.description}</p>
                  )}
                </div>
                <div className="flex gap-2 px-6">
                  <button
                    onClick={() => setActiveTab('structure')}
                    className={`
                      px-6 py-3 font-medium transition-all border-b-2
                      ${
                        activeTab === 'structure'
                          ? 'text-brand-primary border-brand-primary'
                          : 'text-light-muted border-transparent hover:text-light-text'
                      }
                    `}
                  >
                    Menü-Struktur
                  </button>
                  <button
                    onClick={() => setActiveTab('design')}
                    className={`
                      px-6 py-3 font-medium transition-all border-b-2
                      ${
                        activeTab === 'design'
                          ? 'text-brand-primary border-brand-primary'
                          : 'text-light-muted border-transparent hover:text-light-text'
                      }
                    `}
                  >
                    Menü-Design
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'structure' ? (
                  <MenuStructureTab menu={selectedMenu} onUpdate={loadMenus} />
                ) : (
                  <MenuDesignTab
                    menu={selectedMenu}
                    onUpdate={handleUpdateMenuDesign}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-light-muted">
                <FiMenu className="mx-auto mb-4" size={64} />
                <p>Wählen Sie ein Menü aus oder erstellen Sie ein neues</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Live Preview (Always Visible) */}
        {selectedMenu && (
          <div className="w-96 bg-dark-surface border-l border-dark-border flex flex-col">
            <div className="p-4 border-b border-dark-border">
              <h3 className="text-lg font-semibold text-light-text flex items-center gap-2">
                <FiEye />
                Live-Vorschau
              </h3>
              <p className="text-xs text-light-muted mt-1">
                Vorschau aktualisiert sich automatisch
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <MenuPreview menu={selectedMenu} />
            </div>
          </div>
        )}
      </div>

      {/* Create Menu Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-panel border border-dark-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-light-text mb-4">Neues Menü erstellen</h3>
            <input
              type="text"
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateMenu()}
              placeholder="Menü-Name"
              className="w-full px-4 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text placeholder-light-muted focus:outline-none focus:border-brand-primary"
              autoFocus
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-dark-surface hover:bg-dark-surface/80 text-light-text rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleCreateMenu}
                disabled={!newMenuName.trim()}
                className="flex-1 px-4 py-2 bg-brand-primary hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

// Placeholder components - will be implemented next
const MenuStructureTab: React.FC<{ menu: MenuNav; onUpdate: () => void }> = ({ menu }) => {
  return (
    <div className="bg-dark-panel border border-dark-border rounded-lg p-8 text-center">
      <FiMenu className="mx-auto text-light-muted mb-4" size={48} />
      <h3 className="text-lg font-semibold text-light-text mb-2">Menü-Struktur</h3>
      <p className="text-light-muted mb-4">
        Hier können Sie die Struktur Ihres Menüs mit Drag & Drop bearbeiten
      </p>
      <p className="text-sm text-light-muted">
        Wird in Kürze implementiert...
      </p>
    </div>
  );
};
