import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import {
  FaSquare,
  FaColumns,
  FaFont,
  FaHeading,
  FaImage,
  FaMousePointer,
  FaArrowsAltV,
  FaMinus,
  FaVideo,
  FaCode,
  FaStar,
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
  // Column removed - Rows now support 1-6 columns directly

  // Content
  { type: 'text', label: 'Text', icon: <FaFont />, category: 'Content' },
  { type: 'heading', label: 'Heading', icon: <FaHeading />, category: 'Content' },
  { type: 'button', label: 'Button', icon: <FaMousePointer />, category: 'Content' },
  { type: 'icon', label: 'Icon', icon: <FaStar />, category: 'Content' },

  // Media
  { type: 'image', label: 'Image', icon: <FaImage />, category: 'Media' },
  { type: 'video', label: 'Video', icon: <FaVideo />, category: 'Media' },

  // Other
  { type: 'spacer', label: 'Spacer', icon: <FaArrowsAltV />, category: 'Other' },
  { type: 'divider', label: 'Divider', icon: <FaMinus />, category: 'Other' },
  { type: 'code', label: 'Code', icon: <FaCode />, category: 'Other' },
];

export const ElementsSidebar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const categories = Array.from(new Set(elementDefinitions.map((el) => el.category)));

  // Filter elements based on search query
  const filteredElements = elementDefinitions.filter((el) =>
    el.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get filtered categories (only show categories that have matching elements)
  const filteredCategories = categories.filter((category) =>
    filteredElements.some((el) => el.category === category)
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-dark-border">
        <h2 className="text-lg font-semibold mb-3 text-light-text">Elements</h2>

        {/* Search Field */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-muted" size={16} />
          <input
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-dark-panel border border-dark-border rounded text-sm text-light-text placeholder-light-muted focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredCategories.length === 0 ? (
          <p className="text-center text-light-muted text-sm py-4">
            No elements found
          </p>
        ) : (
          filteredCategories.map((category) => (
            <div key={category} className="mb-6">
              <h3 className="text-xs font-semibold text-light-muted uppercase mb-2">{category}</h3>
              <div className="space-y-1">
                {filteredElements
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
          ))
        )}
      </div>
    </div>
  );
};
