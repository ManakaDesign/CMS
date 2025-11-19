import React from 'react';
import * as FiIcons from 'react-icons/fi';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface IconProps {
  element: Element;
  children?: React.ReactNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Icon: React.FC<IconProps> = ({
  element,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Get icon name from settings
  const iconName = element.settings.icon || 'FiStar';

  // Get the icon component from react-icons
  const IconComponent = (FiIcons as any)[iconName] || FiIcons.FiStar;

  // Get icon size from settings (default 24px)
  const iconSize = element.settings.iconSize || 24;

  return (
    <BaseElement
      element={element}
      isSelected={isSelected}
      isHovered={isHovered}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <IconComponent size={iconSize} />
      </div>
    </BaseElement>
  );
};
