import React from 'react';
import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent } from '@dnd-kit/core';
import { useBuilderStore } from '../store/builderStore';
import type { Element, ElementType } from '../types';

interface DragAndDropProviderProps {
  children: React.ReactNode;
}

export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({ children }) => {
  const { page, addElement, setIsDragging } = useBuilderStore();
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

    // Check if we're creating a new element
    if (dragData?.isNew) {
      const elementType = dragData.type as ElementType;
      const parentId = dropData?.parentId ?? null;

      // Validate drop: Check if drop zone accepts this element type
      const acceptedTypes = dropData?.accepts || [];
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(elementType)) {
        console.warn(`Cannot drop ${elementType} here. Accepted types:`, acceptedTypes);
        return;
      }

      // Create default element based on type
      const newElement: Element = {
        id: Date.now(), // Temporary ID, will be replaced by server
        page_id: page.id,
        type: elementType,
        settings: getDefaultSettings(elementType),
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

    // TODO: Handle reordering existing elements
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
      return { gap: '16px' };
    case 'column':
      return { width: '1' };
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
