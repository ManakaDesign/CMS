import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface ButtonProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Button: React.FC<ButtonProps> = (props) => {
  const { element, onClick, ...baseProps } = props;

  const text = element.settings.text || 'Click Me';
  const url = element.settings.url || '#';
  const target = element.settings.openInNewTab ? '_blank' : '_self';

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  return (
    <BaseElement element={element} onClick={onClick} {...baseProps}>
      <a
        href={url}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        onClick={handleButtonClick}
        className="inline-block px-6 py-3 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
      >
        {text}
      </a>
    </BaseElement>
  );
};
