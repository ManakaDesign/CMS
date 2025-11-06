import React from 'react';
import type { Element } from '../../types';
import { useBuilderStore } from '../../store/builderStore';

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
