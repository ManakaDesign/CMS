import React from 'react';
import * as FiIcons from 'react-icons/fi';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface IconProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Icon: React.FC<IconProps> = (props) => {
  const { element, ...baseProps } = props;

  // Get icon type: 'react' or 'svg'
  const iconType = element.settings.iconType || 'react';

  // Get icon size from settings (default 24px)
  const iconSize = element.settings.iconSize || 24;

  // Parse iconSize to get numeric value
  const sizeValue = typeof iconSize === 'string' ? parseInt(iconSize) : iconSize;

  // Debug log
  console.log('Icon Element:', {
    iconType,
    svgUrl: element.settings.svgUrl,
    icon: element.settings.icon,
    allSettings: element.settings,
  });

  // Render React Icon (color controlled by CSS)
  if (iconType === 'react') {
    const iconName = element.settings.icon || 'FiStar';
    const IconComponent = (FiIcons as any)[iconName] || FiIcons.FiStar;

    return (
      <BaseElement element={element} {...baseProps}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconComponent size={sizeValue} style={{ color: 'currentColor' }} />
        </div>
      </BaseElement>
    );
  }

  // Render SVG from Media Library with color control via mask
  if (iconType === 'svg' && element.settings.svgUrl) {
    console.log('Rendering SVG icon with URL:', element.settings.svgUrl);
    // Check if this is an SVG file
    const isSvg = element.settings.svgUrl.toLowerCase().endsWith('.svg');

    return (
      <BaseElement element={element} {...baseProps}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: `${sizeValue}px`,
            height: `${sizeValue}px`,
            // Use SVG as mask to allow color control
            ...(isSvg && {
              backgroundColor: 'currentColor',
              WebkitMaskImage: `url(${element.settings.svgUrl})`,
              maskImage: `url(${element.settings.svgUrl})`,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
            }),
          }}
        >
          {/* Show image fallback for non-SVG files */}
          {!isSvg && (
            <img
              src={element.settings.svgUrl}
              alt={element.settings.svgAlt || 'Icon'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          )}
        </div>
      </BaseElement>
    );
  }

  // Fallback
  console.log('Rendering fallback icon');
  return (
    <BaseElement element={element} {...baseProps}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FiIcons.FiStar size={sizeValue} style={{ color: 'currentColor' }} />
      </div>
    </BaseElement>
  );
};
