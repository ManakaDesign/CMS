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

export const ElementToolbar: React.FC<ElementToolbarProps> = ({ elementId, elementType }) => {
  const { duplicateElement, deleteElement, getElementById } = useBuilderStore();

  const element = getElementById(elementId);
  const colors = getElementColors(element?.type || elementType || '');

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
    duplicateElement(elementId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this element?')) {
      deleteElement(elementId);
    }
  };

  return (
    <div
      className={`absolute top-0 right-0 -translate-y-full flex gap-1 ${colors.bg} border ${colors.border} rounded shadow-lg p-1 z-50`}
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
        title="Duplicate"
        onClick={handleDuplicate}
      >
        <Copy className={`w-4 h-4 ${colors.text}`} />
      </button>

      {/* Delete button */}
      <button
        className="p-1.5 hover:bg-red-100 rounded transition-colors cursor-pointer"
        title="Delete"
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );
};
