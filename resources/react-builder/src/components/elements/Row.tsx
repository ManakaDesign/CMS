import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';
import { useBuilderStore } from '../../store/builderStore';
import { getElementComponent } from './ElementRegistry';
import { DropZone } from '../DropZone';
import { BackgroundRenderer } from './BackgroundRenderer';

interface RowProps {
  element: Element;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Row: React.FC<RowProps> = (props) => {
  const { element, isSelected, isHovered, onClick, onMouseEnter, onMouseLeave } = props;
  const { elements, activeBreakpoint } = useBuilderStore();

  // Get column count from settings based on active breakpoint
  const columnsConfig = element.settings.columns || 1;
  const isLegacy = typeof columnsConfig === 'number';

  let columnCount: number;
  if (isLegacy) {
    // Legacy: single number, use as desktop, auto-responsive fallback
    const desktopColumns = columnsConfig;
    if (activeBreakpoint === 'mobile') {
      columnCount = 1; // Always 1 column on mobile
    } else if (activeBreakpoint === 'tablet') {
      // Smart fallback for tablet
      columnCount = desktopColumns >= 4 ? Math.ceil(desktopColumns / 2) : desktopColumns;
    } else {
      columnCount = desktopColumns;
    }
  } else {
    // New format: breakpoint-specific with fallbacks
    if (columnsConfig[activeBreakpoint]) {
      columnCount = columnsConfig[activeBreakpoint];
    } else if (activeBreakpoint === 'mobile') {
      // Mobile fallback: use tablet or default to 1
      columnCount = columnsConfig.tablet || 1;
    } else if (activeBreakpoint === 'tablet') {
      // Tablet fallback: use desktop with smart reduction
      const desktopColumns = columnsConfig.desktop || 1;
      columnCount = desktopColumns >= 4 ? Math.ceil(desktopColumns / 2) : desktopColumns;
    } else {
      // Desktop fallback
      columnCount = columnsConfig.desktop || 1;
    }
  }

  // Get children elements
  const childElements = elements
    .filter((el) => el.parent_id === element.id)
    .sort((a, b) => a.order - b.order);

  // Group children by column index (stored in settings.columnIndex, default to 0)
  const columnGroups: Element[][] = Array.from({ length: columnCount }, () => []);
  childElements.forEach((child) => {
    const columnIndex = child.settings.columnIndex ?? 0;
    if (columnIndex >= 0 && columnIndex < columnCount) {
      columnGroups[columnIndex].push(child);
    } else {
      // Fallback to first column if invalid index
      columnGroups[0].push(child);
    }
  });

  // Get styles with proper inheritance: desktop → tablet → mobile
  const getActiveStyles = (): React.CSSProperties => {
    let styles: Record<string, any> = { ...element.styles.desktop };

    if (activeBreakpoint === 'tablet' || activeBreakpoint === 'mobile') {
      styles = { ...styles, ...element.styles.tablet };
    }

    if (activeBreakpoint === 'mobile') {
      styles = { ...styles, ...element.styles.mobile };
    }

    return styles as React.CSSProperties;
  };

  // Get hover styles with inheritance
  const getHoverStyles = (): React.CSSProperties => {
    const hoverStyles = (element as any).hoverStyles || {};
    let styles = { ...getActiveStyles() };
    let hoverOverrides: Record<string, any> = { ...hoverStyles.desktop };

    if (activeBreakpoint === 'tablet' || activeBreakpoint === 'mobile') {
      hoverOverrides = { ...hoverOverrides, ...hoverStyles.tablet };
    }

    if (activeBreakpoint === 'mobile') {
      hoverOverrides = { ...hoverOverrides, ...hoverStyles.mobile };
    }

    styles = { ...styles, ...hoverOverrides };
    return styles as React.CSSProperties;
  };

  // Convert styles to CSS string
  const stylesToCSS = (styles: React.CSSProperties): string => {
    return Object.entries(styles)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value} !important;`;
      })
      .join(' ');
  };

  // Check if element has hover styles
  const hoverStylesObj = (element as any).hoverStyles || {};
  const hasHoverStyles = Object.keys(hoverStylesObj).some(
    (key) => hoverStylesObj[key] && Object.keys(hoverStylesObj[key]).length > 0
  );

  return (
    <BaseElement element={element} isSelected={isSelected} isHovered={isHovered} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} skipStyles={true}>
      {/* Inject hover styles */}
      {hasHoverStyles && (
        <style>
          {`[data-element-id="${element.id}"] > div > .row-content:hover { ${stylesToCSS(getHoverStyles())} }`}
        </style>
      )}

      <div className="relative overflow-hidden" style={{ width: '100%' }}>
        {/* Background Layer - fills entire element */}
        <BackgroundRenderer element={element} />

        {/* Content Layer - padding and other styles applied here */}
        <div className="relative z-10 flex row-content" style={{ gap: element.settings.gap || '16px', width: '100%', ...getActiveStyles() }}>
        {Array.from({ length: columnCount }).map((_, columnIndex) => (
          <RowColumn
            key={columnIndex}
            rowId={element.id}
            columnIndex={columnIndex}
            columnCount={columnCount}
            isRowSelected={isSelected || false}
            children={columnGroups[columnIndex]}
          />
        ))}
        </div>
      </div>
    </BaseElement>
  );
};

// Individual column component with droppable area
interface RowColumnProps {
  rowId: number;
  columnIndex: number;
  columnCount: number;
  isRowSelected: boolean;
  children: Element[];
}

const RowColumn: React.FC<RowColumnProps> = ({ rowId, columnIndex, columnCount, isRowSelected, children }) => {
  const { selectedElementId, hoveredElementId, selectElement, hoverElement, isPreviewMode } = useBuilderStore();

  // Make column droppable (empty state only)
  const { setNodeRef } = useDroppable({
    id: `row-${rowId}-column-${columnIndex}`,
    data: {
      accepts: ['text', 'heading', 'button', 'image', 'video', 'spacer', 'divider', 'code'],
      parentId: rowId,
      columnIndex, // Store which column this is
    },
  });

  const renderElement = (element: Element): React.ReactNode => {
    const Component = getElementComponent(element.type);
    const isSelected = selectedElementId === element.id;
    const isHovered = hoveredElementId === element.id && !isSelected;

    return (
      <Component
        key={element.id}
        element={element}
        isSelected={!isPreviewMode && isSelected}
        isHovered={!isPreviewMode && isHovered}
        onClick={() => !isPreviewMode && selectElement(element.id)}
        onMouseEnter={() => !isPreviewMode && hoverElement(element.id)}
        onMouseLeave={() => !isPreviewMode && hoverElement(null)}
      />
    );
  };

  // Show dashed border on right for all but the last column when row is selected
  const borderStyle: React.CSSProperties = {};
  if (isRowSelected && columnIndex < columnCount - 1) {
    borderStyle.borderRight = '2px dashed #10b981'; // Green dashed border
    borderStyle.paddingRight = '8px';
    borderStyle.marginRight = '8px';
  }

  return (
    <div
      className="flex-1 min-h-[100px] relative transition-all"
      style={{
        flex: `1 1 ${100 / columnCount}%`,
        ...borderStyle,
      }}
    >
      {children.length > 0 ? (
        <div className="flex flex-col relative">
          {/* Drop zone before first element */}
          <DropZone
            id={`row-${rowId}-col-${columnIndex}-drop-before-0`}
            parentId={rowId}
            position="before"
            accepts={['text', 'heading', 'button', 'image', 'video', 'spacer', 'divider', 'code']}
            index={0}
          />

          {children.map((child) => (
            <React.Fragment key={child.id}>
              {renderElement(child)}

              {/* Drop zone after each element - use actual element order + 1 */}
              <DropZone
                id={`row-${rowId}-col-${columnIndex}-drop-after-${child.id}`}
                parentId={rowId}
                position="after"
                accepts={['text', 'heading', 'button', 'image', 'video', 'spacer', 'divider', 'code']}
                index={child.order + 1}
              />
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div
          ref={setNodeRef}
          className="w-full h-full flex items-center justify-center text-center text-gray-400 py-4 text-sm relative"
        >
          Drop elements here
        </div>
      )}
    </div>
  );
};
