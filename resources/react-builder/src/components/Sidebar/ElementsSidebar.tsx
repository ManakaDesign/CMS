import React from 'react';
import {
  FaSquare,
  FaColumns,
  FaGripVertical,
  FaFont,
  FaHeading,
  FaImage,
  FaMousePointer,
  FaArrowsAltV,
  FaMinus,
  FaVideo,
  FaCode,
} from 'react-icons/fa';
import { DraggableElement } from './DraggableElement';
import type { ElementType } from '../../types';

interface ElementDefinition {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const elementDefinitions: ElementDefinition[] = [
  // Layout
  { type: 'section', label: 'Section', icon: <FaSquare />, category: 'Layout' },
  { type: 'row', label: 'Row', icon: <FaColumns />, category: 'Layout' },
  { type: 'column', label: 'Column', icon: <FaGripVertical />, category: 'Layout' },

  // Content
  { type: 'text', label: 'Text', icon: <FaFont />, category: 'Content' },
  { type: 'heading', label: 'Heading', icon: <FaHeading />, category: 'Content' },
  { type: 'button', label: 'Button', icon: <FaMousePointer />, category: 'Content' },

  // Media
  { type: 'image', label: 'Image', icon: <FaImage />, category: 'Media' },
  { type: 'video', label: 'Video', icon: <FaVideo />, category: 'Media' },

  // Other
  { type: 'spacer', label: 'Spacer', icon: <FaArrowsAltV />, category: 'Other' },
  { type: 'divider', label: 'Divider', icon: <FaMinus />, category: 'Other' },
  { type: 'code', label: 'Code', icon: <FaCode />, category: 'Other' },
];

export const ElementsSidebar: React.FC = () => {
  const categories = Array.from(new Set(elementDefinitions.map((el) => el.category)));

  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Elements</h2>

      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">{category}</h3>
          <div className="space-y-1">
            {elementDefinitions
              .filter((el) => el.category === category)
              .map((element) => (
                <DraggableElement
                  key={element.type}
                  type={element.type}
                  icon={element.icon}
                  label={element.label}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
