import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';
import { useBuilderStore } from '../../store/builderStore';
import { BackgroundRenderer } from './BackgroundRenderer';
import * as FiIcons from 'react-icons/fi';

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
  const { activeBreakpoint, toggleElementSelection } = useBuilderStore();

  const text = element.settings.text || 'Click Me';
  const url = element.settings.url || '#';
  const target = element.settings.openInNewTab ? '_blank' : '_self';
  const customClasses = element.settings.elementClass || '';
  const iconBefore = element.settings.iconBefore;
  const iconAfter = element.settings.iconAfter;

  // Get icon components
  const IconBefore = iconBefore ? (FiIcons as any)[iconBefore] : null;
  const IconAfter = iconAfter ? (FiIcons as any)[iconAfter] : null;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if Shift key is pressed for multi-select
    if (e.shiftKey) {
      toggleElementSelection(element.id);
    } else {
      onClick?.();
    }
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

  // Styles for the <a> element (visual styles only)
  // Box model (display, width, height, margins) is handled by BaseElement wrapper
  const linkStyles = {
    // Fill the wrapper completely
    display: 'block',
    width: '100%',
    height: '100%',
    // Visual styles
    padding: breakpointStyles.padding || '12px 24px',
    backgroundColor: breakpointStyles.backgroundColor,
    color: breakpointStyles.color,
    fontSize: breakpointStyles.fontSize,
    fontWeight: breakpointStyles.fontWeight,
    fontFamily: breakpointStyles.fontFamily,
    textAlign: breakpointStyles.textAlign,
    lineHeight: breakpointStyles.lineHeight,
    letterSpacing: breakpointStyles.letterSpacing,
    borderRadius: breakpointStyles.borderRadius,
    border: breakpointStyles.border,
    borderWidth: breakpointStyles.borderWidth,
    borderColor: breakpointStyles.borderColor,
    borderStyle: breakpointStyles.borderStyle,
    boxShadow: breakpointStyles.boxShadow,
    opacity: breakpointStyles.opacity,
    transition: breakpointStyles.transition,
    transform: breakpointStyles.transform,
    // Required for BackgroundRenderer positioning
    position: 'relative',
    overflow: 'hidden',
    textDecoration: 'none',
    cursor: 'pointer',
  } as React.CSSProperties;

  // Styles for the <span> element (text layer above background)
  // Minimal - just for positioning above BackgroundRenderer
  const buttonStyles: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    display: 'block',
  };

  // Get hover styles with inheritance
  const getHoverStyles = (): React.CSSProperties => {
    const hoverStyles = (element as any).hoverStyles || {};

    // Build hover styles with inheritance
    let hoverOverrides: Record<string, any> = { ...hoverStyles.desktop };

    if (activeBreakpoint === 'tablet' || activeBreakpoint === 'mobile') {
      hoverOverrides = { ...hoverOverrides, ...hoverStyles.tablet };
    }

    if (activeBreakpoint === 'mobile') {
      hoverOverrides = { ...hoverOverrides, ...hoverStyles.mobile };
    }

    // Merge normal link styles with hover overrides
    return {
      ...linkStyles,
      backgroundColor: hoverOverrides.backgroundColor || linkStyles.backgroundColor,
      color: hoverOverrides.color || linkStyles.color,
      borderColor: hoverOverrides.borderColor || linkStyles.borderColor,
      boxShadow: hoverOverrides.boxShadow || linkStyles.boxShadow,
      opacity: hoverOverrides.opacity || linkStyles.opacity,
      transform: hoverOverrides.transform || linkStyles.transform,
    } as React.CSSProperties;
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
        className={customClasses}
        style={linkStyles}
      >
        {/* Background Layer - fills entire button */}
        <BackgroundRenderer element={element} />

        {/* Text Layer - positioned above background */}
        <span className="button-content" style={{...buttonStyles, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
          {IconBefore && <IconBefore size={18} />}
          {text}
          {IconAfter && <IconAfter size={18} />}
        </span>
      </a>
    </BaseElement>
  );
};
