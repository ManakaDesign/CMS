import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';
import { useBuilderStore } from '../../store/builderStore';
import { getElementComponent } from './ElementRegistry';

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
  const { elements } = useBuilderStore();

  // Get column count from settings (default to 1)
  const columnCount = element.settings.columns || 1;

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

  const defaultStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: element.settings.gap || '16px',
    width: '100%',
  };

  return (
    <BaseElement element={element} isSelected={isSelected} isHovered={isHovered} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div style={defaultStyles}>
        {Array.from({ length: columnCount }).map((_, columnIndex) => (
          <RowColumn
            key={columnIndex}
            rowId={element.id}
            columnIndex={columnIndex}
            columnCount={columnCount}
            children={columnGroups[columnIndex]}
          />
        ))}
      </div>
    </BaseElement>
  );
};

// Individual column component with droppable area
interface RowColumnProps {
  rowId: number;
  columnIndex: number;
  columnCount: number;
  children: Element[];
}

const RowColumn: React.FC<RowColumnProps> = ({ rowId, columnIndex, columnCount, children }) => {
  const { selectedElementId, hoveredElementId, selectElement, hoverElement, isPreviewMode } = useBuilderStore();

  // Make column droppable
  const { setNodeRef, isOver } = useDroppable({
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

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[100px] ${isOver ? 'bg-green-50 ring-2 ring-green-300' : ''}`}
      style={{ flex: `1 1 ${100 / columnCount}%` }}
    >
      {children.length > 0 ? (
        <div className="flex flex-col gap-2">
          {children.map(renderElement)}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-center text-gray-400 py-4 text-sm">
          Drop elements here
        </div>
      )}
    </div>
  );
};
