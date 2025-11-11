import React, { useState, useRef, useEffect } from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';
import { useBuilderStore } from '../../store/builderStore';

interface TextProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Text: React.FC<TextProps> = (props) => {
  const { element, isSelected, onClick, ...baseProps } = props;
  const { updateElement, toggleElementSelection } = useBuilderStore();
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const wasSelectedRef = useRef(false);

  const content = element.settings.content || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

  // Handle click: first click selects, second click on selected element enables editing
  const handleTextClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Check if Shift key is pressed for multi-select
    if (e.shiftKey) {
      toggleElementSelection(element.id);
    } else if (isSelected && wasSelectedRef.current && !isEditing) {
      // Second click on already selected element -> start editing
      setIsEditing(true);
    } else {
      // First click -> select element
      onClick?.();
    }
  };

  // Track if element was already selected
  useEffect(() => {
    wasSelectedRef.current = isSelected || false;
  }, [isSelected]);

  // Handle inline editing
  const handleBlur = () => {
    const newContent = contentRef.current?.innerHTML || content;
    if (newContent !== content) {
      updateElement(element.id, {
        settings: { ...element.settings, content: newContent },
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      // Reset content on escape
      if (contentRef.current) {
        contentRef.current.innerHTML = content;
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  // Auto-focus and set initial content when editing starts
  useEffect(() => {
    if (isEditing && contentRef.current) {
      // Set initial content
      contentRef.current.innerHTML = content;
      contentRef.current.focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(contentRef.current);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isEditing]);

  return (
    <BaseElement element={element} isSelected={isSelected} onClick={onClick} {...baseProps}>
      {isEditing ? (
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="outline-none min-h-[1em]"
        />
      ) : (
        <p
          dangerouslySetInnerHTML={{ __html: content }}
          onClick={handleTextClick}
          className="cursor-text"
        />
      )}
    </BaseElement>
  );
};
