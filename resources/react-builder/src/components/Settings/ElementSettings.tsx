import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { FiTrash2, FiCopy, FiEye, FiEyeOff, FiDroplet, FiImage, FiVideo, FiAlignLeft, FiAlignCenter, FiAlignRight, FiSettings, FiColumns, FiX } from 'react-icons/fi';
import { RiAlignItemLeftFill, RiAlignItemHorizontalCenterFill, RiAlignItemRightFill } from 'react-icons/ri';
import { SpacingControl } from './SpacingControl';
import { GlobalColorSwatches } from './GlobalColorSwatches';

type BackgroundType = 'color' | 'gradient' | 'image' | 'video' | 'none';

// Element type groups for multiselect logic
const ELEMENT_GROUPS = {
  container: ['section', 'row'],
  content: ['text', 'heading', 'button', 'image', 'video', 'spacer', 'divider', 'code'],
} as const;

// Helper to get element group
const getElementGroup = (type: string): 'container' | 'content' | 'unknown' => {
  if (ELEMENT_GROUPS.container.includes(type as any)) return 'container';
  if (ELEMENT_GROUPS.content.includes(type as any)) return 'content';
  return 'unknown';
};

// Helper to check multiselect compatibility
const checkMultiSelectCompatibility = (elements: any[]): {
  compatible: boolean;
  allSameType: boolean;
  allSameGroup: boolean;
  types: string[];
} => {
  if (elements.length <= 1) {
    return { compatible: true, allSameType: true, allSameGroup: true, types: [] };
  }

  const types = [...new Set(elements.map(el => el.type))];
  const groups = [...new Set(elements.map(el => getElementGroup(el.type)))];

  const allSameType = types.length === 1;
  const allSameGroup = groups.length === 1 && groups[0] !== 'unknown';
  const compatible = allSameType || allSameGroup;

  return { compatible, allSameType, allSameGroup, types };
};

export const ElementSettings: React.FC = () => {
  const { selectedElementId, selectedElementIds, selectedColumnIndex, selectColumn, getElementById, updateElement, deleteElement, duplicateElement, activeBreakpoint, elements } =
    useBuilderStore();

  // Always compute selectedElements based on selectedElementIds
  const selectedElements = selectedElementIds.length > 0
    ? elements.filter(el => selectedElementIds.includes(el.id))
    : [];

  // Check if we're in multi-select mode
  const isMultiSelect = selectedElementIds.length > 1;

  // Check multiselect compatibility
  const multiSelectInfo = checkMultiSelectCompatibility(selectedElements);

  const element = selectedElementId ? getElementById(selectedElementId) : (isMultiSelect ? selectedElements[0] : null);
  const [settingsTab, setSettingsTab] = useState<'design' | 'element'>('element');
  const [styleMode, setStyleMode] = useState<'normal' | 'hover'>('normal');
  const [backgroundType, setBackgroundType] = useState<BackgroundType>('color');
  const [columnStyleMode, setColumnStyleMode] = useState<'normal' | 'hover'>('normal');
  const [columnBackgroundType, setColumnBackgroundType] = useState<BackgroundType>('color');

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

  if (!element && !isMultiSelect) {
    return (
      <div className="p-4 text-center text-light-muted">
        <p>Select an element to edit its settings</p>
      </div>
    );
  }

  // Handle background type change - clear other background types
  const handleBackgroundTypeChange = (newType: BackgroundType) => {
    // Get fresh store data
    const store = useBuilderStore.getState();
    const currentElements = store.elements;
    const currentSelectedIds = store.selectedElementIds;
    const isCurrentlyMultiSelect = currentSelectedIds.length > 1;

    setBackgroundType(newType);

    if (isCurrentlyMultiSelect) {
      // Multi-select: batch update all selected elements
      const elementIdsSet = new Set(currentSelectedIds);

      const updatedElements = currentElements.map(el => {
        if (!elementIdsSet.has(el.id)) return el;

        // Clear all background types
        const newSettings = { ...el.settings };
        delete newSettings.backgroundGradient;
        delete newSettings.backgroundImage;
        delete newSettings.backgroundVideo;

        // Also clear backgroundColor style if switching away from color
        if (newType !== 'color') {
          const breakpointStyles = el.styles[activeBreakpoint] || {};
          const updatedBreakpointStyles = { ...breakpointStyles };
          delete updatedBreakpointStyles.backgroundColor;

          return {
            ...el,
            settings: newSettings,
            styles: {
              ...el.styles,
              [activeBreakpoint]: updatedBreakpointStyles,
            },
          };
        }

        return {
          ...el,
          settings: newSettings,
        };
      });

      useBuilderStore.setState({ elements: updatedElements });
      useBuilderStore.getState().addToHistory();
      return;
    }

    // Single element mode
    if (!element) return;

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
    // Get fresh store data
    const store = useBuilderStore.getState();
    const currentElements = store.elements;
    const currentSelectedIds = store.selectedElementIds;
    const isCurrentlyMultiSelect = currentSelectedIds.length > 1;

    if (isCurrentlyMultiSelect) {
      // Multi-select: batch update all selected elements
      const elementIdsSet = new Set(currentSelectedIds);

      const updatedElements = currentElements.map(el => {
        if (!elementIdsSet.has(el.id)) return el;

        return {
          ...el,
          settings: { ...el.settings, [key]: value },
        };
      });

      useBuilderStore.setState({ elements: updatedElements });
      useBuilderStore.getState().addToHistory();
      return;
    }

    // Single element mode
    if (!element) return;
    updateElement(element.id, {
      settings: { ...element.settings, [key]: value },
    });
  };

  // Multi-select helper: Check if style values are mixed
  const hasMultiSelectMixedValues = (property: string): boolean => {
    if (!isMultiSelect) return false;

    const values = selectedElements.map(el => {
      if (styleMode === 'hover') {
        const hoverStyles = (el as any).hoverStyles || {};
        const breakpointStyles = hoverStyles[activeBreakpoint] || {};
        return (breakpointStyles as any)[property] || '';
      }
      const breakpointStyles = el.styles[activeBreakpoint] || {};
      return (breakpointStyles as any)[property] || '';
    });

    // Check if all values are the same
    const firstValue = values[0];
    return !values.every(v => v === firstValue);
  };

  // Get current style value based on styleMode (normal or hover)
  const getStyleValue = (property: string): string => {
    // In multi-select mode, check for mixed values
    if (isMultiSelect && hasMultiSelectMixedValues(property)) {
      return ''; // Return empty string to trigger placeholder
    }

    if (isMultiSelect) {
      // Use first element's value if not mixed
      const firstElement = selectedElements[0];
      if (styleMode === 'hover') {
        const hoverStyles = (firstElement as any).hoverStyles || {};
        const breakpointStyles = hoverStyles[activeBreakpoint] || {};
        return (breakpointStyles as any)[property] || '';
      }
      const breakpointStyles = firstElement.styles[activeBreakpoint] || {};
      return (breakpointStyles as any)[property] || '';
    }

    if (!element) return '';

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
    // Get fresh data from store to avoid stale closure
    const store = useBuilderStore.getState();
    const currentElements = store.elements;
    const currentSelectedIds = store.selectedElementIds;
    const isCurrentlyMultiSelect = currentSelectedIds.length > 1;

    if (isCurrentlyMultiSelect) {
      // Multi-select: batch update all selected elements
      const elementIdsSet = new Set(currentSelectedIds);

      const updatedElements = currentElements.map(el => {
        if (!elementIdsSet.has(el.id)) return el;

        if (styleMode === 'hover') {
          const hoverStyles = (el as any).hoverStyles || {};
          return {
            ...el,
            hoverStyles: {
              ...hoverStyles,
              [breakpoint]: {
                ...hoverStyles[breakpoint],
                [property]: value,
              },
            },
          };
        } else {
          return {
            ...el,
            styles: {
              ...el.styles,
              [breakpoint]: {
                ...el.styles[breakpoint],
                [property]: value,
              },
            },
          };
        }
      });

      // Update all elements in a single operation
      useBuilderStore.setState({ elements: updatedElements });
      useBuilderStore.getState().addToHistory();
      return;
    }

    if (!element) return;

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

    // Get fresh data from store to avoid stale closure
    const store = useBuilderStore.getState();
    const currentElements = store.elements;
    const currentSelectedIds = store.selectedElementIds;
    const isCurrentlyMultiSelect = currentSelectedIds.length > 1;

    if (isCurrentlyMultiSelect) {
      // Multi-select: batch update all selected elements
      const elementIdsSet = new Set(currentSelectedIds);

      const updatedElements = currentElements.map(el => {
        if (!elementIdsSet.has(el.id)) return el;

        if (styleMode === 'hover') {
          const hoverStyles = (el as any).hoverStyles || {};
          return {
            ...el,
            hoverStyles: {
              ...hoverStyles,
              [breakpoint]: {
                ...hoverStyles[breakpoint],
                [property]: finalValue,
              },
            },
          };
        } else {
          return {
            ...el,
            styles: {
              ...el.styles,
              [breakpoint]: {
                ...el.styles[breakpoint],
                [property]: finalValue,
              },
            },
          };
        }
      });

      // Update all elements in a single operation
      useBuilderStore.setState({ elements: updatedElements });
      useBuilderStore.getState().addToHistory();
      return;
    }

    if (!element) return;

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
      {/* Multi-Select Header */}
      {isMultiSelect && (
        <div className="bg-orange-900/30 border-b-2 border-brand-orange p-4">
          <div className="flex items-center justify-between">
            <div className="w-full">
              <h3 className="text-sm font-semibold text-orange-300 flex items-center gap-2">
                {selectedElementIds.length} Elements Selected
              </h3>
              {multiSelectInfo.allSameType ? (
                <p className="text-xs text-orange-400/70 mt-1">
                  Editing {selectedElements[0]?.type || 'elements'} elements - Changes apply to all
                </p>
              ) : multiSelectInfo.allSameGroup ? (
                <p className="text-xs text-orange-400/70 mt-1">
                  Mixed types ({multiSelectInfo.types.join(', ')}) - Only common properties available
                </p>
              ) : (
                <div className="mt-2 p-2 bg-red-900/30 border border-red-700/50 rounded">
                  <p className="text-xs text-red-300">
                    ⚠️ Unterschiedliche Elemente ausgewählt. Globale Bearbeitung nur für gleiche Elementtypen verfügbar.
                  </p>
                  <p className="text-xs text-red-400/70 mt-1">
                    Ausgewählte Typen: {multiSelectInfo.types.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!isMultiSelect && (
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
      )}

      {/* Tab Content - Element */}
      {settingsTab === 'element' && !isMultiSelect && element && (
        <>
      {/* Element Actions */}
      <div className="p-4 border-b border-dark-border">
        <h3 className="text-xs font-semibold text-light-muted uppercase mb-3">Actions</h3>
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

        {/* Video Settings */}
        {element.type === 'video' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Video Provider</label>
              <select
                value={element.settings.provider || 'youtube'}
                onChange={(e) => updateSetting('provider', e.target.value)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text"
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="direct">Direct URL</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Video URL</label>
              <input
                type="text"
                value={element.settings.src || ''}
                onChange={(e) => updateSetting('src', e.target.value)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                placeholder={
                  element.settings.provider === 'youtube'
                    ? 'https://www.youtube.com/watch?v=...'
                    : element.settings.provider === 'vimeo'
                    ? 'https://vimeo.com/...'
                    : 'https://example.com/video.mp4'
                }
              />
              <p className="text-xs text-light-muted mt-1">
                {element.settings.provider === 'youtube' && 'Enter YouTube video URL'}
                {element.settings.provider === 'vimeo' && 'Enter Vimeo video URL'}
                {(!element.settings.provider || element.settings.provider === 'direct') && 'Direct MP4, WebM, or Ogg video URL'}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Aspect Ratio</label>
              <select
                value={element.settings.aspectRatio || '16/9'}
                onChange={(e) => updateSetting('aspectRatio', e.target.value)}
                className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text"
              >
                <option value="16/9">16:9 (Widescreen)</option>
                <option value="4/3">4:3 (Standard)</option>
                <option value="1/1">1:1 (Square)</option>
                <option value="21/9">21:9 (Ultrawide)</option>
              </select>
            </div>
          </>
        )}

        {/* Row Columns - Total count and responsive layout */}
        {element.type === 'row' && (() => {
          // Get total column count (always a number now)
          const totalColumns = typeof element.settings.columns === 'number' ? element.settings.columns : 1;

          // Get responsive layout (columns per row for each breakpoint)
          const responsiveLayout = element.settings.responsiveLayout || {
            desktop: totalColumns,
            tablet: Math.min(totalColumns, 2),
            mobile: 1,
          };

          const handleTotalColumnsChange = (newTotal: number) => {
            if (!element) return;

            const oldTotal = totalColumns;

            // Update responsive layout first to ensure valid values
            const newLayout = { ...responsiveLayout };
            newLayout.desktop = newTotal;  // Desktop always matches total columns
            newLayout.tablet = Math.min(newLayout.tablet, newTotal);
            newLayout.mobile = Math.min(newLayout.mobile, newTotal);

            // Update both columns and responsiveLayout in one go
            updateElement(element.id, {
              settings: {
                ...element.settings,
                columns: newTotal,
                responsiveLayout: newLayout
              },
            });

            // Redistribute child elements if column count changed
            if (newTotal !== oldTotal) {
              const childElements = elements.filter(el => el.parent_id === element.id);

              childElements.forEach((child, index) => {
                const oldColumnIndex = child.settings.columnIndex ?? 0;
                // Redistribute: maintain relative position but wrap to new column count
                const newColumnIndex = index % newTotal;

                if (oldColumnIndex !== newColumnIndex || oldColumnIndex >= newTotal) {
                  updateElement(child.id, {
                    settings: { ...child.settings, columnIndex: newColumnIndex }
                  });
                }
              });
            }
          };

          const handleColumnsPerRowChange = (newColumnsPerRow: number) => {
            if (!element) return;

            const newLayout = { ...responsiveLayout };
            newLayout[activeBreakpoint] = newColumnsPerRow;

            // Update responsiveLayout directly
            updateElement(element.id, {
              settings: {
                ...element.settings,
                responsiveLayout: newLayout
              },
            });
          };

          return (
            <div className="mb-4 space-y-4">
              {/* Total Columns (only on desktop) */}
              {activeBreakpoint === 'desktop' && (
                <div>
                  <label className="block text-sm font-medium text-light-text mb-2">
                    Total Columns
                  </label>
                  <select
                    value={totalColumns}
                    onChange={(e) => handleTotalColumnsChange(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                  >
                    <option value="1">1 Column</option>
                    <option value="2">2 Columns</option>
                    <option value="3">3 Columns</option>
                    <option value="4">4 Columns</option>
                    <option value="5">5 Columns</option>
                    <option value="6">6 Columns</option>
                  </select>
                  <p className="text-xs text-light-muted mt-1">
                    Total number of columns in this row
                  </p>
                </div>
              )}

              {/* Columns per Row (responsive layout) */}
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Columns per Row ({activeBreakpoint.charAt(0).toUpperCase() + activeBreakpoint.slice(1)})
                </label>
                <select
                  value={responsiveLayout[activeBreakpoint]}
                  onChange={(e) => handleColumnsPerRowChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                >
                  {Array.from({ length: totalColumns }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Column' : 'Columns'} per Row
                    </option>
                  ))}
                </select>
                <p className="text-xs text-light-muted mt-1">
                  {totalColumns > 1 && responsiveLayout[activeBreakpoint] < totalColumns
                    ? `${totalColumns} columns arranged in rows of ${responsiveLayout[activeBreakpoint]}`
                    : `All ${totalColumns} column(s) in one row`}
                </p>
              </div>

              {/* Column Style Selector */}
              {totalColumns > 1 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-light-text mb-2">
                    Column Settings
                  </label>
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(totalColumns, 3)}, 1fr)` }}>
                    {Array.from({ length: totalColumns }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          selectColumn(index);
                          setSettingsTab('design');
                        }}
                        className={`
                          flex flex-col items-center gap-2 p-3 rounded transition-colors
                          ${selectedColumnIndex === index
                            ? 'bg-green-400/20 border-2 border-green-400'
                            : 'bg-dark-panel border border-dark-border hover:bg-dark-hover'
                          }
                        `}
                        title={`Edit Column ${index + 1}`}
                      >
                        <FiColumns size={20} className={selectedColumnIndex === index ? 'text-green-400' : 'text-light-muted'} />
                        <span className="text-xs text-light-text">Col {index + 1}</span>
                        <FiSettings size={14} className={selectedColumnIndex === index ? 'text-green-400' : 'text-light-muted'} />
                      </button>
                    ))}
                  </div>
                  {selectedColumnIndex !== null && (
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                      <FiSettings size={12} />
                      Column {selectedColumnIndex + 1} selected - edit in Design tab
                    </p>
                  )}
                </div>
              )}

              {/* Gap between Columns */}
              {totalColumns > 1 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-light-text mb-2">Column Gap</label>
                  <input
                    type="text"
                    value={element.settings.gap || '16px'}
                    onChange={(e) => updateSetting('gap', e.target.value)}
                    className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                    placeholder="16px"
                  />
                  <p className="text-xs text-light-muted mt-1">Space between columns (e.g., 0px, 16px, 2rem)</p>
                </div>
              )}

              {/* Min Height */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-light-text mb-2">Min Height</label>
                <input
                  type="text"
                  value={element.settings.minHeight || ''}
                  onChange={(e) => updateSetting('minHeight', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                  placeholder="auto"
                />
                <p className="text-xs text-light-muted mt-1">Minimum height (e.g., 100px, 10vh, auto)</p>
              </div>
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
      {(settingsTab === 'design' || isMultiSelect) && (
        <>
      {/* Column-Specific Design Settings */}
      {!isMultiSelect && element && element.type === 'row' && selectedColumnIndex !== null && (() => {
        // Initialize columnStyles if not exists
        const columnStyles = element.settings.columnStyles || [];
        const columnStyle = columnStyles[selectedColumnIndex] || {};
        const columnHoverStyles = element.settings.columnHoverStyles || [];
        const columnHoverStyle = columnHoverStyles[selectedColumnIndex] || {};

        // Get column style value based on mode
        const getColumnStyleValue = (property: string): string => {
          if (columnStyleMode === 'hover') {
            return (columnHoverStyle as any)[property] || '';
          }
          return (columnStyle as any)[property] || '';
        };

        // Update column style
        const updateColumnStyle = (property: string, value: string) => {
          if (columnStyleMode === 'hover') {
            const newColumnHoverStyles = [...columnHoverStyles];
            newColumnHoverStyles[selectedColumnIndex] = {
              ...columnHoverStyle,
              [property]: value,
            };
            updateSetting('columnHoverStyles', newColumnHoverStyles);
          } else {
            const newColumnStyles = [...columnStyles];
            newColumnStyles[selectedColumnIndex] = {
              ...columnStyle,
              [property]: value,
            };
            updateSetting('columnStyles', newColumnStyles);
          }
        };

        // Handle background type change for columns
        const handleColumnBackgroundTypeChange = (newType: BackgroundType) => {
          setColumnBackgroundType(newType);

          // Get the appropriate style object based on mode
          const targetStyle = columnStyleMode === 'hover' ? columnHoverStyle : columnStyle;
          const targetArray = columnStyleMode === 'hover' ? [...columnHoverStyles] : [...columnStyles];
          const settingsKey = columnStyleMode === 'hover' ? 'columnHoverStyles' : 'columnStyles';

          // Clear background from target style
          const clearedStyle = { ...targetStyle };
          delete clearedStyle.backgroundColor;
          delete clearedStyle.backgroundImage;
          delete clearedStyle.background;

          targetArray[selectedColumnIndex] = clearedStyle;
          updateSetting(settingsKey, targetArray);

          // Also clear background settings for this column
          const columnBgSettings = element.settings.columnBackgrounds || [];
          const newColumnBgSettings = [...columnBgSettings];
          if (newType !== 'gradient' && newType !== 'image' && newType !== 'video') {
            newColumnBgSettings[selectedColumnIndex] = {};
            updateSetting('columnBackgrounds', newColumnBgSettings);
          }
        };

        // Update column background settings (for gradient, image, video)
        const updateColumnBackgroundSetting = (key: string, value: any) => {
          const columnBackgrounds = element.settings.columnBackgrounds || [];
          const newColumnBackgrounds = [...columnBackgrounds];
          newColumnBackgrounds[selectedColumnIndex] = {
            ...newColumnBackgrounds[selectedColumnIndex],
            [key]: value,
          };
          updateSetting('columnBackgrounds', newColumnBackgrounds);
        };

        // Get column background settings
        const columnBackgrounds = element.settings.columnBackgrounds || [];
        const columnBackground = columnBackgrounds[selectedColumnIndex] || {};

        return (
          <div className="bg-green-900/30 border-b-2 border-green-400">
            {/* Column Header */}
            <div className="p-4 bg-green-900/20 border-b border-green-400/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-green-300 flex items-center gap-2">
                    <FiColumns size={16} />
                    Column {selectedColumnIndex + 1} Settings
                  </h3>
                  <p className="text-xs text-green-400/70 mt-1">Customize this column independently</p>
                </div>
                <button
                  onClick={() => selectColumn(null)}
                  className="px-3 py-1 text-xs bg-dark-panel hover:bg-dark-hover text-light-text rounded transition-colors"
                >
                  Back to Row
                </button>
              </div>

              {/* Normal/Hover Toggle for Column */}
              <div className="flex items-center gap-1 bg-dark-panel border border-green-400/30 rounded p-0.5">
                <button
                  onClick={() => setColumnStyleMode('normal')}
                  className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${
                    columnStyleMode === 'normal'
                      ? 'bg-green-400 text-dark-bg font-semibold'
                      : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Normal Styles"
                >
                  Normal
                </button>
                <button
                  onClick={() => setColumnStyleMode('hover')}
                  className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${
                    columnStyleMode === 'hover'
                      ? 'bg-green-400 text-dark-bg font-semibold'
                      : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Hover Styles"
                >
                  Hover
                </button>
              </div>
            </div>

            {/* Column Attributes */}
            <div className="p-4 border-b border-green-400/30">
              <h3 className="text-xs font-semibold text-green-300 uppercase mb-3">Column Attributes</h3>

              {/* Column ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-light-text mb-2">Column ID</label>
                <input
                  type="text"
                  value={(() => {
                    const columnIds = element.settings.columnIds || [];
                    return columnIds[selectedColumnIndex] || '';
                  })()}
                  onChange={(e) => {
                    const columnIds = element.settings.columnIds || [];
                    const newColumnIds = [...columnIds];
                    newColumnIds[selectedColumnIndex] = e.target.value;
                    updateSetting('columnIds', newColumnIds);
                  }}
                  className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                  placeholder="my-column-id"
                />
                <p className="text-xs text-light-muted mt-1">Unique identifier for this column</p>
              </div>

              {/* Column Class */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-light-text mb-2">CSS Classes</label>
                <input
                  type="text"
                  value={(() => {
                    const columnClasses = element.settings.columnClasses || [];
                    return columnClasses[selectedColumnIndex] || '';
                  })()}
                  onChange={(e) => {
                    const columnClasses = element.settings.columnClasses || [];
                    const newColumnClasses = [...columnClasses];
                    newColumnClasses[selectedColumnIndex] = e.target.value;
                    updateSetting('columnClasses', newColumnClasses);
                  }}
                  className="w-full px-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted"
                  placeholder="class-1 class-2 class-3"
                />
                <p className="text-xs text-light-muted mt-1">Space-separated CSS class names</p>
              </div>
            </div>

            {/* Column Style Controls */}
            <div className="p-4 space-y-4">
              {/* Background */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-green-300">Background</label>

                  {/* Background Type Icons */}
                  <div className="flex items-center gap-1 bg-dark-panel border border-green-400/30 rounded p-0.5">
                    <button
                      onClick={() => handleColumnBackgroundTypeChange('color')}
                      className={`p-1.5 rounded transition-colors ${
                        columnBackgroundType === 'color'
                          ? 'bg-green-400 text-dark-bg'
                          : 'text-light-muted hover:text-light-text'
                      }`}
                      title="Solid Color"
                    >
                      <FiDroplet size={14} />
                    </button>
                    <button
                      onClick={() => handleColumnBackgroundTypeChange('gradient')}
                      className={`p-1.5 rounded transition-colors ${
                        columnBackgroundType === 'gradient'
                          ? 'bg-green-400 text-dark-bg'
                          : 'text-light-muted hover:text-light-text'
                      }`}
                      title="Gradient"
                    >
                      <div className="w-3.5 h-3.5 rounded" style={{ background: 'linear-gradient(45deg, currentColor 0%, transparent 100%)' }} />
                    </button>
                    <button
                      onClick={() => handleColumnBackgroundTypeChange('image')}
                      className={`p-1.5 rounded transition-colors ${
                        columnBackgroundType === 'image'
                          ? 'bg-green-400 text-dark-bg'
                          : 'text-light-muted hover:text-light-text'
                      }`}
                      title="Image"
                    >
                      <FiImage size={14} />
                    </button>
                    <button
                      onClick={() => handleColumnBackgroundTypeChange('video')}
                      className={`p-1.5 rounded transition-colors ${
                        columnBackgroundType === 'video'
                          ? 'bg-green-400 text-dark-bg'
                          : 'text-light-muted hover:text-light-text'
                      }`}
                      title="Video"
                    >
                      <FiVideo size={14} />
                    </button>
                  </div>
                </div>

                {/* Background Color */}
                {columnBackgroundType === 'color' && (
                  <>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={getColumnStyleValue('backgroundColor') || '#ffffff'}
                        onChange={(e) => updateColumnStyle('backgroundColor', e.target.value)}
                        className="flex-1 h-10 border border-green-400/30 rounded cursor-pointer"
                      />
                      <button
                        onClick={() => updateColumnStyle('backgroundColor', '')}
                        className="p-2 hover:bg-dark-hover rounded transition-colors text-light-muted hover:text-light-text"
                        title="Clear color"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                    <GlobalColorSwatches onColorSelect={(color) => updateColumnStyle('backgroundColor', color)} />
                  </>
                )}

                {/* Background Gradient */}
                {columnBackgroundType === 'gradient' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-green-300 mb-1 block">Color 1</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={(columnBackground.gradientColor1 as string) || '#ffffff'}
                          onChange={(e) => updateColumnBackgroundSetting('gradientColor1', e.target.value)}
                          className="flex-1 h-8 border border-green-400/30 rounded"
                        />
                        <button
                          onClick={() => updateColumnBackgroundSetting('gradientColor1', '')}
                          className="p-1.5 hover:bg-dark-hover rounded transition-colors text-light-muted hover:text-light-text"
                          title="Clear color"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                      <GlobalColorSwatches onColorSelect={(color) => updateColumnBackgroundSetting('gradientColor1', color)} />
                    </div>
                    <div>
                      <label className="text-xs text-green-300 mb-1 block">Color 2</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={(columnBackground.gradientColor2 as string) || '#000000'}
                          onChange={(e) => updateColumnBackgroundSetting('gradientColor2', e.target.value)}
                          className="flex-1 h-8 border border-green-400/30 rounded"
                        />
                        <button
                          onClick={() => updateColumnBackgroundSetting('gradientColor2', '')}
                          className="p-1.5 hover:bg-dark-hover rounded transition-colors text-light-muted hover:text-light-text"
                          title="Clear color"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                      <GlobalColorSwatches onColorSelect={(color) => updateColumnBackgroundSetting('gradientColor2', color)} />
                    </div>
                    <div>
                      <label className="text-xs text-green-300 mb-1 block">Angle (deg)</label>
                      <input
                        type="number"
                        value={(columnBackground.gradientAngle as number) || 45}
                        onChange={(e) => updateColumnBackgroundSetting('gradientAngle', parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-dark-panel border border-green-400/30 rounded text-sm text-light-text"
                      />
                    </div>
                  </div>
                )}

                {/* Background Image */}
                {columnBackgroundType === 'image' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={(columnBackground.imageUrl as string) || ''}
                      onChange={(e) => updateColumnBackgroundSetting('imageUrl', e.target.value)}
                      placeholder="Image URL"
                      className="w-full px-3 py-2 bg-dark-panel border border-green-400/30 rounded text-sm text-light-text placeholder-light-muted"
                    />
                    <select
                      value={(columnBackground.imageSize as string) || 'cover'}
                      onChange={(e) => updateColumnBackgroundSetting('imageSize', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-panel border border-green-400/30 rounded text-sm text-light-text"
                    >
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="auto">Auto</option>
                    </select>
                    <select
                      value={(columnBackground.imagePosition as string) || 'center'}
                      onChange={(e) => updateColumnBackgroundSetting('imagePosition', e.target.value)}
                      className="w-full px-3 py-2 bg-dark-panel border border-green-400/30 rounded text-sm text-light-text"
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                )}

                {/* Background Video */}
                {columnBackgroundType === 'video' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={(columnBackground.videoUrl as string) || ''}
                      onChange={(e) => updateColumnBackgroundSetting('videoUrl', e.target.value)}
                      placeholder="Video URL (MP4)"
                      className="w-full px-3 py-2 bg-dark-panel border border-green-400/30 rounded text-sm text-light-text placeholder-light-muted"
                    />
                  </div>
                )}
              </div>

              {/* Padding */}
              <SpacingControl
                label="Padding"
                value={getColumnStyleValue('padding')}
                onChange={(value) => updateColumnStyle('padding', value)}
                className="mb-4"
              />

              {/* Border */}
              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">Border</label>
                <input
                  type="text"
                  value={getColumnStyleValue('border')}
                  onChange={(e) => updateColumnStyle('border', e.target.value)}
                  placeholder="e.g., 1px solid #000"
                  className="w-full px-3 py-2 bg-dark-panel border border-green-400/30 rounded text-sm text-light-text placeholder-light-muted focus:border-green-400 focus:outline-none"
                />
              </div>

              {/* Border Radius */}
              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">Border Radius</label>
                <input
                  type="text"
                  value={getColumnStyleValue('borderRadius')}
                  onChange={(e) => updateColumnStyle('borderRadius', e.target.value)}
                  placeholder="e.g., 8px or 0.5rem"
                  className="w-full px-3 py-2 bg-dark-panel border border-green-400/30 rounded text-sm text-light-text placeholder-light-muted focus:border-green-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Normal Style Settings - only show if no column is selected */}
      {(isMultiSelect || (element && !(element.type === 'row' && selectedColumnIndex !== null))) && (
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className={`text-xs font-semibold uppercase ${isMultiSelect ? 'text-orange-300' : 'text-light-muted'}`}>
            Styles ({activeBreakpoint.charAt(0).toUpperCase() + activeBreakpoint.slice(1)})
          </h3>

          {/* Normal/Hover Toggle */}
          <div className={`flex items-center gap-1 bg-dark-panel rounded p-0.5 ${isMultiSelect ? 'border border-brand-orange/30' : 'border border-dark-border'}`}>
            <button
              onClick={() => setStyleMode('normal')}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                styleMode === 'normal'
                  ? (isMultiSelect ? 'bg-brand-orange text-white' : 'bg-brand-primary text-white')
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
                  ? (isMultiSelect ? 'bg-brand-orange text-white' : 'bg-brand-primary text-white')
                  : 'text-light-muted hover:text-light-text'
              }`}
              title="Hover Styles"
            >
              Hover
            </button>
          </div>
        </div>

        {/* Typography */}
        {((isMultiSelect && selectedElements.length > 0) || element) &&
         (element?.type === 'text' || element?.type === 'heading' || element?.type === 'button' ||
          selectedElements[0]?.type === 'text' || selectedElements[0]?.type === 'heading' || selectedElements[0]?.type === 'button') && (
          <>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isMultiSelect ? 'text-orange-300' : 'text-light-text'}`}>Font Size</label>
              <input
                type="text"
                value={getStyleValue('fontSize')}
                onChange={(e) => updateStyleDirect('fontSize', e.target.value, activeBreakpoint)}
                onBlur={(e) => updateStyle('fontSize', e.target.value, activeBreakpoint)}
                className={`w-full px-3 py-2 bg-dark-panel rounded text-sm text-light-text placeholder-light-muted ${isMultiSelect ? 'border border-brand-orange/30' : 'border border-dark-border'}`}
                placeholder={isMultiSelect && hasMultiSelectMixedValues('fontSize') ? 'Mixed Values' : '16px'}
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
              <label className={`block text-sm font-medium mb-2 ${isMultiSelect ? 'text-orange-300' : 'text-light-text'}`}>Line Height</label>
              <input
                type="text"
                value={getStyleValue('lineHeight')}
                onChange={(e) => updateStyleDirect('lineHeight', e.target.value, activeBreakpoint)}
                onBlur={(e) => updateStyle('lineHeight', e.target.value, activeBreakpoint)}
                className={`w-full px-3 py-2 bg-dark-panel rounded text-sm text-light-text placeholder-light-muted ${isMultiSelect ? 'border border-brand-orange/30' : 'border border-dark-border'}`}
                placeholder={isMultiSelect && hasMultiSelectMixedValues('lineHeight') ? 'Mixed Values' : '1.5 or 24px'}
              />
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isMultiSelect ? 'text-orange-300' : 'text-light-text'}`}>Text Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={getStyleValue('color') || '#000000'}
                  onChange={(e) => updateStyle('color', e.target.value, activeBreakpoint)}
                  className={`flex-1 h-10 rounded cursor-pointer ${isMultiSelect ? 'border border-brand-orange/30' : 'border border-dark-border'}`}
                />
                <button
                  onClick={() => updateStyle('color', '', activeBreakpoint)}
                  className="p-2 hover:bg-dark-hover rounded transition-colors text-light-muted hover:text-light-text"
                  title="Clear color"
                >
                  <FiX size={16} />
                </button>
              </div>
              {isMultiSelect && hasMultiSelectMixedValues('color') && (
                <p className="text-xs text-orange-400 mt-1">Mixed Values</p>
              )}
              <GlobalColorSwatches onColorSelect={(color) => updateStyle('color', color, activeBreakpoint)} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-light-text mb-2">Text Alignment</label>
              <div className="flex items-center gap-1 bg-dark-panel border border-dark-border rounded p-1">
                <button
                  onClick={() => {
                    updateStyle('textAlign', 'left', activeBreakpoint);
                  }}
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
                  onClick={() => {
                    updateStyle('textAlign', 'center', activeBreakpoint);
                  }}
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
                  onClick={() => {
                    updateStyle('textAlign', 'right', activeBreakpoint);
                  }}
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
        {(isMultiSelect || element) && (element?.type === 'section' || element?.type === 'row' || element?.type === 'button') && (() => {
          if (!element && !isMultiSelect) return null;

          // Parse margin shorthand to get left/right values
          const margin = getStyleValue('margin') || '0';
          const parts = margin.trim().split(/\s+/);
          let marginRight = '0', marginLeft = '0';

          if (parts.length === 1) {
            marginLeft = marginRight = parts[0];
          } else if (parts.length === 2) {
            marginRight = marginLeft = parts[1];
          } else if (parts.length === 3) {
            marginRight = marginLeft = parts[1];
          } else if (parts.length >= 4) {
            marginRight = parts[1];
            marginLeft = parts[3];
          }

          const isLeft = (marginLeft === '0' || marginLeft === '0px') && marginRight === 'auto';
          const isCenter = marginLeft === 'auto' && marginRight === 'auto';
          const isRight = marginLeft === 'auto' && (marginRight === '0' || marginRight === '0px');

          const handleAlignment = (left: string, right: string) => {
            // Helper to parse existing margin shorthand and update left/right values
            const updateMarginShorthand = (existingStyles: Record<string, any>) => {
              const margin = existingStyles.margin || '0';
              const parts = margin.trim().split(/\s+/);

              let top = '0', bottom = '0';
              if (parts.length === 1) {
                top = bottom = parts[0];
              } else if (parts.length === 2) {
                top = bottom = parts[0];
              } else if (parts.length === 3) {
                top = parts[0];
                bottom = parts[2];
              } else if (parts.length >= 4) {
                top = parts[0];
                bottom = parts[2];
              }

              return `${top} ${right} ${bottom} ${left}`;
            };

            // Get fresh store data
            const store = useBuilderStore.getState();
            const currentElements = store.elements;
            const currentSelectedIds = store.selectedElementIds;
            const isCurrentlyMultiSelect = currentSelectedIds.length > 1;

            if (isCurrentlyMultiSelect) {
              // Multi-select: batch update all selected elements
              const elementIdsSet = new Set(currentSelectedIds);

              const updatedElements = currentElements.map(el => {
                if (!elementIdsSet.has(el.id)) return el;

                if (styleMode === 'hover') {
                  const hoverStyles = (el as any).hoverStyles || {};
                  const existingStyles = hoverStyles[activeBreakpoint] || {};
                  return {
                    ...el,
                    hoverStyles: {
                      ...hoverStyles,
                      [activeBreakpoint]: {
                        ...existingStyles,
                        margin: updateMarginShorthand(existingStyles),
                        marginLeft: undefined,
                        marginRight: undefined,
                      },
                    },
                  };
                } else {
                  const existingStyles = el.styles[activeBreakpoint] || {};
                  return {
                    ...el,
                    styles: {
                      ...el.styles,
                      [activeBreakpoint]: {
                        ...existingStyles,
                        margin: updateMarginShorthand(existingStyles),
                        marginLeft: undefined,
                        marginRight: undefined,
                      },
                    },
                  };
                }
              });

              useBuilderStore.setState({ elements: updatedElements });
              useBuilderStore.getState().addToHistory();
              return;
            }

            // Single element mode
            if (!element) return;

            if (styleMode === 'hover') {
              const hoverStyles = (element as any).hoverStyles || {};
              const existingStyles = hoverStyles[activeBreakpoint] || {};
              updateElement(element.id, {
                hoverStyles: {
                  ...hoverStyles,
                  [activeBreakpoint]: {
                    ...existingStyles,
                    margin: updateMarginShorthand(existingStyles),
                    marginLeft: undefined,
                    marginRight: undefined,
                  },
                },
              } as any);
            } else {
              const existingStyles = element.styles[activeBreakpoint] || {};
              updateElement(element.id, {
                styles: {
                  ...element.styles,
                  [activeBreakpoint]: {
                    ...existingStyles,
                    margin: updateMarginShorthand(existingStyles),
                    marginLeft: undefined,
                    marginRight: undefined,
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
                  <RiAlignItemLeftFill size={16} />
                </button>
                <button
                  onClick={() => handleAlignment('auto', 'auto')}
                  className={`flex-1 p-2 rounded transition-colors flex items-center justify-center ${
                    isCenter ? 'bg-brand-primary text-white' : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Align Center"
                >
                  <RiAlignItemHorizontalCenterFill size={16} />
                </button>
                <button
                  onClick={() => handleAlignment('auto', '0')}
                  className={`flex-1 p-2 rounded transition-colors flex items-center justify-center ${
                    isRight ? 'bg-brand-primary text-white' : 'text-light-muted hover:text-light-text'
                  }`}
                  title="Align Right"
                >
                  <RiAlignItemRightFill size={16} />
                </button>
              </div>
            </div>
          );
        })()}

        {/* Width/Height Controls - only for certain elements */}
        {(isMultiSelect || element) && (element?.type === 'section' || element?.type === 'row' || element?.type === 'image' || element?.type === 'video' || element?.type === 'button') && (
          <>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isMultiSelect ? 'text-orange-300' : 'text-light-text'}`}>Width</label>
              <input
                type="text"
                value={getStyleValue('width')}
                onChange={(e) => updateStyleDirect('width', e.target.value, activeBreakpoint)}
                onBlur={(e) => updateStyle('width', e.target.value, activeBreakpoint)}
                className={`w-full px-3 py-2 bg-dark-panel rounded text-sm text-light-text placeholder-light-muted ${isMultiSelect ? 'border border-brand-orange/30' : 'border border-dark-border'}`}
                placeholder={isMultiSelect && hasMultiSelectMixedValues('width') ? 'Mixed Values' : 'auto, 100%, 500px'}
              />
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isMultiSelect ? 'text-orange-300' : 'text-light-text'}`}>Max Width</label>
              <input
                type="text"
                value={getStyleValue('maxWidth')}
                onChange={(e) => updateStyleDirect('maxWidth', e.target.value, activeBreakpoint)}
                onBlur={(e) => updateStyle('maxWidth', e.target.value, activeBreakpoint)}
                className={`w-full px-3 py-2 bg-dark-panel rounded text-sm text-light-text placeholder-light-muted ${isMultiSelect ? 'border border-brand-orange/30' : 'border border-dark-border'}`}
                placeholder={isMultiSelect && hasMultiSelectMixedValues('maxWidth') ? 'Mixed Values' : 'none, 100%, 1200px'}
              />
            </div>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isMultiSelect ? 'text-orange-300' : 'text-light-text'}`}>Height</label>
              <input
                type="text"
                value={getStyleValue('height')}
                onChange={(e) => updateStyleDirect('height', e.target.value, activeBreakpoint)}
                onBlur={(e) => updateStyle('height', e.target.value, activeBreakpoint)}
                className={`w-full px-3 py-2 bg-dark-panel rounded text-sm text-light-text placeholder-light-muted ${isMultiSelect ? 'border border-brand-orange/30' : 'border border-dark-border'}`}
                placeholder={isMultiSelect && hasMultiSelectMixedValues('height') ? 'Mixed Values' : 'auto, 100%, 300px'}
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
        {(isMultiSelect || element) && (element?.type === 'section' || element?.type === 'row' || element?.type === 'button') && (
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
              <>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={getStyleValue('backgroundColor') || '#ffffff'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value, activeBreakpoint)}
                    className={`flex-1 h-10 rounded cursor-pointer ${isMultiSelect ? 'border border-brand-orange/30' : 'border border-dark-border'}`}
                  />
                  <button
                    onClick={() => updateStyle('backgroundColor', '', activeBreakpoint)}
                    className="p-2 hover:bg-dark-hover rounded transition-colors text-light-muted hover:text-light-text"
                    title="Clear color"
                  >
                    <FiX size={16} />
                  </button>
                </div>
                {isMultiSelect && hasMultiSelectMixedValues('backgroundColor') && (
                  <p className="text-xs text-orange-400 mt-1">Mixed Values</p>
                )}
                <GlobalColorSwatches onColorSelect={(color) => updateStyle('backgroundColor', color, activeBreakpoint)} />
              </>
            )}

            {/* Background Gradient */}
            {backgroundType === 'gradient' && element && (
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-light-muted mb-1 block">Color 1</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={(element.settings.backgroundGradient?.color1 as string) || '#ffffff'}
                      onChange={(e) => updateSetting('backgroundGradient', {
                        ...element.settings.backgroundGradient,
                        color1: e.target.value
                      })}
                      className="flex-1 h-8 border border-dark-border rounded"
                    />
                    <button
                      onClick={() => updateSetting('backgroundGradient', {
                        ...element.settings.backgroundGradient,
                        color1: ''
                      })}
                      className="p-1.5 hover:bg-dark-hover rounded transition-colors text-light-muted hover:text-light-text"
                      title="Clear color"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                  <GlobalColorSwatches onColorSelect={(color) => updateSetting('backgroundGradient', {
                    ...element.settings.backgroundGradient,
                    color1: color
                  })} />
                </div>
                <div>
                  <label className="text-xs text-light-muted mb-1 block">Color 2</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={(element.settings.backgroundGradient?.color2 as string) || '#000000'}
                      onChange={(e) => updateSetting('backgroundGradient', {
                        ...element.settings.backgroundGradient,
                        color2: e.target.value
                      })}
                      className="flex-1 h-8 border border-dark-border rounded"
                    />
                    <button
                      onClick={() => updateSetting('backgroundGradient', {
                        ...element.settings.backgroundGradient,
                        color2: ''
                      })}
                      className="p-1.5 hover:bg-dark-hover rounded transition-colors text-light-muted hover:text-light-text"
                      title="Clear color"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                  <GlobalColorSwatches onColorSelect={(color) => updateSetting('backgroundGradient', {
                    ...element.settings.backgroundGradient,
                    color2: color
                  })} />
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
            {backgroundType === 'image' && element && (
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
            {backgroundType === 'video' && element && (
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
          <label className={`block text-sm font-medium mb-2 ${isMultiSelect ? 'text-orange-300' : 'text-light-text'}`}>Border</label>
          <input
            type="text"
            value={getStyleValue('border')}
            onChange={(e) => updateStyle('border', e.target.value, activeBreakpoint)}
            className={`w-full px-3 py-2 bg-dark-panel rounded text-sm text-light-text placeholder-light-muted ${isMultiSelect ? 'border border-brand-orange/30' : 'border border-dark-border'}`}
            placeholder={isMultiSelect && hasMultiSelectMixedValues('border') ? 'Mixed Values' : '1px solid #000'}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isMultiSelect ? 'text-orange-300' : 'text-light-text'}`}>Border Radius</label>
          <input
            type="text"
            value={getStyleValue('borderRadius')}
            onChange={(e) => updateStyleDirect('borderRadius', e.target.value, activeBreakpoint)}
            onBlur={(e) => updateStyle('borderRadius', e.target.value, activeBreakpoint)}
            className={`w-full px-3 py-2 bg-dark-panel rounded text-sm text-light-text placeholder-light-muted ${isMultiSelect ? 'border border-brand-orange/30' : 'border border-dark-border'}`}
            placeholder={isMultiSelect && hasMultiSelectMixedValues('borderRadius') ? 'Mixed Values' : '4px'}
          />
        </div>
      </div>
      )}
        </>
      )}
    </div>
  );
};
