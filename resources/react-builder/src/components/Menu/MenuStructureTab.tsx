import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMove,
  FiChevronDown,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiLink,
  FiFile,
  FiGrid,
} from 'react-icons/fi';
import type { MenuNav, MenuItemNav, Page } from '../../types';
import api from '../../services/api';

interface MenuStructureTabProps {
  menu: MenuNav;
  onUpdate: () => void;
}

export const MenuStructureTab: React.FC<MenuStructureTabProps> = ({ menu, onUpdate }) => {
  const [items, setItems] = useState<MenuItemNav[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [draggedItem, setDraggedItem] = useState<MenuItemNav | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);

  // Modals
  const [showAddPagesModal, setShowAddPagesModal] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemNav | null>(null);

  useEffect(() => {
    loadData();
  }, [menu.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [itemsRes, pagesRes] = await Promise.all([
        api.get(`/menu-items?menu_id=${menu.id}`),
        api.get('/pages'),
      ]);
      setItems(itemsRes.data);
      // Handle paginated response from Laravel
      setPages(Array.isArray(pagesRes.data) ? pagesRes.data : (pagesRes.data.data || []));

      // Auto-expand all items initially
      const allIds = new Set<number>(itemsRes.data.map((item: MenuItemNav) => item.id));
      setExpandedIds(allIds);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleDeleteItem = async (item: MenuItemNav) => {
    if (!confirm(`"${item.label}" wirklich löschen?`)) return;

    try {
      await api.delete(`/menu-items/${item.id}`);
      await loadData();
      onUpdate();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const handleToggleVisibility = async (item: MenuItemNav) => {
    try {
      await api.put(`/menu-items/${item.id}`, {
        is_visible: !item.is_visible,
      });
      await loadData();
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: MenuItemNav) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(targetId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetItem: MenuItemNav | null) => {
    e.preventDefault();
    setDragOverId(null);

    if (!draggedItem) return;

    try {
      // Move item under target (or to root if target is null)
      await api.put(`/menu-items/${draggedItem.id}`, {
        parent_id: targetItem?.id || null,
      });
      await loadData();
      onUpdate();
    } catch (error) {
      console.error('Failed to move item:', error);
    }

    setDraggedItem(null);
  };

  const buildTree = (parentId: number | null = null): MenuItemNav[] => {
    return items
      .filter((item) => item.parent_id === parentId)
      .sort((a, b) => a.order - b.order);
  };

  const renderMenuItem = (item: MenuItemNav, depth: number = 0) => {
    const hasChildren = items.some((i) => i.parent_id === item.id);
    const isExpanded = expandedIds.has(item.id);
    const isDraggedOver = dragOverId === item.id;
    const isDragging = draggedItem?.id === item.id;

    return (
      <div key={item.id} className={isDragging ? 'opacity-50' : ''}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={(e) => handleDragOver(e, item.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item)}
          className={`
            group flex items-center gap-2 px-3 py-2 rounded-lg cursor-move transition-all
            ${isDraggedOver ? 'bg-brand-primary/20 border-2 border-brand-primary' : 'border-2 border-transparent'}
            hover:bg-dark-surface
          `}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpanded(item.id)}
            className="p-1 hover:bg-dark-panel rounded transition-colors"
            style={{ visibility: hasChildren ? 'visible' : 'hidden' }}
          >
            {isExpanded ? (
              <FiChevronDown className="text-light-muted" size={16} />
            ) : (
              <FiChevronRight className="text-light-muted" size={16} />
            )}
          </button>

          {/* Drag Handle */}
          <FiMove className="text-light-muted flex-shrink-0" size={14} />

          {/* Icon */}
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            {item.type === 'page' && <FiFile className="text-light-muted" size={14} />}
            {item.type === 'custom' && <FiLink className="text-light-muted" size={14} />}
            {item.type === 'group' && <FiGrid className="text-light-muted" size={14} />}
          </div>

          {/* Label */}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-light-text truncate">{item.label}</div>
            {item.page && (
              <div className="text-xs text-light-muted truncate">→ {item.page.slug}</div>
            )}
            {item.url && (
              <div className="text-xs text-light-muted truncate">→ {item.url}</div>
            )}
          </div>

          {/* Type Badge */}
          <span className="px-2 py-0.5 bg-dark-surface text-light-muted text-xs rounded flex-shrink-0">
            {item.type}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleToggleVisibility(item)}
              className="p-1 hover:bg-dark-panel rounded transition-colors"
              title={item.is_visible ? 'Ausblenden' : 'Einblenden'}
            >
              {item.is_visible ? (
                <FiEye className="text-light-muted" size={14} />
              ) : (
                <FiEyeOff className="text-light-muted" size={14} />
              )}
            </button>
            <button
              onClick={() => setEditingItem(item)}
              className="p-1 hover:bg-dark-panel rounded transition-colors"
              title="Bearbeiten"
            >
              <FiEdit2 className="text-light-muted" size={14} />
            </button>
            <button
              onClick={() => handleDeleteItem(item)}
              className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-colors"
              title="Löschen"
            >
              <FiTrash2 className="text-light-muted" size={14} />
            </button>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div>
            {buildTree(item.id).map((child) => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-light-muted">Lade Menü-Struktur...</div>
      </div>
    );
  }

  const rootItems = buildTree(null);

  return (
    <div className="max-w-5xl">
      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setShowAddPagesModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <FiPlus size={18} />
          Seiten hinzufügen
        </button>
        <button
          onClick={() => setShowAddLinkModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-dark-surface hover:bg-dark-surface/80 text-light-text border border-dark-border rounded-lg transition-colors"
        >
          <FiLink size={18} />
          Link hinzufügen
        </button>
      </div>

      {/* Menu Items Tree */}
      <div className="bg-dark-panel border border-dark-border rounded-lg p-4">
        {rootItems.length === 0 ? (
          <div className="text-center py-12">
            <FiGrid className="mx-auto text-light-muted mb-3" size={48} />
            <p className="text-light-muted mb-4">Keine Menü-Elemente vorhanden</p>
            <p className="text-sm text-light-muted">
              Fügen Sie Seiten hinzu oder erstellen Sie eigene Links
            </p>
          </div>
        ) : (
          <div
            className="space-y-1"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverId(null);
            }}
            onDrop={(e) => handleDrop(e, null)}
          >
            {rootItems.map((item) => renderMenuItem(item, 0))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-4 p-4 bg-dark-panel border border-dark-border rounded-lg">
        <div className="text-sm text-light-muted space-y-2">
          <p>
            <strong className="text-light-text">💡 Tipp:</strong> Ziehen Sie Menü-Elemente per
            Drag & Drop, um die Hierarchie zu ändern.
          </p>
          <p>
            Ziehen Sie ein Element auf ein anderes, um es als Untermenü hinzuzufügen. Ziehen Sie
            es in den leeren Bereich unten, um es zur Hauptebene zu verschieben.
          </p>
        </div>
      </div>

      {/* Modals */}
      {showAddPagesModal && (
        <AddPagesModal
          menu={menu}
          pages={pages}
          existingItems={items}
          onClose={() => setShowAddPagesModal(false)}
          onSuccess={() => {
            loadData();
            onUpdate();
            setShowAddPagesModal(false);
          }}
        />
      )}

      {showAddLinkModal && (
        <AddLinkModal
          menu={menu}
          onClose={() => setShowAddLinkModal(false)}
          onSuccess={() => {
            loadData();
            onUpdate();
            setShowAddLinkModal(false);
          }}
        />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            loadData();
            onUpdate();
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

// Add Pages Modal Component
const AddPagesModal: React.FC<{
  menu: MenuNav;
  pages: Page[];
  existingItems: MenuItemNav[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ menu, pages, existingItems, onClose, onSuccess }) => {
  const [selectedPageIds, setSelectedPageIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out pages that are already in the menu
  const existingPageIds = new Set(existingItems.map((item) => item.page_id).filter(Boolean));
  const availablePages = pages.filter((page) => !existingPageIds.has(page.id));

  const togglePage = (pageId: number) => {
    setSelectedPageIds((prev) =>
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
    );
  };

  const handleSubmit = async () => {
    if (selectedPageIds.length === 0) return;

    try {
      setIsSubmitting(true);
      await api.post('/menu-items/bulk-from-pages', {
        menu_id: menu.id,
        page_ids: selectedPageIds,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to add pages:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-panel border border-dark-border rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-dark-border">
          <h3 className="text-lg font-semibold text-light-text">Seiten hinzufügen</h3>
          <p className="text-sm text-light-muted mt-1">
            Wählen Sie die Seiten aus, die Sie zum Menü hinzufügen möchten
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {availablePages.length === 0 ? (
            <div className="text-center py-8 text-light-muted">
              Alle Seiten sind bereits im Menü enthalten
            </div>
          ) : (
            <div className="space-y-2">
              {availablePages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => togglePage(page.id)}
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${
                      selectedPageIds.includes(page.id)
                        ? 'border-brand-primary bg-brand-primary/10'
                        : 'border-dark-border bg-dark-surface hover:border-dark-border/60'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                      w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                      ${
                        selectedPageIds.includes(page.id)
                          ? 'border-brand-primary bg-brand-primary'
                          : 'border-dark-border'
                      }
                    `}
                    >
                      {selectedPageIds.includes(page.id) && (
                        <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-light-text">{page.title}</div>
                      <div className="text-xs text-light-muted mt-1">/{page.slug}</div>
                      {page.status === 'draft' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded">
                          Entwurf
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-dark-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-dark-surface hover:bg-dark-surface/80 text-light-text rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedPageIds.length === 0 || isSubmitting}
            className="flex-1 px-4 py-2 bg-brand-primary hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Wird hinzugefügt...'
              : `${selectedPageIds.length} Seite${selectedPageIds.length !== 1 ? 'n' : ''} hinzufügen`}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Link Modal Component
const AddLinkModal: React.FC<{
  menu: MenuNav;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ menu, onClose, onSuccess }) => {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [target, setTarget] = useState<'_self' | '_blank'>('_self');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!label.trim() || !url.trim()) return;

    try {
      setIsSubmitting(true);
      await api.post('/menu-items', {
        menu_id: menu.id,
        label: label.trim(),
        url: url.trim(),
        type: 'custom',
        target,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to add link:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-panel border border-dark-border rounded-lg w-full max-w-md">
        <div className="p-6 border-b border-dark-border">
          <h3 className="text-lg font-semibold text-light-text">Link hinzufügen</h3>
          <p className="text-sm text-light-muted mt-1">Erstellen Sie einen benutzerdefinierten Link</p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">Link-Text</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="z.B. Kontakt"
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text placeholder-light-muted focus:outline-none focus:border-brand-primary"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text mb-2">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com oder /seite"
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text placeholder-light-muted focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-text mb-2">Ziel</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as '_self' | '_blank')}
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
            >
              <option value="_self">Gleiches Fenster</option>
              <option value="_blank">Neues Fenster</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-dark-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-dark-surface hover:bg-dark-surface/80 text-light-text rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={!label.trim() || !url.trim() || isSubmitting}
            className="flex-1 px-4 py-2 bg-brand-primary hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Wird hinzugefügt...' : 'Hinzufügen'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Item Modal Component
const EditItemModal: React.FC<{
  item: MenuItemNav;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ item, onClose, onSuccess }) => {
  const [label, setLabel] = useState(item.label);
  const [url, setUrl] = useState(item.url || '');
  const [target, setTarget] = useState<'_self' | '_blank'>(item.target);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!label.trim()) return;

    try {
      setIsSubmitting(true);
      await api.put(`/menu-items/${item.id}`, {
        label: label.trim(),
        url: url.trim() || null,
        target,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to update item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-panel border border-dark-border rounded-lg w-full max-w-md">
        <div className="p-6 border-b border-dark-border">
          <h3 className="text-lg font-semibold text-light-text">Menü-Element bearbeiten</h3>
          <p className="text-sm text-light-muted mt-1">
            Typ: {item.type} {item.page && `(${item.page.title})`}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">Link-Text</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text placeholder-light-muted focus:outline-none focus:border-brand-primary"
              autoFocus
            />
          </div>

          {item.type === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-light-text mb-2">URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com oder /seite"
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text placeholder-light-muted focus:outline-none focus:border-brand-primary"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-light-text mb-2">Ziel</label>
            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as '_self' | '_blank')}
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
            >
              <option value="_self">Gleiches Fenster</option>
              <option value="_blank">Neues Fenster</option>
            </select>
          </div>
        </div>

        <div className="p-6 border-t border-dark-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-dark-surface hover:bg-dark-surface/80 text-light-text rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={!label.trim() || isSubmitting}
            className="flex-1 px-4 py-2 bg-brand-primary hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </div>
      </div>
    </div>
  );
};
