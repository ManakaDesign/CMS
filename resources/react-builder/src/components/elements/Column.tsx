import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface ColumnProps {
  element: Element;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Column: React.FC<ColumnProps> = (props) => {
  const { element, children, ...baseProps } = props;

  // Make column droppable - accepts content elements
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${element.id}`,
    data: {
      accepts: ['text', 'heading', 'button', 'image', 'video', 'spacer', 'divider', 'code'],
      parentId: element.id,
    },
  });

  const defaultStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: element.settings.width || '1',
    minHeight: '50px',
  };

  return (
    <BaseElement element={element} {...baseProps}>
      <div
        ref={setNodeRef}
        style={defaultStyles}
        className={isOver ? 'bg-blue-50 ring-2 ring-blue-300' : ''}
      >
        {children || (
          <div className="text-center text-gray-400 py-4">
            Drop content here
          </div>
        )}
      </div>
    </BaseElement>
  );
};
