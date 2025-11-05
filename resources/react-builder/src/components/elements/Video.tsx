import React from 'react';
import type { Element } from '../../types';
import { BaseElement } from './BaseElement';

interface VideoProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Video: React.FC<VideoProps> = (props) => {
  const { element, ...baseProps } = props;

  const url = element.settings.url || '';
  const provider = element.settings.provider || 'youtube';
  const width = element.settings.width || '100%';
  const aspectRatio = element.settings.aspectRatio || '16/9';

  const getEmbedUrl = () => {
    if (!url) return '';

    if (provider === 'youtube') {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (provider === 'vimeo') {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }

    return url;
  };

  return (
    <BaseElement element={element} {...baseProps}>
      <div style={{ width, aspectRatio, position: 'relative' }}>
        {url ? (
          <iframe
            src={getEmbedUrl()}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400">
            No video URL provided
          </div>
        )}
      </div>
    </BaseElement>
  );
};
