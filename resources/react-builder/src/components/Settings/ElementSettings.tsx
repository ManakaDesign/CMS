import React, { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { FiTrash2, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';
import { SpacingControl } from './SpacingControl';

export const ElementSettings: React.FC = () => {
  const { selectedElementId, getElementById, updateElement, deleteElement, duplicateElement, activeBreakpoint, elements } =
    useBuilderStore();

  const element = selectedElementId ? getElementById(selectedElementId) : null;
  const [styleMode, setStyleMode] = useState<'normal' | 'hover'>('normal');

  if (!element) {
    return (
      <div className="p-4 text-center text-light-muted">
        <p>Select an element to edit its settings</p>
      </div>
    );
  }

  const updateSetting = (key: string, value: any) => {
    updateElement(element.id, {
      settings: { ...element.settings, [key]: value },
    });
  };

  // Get current style value based on styleMode (normal or hover)
  const getStyleValue = (property: string): string => {
    if (styleMode === 'hover') {
      const hoverStyles = (element as any).hoverStyles || {};
      const breakpointStyles = hoverStyles[activeBreakpoint] || {};
      return (breakpointStyles as any)[property] || '';
    }
    const breakpointStyles = element.styles[activeBreakpoint] || {};
    return (breakpointStyles as any)[property] || '';
  };

  // Update style without auto-px (for onChange)
  const updateStyleDirect = (property: string, value: string, breakpoint: 'desktop' | 'tablet' | 'mobile' = 'desktop') => {
    if (styleMode === 'hover') {
      // Update hover styles
      const hoverStyles = (element as any).hoverStyles || {};
      updateElement(element.id, {
        hoverStyles: {
          ...hoverStyles,
          [breakpoint]: {
            ...hoverStyles[breakpoint],
            [property]: value,
          },
        },
      } as any);
    } else {
      // Update normal styles
      updateElement(element.id, {
        styles: {
          ...element.styles,
          [breakpoint]: {
            ...element.styles[breakpoint],
            [property]: value,
          },
        },
      });
    }
  };

  // Update style with auto-px (for onBlur)
  const updateStyle = (property: string, value: string, breakpoint: 'desktop' | 'tablet' | 'mobile' = 'desktop') => {
    // Auto-append 'px' if only a number is provided (for spacing/size properties)
    const spacingProps = ['padding', 'margin', 'width', 'height', 'fontSize', 'borderRadius', 'gap'];
    const needsPx = spacingProps.includes(property) && /^\d+$/.test(value.trim());
    const finalValue = needsPx ? `${value}px` : value;

    if (styleMode === 'hover') {
      // Update hover styles
      const hoverStyles = (element as any).hoverStyles || {};
      updateElement(element.id, {
        hoverStyles: {
          ...hoverStyles,
          [breakpoint]: {
            ...hoverStyles[breakpoint],
            [property]: finalValue,
          },
        },
      } as any);
    } else {
      // Update normal styles
      updateElement(element.id, {
        styles: {
          ...element.styles,
          [breakpoint]: {
            ...element.styles[breakpoint],
            [property]: finalValue,
          },
        },
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <h2 className="text-sm font-semibold text-light-text mb-3">Element Settings</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => duplicateElement(element.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-dark-panel hover:bg-dark-hover rounded transition-colors"
            title="Duplicate"
          >
            <FiCopy size={14} />
            Duplicate
          </button>
          <button
            onClick={() => updateElement(element.id, { is_visible: !element.is_visible })}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-dark-panel hover:bg-dark-hover rounded transition-colors"
            title={element.is_visible ? 'Hide' : 'Show'}
          >
            {element.is_visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
            {element.is_visible ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={() => deleteElement(element.id)}
            className="px-3 py-2 text-sm bg-red-900/20 text-red-400 hover:bg-red-900/30 rounded transition-colors"
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content Settings */}
      <div className="p-4 border-b border-dark-border">
        <h3 className="text-xs font-semibold text-light-muted uppercase mb-3">Content</h3>

        {/* Text/Heading Content */}
        {(element.type === 'text' || element.type === 'heading') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-light-text mb-2">Content</label>
            <textarea
              value={element.settings.content || ''}
              onChange={(e) => updateSetting('content', e.target.value)}
              className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm resize-none text-light-text placeholder-light-muted"
              rows={3}
            />
          </div>
        )}

        {/* Heading Tag */}
        {element.type === 'heading' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-light-text mb-2">Tag</label>
            <select
              value={element.settings.tag || 'h2'}
              onChange={(e) => updateSetting('tag', e.target.value)}
              className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
              <option value="h5">H5</option>
              <option value="h6">H6</option>
            </select>
          </div>
        )}

        {/* Button Settings */}
        {element.type === 'button' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Text</label>
              <input
                type="text"
                value={element.settings.text || ''}
                onChange={(e) => updateSetting('text', e.target.value)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">URL</label>
              <input
                type="text"
                value={element.settings.url || ''}
                onChange={(e) => updateSetting('url', e.target.value)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={element.settings.openInNewTab || false}
                  onChange={(e) => updateSetting('openInNewTab', e.target.checked)}
                  className="mr-2"
                />
                Open in new tab
              </label>
            </div>
          </>
        )}

        {/* Image Settings */}
        {element.type === 'image' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Image URL</label>
              <input
                type="text"
                value={element.settings.src || ''}
                onChange={(e) => updateSetting('src', e.target.value)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Alt Text</label>
              <input
                type="text"
                value={element.settings.alt || ''}
                onChange={(e) => updateSetting('alt', e.target.value)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              />
            </div>
          </>
        )}

        {/* Row Columns - Breakpoint specific */}
        {element.type === 'row' && (() => {
          // Get columns for current breakpoint
          const columnsConfig = element.settings.columns || {};
          const isLegacy = typeof columnsConfig === 'number';

          // Legacy support: if columns is a number, treat it as desktop value
          const currentColumns = isLegacy
            ? (activeBreakpoint === 'desktop' ? columnsConfig : 1)
            : (columnsConfig[activeBreakpoint] || columnsConfig.desktop || 1);

          const handleColumnChange = (newColumns: number) => {
            // Get old columns to redistribute elements
            const oldColumns = currentColumns;

            // Update columns config
            const newColumnsConfig = isLegacy ? { desktop: columnsConfig } : { ...columnsConfig };
            newColumnsConfig[activeBreakpoint] = newColumns;

            updateSetting('columns', newColumnsConfig);

            // Redistribute child elements if column count changed
            if (newColumns !== oldColumns) {
              const childElements = elements.filter(el => el.parent_id === element.id);

              childElements.forEach((child, index) => {
                const oldColumnIndex = child.settings.columnIndex ?? 0;
                // Redistribute: maintain relative position but wrap to new column count
                const newColumnIndex = index % newColumns;

                if (oldColumnIndex !== newColumnIndex) {
                  updateElement(child.id, {
                    settings: { ...child.settings, columnIndex: newColumnIndex }
                  });
                }
              });
            }
          };

          return (
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">
                Columns ({activeBreakpoint.charAt(0).toUpperCase() + activeBreakpoint.slice(1)})
              </label>
              <select
                value={currentColumns}
                onChange={(e) => handleColumnChange(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              >
                <option value="1">1 Column</option>
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
                <option value="4">4 Columns</option>
                <option value="5">5 Columns</option>
                <option value="6">6 Columns</option>
              </select>
              {!isLegacy && !columnsConfig[activeBreakpoint] && (
                <p className="text-xs text-light-muted mt-1">
                  Using default: {columnsConfig.desktop || 1} column(s)
                </p>
              )}
            </div>
          );
        })()}

        {/* Spacer Height */}
        {element.type === 'spacer' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-light-text mb-2">Height</label>
            <input
              type="text"
              value={element.settings.height || '50px'}
              onChange={(e) => updateSetting('height', e.target.value)}
              className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              placeholder="50px"
            />
          </div>
        )}
      </div>

      {/* Style Settings */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-light-muted uppercase">
            Styles ({activeBreakpoint.charAt(0).toUpperCase() + activeBreakpoint.slice(1)})
          </h3>

          {/* Normal/Hover Toggle */}
          <div className="flex items-center gap-1 bg-dark-panel border border-dark-border rounded p-0.5">
            <button
              onClick={() => setStyleMode('normal')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                styleMode === 'normal'
                  ? 'bg-brand-primary text-white'
                  : 'text-light-muted hover:text-light-text'
              }`}
              title="Normal Styles"
            >
              Normal
            </button>
            <button
              onClick={() => setStyleMode('hover')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                styleMode === 'hover'
                  ? 'bg-brand-primary text-white'
                  : 'text-light-muted hover:text-light-text'
              }`}
              title="Hover Styles"
            >
              Hover
            </button>
          </div>
        </div>

        {/* Typography */}
        {(element.type === 'text' || element.type === 'heading' || element.type === 'button') && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Font Size</label>
              <input
                type="text"
                value={getStyleValue('fontSize')}
                onChange={(e) => updateStyleDirect('fontSize', e.target.value, activeBreakpoint)}
                onBlur={(e) => updateStyle('fontSize', e.target.value, activeBreakpoint)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                placeholder="16px"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Font Weight</label>
              <select
                value={getStyleValue('fontWeight') || 'normal'}
                onChange={(e) => updateStyle('fontWeight', e.target.value, activeBreakpoint)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="300">Light</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Text Color</label>
              <input
                type="color"
                value={getStyleValue('color') || '#000000'}
                onChange={(e) => updateStyle('color', e.target.value, activeBreakpoint)}
                className="w-full h-10 border border-dark-border rounded"
              />
            </div>
          </>
        )}

        {/* Spacing */}
        <SpacingControl
          label="Padding"
          value={getStyleValue('padding')}
          onChange={(value) => updateStyle('padding', value, activeBreakpoint)}
          className="mb-4"
        />

        <SpacingControl
          label="Margin"
          value={getStyleValue('margin')}
          onChange={(value) => updateStyle('margin', value, activeBreakpoint)}
          className="mb-4"
        />

        {/* Background */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-light-text mb-2">Background Color</label>
          <input
            type="color"
            value={getStyleValue('backgroundColor') || '#ffffff'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value, activeBreakpoint)}
            className="w-full h-10 border border-dark-border rounded"
          />
        </div>

        {/* Border */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-light-text mb-2">Border</label>
          <input
            type="text"
            value={getStyleValue('border')}
            onChange={(e) => updateStyle('border', e.target.value, activeBreakpoint)}
            className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
            placeholder="1px solid #000"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-light-text mb-2">Border Radius</label>
          <input
            type="text"
            value={getStyleValue('borderRadius')}
            onChange={(e) => updateStyleDirect('borderRadius', e.target.value, activeBreakpoint)}
            onBlur={(e) => updateStyle('borderRadius', e.target.value, activeBreakpoint)}
            className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
            placeholder="4px"
          />
        </div>
      </div>
    </div>
  );
};
