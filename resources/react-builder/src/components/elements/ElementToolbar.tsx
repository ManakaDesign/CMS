import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useBuilderStore } from '../../store/builderStore';
import { Move, Copy, Trash2 } from 'lucide-react';

interface ElementToolbarProps {
  elementId: number;
  elementType?: string;
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({ elementId, elementType }) => {
  const { duplicateElement, deleteElement, getElementById } = useBuilderStore();

  const element = getElementById(elementId);

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
      className="absolute top-0 right-0 -translate-y-full flex gap-1 bg-white border border-gray-300 rounded shadow-lg p-1 z-50"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Move button - acts as drag handle */}
      <button
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-move"
        title="Move (Drag to reorder)"
      >
        <Move className="w-4 h-4 text-gray-700" />
      </button>

      {/* Duplicate button */}
      <button
        className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-pointer"
        title="Duplicate"
        onClick={handleDuplicate}
      >
        <Copy className="w-4 h-4 text-gray-700" />
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
