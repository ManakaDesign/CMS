import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface ColumnProps {
  element: Element;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Column: React.FC<ColumnProps> = (props) => {
  const { element, children, ...baseProps } = props;

  const defaultStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: element.settings.width || '1',
    minHeight: '50px',
  };

  return (
    <BaseElement element={element} {...baseProps}>
      <div style={defaultStyles}>
        {children || (
          <div className="text-center text-gray-400 py-4">
            Drop content here
          </div>
        )}
      </div>
    </BaseElement>
  );
};
