import React, { useState, useRef, useEffect } from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';
import { useBuilderStore } from '../../store/builderStore';

interface HeadingProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Heading: React.FC<HeadingProps> = (props) => {
  const { element, isSelected, onClick, ...baseProps } = props;
  const { updateElement, toggleElementSelection } = useBuilderStore();
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const wasSelectedRef = useRef(false);

  const tag = (element.settings.tag || 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const content = element.settings.content || 'Your Heading Here';

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

  // Handle paste - only allow plain text
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');

    // Insert text at cursor position
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      // Move cursor to end of inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
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
          onPaste={handlePaste}
          className="outline-none min-h-[1em]"
        />
      ) : (
        React.createElement(tag, {
          dangerouslySetInnerHTML: { __html: content },
          onClick: handleTextClick,
          className: 'cursor-text',
        })
      )}
    </BaseElement>
  );
};
