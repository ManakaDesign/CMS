import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface TextProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Text: React.FC<TextProps> = (props) => {
  const { element, ...baseProps } = props;

  const content = element.settings.content || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

  return (
    <BaseElement element={element} {...baseProps}>
      <p dangerouslySetInnerHTML={{ __html: content }} />
    </BaseElement>
  );
};
