import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';
import { DropZone } from '../DropZone';
import { useBuilderStore } from '../../store/builderStore';
import { BackgroundRenderer } from './BackgroundRenderer';

interface SectionProps {
  element: Element;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Section: React.FC<SectionProps> = (props) => {
  const { element, children, ...baseProps } = props;
  const { getElementChildren, activeBreakpoint } = useBuilderStore();

  // Make section droppable for empty state
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${element.id}-empty`,
    data: {
      accepts: ['row'],
      parentId: element.id,
    },
  });

  // Get actual child elements from store (sorted by order)
  const childElements = getElementChildren(element.id);
  const hasChildren = childElements.length > 0;

  // Convert children to array for rendering
  const childrenArray = React.Children.toArray(children);

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

  // Get sizing styles (width, height) for outer wrapper
  const getSizingStyles = (): React.CSSProperties => {
    const allStyles = getActiveStyles();
    const sizingStyles: React.CSSProperties = {};

    if (allStyles.width) sizingStyles.width = allStyles.width;
    if (allStyles.maxWidth) sizingStyles.maxWidth = allStyles.maxWidth;
    if (allStyles.height) sizingStyles.height = allStyles.height;
    if (allStyles.maxHeight) sizingStyles.maxHeight = allStyles.maxHeight;

    return sizingStyles;
  };

  // Get content styles (everything except sizing)
  const getContentStyles = (): React.CSSProperties => {
    const allStyles = getActiveStyles();
    const contentStyles = { ...allStyles };

    delete contentStyles.width;
    delete contentStyles.maxWidth;
    delete contentStyles.height;
    delete contentStyles.maxHeight;

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
    <BaseElement element={element} {...baseProps} skipStyles={true}>
      {/* Inject hover styles */}
      {hasHoverStyles && (
        <style>
          {`[data-element-id="${element.id}"] > div > .section-content:hover { ${stylesToCSS(getHoverStyles())} }`}
        </style>
      )}

      <div
        className="relative transition-all overflow-hidden"
        style={{ minHeight: element.settings.minHeight || '100px', width: '100%', ...getSizingStyles() }}
      >
        {/* Background Layer - fills entire element */}
        <BackgroundRenderer element={element} />

        {/* Content Layer - padding applied here */}
        <div className="relative z-10 section-content" style={getContentStyles()}>
        {hasChildren ? (
          <div className="flex flex-col relative">
            {/* Drop zone before first child */}
            <DropZone
              id={`section-${element.id}-drop-before-0`}
              parentId={element.id}
              position="before"
              accepts={['row']}
              index={0}
            />

            {/* Render children with drop zones between them */}
            {childrenArray.map((child, index) => {
              const childElement = childElements[index];
              return (
                <React.Fragment key={(child as any).key || index}>
                  {child}

                  {/* Drop zone after each child - use actual element order + 1 */}
                  <DropZone
                    id={`section-${element.id}-drop-after-${childElement?.id || index}`}
                    parentId={element.id}
                    position="after"
                    accepts={['row']}
                    index={childElement ? childElement.order + 1 : index + 1}
                  />
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div
            ref={setNodeRef}
            className="text-center text-gray-400 py-8 relative"
          >
            {isOver && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-400" />
            )}
            Drop a Row here
          </div>
        )}
        </div>
      </div>
    </BaseElement>
  );
};
