import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

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
  const { element, children, ...baseProps } = props;

  // Make row droppable - accepts columns and other elements
  const { setNodeRef, isOver } = useDroppable({
    id: `row-${element.id}`,
    data: {
      accepts: ['column', 'text', 'heading', 'button', 'image', 'video', 'spacer', 'divider', 'code'],
      parentId: element.id,
    },
  });

  const defaultStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: element.settings.gap || '16px',
    width: '100%',
  };

  return (
    <BaseElement element={element} {...baseProps}>
      <div
        ref={setNodeRef}
        style={defaultStyles}
        className={isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''}
      >
        {children || (
          <div className="w-full text-center text-gray-400 py-4">
            Drop elements here
          </div>
        )}
      </div>
    </BaseElement>
  );
};
