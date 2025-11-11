import React from 'react';
import { useBuilderStore } from '../store/builderStore';
import type { Element } from '../types';
import { getElementComponent } from './elements/ElementRegistry';
import { DropZone } from './DropZone';

export const Canvas: React.FC = () => {
  const {
    elements,
    selectedElementId,
    hoveredElementId,
    selectElement,
    hoverElement,
    isPreviewMode,
    customCSS,
  } = useBuilderStore();

  const renderElement = (element: Element): React.ReactNode => {
    const Component = getElementComponent(element.type);
    const children = elements
      .filter((el) => el.parent_id === element.id)
      .sort((a, b) => a.order - b.order)
      .map((child) => <React.Fragment key={child.id}>{renderElement(child)}</React.Fragment>);

    const isSelected = selectedElementId === element.id;
    const isHovered = hoveredElementId === element.id && !isSelected;

    return (
      <Component
        key={element.id}
        element={element}
        isSelected={!isPreviewMode && isSelected}
        isHovered={!isPreviewMode && isHovered}
        onClick={() => !isPreviewMode && selectElement(element.id)}
        onMouseEnter={() => !isPreviewMode && hoverElement(element.id)}
        onMouseLeave={() => !isPreviewMode && hoverElement(null)}
      >
        {children.length > 0 ? children : undefined}
      </Component>
    );
  };

  const rootElements = elements
    .filter((el) => !el.parent_id)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      {/* Custom CSS */}
      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      )}

      <div
        className="builder-canvas bg-white min-h-full w-full"
        onClick={(e) => {
          // Click on canvas background deselects all
          if (e.target === e.currentTarget) {
            selectElement(null);
          }
        }}
      >
      {rootElements.length > 0 ? (
        <>
          {/* Drop zone before first element */}
          <DropZone
            id="canvas-drop-before-0"
            parentId={null}
            position="before"
            accepts={['section']}
            index={0}
          />

          {rootElements.map((element, index) => (
            <React.Fragment key={element.id}>
              {renderElement(element)}

              {/* Drop zone after each element */}
              <DropZone
                id={`canvas-drop-after-${element.id}`}
                parentId={null}
                position="after"
                accepts={['section']}
                index={index + 1}
              />
            </React.Fragment>
          ))}
        </>
      ) : (
        <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Your canvas is empty</p>
            <p className="text-sm">Drag elements from the left sidebar to start building</p>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
