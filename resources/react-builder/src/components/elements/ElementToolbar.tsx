import React from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { Move, Copy, Trash2 } from 'lucide-react';

interface ElementToolbarProps {
  elementId: number;
  elementType?: string; // Optional, not used currently
}

export const ElementToolbar: React.FC<ElementToolbarProps> = ({ elementId }) => {
  const { duplicateElement, deleteElement } = useBuilderStore();

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
    >
      <button
        className="p-1.5 hover:bg-gray-100 rounded transition-colors cursor-move"
        title="Move (Drag to reorder)"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Move className="w-4 h-4 text-gray-700" />
      </button>
      <button
        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
        title="Duplicate"
        onClick={handleDuplicate}
      >
        <Copy className="w-4 h-4 text-gray-700" />
      </button>
      <button
        className="p-1.5 hover:bg-red-100 rounded transition-colors"
        title="Delete"
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );
};
