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

  // Get desktop column count (for rendering structure)
  let columnCount: number;
  if (isLegacy) {
    columnCount = columnsConfig;
  } else {
    columnCount = columnsConfig.desktop || columnsConfig.tablet || 1;
  }

  // Determine flex direction based on breakpoint
  // On mobile, stack columns vertically instead of reducing column count
  const flexDirection = activeBreakpoint === 'mobile' ? 'column' : 'row';

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

  // Get content styles (everything except sizing and alignment - those go on BaseElement wrapper)
  const getContentStyles = (): React.CSSProperties => {
    const allStyles = getActiveStyles();
    const contentStyles = { ...allStyles };

    delete contentStyles.width;
    delete contentStyles.maxWidth;
    delete contentStyles.height;
    delete contentStyles.maxHeight;
    delete contentStyles.marginLeft;
    delete contentStyles.marginRight;

    return contentStyles;
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

      <div className="relative overflow-hidden" style={{ width: '100%', height: '100%' }}>
        {/* Background Layer - fills entire element */}
        <BackgroundRenderer element={element} />

        {/* Content Layer - padding and other styles applied here */}
        <div className="relative z-10 flex row-content" style={{ width: '100%', flexDirection, ...getContentStyles(), gap: element.settings.gap || '16px', minHeight: element.settings.minHeight || 'auto' }}>
        {Array.from({ length: columnCount }).map((_, columnIndex) => {
          // Get column-specific styles
          const columnStyles = element.settings.columnStyles || [];
          const columnStyle = columnStyles[columnIndex] || {};

          // Get column hover styles
          const columnHoverStyles = element.settings.columnHoverStyles || [];
          const columnHoverStyle = columnHoverStyles[columnIndex] || {};

          // Get column background settings
          const columnBackgrounds = element.settings.columnBackgrounds || [];
          const columnBackground = columnBackgrounds[columnIndex] || {};

          // Get column ID and classes
          const columnIds = element.settings.columnIds || [];
          const columnId = columnIds[columnIndex] || undefined;
          const columnClasses = element.settings.columnClasses || [];
          const columnClass = columnClasses[columnIndex] || '';

          return (
          <RowColumn
            key={columnIndex}
            rowId={element.id}
            rowElementId={element.id}
            columnIndex={columnIndex}
            columnCount={columnCount}
            isRowSelected={isSelected || false}
            children={columnGroups[columnIndex]}
            columnStyle={columnStyle}
            columnHoverStyle={columnHoverStyle}
            columnBackground={columnBackground}
            activeBreakpoint={activeBreakpoint}
            columnId={columnId}
            columnClass={columnClass}
          />
        );
        })}
        </div>
      </div>
    </BaseElement>
  );
};

// Individual column component with droppable area
interface RowColumnProps {
  rowId: number;
  rowElementId: number;
  columnIndex: number;
  columnCount: number;
  isRowSelected: boolean;
  children: Element[];
  columnStyle?: React.CSSProperties;
  columnHoverStyle?: React.CSSProperties;
  columnBackground?: any;
  activeBreakpoint: string;
  columnId?: string;
  columnClass?: string;
}

const RowColumn: React.FC<RowColumnProps> = ({ rowId, rowElementId, columnIndex, columnCount, isRowSelected, children, columnStyle, columnHoverStyle, columnBackground, activeBreakpoint, columnId, columnClass }) => {
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

  // Show dashed border for all columns when row is selected
  const borderStyle: React.CSSProperties = {};
  if (isRowSelected) {
    borderStyle.border = '2px dashed #10b981'; // Green dashed border for all sides
  }

  // Convert styles to CSS string for hover styles
  const stylesToCSS = (styles: React.CSSProperties): string => {
    return Object.entries(styles)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value} !important;`;
      })
      .join(' ');
  };

  // Check if column has hover styles
  const hasColumnHoverStyles = columnHoverStyle && Object.keys(columnHoverStyle).length > 0;

  // Render column background
  const renderColumnBackground = () => {
    if (!columnBackground) return null;

    // Gradient background
    if (columnBackground.gradientColor1 && columnBackground.gradientColor2) {
      const angle = columnBackground.gradientAngle || 45;
      const gradient = `linear-gradient(${angle}deg, ${columnBackground.gradientColor1}, ${columnBackground.gradientColor2})`;
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: gradient,
            zIndex: 0,
          }}
        />
      );
    }

    // Image background
    if (columnBackground.imageUrl) {
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${columnBackground.imageUrl})`,
            backgroundSize: columnBackground.imageSize || 'cover',
            backgroundPosition: columnBackground.imagePosition || 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
          }}
        />
      );
    }

    // Video background
    if (columnBackground.videoUrl) {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ minWidth: '100%', minHeight: '100%' }}
          >
            <source src={columnBackground.videoUrl} type="video/mp4" />
          </video>
        </div>
      );
    }

    return null;
  };

  const columnClassName = `row-${rowElementId}-column-${columnIndex}`;

  return (
    <>
      {/* Inject hover styles for this column */}
      {hasColumnHoverStyles && (
        <style>
          {`.${columnClassName}:hover { ${stylesToCSS(columnHoverStyle)} }`}
        </style>
      )}

      <div
        id={columnId}
        className={`${columnClassName} flex-1 min-h-[100px] relative transition-all overflow-hidden ${columnClass || ''}`.trim()}
        style={{
          flex: activeBreakpoint === 'mobile' ? '1 1 100%' : `1 1 ${100 / columnCount}%`,
          ...borderStyle,
          ...columnStyle,
        }}
      >
        {/* Column Background Layer */}
        {renderColumnBackground()}

        {/* Column Content Layer */}
        <div className="relative" style={{ zIndex: 1 }}>
      {children.length > 0 ? (
        <div className="relative">
          {/* Drop zone before first element */}
          <DropZone
            id={`row-${rowId}-col-${columnIndex}-drop-before-0`}
            parentId={rowId}
            position="before"
            accepts={['text', 'heading', 'button', 'image', 'video', 'spacer', 'divider', 'code']}
            index={0}
            columnIndex={columnIndex}
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
                columnIndex={columnIndex}
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
    </div>
    </>
  );
};
