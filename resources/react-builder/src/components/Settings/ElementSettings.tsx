import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { FiTrash2, FiCopy, FiEye, FiEyeOff, FiDroplet, FiImage, FiVideo, FiAlignLeft, FiAlignCenter, FiAlignRight, FiArrowLeft, FiArrowRight, FiMinus } from 'react-icons/fi';
import { SpacingControl } from './SpacingControl';

type BackgroundType = 'color' | 'gradient' | 'image' | 'video' | 'none';

export const ElementSettings: React.FC = () => {
  const { selectedElementId, getElementById, updateElement, deleteElement, duplicateElement, activeBreakpoint, elements } =
    useBuilderStore();

  const element = selectedElementId ? getElementById(selectedElementId) : null;
  const [settingsTab, setSettingsTab] = useState<'design' | 'element'>('element');
  const [styleMode, setStyleMode] = useState<'normal' | 'hover'>('normal');
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('color');

  // Initialize backgroundType based on what's stored in element
  useEffect(() => {
    if (element) {
      if (element.settings.backgroundVideo?.url) {
        setBackgroundType('video');
      } else if (element.settings.backgroundImage?.url) {
        setBackgroundType('image');
      } else if (element.settings.backgroundGradient?.color1 && element.settings.backgroundGradient?.color2) {
        setBackgroundType('gradient');
      } else {
        setBackgroundType('color');
      }
    }
  }, [element?.id]);

  if (!element) {
    return (
      <div className="p-4 text-center text-light-muted">
        <p>Select an element to edit its settings</p>
      </div>
    );
  }

  // Handle background type change - clear other background types
  const handleBackgroundTypeChange = (newType: BackgroundType) => {
    setBackgroundType(newType);

    // Clear all background types
    const newSettings = { ...element.settings };
    delete newSettings.backgroundGradient;
    delete newSettings.backgroundImage;
    delete newSettings.backgroundVideo;

    updateElement(element.id, { settings: newSettings });

    // Also clear backgroundColor style if switching away from color
    if (newType !== 'color') {
      const breakpointStyles = element.styles[activeBreakpoint] || {};
      const updatedBreakpointStyles = { ...breakpointStyles };
      delete updatedBreakpointStyles.backgroundColor;

      updateElement(element.id, {
        styles: {
          ...element.styles,
          [activeBreakpoint]: updatedBreakpointStyles,
        },
      });
    }
  };

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
    const spacingProps = ['padding', 'margin', 'width', 'height', 'maxWidth', 'maxHeight', 'fontSize', 'borderRadius', 'gap'];
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

      {/* Tabs */}
      <div className="flex border-b border-dark-border">
        <button
          onClick={() => setSettingsTab('element')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            settingsTab === 'element'
              ? 'text-brand-primary border-b-2 border-brand-primary bg-dark-panel'
              : 'text-light-muted hover:text-light-text hover:bg-dark-hover'
          }`}
        >
          Element
        </button>
        <button
          onClick={() => setSettingsTab('design')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            settingsTab === 'design'
              ? 'text-brand-primary border-b-2 border-brand-primary bg-dark-panel'
              : 'text-light-muted hover:text-light-text hover:bg-dark-hover'
          }`}
        >
          Design
        </button>
      </div>

      {/* Tab Content - Element */}
      {settingsTab === 'element' && (
        <>
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

      {/* Element Attributes */}
      <div className="p-4 border-b border-dark-border">
        <h3 className="text-xs font-semibold text-light-muted uppercase mb-3">Element Attributes</h3>

        {/* Element ID */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-light-text mb-2">Element ID</label>
          <input
            type="text"
            value={element.settings.elementId || ''}
            onChange={(e) => updateSetting('elementId', e.target.value)}
            className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
            placeholder="my-element-id"
          />
          <p className="text-xs text-light-muted mt-1">Unique identifier for this element</p>
        </div>

        {/* Element Class */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-light-text mb-2">CSS Classes</label>
          <input
            type="text"
            value={element.settings.elementClass || ''}
            onChange={(e) => updateSetting('elementClass', e.target.value)}
            className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
            placeholder="class-1 class-2 class-3"
          />
          <p className="text-xs text-light-muted mt-1">Space-separated CSS class names</p>
        </div>
      </div>
        </>
      )}

      {/* Tab Content - Design */}
      {settingsTab === 'design' && (
        <>
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Text Alignment</label>
              <div className="flex items-center gap-1 bg-dark-panel border border-dark-border rounded p-1">
                <button
                  onClick={() => updateStyle('textAlign', 'left', activeBreakpoint)}
                  className={`flex-1 p-2 rounded transition-colors flex items-center justify-center ${
                    getStyleValue('textAlign') === 'left' || !getStyleValue('textAlign')
                      ? 'bg-brand-primary text-white'
                      : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Align Left"
                >
                  <FiAlignLeft size={16} />
                </button>
                <button
                  onClick={() => updateStyle('textAlign', 'center', activeBreakpoint)}
                  className={`flex-1 p-2 rounded transition-colors flex items-center justify-center ${
                    getStyleValue('textAlign') === 'center'
                      ? 'bg-brand-primary text-white'
                      : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Align Center"
                >
                  <FiAlignCenter size={16} />
                </button>
                <button
                  onClick={() => updateStyle('textAlign', 'right', activeBreakpoint)}
                  className={`flex-1 p-2 rounded transition-colors flex items-center justify-center ${
                    getStyleValue('textAlign') === 'right'
                      ? 'bg-brand-primary text-white'
                      : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Align Right"
                >
                  <FiAlignRight size={16} />
                </button>
              </div>
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

        {/* Display Property */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-light-text mb-2">Display</label>
          <select
            value={getStyleValue('display') || 'block'}
            onChange={(e) => updateStyle('display', e.target.value, activeBreakpoint)}
            className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text"
          >
            <option value="block">Block</option>
            <option value="inline">Inline</option>
            <option value="inline-block">Inline Block</option>
            <option value="flex">Flex</option>
            <option value="inline-flex">Inline Flex</option>
            <option value="none">None</option>
          </select>
        </div>

        {/* Element Alignment - for elements with limited width */}
        {(element.type === 'section' || element.type === 'row' || element.type === 'button') && (() => {
          const marginLeft = getStyleValue('marginLeft');
          const marginRight = getStyleValue('marginRight');

          const isLeft = (marginLeft === '0' || marginLeft === '0px' || !marginLeft) && marginRight === 'auto';
          const isCenter = marginLeft === 'auto' && marginRight === 'auto';
          const isRight = marginLeft === 'auto' && (marginRight === '0' || marginRight === '0px' || !marginRight);

          const handleAlignment = (left: string, right: string) => {
            if (styleMode === 'hover') {
              const hoverStyles = (element as any).hoverStyles || {};
              updateElement(element.id, {
                hoverStyles: {
                  ...hoverStyles,
                  [activeBreakpoint]: {
                    ...hoverStyles[activeBreakpoint],
                    marginLeft: left,
                    marginRight: right,
                  },
                },
              } as any);
            } else {
              updateElement(element.id, {
                styles: {
                  ...element.styles,
                  [activeBreakpoint]: {
                    ...element.styles[activeBreakpoint],
                    marginLeft: left,
                    marginRight: right,
                  },
                },
              });
            }
          };

          return (
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Element Alignment</label>
              <div className="flex items-center gap-1 bg-dark-panel border border-dark-border rounded p-1">
                <button
                  onClick={() => handleAlignment('0', 'auto')}
                  className={`flex-1 p-2 rounded transition-colors flex items-center justify-center ${
                    isLeft ? 'bg-brand-primary text-white' : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Align Left"
                >
                  <FiArrowLeft size={16} />
                </button>
                <button
                  onClick={() => handleAlignment('auto', 'auto')}
                  className={`flex-1 p-2 rounded transition-colors flex items-center justify-center ${
                    isCenter ? 'bg-brand-primary text-white' : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Align Center"
                >
                  <FiMinus size={16} />
                </button>
                <button
                  onClick={() => handleAlignment('auto', '0')}
                  className={`flex-1 p-2 rounded transition-colors flex items-center justify-center ${
                    isRight ? 'bg-brand-primary text-white' : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Align Right"
                >
                  <FiArrowRight size={16} />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Width/Height Controls - only for certain elements */}
        {(element.type === 'section' || element.type === 'row' || element.type === 'image' || element.type === 'video' || element.type === 'button') && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Width</label>
              <input
                type="text"
                value={getStyleValue('width')}
                onChange={(e) => updateStyleDirect('width', e.target.value, activeBreakpoint)}
                onBlur={(e) => updateStyle('width', e.target.value, activeBreakpoint)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                placeholder="auto, 100%, 500px"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Max Width</label>
              <input
                type="text"
                value={getStyleValue('maxWidth')}
                onChange={(e) => updateStyleDirect('maxWidth', e.target.value, activeBreakpoint)}
                onBlur={(e) => updateStyle('maxWidth', e.target.value, activeBreakpoint)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                placeholder="none, 100%, 1200px"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Height</label>
              <input
                type="text"
                value={getStyleValue('height')}
                onChange={(e) => updateStyleDirect('height', e.target.value, activeBreakpoint)}
                onBlur={(e) => updateStyle('height', e.target.value, activeBreakpoint)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                placeholder="auto, 100%, 300px"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Max Height</label>
              <input
                type="text"
                value={getStyleValue('maxHeight')}
                onChange={(e) => updateStyleDirect('maxHeight', e.target.value, activeBreakpoint)}
                onBlur={(e) => updateStyle('maxHeight', e.target.value, activeBreakpoint)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                placeholder="none, 100vh, 600px"
              />
            </div>
          </>
        )}

        {/* Background */}
        {(element.type === 'section' || element.type === 'row' || element.type === 'button') && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-light-text">Background</label>

              {/* Background Type Icons */}
              <div className="flex items-center gap-1 bg-dark-panel border border-dark-border rounded p-0.5">
                <button
                  onClick={() => handleBackgroundTypeChange('color')}
                  className={`p-1.5 rounded transition-colors ${
                    backgroundType === 'color'
                      ? 'bg-brand-primary text-white'
                      : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Solid Color"
                >
                  <FiDroplet size={14} />
                </button>
                <button
                  onClick={() => handleBackgroundTypeChange('gradient')}
                  className={`p-1.5 rounded transition-colors ${
                    backgroundType === 'gradient'
                      ? 'bg-brand-primary text-white'
                      : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Gradient"
                >
                  <div className="w-3.5 h-3.5 rounded" style={{ background: 'linear-gradient(45deg, currentColor 0%, transparent 100%)' }} />
                </button>
                <button
                  onClick={() => handleBackgroundTypeChange('image')}
                  className={`p-1.5 rounded transition-colors ${
                    backgroundType === 'image'
                      ? 'bg-brand-primary text-white'
                      : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Image"
                >
                  <FiImage size={14} />
                </button>
                <button
                  onClick={() => handleBackgroundTypeChange('video')}
                  className={`p-1.5 rounded transition-colors ${
                    backgroundType === 'video'
                      ? 'bg-brand-primary text-white'
                      : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Video"
                >
                  <FiVideo size={14} />
                </button>
              </div>
            </div>

            {/* Background Color */}
            {backgroundType === 'color' && (
              <input
                type="color"
                value={getStyleValue('backgroundColor') || '#ffffff'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value, activeBreakpoint)}
                className="w-full h-10 border border-dark-border rounded"
              />
            )}

            {/* Background Gradient */}
            {backgroundType === 'gradient' && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-light-muted mb-1 block">Color 1</label>
                  <input
                    type="color"
                    value={(element.settings.backgroundGradient?.color1 as string) || '#ffffff'}
                    onChange={(e) => updateSetting('backgroundGradient', {
                      ...element.settings.backgroundGradient,
                      color1: e.target.value
                    })}
                    className="w-full h-8 border border-dark-border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-light-muted mb-1 block">Color 2</label>
                  <input
                    type="color"
                    value={(element.settings.backgroundGradient?.color2 as string) || '#000000'}
                    onChange={(e) => updateSetting('backgroundGradient', {
                      ...element.settings.backgroundGradient,
                      color2: e.target.value
                    })}
                    className="w-full h-8 border border-dark-border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-light-muted mb-1 block">Angle (deg)</label>
                  <input
                    type="number"
                    value={(element.settings.backgroundGradient?.angle as number) || 45}
                    onChange={(e) => updateSetting('backgroundGradient', {
                      ...element.settings.backgroundGradient,
                      angle: parseInt(e.target.value)
                    })}
                    className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text"
                    min="0"
                    max="360"
                  />
                </div>
              </div>
            )}

            {/* Background Image */}
            {backgroundType === 'image' && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-light-muted mb-1 block">Image URL</label>
                  <input
                    type="text"
                    value={(element.settings.backgroundImage?.url as string) || ''}
                    onChange={(e) => updateSetting('backgroundImage', {
                      ...element.settings.backgroundImage,
                      url: e.target.value
                    })}
                    className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-xs text-light-muted mb-1 block">Size</label>
                  <select
                    value={(element.settings.backgroundImage?.size as string) || 'cover'}
                    onChange={(e) => updateSetting('backgroundImage', {
                      ...element.settings.backgroundImage,
                      size: e.target.value
                    })}
                    className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-light-muted mb-1 block">Position</label>
                  <select
                    value={(element.settings.backgroundImage?.position as string) || 'center center'}
                    onChange={(e) => updateSetting('backgroundImage', {
                      ...element.settings.backgroundImage,
                      position: e.target.value
                    })}
                    className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text"
                  >
                    <option value="center center">Center Center</option>
                    <option value="top left">Top Left</option>
                    <option value="top center">Top Center</option>
                    <option value="top right">Top Right</option>
                    <option value="center left">Center Left</option>
                    <option value="center right">Center Right</option>
                    <option value="bottom left">Bottom Left</option>
                    <option value="bottom center">Bottom Center</option>
                    <option value="bottom right">Bottom Right</option>
                  </select>
                </div>
              </div>
            )}

            {/* Background Video */}
            {backgroundType === 'video' && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-light-muted mb-1 block">Video URL (.mp4)</label>
                  <input
                    type="text"
                    value={(element.settings.backgroundVideo?.url as string) || ''}
                    onChange={(e) => updateSetting('backgroundVideo', {
                      ...element.settings.backgroundVideo,
                      url: e.target.value
                    })}
                    className="w-full px-2 py-1.5 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                    placeholder="https://...video.mp4"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(element.settings.backgroundVideo?.loop as boolean) ?? true}
                    onChange={(e) => updateSetting('backgroundVideo', {
                      ...element.settings.backgroundVideo,
                      loop: e.target.checked
                    })}
                    className="rounded"
                  />
                  <label className="text-xs text-light-muted">Loop Video</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={(element.settings.backgroundVideo?.muted as boolean) ?? true}
                    onChange={(e) => updateSetting('backgroundVideo', {
                      ...element.settings.backgroundVideo,
                      muted: e.target.checked
                    })}
                    className="rounded"
                  />
                  <label className="text-xs text-light-muted">Muted</label>
                </div>
              </div>
            )}
          </div>
        )}

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
        </>
      )}
    </div>
  );
};
