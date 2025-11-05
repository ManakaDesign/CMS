import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface HeadingProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Heading: React.FC<HeadingProps> = (props) => {
  const { element, ...baseProps } = props;

  const tag = (element.settings.tag || 'h2') as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const content = element.settings.content || 'Your Heading Here';

  return (
    <BaseElement element={element} {...baseProps}>
      {React.createElement(tag, { dangerouslySetInnerHTML: { __html: content } })}
    </BaseElement>
  );
};
