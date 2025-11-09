import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';
import { DropZone } from '../DropZone';
import { useBuilderStore } from '../../store/builderStore';
import { BackgroundRenderer } from './BackgroundRenderer';

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
  const { getElementChildren } = useBuilderStore();

  // Make section droppable for empty state
  const { setNodeRef, isOver } = useDroppable({
    id: `section-${element.id}-empty`,
    data: {
      accepts: ['row'],
      parentId: element.id,
    },
  });

  // Get actual child elements from store (sorted by order)
  const childElements = getElementChildren(element.id);
  const hasChildren = childElements.length > 0;

  // Convert children to array for rendering
  const childrenArray = React.Children.toArray(children);

  return (
    <BaseElement element={element} {...baseProps}>
      <div
        className="w-full relative transition-all overflow-hidden"
        style={{ minHeight: element.settings.minHeight || '100px' }}
      >
        {/* Background Layer */}
        <BackgroundRenderer element={element} />

        {/* Content Layer */}
        <div className="relative z-10">
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
            {childrenArray.map((child, index) => {
              const childElement = childElements[index];
              return (
                <React.Fragment key={(child as any).key || index}>
                  {child}

                  {/* Drop zone after each child - use actual element order + 1 */}
                  <DropZone
                    id={`section-${element.id}-drop-after-${childElement?.id || index}`}
                    parentId={element.id}
                    position="after"
                    accepts={['row']}
                    index={childElement ? childElement.order + 1 : index + 1}
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
      </div>
    </BaseElement>
  );
};
