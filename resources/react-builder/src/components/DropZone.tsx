import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useDragContext } from '../contexts/DragContext';
import { useBuilderStore } from '../store/builderStore';

interface DropZoneProps {
  id: string;
  parentId: number | null;
  position: 'before' | 'after' | 'inside';
  accepts: string[];
  index?: number;
  columnIndex?: number;
  orientation?: 'horizontal' | 'vertical';
}

/**
 * DropZone - Divi-style precise drop indicator
 *
 * Creates a visual drop zone that shows exactly where an element will be inserted.
 * Displays a colored line with a semi-transparent overlay when hovering.
 * Only visible when dragging a compatible element type.
 */
export const DropZone: React.FC<DropZoneProps> = ({
  id,
  parentId,
  position,
  accepts,
  index,
  columnIndex,
  orientation = 'horizontal',
}) => {
  const { activeElementType } = useDragContext();
  const { isDragging } = useBuilderStore();
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      accepts,
      parentId,
      position,
      index,
      columnIndex,
    },
  });

  // Only show drop zone if we're dragging and the element type is accepted
  const isValidDrop = isDragging && activeElementType && accepts.includes(activeElementType);

  // Don't render anything if this isn't a valid drop zone
  if (!isValidDrop) {
    return null;
  }

  // Determine color based on the DRAGGED element type (not the container)
  const getColor = () => {
    if (activeElementType === 'section') return '#3b82f6'; // Blue for sections
    if (activeElementType === 'row') return '#10b981'; // Green for rows
    return '#6b7280'; // Gray for content elements
  };

  const lineColor = getColor();

  if (orientation === 'horizontal') {
    return (
      <div
        ref={setNodeRef}
        className="relative w-full group"
        style={{
          height: isOver ? '8px' : '4px',
          transition: 'height 150ms ease',
        }}
      >
        {/* Hover area - invisible but extends drop zone */}
        <div className="absolute inset-0 -top-2 -bottom-2" />

        {/* Drop line - visible on hover */}
        <div
          className={`
            absolute left-0 right-0 top-1/2 -translate-y-1/2
            transition-all duration-150
            ${isOver ? 'h-1 opacity-100' : 'h-0.5 opacity-0 group-hover:opacity-30'}
          `}
          style={{
            backgroundColor: lineColor,
          }}
        />

        {/* Drop indicator dot - visible when dragging over */}
        {isOver && (
          <>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: lineColor }}
            />
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: lineColor }}
            />
          </>
        )}

        {/* Semi-transparent overlay - shows drop area */}
        {isOver && (
          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 opacity-20 pointer-events-none"
            style={{ backgroundColor: lineColor }}
          />
        )}
      </div>
    );
  }

  // Vertical orientation (for side-by-side drops in future)
  return (
    <div
      ref={setNodeRef}
      className="relative h-full group"
      style={{
        width: isOver ? '8px' : '4px',
        transition: 'width 150ms ease',
      }}
    >
      {/* Hover area */}
      <div className="absolute inset-0 -left-2 -right-2" />

      {/* Drop line */}
      <div
        className={`
          absolute top-0 bottom-0 left-1/2 -translate-x-1/2
          transition-all duration-150
          ${isOver ? 'w-1 opacity-100' : 'w-0.5 opacity-0 group-hover:opacity-30'}
        `}
        style={{
          backgroundColor: lineColor,
        }}
      />

      {isOver && (
        <>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: lineColor }}
          />
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: lineColor }}
          />
        </>
      )}

      {isOver && (
        <div
          className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 opacity-20 pointer-events-none"
          style={{ backgroundColor: lineColor }}
        />
      )}
    </div>
  );
};
