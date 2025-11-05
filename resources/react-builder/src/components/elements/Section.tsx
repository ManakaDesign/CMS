import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface SectionProps {
  element: Element;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Section: React.FC<SectionProps> = (props) => {
  const { element, children, ...baseProps } = props;

  return (
    <BaseElement element={element} {...baseProps}>
      <div className="w-full" style={{ minHeight: element.settings.minHeight || '100px' }}>
        {children || (
          <div className="text-center text-gray-400 py-8">
            Drop elements here
          </div>
        )}
      </div>
    </BaseElement>
  );
};
