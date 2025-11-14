import React, { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { HexColorPicker } from 'react-colorful';

export const GlobalSettings: React.FC = () => {
  const { globalColors, addGlobalColor, updateGlobalColor, deleteGlobalColor, elements, updateElement } = useBuilderStore();
  const [newColorName, setNewColorName] = useState('');
  const [newColorValue, setNewColorValue] = useState('#000000');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const handleAddColor = () => {
    if (!newColorName.trim()) return;

    addGlobalColor({
      name: newColorName.trim(),
      value: newColorValue,
    });

    setNewColorName('');
    setNewColorValue('#000000');
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editingName.trim()) {
      updateGlobalColor(id, { name: editingName.trim() });
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleColorChange = (id: string, newValue: string) => {
    // Find the old color value
    const oldColor = globalColors.find(c => c.id === id);
    if (!oldColor) return;

    const oldValue = oldColor.value.toLowerCase();

    // Update the global color
    updateGlobalColor(id, { value: newValue });

    // Update all elements that use this color
    elements.forEach((element) => {
      let needsUpdate = false;
      const updatedElement = { ...element };

      // Check all breakpoints (desktop, tablet, mobile)
      const breakpoints = ['desktop', 'tablet', 'mobile'] as const;

      breakpoints.forEach((breakpoint) => {
        const styles = element.styles[breakpoint] || {};
        const updatedStyles = { ...styles } as any;
        let stylesChanged = false;

        // Check all style properties that could contain colors
        const colorProps = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'];

        colorProps.forEach((prop) => {
          const styleValue = (styles as any)[prop];
          if (styleValue?.toLowerCase && styleValue.toLowerCase() === oldValue) {
            updatedStyles[prop] = newValue;
            stylesChanged = true;
          }
        });

        if (stylesChanged) {
          if (!updatedElement.styles) updatedElement.styles = {};
          updatedElement.styles[breakpoint] = updatedStyles;
          needsUpdate = true;
        }

        // Also check hover styles
        if ((element as any).hoverStyles) {
          const hoverStyles = (element as any).hoverStyles[breakpoint] || {};
          const updatedHoverStyles = { ...hoverStyles } as any;
          let hoverStylesChanged = false;

          colorProps.forEach((prop) => {
            const hoverValue = (hoverStyles as any)[prop];
            if (hoverValue?.toLowerCase && hoverValue.toLowerCase() === oldValue) {
              updatedHoverStyles[prop] = newValue;
              hoverStylesChanged = true;
            }
          });

          if (hoverStylesChanged) {
            if (!(updatedElement as any).hoverStyles) (updatedElement as any).hoverStyles = {};
            (updatedElement as any).hoverStyles[breakpoint] = updatedHoverStyles;
            needsUpdate = true;
          }
        }
      });

      // Check column styles for rows
      if (element.type === 'row' && element.settings.columnStyles) {
        const columnStyles = element.settings.columnStyles as any[];
        const updatedColumnStyles = columnStyles.map(colStyle => {
          if (!colStyle) return colStyle;
          const updated = { ...colStyle };
          let changed = false;

          if (colStyle.backgroundColor?.toLowerCase() === oldValue) {
            updated.backgroundColor = newValue;
            changed = true;
          }

          return changed ? updated : colStyle;
        });

        if (JSON.stringify(updatedColumnStyles) !== JSON.stringify(columnStyles)) {
          if (!updatedElement.settings) updatedElement.settings = {};
          updatedElement.settings.columnStyles = updatedColumnStyles;
          needsUpdate = true;
        }
      }

      // Check gradient backgrounds
      if (element.settings.backgroundGradient) {
        const gradient = element.settings.backgroundGradient as any;
        let gradientChanged = false;
        const updatedGradient = { ...gradient };

        if (gradient.color1?.toLowerCase() === oldValue) {
          updatedGradient.color1 = newValue;
          gradientChanged = true;
        }
        if (gradient.color2?.toLowerCase() === oldValue) {
          updatedGradient.color2 = newValue;
          gradientChanged = true;
        }

        if (gradientChanged) {
          if (!updatedElement.settings) updatedElement.settings = {};
          updatedElement.settings.backgroundGradient = updatedGradient;
          needsUpdate = true;
        }
      }

      // Check column gradient backgrounds for rows
      if (element.type === 'row' && element.settings.columnBackgrounds) {
        const columnBgs = element.settings.columnBackgrounds as any[];
        const updatedColumnBgs = columnBgs.map(colBg => {
          if (!colBg) return colBg;
          const updated = { ...colBg };
          let changed = false;

          if (colBg.gradientColor1?.toLowerCase() === oldValue) {
            updated.gradientColor1 = newValue;
            changed = true;
          }
          if (colBg.gradientColor2?.toLowerCase() === oldValue) {
            updated.gradientColor2 = newValue;
            changed = true;
          }

          return changed ? updated : colBg;
        });

        if (JSON.stringify(updatedColumnBgs) !== JSON.stringify(columnBgs)) {
          if (!updatedElement.settings) updatedElement.settings = {};
          updatedElement.settings.columnBackgrounds = updatedColumnBgs;
          needsUpdate = true;
        }
      }

      // Update the element if any changes were made
      if (needsUpdate) {
        updateElement(element.id, updatedElement);
      }
    });
  };

  return (
    <div className="h-full flex flex-col bg-dark-surface">
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <h2 className="text-lg font-semibold text-light-text">Globale Einstellungen</h2>
        <p className="text-xs text-light-muted mt-1">Projekt-weite Farben und Einstellungen</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Global Colors Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-light-text mb-3">Globale Farben</h3>
          <p className="text-xs text-light-muted mb-4">
            Diese Farben stehen in allen Farbwählern zur Verfügung
          </p>

          {/* Add New Color */}
          <div className="bg-dark-panel border border-dark-border rounded-lg p-3 mb-4">
            <label className="block text-xs font-medium text-light-text mb-2">
              Neue Farbe hinzufügen
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddColor()}
                placeholder="Farbname (z.B. Primary Blue)"
                className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              />
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={newColorValue}
                  onChange={(e) => setNewColorValue(e.target.value)}
                  className="w-16 h-10 border border-dark-border rounded cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={newColorValue}
                  onChange={(e) => setNewColorValue(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border rounded text-sm text-light-text placeholder-light-muted font-mono"
                />
              </div>
              <button
                onClick={handleAddColor}
                disabled={!newColorName.trim()}
                className="w-full px-4 py-2 bg-brand-primary text-white rounded hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FiPlus size={16} />
                Hinzufügen
              </button>
            </div>
          </div>

          {/* Color List */}
          <div className="space-y-2">
            {globalColors.length === 0 ? (
              <div className="text-center py-8 text-light-muted text-sm">
                Noch keine globalen Farben definiert
              </div>
            ) : (
              globalColors.map((color) => (
                <div
                  key={color.id}
                  className="bg-dark-panel border border-dark-border rounded-lg p-3 hover:border-brand-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Color Preview */}
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(showColorPicker === color.id ? null : color.id)}
                        className="w-12 h-12 rounded border-2 border-dark-border hover:border-brand-primary transition-colors"
                        style={{ backgroundColor: color.value }}
                        title="Farbe ändern"
                      />
                      {showColorPicker === color.id && (
                        <div className="absolute z-10 mt-2 left-0">
                          <div
                            className="fixed inset-0"
                            onClick={() => setShowColorPicker(null)}
                          />
                          <div className="relative bg-dark-surface border border-dark-border rounded-lg p-3 shadow-xl">
                            <HexColorPicker
                              color={color.value}
                              onChange={(newValue) => handleColorChange(color.id, newValue)}
                            />
                            <input
                              type="text"
                              value={color.value}
                              onChange={(e) => handleColorChange(color.id, e.target.value)}
                              className="w-full mt-2 px-2 py-1 bg-dark-bg border border-dark-border rounded text-xs text-light-text font-mono"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Color Info */}
                    <div className="flex-1">
                      {editingId === color.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(color.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="w-full px-2 py-1 bg-dark-bg border border-brand-primary rounded text-sm text-light-text"
                          autoFocus
                        />
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-light-text">{color.name}</div>
                          <div className="text-xs text-light-muted font-mono">{color.value}</div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {editingId === color.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(color.id)}
                            className="p-2 text-green-400 hover:bg-dark-hover rounded transition-colors"
                            title="Speichern"
                          >
                            <FiCheck size={16} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-2 text-light-muted hover:bg-dark-hover rounded transition-colors"
                            title="Abbrechen"
                          >
                            <FiX size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleStartEdit(color.id, color.name)}
                            className="p-2 text-light-muted hover:text-light-text hover:bg-dark-hover rounded transition-colors"
                            title="Namen bearbeiten"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Möchtest du die Farbe "${color.name}" wirklich löschen?`)) {
                                deleteGlobalColor(color.id);
                              }
                            }}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                            title="Löschen"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Future sections can be added here */}
        <div className="border-t border-dark-border pt-4">
          <p className="text-xs text-light-muted italic">
            Weitere globale Einstellungen werden hier hinzugefügt...
          </p>
        </div>
      </div>
    </div>
  );
};
