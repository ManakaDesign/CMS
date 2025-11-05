import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface SpacerProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Spacer: React.FC<SpacerProps> = (props) => {
  const { element, ...baseProps } = props;

  const height = element.settings.height || '50px';

  return (
    <BaseElement element={element} {...baseProps}>
      <div style={{ height, width: '100%' }} />
    </BaseElement>
  );
};
