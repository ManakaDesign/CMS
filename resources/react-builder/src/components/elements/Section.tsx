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
        className={`w-full transition-all ${isOver ? 'bg-blue-50 ring-4 ring-blue-400' : ''}`}
        style={{ minHeight: element.settings.minHeight || '100px' }}
      >
        {children || (
          <div className="text-center text-gray-400 py-8">
            Drop a Row here
          </div>
        )}
      </div>
    </BaseElement>
  );
};
