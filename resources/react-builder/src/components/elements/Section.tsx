import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';
import { DropZone } from '../DropZone';
import { useBuilderStore } from '../../store/builderStore';

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
  const { element, ...baseProps } = props;
  const { elements } = useBuilderStore();

  // Get child rows
  const childRows = elements
    .filter((el) => el.parent_id === element.id)
    .sort((a, b) => a.order - b.order);

  // Make section droppable for empty state
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${element.id}-empty`,
    data: {
      accepts: ['row'],
      parentId: element.id,
    },
  });

  return (
    <BaseElement element={element} {...baseProps}>
      <div
        className="w-full relative transition-all"
        style={{ minHeight: element.settings.minHeight || '100px' }}
      >
        {childRows.length > 0 ? (
          <div className="flex flex-col relative">
            {/* Drop zone before first row */}
            <DropZone
              id={`section-${element.id}-drop-before-0`}
              parentId={element.id}
              position="before"
              accepts={['row']}
              index={0}
            />

            {childRows.map((row, index) => {
              // Render the row element via children prop passed from Canvas
              const rowChild = React.Children.toArray(props.children).find((child: any) => {
                return child.key === `${row.id}`;
              });

              return (
                <React.Fragment key={row.id}>
                  {rowChild}

                  {/* Drop zone after each row */}
                  <DropZone
                    id={`section-${element.id}-drop-after-${row.id}`}
                    parentId={element.id}
                    position="after"
                    accepts={['row']}
                    index={index + 1}
                  />
                </React.Fragment>
              );
            })}
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
