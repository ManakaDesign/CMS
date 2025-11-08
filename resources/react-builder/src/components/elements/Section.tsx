import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface SectionProps {
  element: Element;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Section: React.FC<SectionProps> = (props) => {
  const { element, children, ...baseProps } = props;

  // Make section droppable - accepts rows
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${element.id}`,
    data: {
      accepts: ['row'],
      parentId: element.id,
    },
  });

  return (
    <BaseElement element={element} {...baseProps}>
      <div
        ref={setNodeRef}
        className="w-full relative transition-all"
        style={{ minHeight: element.settings.minHeight || '100px' }}
      >
        {/* Drop indicator line */}
        {isOver && (
          <>
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 z-10" />
            <div className="absolute inset-0 bg-blue-50 bg-opacity-50 z-0" />
          </>
        )}
        {children || (
          <div className="text-center text-gray-400 py-8">
            Drop a Row here
          </div>
        )}
      </div>
    </BaseElement>
  );
};
