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
}) => {
  const { activeBreakpoint } = useBuilderStore();

  const getActiveStyles = (): React.CSSProperties => {
    // Get styles for current breakpoint with fallback to desktop
    const breakpointStyles = element.styles[activeBreakpoint] || element.styles.desktop || {};
    return breakpointStyles as React.CSSProperties;
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

  const className = `
    relative
    ${!element.is_visible ? 'opacity-50' : ''}
  `.trim();

  return (
    <div
      data-element-id={element.id}
      data-element-type={element.type}
      className={className}
      style={{ ...getActiveStyles(), ...outlineStyle }}
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
  );
};
