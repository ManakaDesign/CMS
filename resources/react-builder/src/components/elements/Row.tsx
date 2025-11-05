import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface RowProps {
  element: Element;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Row: React.FC<RowProps> = (props) => {
  const { element, children, ...baseProps } = props;

  const defaultStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row' as const,
    gap: element.settings.gap || '16px',
    width: '100%',
  };

  return (
    <BaseElement element={element} {...baseProps}>
      <div style={defaultStyles}>
        {children || (
          <div className="w-full text-center text-gray-400 py-4">
            Add columns here
          </div>
        )}
      </div>
    </BaseElement>
  );
};
