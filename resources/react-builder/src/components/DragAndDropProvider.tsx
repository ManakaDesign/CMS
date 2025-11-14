import React from 'react';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from '@dnd-kit/core';
import { useBuilderStore } from '../store/builderStore';
import type { Element, ElementType } from '../types';
import { useDragContext } from '../contexts/DragContext';

interface DragAndDropProviderProps {
  children: React.ReactNode;
}

export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({ children }) => {
  const { page, elements, addElement, moveElement, setIsDragging, selectedElementIds } = useBuilderStore();
  const { setActiveElementType } = useDragContext();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);

    // Set the active element type for drop zones to use
    const dragData = event.active.data.current;
    const elementType = dragData?.type || dragData?.elementType;
    setActiveElementType(elementType || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setIsDragging(false);
    setActiveElementType(null);

    if (!over || !page) return;

    const dragData = active.data.current;
    const dropData = over.data.current;

    // Check if we're creating a new element from sidebar
    if (dragData?.isNew) {
      const elementType = dragData.type as ElementType;
      const parentId = dropData?.parentId ?? null;

      // Validate drop: Check if drop zone accepts this element type
      const acceptedTypes = dropData?.accepts || [];
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(elementType)) {
        console.warn(`Cannot drop ${elementType} here. Accepted types:`, acceptedTypes);
        return;
      }

      // Get default settings and add columnIndex if dropping into a row column
      const defaultSettings = getDefaultSettings(elementType);
      if (dropData?.columnIndex !== undefined) {
        defaultSettings.columnIndex = dropData.columnIndex;
      }

      // Calculate order based on drop zone index
      const dropIndex = dropData?.index ?? 0;

      // Create default element based on type
      const newElement: Element = {
        id: Date.now(), // Temporary ID, will be replaced by server
        page_id: page.id,
        type: elementType,
        settings: defaultSettings,
        styles: {
          desktop: getDefaultStyles(elementType),
        },
        parent_id: parentId ?? undefined,
        order: dropIndex,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addElement(newElement);
    }
    // Handle reordering existing canvas elements
    else if (dragData?.isCanvasElement) {
      const elementId = dragData.elementId;
      const newParentId = dropData?.parentId ?? null;

      // Check if this element is part of multi-selection
      const isMultiSelect = selectedElementIds.length > 1 && selectedElementIds.includes(elementId);
      const elementsToMove = isMultiSelect ? selectedElementIds : [elementId];

      // Don't allow dropping an element into itself or its own children
      if (elementsToMove.includes(newParentId as number)) {
        console.warn('Cannot drop element into itself');
        return;
      }

      // Check if the new parent is a child of any element being moved
      const isChildOfElement = (potentialChildId: number | null, parentIds: number[]): boolean => {
        if (!potentialChildId) return false;
        if (parentIds.includes(potentialChildId)) return true;

        const potentialChild = elements.find(el => el.id === potentialChildId);
        if (!potentialChild?.parent_id) return false;

        return isChildOfElement(potentialChild.parent_id, parentIds);
      };

      if (newParentId && isChildOfElement(newParentId, elementsToMove)) {
        console.warn('Cannot drop element into its own child');
        return;
      }

      // Validate drop: Check if drop zone accepts this element type
      const acceptedTypes = dropData?.accepts || [];
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(dragData.elementType)) {
        console.warn(`Cannot drop ${dragData.elementType} here. Accepted types:`, acceptedTypes);
        return;
      }

      // Calculate new order from drop zone index
      let newOrder = dropData?.index ?? 0;

      // Move all selected elements to the new location
      elementsToMove.forEach((id, index) => {
        moveElement(id, newParentId, newOrder + index);
      });

      // Update columnIndex if dropping into a row column
      if (dropData?.columnIndex !== undefined) {
        const { updateElement } = useBuilderStore.getState();
        elementsToMove.forEach(id => {
          const element = elements.find(el => el.id === id);
          if (element) {
            const updatedSettings = { ...element.settings, columnIndex: dropData.columnIndex };
            updateElement(id, { settings: updatedSettings });
          }
        });
      }
    }
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="bg-orange-100 border-2 border-orange-400 rounded px-3 py-2 shadow-xl opacity-90">
            <div className="flex items-center gap-2 text-orange-900 font-medium text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              {selectedElementIds.length > 1 ? `Moving ${selectedElementIds.length} elements...` : 'Moving...'}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

// Helper functions for default settings
function getDefaultSettings(type: ElementType): Record<string, any> {
  switch (type) {
    case 'section':
      return { minHeight: '100px' };
    case 'row':
      return {
        gap: '16px',
        columns: 1,
        responsiveLayout: { desktop: 1, tablet: 1, mobile: 1 }
      };
    case 'column':
      return { width: '1' }; // Legacy - deprecated
    case 'text':
      return { content: 'Edit this text...' };
    case 'heading':
      return { tag: 'h2', content: 'Your Heading' };
    case 'button':
      return { text: 'Click Me', url: '#', openInNewTab: false };
    case 'image':
      return { src: 'https://via.placeholder.com/800x400', alt: 'Placeholder', width: '100%', objectFit: 'cover' };
    case 'video':
      return { url: '', provider: 'youtube', width: '100%', aspectRatio: '16/9' };
    case 'spacer':
      return { height: '50px' };
    case 'divider':
      return { style: 'solid', color: '#e5e7eb', width: '100%', height: '1px' };
    case 'code':
      return { code: '// Your code here', language: 'javascript' };
    default:
      return {};
  }
}

function getDefaultStyles(type: ElementType): Record<string, any> {
  switch (type) {
    case 'section':
      return {
        padding: '40px 20px',
        width: '100%',
      };
    case 'row':
      return {
        display: 'flex',
        width: '100%',
        gap: '16px',
      };
    case 'column':
      return {
        flex: '1',
      };
    case 'text':
      return {
        fontSize: '16px',
        lineHeight: '1.5',
      };
    case 'heading':
      return {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '16px',
      };
    case 'button':
      return {
        display: 'inline-block',
        padding: '12px 24px',
      };
    default:
      return {};
  }
}
