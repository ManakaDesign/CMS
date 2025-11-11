import React from 'react';
import type { Element } from '../../types';

interface BackgroundRendererProps {
  element: Element;
  className?: string;
}

export const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({ element, className = '' }) => {
  const { backgroundGradient, backgroundImage, backgroundVideo } = element.settings;

  // Background Video
  if (backgroundVideo?.url) {
    return (
      <video
        src={backgroundVideo.url as string}
        autoPlay
        loop={backgroundVideo.loop !== false}
        muted={backgroundVideo.muted !== false}
        playsInline
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
        style={{ pointerEvents: 'none' }}
      />
    );
  }

  // Background Image
  if (backgroundImage?.url) {
    return (
      <div
        className={`absolute inset-0 w-full h-full ${className}`}
        style={{
          backgroundImage: `url(${backgroundImage.url})`,
          backgroundSize: (backgroundImage.size as string) || 'cover',
          backgroundPosition: (backgroundImage.position as string) || 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    );
  }

  // Background Gradient
  if (backgroundGradient?.color1 && backgroundGradient?.color2) {
    const angle = (backgroundGradient.angle as number) || 45;
    return (
      <div
        className={`absolute inset-0 w-full h-full ${className}`}
        style={{
          background: `linear-gradient(${angle}deg, ${backgroundGradient.color1} 0%, ${backgroundGradient.color2} 100%)`,
        }}
      />
    );
  }

  // No special background
  return null;
};
