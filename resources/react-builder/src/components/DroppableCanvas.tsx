import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Canvas } from './Canvas';

export const DroppableCanvas: React.FC = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-root',
    data: {
      accepts: ['section'], // Only sections can be dropped at root level
      parentId: null,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        relative w-full h-full
        ${isOver ? 'bg-blue-50' : ''}
      `}
    >
      <Canvas />
    </div>
  );
};
