import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { ElementType } from '../../types';

interface DraggableElementProps {
  type: ElementType;
  icon: React.ReactNode;
  label: string;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({ type, icon, label }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new-${type}`,
    data: {
      type,
      isNew: true,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`
        flex items-center gap-2 p-3 rounded cursor-move hover:bg-gray-100 transition-colors
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <span className="text-gray-600">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
};
