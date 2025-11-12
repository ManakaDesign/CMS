import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useBuilderStore } from '../../store/builderStore';
import { Move, Copy, Trash2 } from 'lucide-react';

interface ElementToolbarProps {
  elementId: number;
  elementType?: string;
}

// Get colors based on element type
const getElementColors = (type: string): { bg: string; border: string; text: string; hover: string } => {
  if (type === 'section') {
    return {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      text: 'text-blue-700',
      hover: 'hover:bg-blue-100',
    };
  }
  if (type === 'row') {
    return {
      bg: 'bg-green-50',
      border: 'border-green-400',
      text: 'text-green-700',
      hover: 'hover:bg-green-100',
    };
  }
  return {
    bg: 'bg-gray-50',
    border: 'border-gray-400',
    text: 'text-gray-700',
    hover: 'hover:bg-gray-100',
  };
};

// Get position classes based on element type
const getToolbarPosition = (type: string): string => {
  if (type === 'row') {
    return 'top-0 left-0'; // Rows: left top (inside, no margin)
  }
  return 'top-0 right-0'; // Sections and elements: right top (inside, no margin)
};

export const ElementToolbar: React.FC<ElementToolbarProps> = ({ elementId, elementType }) => {
  const { duplicateElement, deleteElement, getElementById, selectedElementIds } = useBuilderStore();

  const element = getElementById(elementId);
  const type = element?.type || elementType || '';

  // Check if this element is part of multi-selection
  const isMultiSelected = selectedElementIds.includes(elementId);
  const isMultiSelectMode = selectedElementIds.length > 1;

  // Use orange colors for multi-select, otherwise type-based colors
  const colors = isMultiSelected ? {
    bg: 'bg-orange-50',
    border: 'border-orange-400',
    text: 'text-orange-700',
    hover: 'hover:bg-orange-100',
  } : getElementColors(type);

  const position = getToolbarPosition(type);

  // Setup draggable for the move button only
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `canvas-element-${elementId}`,
    data: {
      elementId: elementId,
      elementType: element?.type || elementType,
      isCanvasElement: true,
    },
  });

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isMultiSelectMode && isMultiSelected) {
      // Duplicate all selected elements
      selectedElementIds.forEach(id => {
        duplicateElement(id);
      });
    } else {
      // Single element duplicate
      duplicateElement(elementId);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isMultiSelectMode && isMultiSelected) {
      // Delete all selected elements
      const count = selectedElementIds.length;
      if (window.confirm(`Are you sure you want to delete ${count} selected elements?`)) {
        selectedElementIds.forEach(id => {
          deleteElement(id);
        });
      }
    } else {
      // Single element delete
      if (window.confirm('Are you sure you want to delete this element?')) {
        deleteElement(elementId);
      }
    }
  };

  return (
    <div
      className={`absolute ${position} flex gap-1 ${colors.bg} border ${colors.border} rounded shadow-lg p-1 z-50`}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Move button - acts as drag handle */}
      <button
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`p-1.5 ${colors.hover} rounded transition-colors cursor-move`}
        title="Move (Drag to reorder)"
      >
        <Move className={`w-4 h-4 ${colors.text}`} />
      </button>

      {/* Duplicate button */}
      <button
        className={`p-1.5 ${colors.hover} rounded transition-colors cursor-pointer`}
        title={isMultiSelectMode && isMultiSelected ? `Duplicate ${selectedElementIds.length} elements` : 'Duplicate'}
        onClick={handleDuplicate}
      >
        <Copy className={`w-4 h-4 ${colors.text}`} />
      </button>

      {/* Delete button */}
      <button
        className="p-1.5 hover:bg-red-100 rounded transition-colors cursor-pointer"
        title={isMultiSelectMode && isMultiSelected ? `Delete ${selectedElementIds.length} elements` : 'Delete'}
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );
};
