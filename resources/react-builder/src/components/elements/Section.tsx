import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';
import { DropZone } from '../DropZone';

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

  // Make section droppable for empty state
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${element.id}-empty`,
    data: {
      accepts: ['row'],
      parentId: element.id,
    },
  });

  // Convert children to array for processing
  const childrenArray = React.Children.toArray(children);
  const hasChildren = childrenArray.length > 0;

  return (
    <BaseElement element={element} {...baseProps}>
      <div
        className="w-full relative transition-all"
        style={{ minHeight: element.settings.minHeight || '100px' }}
      >
        {hasChildren ? (
          <div className="flex flex-col relative">
            {/* Drop zone before first child */}
            <DropZone
              id={`section-${element.id}-drop-before-0`}
              parentId={element.id}
              position="before"
              accepts={['row']}
              index={0}
            />

            {/* Render children with drop zones between them */}
            {childrenArray.map((child, index) => (
              <React.Fragment key={(child as any).key || index}>
                {child}

                {/* Drop zone after each child */}
                <DropZone
                  id={`section-${element.id}-drop-after-${index}`}
                  parentId={element.id}
                  position="after"
                  accepts={['row']}
                  index={index + 1}
                />
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div
            ref={setNodeRef}
            className="text-center text-gray-400 py-8 relative"
          >
            {isOver && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-400" />
            )}
            Drop a Row here
          </div>
        )}
      </div>
    </BaseElement>
  );
};
