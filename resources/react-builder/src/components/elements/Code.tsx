import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface CodeProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Code: React.FC<CodeProps> = (props) => {
  const { element, ...baseProps } = props;

  const code = element.settings.code || '// Your code here';
  const language = element.settings.language || 'javascript';

  return (
    <BaseElement element={element} {...baseProps}>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </BaseElement>
  );
};
