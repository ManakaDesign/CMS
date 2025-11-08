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
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="bg-blue-100 border-2 border-blue-400 rounded px-3 py-2 shadow-xl opacity-80">
            <div className="flex items-center gap-2 text-blue-900 font-medium text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Moving...
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
