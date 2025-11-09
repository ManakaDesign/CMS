import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';
import { useBuilderStore } from '../../store/builderStore';

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
  const { activeBreakpoint } = useBuilderStore();

  const text = element.settings.text || 'Click Me';
  const url = element.settings.url || '#';
  const target = element.settings.openInNewTab ? '_blank' : '_self';

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick?.();
  };

  // Get button styles from element.styles with breakpoint support
  const breakpointStyles = element.styles[activeBreakpoint] || element.styles.desktop || {};
  const buttonStyles = {
    display: 'inline-block',
    padding: '12px 24px',
    cursor: 'pointer',
    textDecoration: 'none',
    ...breakpointStyles,
  } as React.CSSProperties;

  return (
    <BaseElement element={element} onClick={onClick} {...baseProps}>
      <a
        href={url}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        onClick={handleButtonClick}
        style={buttonStyles}
      >
        {text}
      </a>
    </BaseElement>
  );
};
