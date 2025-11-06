import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface ImageProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Image: React.FC<ImageProps> = (props) => {
  const { element, ...baseProps } = props;

  const src = element.settings.src || 'https://via.placeholder.com/800x400';
  const alt = element.settings.alt || 'Image';
  const width = element.settings.width || '100%';
  const objectFit = element.settings.objectFit || 'cover';

  return (
    <BaseElement element={element} {...baseProps}>
      <img
        src={src}
        alt={alt}
        style={{
          width,
          height: 'auto',
          objectFit,
          display: 'block',
        }}
      />
    </BaseElement>
  );
};
