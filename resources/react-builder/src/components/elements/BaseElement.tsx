import React from 'react';
import type { Element } from '../../types';

interface BaseElementProps {
  element: Element;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const BaseElement: React.FC<BaseElementProps> = ({
  element,
  children,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const getActiveStyles = (): React.CSSProperties => {
    // Get styles for current breakpoint (desktop, tablet, mobile)
    // For now, defaulting to desktop
    return (element.styles.desktop || {}) as React.CSSProperties;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const className = `
    ${isSelected ? 'element-selected' : ''}
    ${isHovered ? 'element-hover' : ''}
    ${!element.is_visible ? 'opacity-50' : ''}
  `.trim();

  return (
    <div
      data-element-id={element.id}
      data-element-type={element.type}
      className={className}
      style={getActiveStyles()}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
};
