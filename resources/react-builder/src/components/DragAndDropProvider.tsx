import React from 'react';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from '@dnd-kit/core';
import { useBuilderStore } from '../store/builderStore';
import type { Element, ElementType } from '../types';

interface DragAndDropProviderProps {
  children: React.ReactNode;
}

export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({ children }) => {
  const { page, elements, addElement, moveElement, setIsDragging } = useBuilderStore();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setIsDragging(false);

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
        order: 0, // Will be calculated properly
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

      // Don't allow dropping an element into itself or its own children
      if (elementId === newParentId) {
        console.warn('Cannot drop element into itself');
        return;
      }

      // Check if the new parent is a child of the element being moved
      const isChildOfElement = (potentialChildId: number | null, parentId: number): boolean => {
        if (!potentialChildId) return false;
        if (potentialChildId === parentId) return true;

        const potentialChild = elements.find(el => el.id === potentialChildId);
        if (!potentialChild?.parent_id) return false;

        return isChildOfElement(potentialChild.parent_id, parentId);
      };

      if (newParentId && isChildOfElement(newParentId, elementId)) {
        console.warn('Cannot drop element into its own child');
        return;
      }

      // Validate drop: Check if drop zone accepts this element type
      const acceptedTypes = dropData?.accepts || [];
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(dragData.elementType)) {
        console.warn(`Cannot drop ${dragData.elementType} here. Accepted types:`, acceptedTypes);
        return;
      }

      // Calculate new order (add to end of siblings)
      const siblings = elements.filter(el => el.parent_id === newParentId);
      const newOrder = siblings.length > 0 ? Math.max(...siblings.map(el => el.order)) + 1 : 0;

      moveElement(elementId, newParentId, newOrder);

      // Update columnIndex if dropping into a row column
      if (dropData?.columnIndex !== undefined) {
        const element = elements.find(el => el.id === elementId);
        if (element) {
          const updatedSettings = { ...element.settings, columnIndex: dropData.columnIndex };
          // We need to use updateElement from store
          // Since we don't have it here, we'll need to import it
          const { updateElement } = useBuilderStore.getState();
          updateElement(elementId, { settings: updatedSettings });
        }
      }
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {children}
      <DragOverlay>
        {activeId ? (
          <div className="bg-white shadow-lg rounded p-2 border-2 border-primary-500">
            Dragging element...
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
      return { gap: '16px', columns: 1 };
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
