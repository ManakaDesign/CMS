import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';
import { useBuilderStore } from '../../store/builderStore';

interface ButtonProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Button: React.FC<ButtonProps> = (props) => {
  const { element, onClick, ...baseProps } = props;
  const { activeBreakpoint } = useBuilderStore();

  const text = element.settings.text || 'Click Me';
  const url = element.settings.url || '#';
  const target = element.settings.openInNewTab ? '_blank' : '_self';

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  // Get button styles with proper inheritance: desktop → tablet → mobile
  let breakpointStyles: Record<string, any> = { ...element.styles.desktop };

  if (activeBreakpoint === 'tablet' || activeBreakpoint === 'mobile') {
    // Tablet inherits desktop and adds/overrides tablet-specific styles
    breakpointStyles = { ...breakpointStyles, ...element.styles.tablet };
  }

  if (activeBreakpoint === 'mobile') {
    // Mobile inherits desktop + tablet and adds/overrides mobile-specific styles
    breakpointStyles = { ...breakpointStyles, ...element.styles.mobile };
  }

  const buttonStyles = {
    display: 'inline-block',
    padding: '12px 24px',
    cursor: 'pointer',
    textDecoration: 'none',
    ...breakpointStyles,
  } as React.CSSProperties;

  // Get hover styles with inheritance
  const getHoverStyles = (): React.CSSProperties => {
    const hoverStyles = (element as any).hoverStyles || {};

    // Start with normal button styles
    let styles = { ...buttonStyles };

    // Apply hover overrides with inheritance
    let hoverOverrides: Record<string, any> = { ...hoverStyles.desktop };

    if (activeBreakpoint === 'tablet' || activeBreakpoint === 'mobile') {
      hoverOverrides = { ...hoverOverrides, ...hoverStyles.tablet };
    }

    if (activeBreakpoint === 'mobile') {
      hoverOverrides = { ...hoverOverrides, ...hoverStyles.mobile };
    }

    // Merge with hover overrides
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
    <BaseElement element={element} onClick={onClick} {...baseProps} skipStyles={true}>
      {/* Inject hover styles for button */}
      {hasHoverStyles && (
        <style>
          {`[data-element-id="${element.id}"] a:hover { ${stylesToCSS(getHoverStyles())} }`}
        </style>
      )}

      <a
        href={url}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        onClick={handleButtonClick}
        style={buttonStyles}
        className="block w-full h-full"
      >
        {text}
      </a>
    </BaseElement>
  );
};
