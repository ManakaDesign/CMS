import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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

  // Make element draggable for reordering within canvas
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `canvas-element-${element.id}`,
    data: {
      elementId: element.id,
      elementType: element.type,
      isCanvasElement: true,
    },
  });

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

  // Combine outline styles with border color
  const outlineStyle: React.CSSProperties = {};
  if (isSelected) {
    outlineStyle.outline = `2px solid ${borderColor}`;
    outlineStyle.outlineOffset = '2px';
  } else if (isHovered) {
    outlineStyle.outline = `2px dashed ${borderColor}`;
    outlineStyle.outlineOffset = '2px';
  }

  const dragStyle = transform
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }
    : {};

  const className = `
    relative
    ${!element.is_visible ? 'opacity-50' : ''}
  `.trim();

  return (
    <div
      ref={setNodeRef}
      data-element-id={element.id}
      data-element-type={element.type}
      className={className}
      style={{ ...getActiveStyles(), ...outlineStyle, ...dragStyle }}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...attributes}
      {...listeners}
    >
      {/* Show toolbar on hover */}
      {isHovered && !isSelected && (
        <ElementToolbar elementId={element.id} elementType={element.type} />
      )}
      {/* Show toolbar on selection */}
      {isSelected && (
        <ElementToolbar elementId={element.id} elementType={element.type} />
      )}
      {children}
    </div>
  );
};
