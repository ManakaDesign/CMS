import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface DividerProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Divider: React.FC<DividerProps> = (props) => {
  const { element, ...baseProps } = props;

  const style = element.settings.style || 'solid';
  const color = element.settings.color || '#e5e7eb';
  const width = element.settings.width || '100%';
  const height = element.settings.height || '1px';

  return (
    <BaseElement element={element} {...baseProps}>
      <hr
        style={{
          width,
          height,
          border: 'none',
          borderTop: `${height} ${style} ${color}`,
          margin: '0',
        }}
      />
    </BaseElement>
  );
};
