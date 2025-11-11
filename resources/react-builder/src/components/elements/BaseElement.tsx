import React from 'react';
import type { Element } from '../../types';
import { useBuilderStore } from '../../store/builderStore';
import { ElementToolbar } from './ElementToolbar';

interface BaseElementProps {
  element: Element;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  skipStyles?: boolean; // Skip applying styles to wrapper (for buttons, etc.)
}

// Get border color based on element type
const getBorderColor = (type: string): string => {
  if (type === 'section') return '#3b82f6'; // Blue
  if (type === 'row') return '#10b981'; // Green
  return '#6b7280'; // Dark gray for content elements
};

export const BaseElement: React.FC<BaseElementProps> = ({
  element,
  children,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
  skipStyles = false,
}) => {
  const { activeBreakpoint } = useBuilderStore();

  const getActiveStyles = (): React.CSSProperties => {
    // Build styles with proper inheritance: desktop → tablet → mobile
    // Each breakpoint inherits from the previous one and overrides specific properties
    let styles: Record<string, any> = { ...element.styles.desktop };

    if (activeBreakpoint === 'tablet' || activeBreakpoint === 'mobile') {
      // Tablet inherits desktop and adds/overrides tablet-specific styles
      styles = { ...styles, ...element.styles.tablet };
    }

    if (activeBreakpoint === 'mobile') {
      // Mobile inherits desktop + tablet and adds/overrides mobile-specific styles
      styles = { ...styles, ...element.styles.mobile };
    }

    return styles as React.CSSProperties;
  };

  const getHoverStyles = (): React.CSSProperties => {
    // Build hover styles with same inheritance pattern + normal styles as base
    const hoverStyles = (element as any).hoverStyles || {};

    // Start with normal styles
    let styles = { ...getActiveStyles() };

    // Apply hover overrides with inheritance
    let hoverOverrides: Record<string, any> = { ...hoverStyles.desktop };

    if (activeBreakpoint === 'tablet' || activeBreakpoint === 'mobile') {
      hoverOverrides = { ...hoverOverrides, ...hoverStyles.tablet };
    }

    if (activeBreakpoint === 'mobile') {
      hoverOverrides = { ...hoverOverrides, ...hoverStyles.mobile };
    }

    // Merge normal styles with hover overrides
    styles = { ...styles, ...hoverOverrides };

    return styles as React.CSSProperties;
  };

  // Convert React.CSSProperties to CSS string
  const stylesToCSS = (styles: React.CSSProperties): string => {
    return Object.entries(styles)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${cssKey}: ${value} !important;`;
      })
      .join(' ');
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const borderColor = getBorderColor(element.type);

  // Use inset box-shadow for inside borders instead of outline
  const outlineStyle: React.CSSProperties = {};
  if (isSelected) {
    outlineStyle.boxShadow = `inset 0 0 0 2px ${borderColor}`;
  } else if (isHovered) {
    outlineStyle.boxShadow = `inset 0 0 0 2px ${borderColor}`;
    outlineStyle.opacity = '0.6';
  }

  // Combine default classes with custom element classes
  const elementClasses = element.settings.elementClass || '';
  const className = `
    relative
    ${!element.is_visible ? 'opacity-50' : ''}
    ${elementClasses}
  `.trim();

  // Check if element has hover styles
  const hoverStyles = (element as any).hoverStyles || {};
  const hasHoverStyles = Object.keys(hoverStyles).some(
    (key) => hoverStyles[key] && Object.keys(hoverStyles[key]).length > 0
  );

  // When skipStyles is true, we still need to apply certain properties to the wrapper
  // for proper layout: display, width, height, and alignment
  const getWrapperStyles = (): React.CSSProperties => {
    if (skipStyles) {
      const activeStyles = getActiveStyles();
      const wrapperStyles: React.CSSProperties = {};

      // Display property for inline-block, flex, etc.
      if (activeStyles.display) {
        wrapperStyles.display = activeStyles.display;
      }

      // Sizing properties
      if (activeStyles.width) {
        wrapperStyles.width = activeStyles.width;
      } else if (element.type === 'button' && activeStyles.display === 'block') {
        // For buttons with display:block but no explicit width, use fit-content
        // This allows the button to be centered with margin:auto
        wrapperStyles.width = 'fit-content';
      }

      if (activeStyles.maxWidth) wrapperStyles.maxWidth = activeStyles.maxWidth;
      if (activeStyles.height) wrapperStyles.height = activeStyles.height;
      if (activeStyles.maxHeight) wrapperStyles.maxHeight = activeStyles.maxHeight;

      // Alignment properties (for centering elements with limited width)
      if (activeStyles.marginLeft) wrapperStyles.marginLeft = activeStyles.marginLeft;
      if (activeStyles.marginRight) wrapperStyles.marginRight = activeStyles.marginRight;

      return { ...wrapperStyles, ...outlineStyle };
    }
    return { ...getActiveStyles(), ...outlineStyle };
  };

  return (
    <>
      {/* Inject hover styles via CSS (skip for elements with skipStyles) */}
      {!skipStyles && hasHoverStyles && (
        <style>
          {`[data-element-id="${element.id}"]:hover { ${stylesToCSS(getHoverStyles())} }`}
        </style>
      )}

      <div
        id={element.settings.elementId || undefined}
        data-element-id={element.id}
        data-element-type={element.type}
        className={className}
        style={getWrapperStyles()}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* Show toolbar on hover or selection */}
        {(isHovered || isSelected) && (
          <ElementToolbar
            elementId={element.id}
            elementType={element.type}
          />
        )}
        {children}
      </div>
    </>
  );
};
