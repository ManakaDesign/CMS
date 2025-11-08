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
  const { element, isSelected, ...baseProps } = props;
  const { updateElement } = useBuilderStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  const content = element.settings.content || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

  // Enable editing on double-click when selected
  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isSelected) {
      e.stopPropagation();
      setIsEditing(true);
      setEditContent(content);
    }
  };

  // Handle inline editing
  const handleBlur = () => {
    if (editContent !== content) {
      updateElement(element.id, {
        settings: { ...element.settings, content: editContent },
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(content);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
  };

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditing && contentRef.current) {
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
    <BaseElement element={element} isSelected={isSelected} {...baseProps}>
      {isEditing ? (
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onInput={(e) => setEditContent(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: editContent }}
          className="outline-none min-h-[1em]"
        />
      ) : (
        <p
          dangerouslySetInnerHTML={{ __html: content }}
          onDoubleClick={handleDoubleClick}
          className="cursor-text"
        />
      )}
    </BaseElement>
  );
};
