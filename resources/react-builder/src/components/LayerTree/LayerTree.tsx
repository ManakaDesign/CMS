import React, { useState } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import type { Element } from '../../types';
import {
  FiChevronDown,
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiLayers,
  FiGrid,
  FiType,
  FiSquare,
  FiImage,
  FiVideo,
  FiMinus
} from 'react-icons/fi';

interface LayerItemProps {
  element: Element;
  level: number;
}

const LayerItem: React.FC<LayerItemProps> = ({ element, level }) => {
  const { selectedElementId, selectElement, updateElement, elements } = useBuilderStore();
  const [isExpanded, setIsExpanded] = useState(true);

  // Get children elements
  const children = elements.filter(el => el.parent_id === element.id);
  const hasChildren = children.length > 0;

  // Get icon based on element type
  const getElementIcon = (type: string) => {
    switch (type) {
      case 'section':
        return FiLayers;
      case 'row':
        return FiGrid;
      case 'text':
      case 'heading':
        return FiType;
      case 'button':
        return FiSquare;
      case 'image':
        return FiImage;
      case 'video':
        return FiVideo;
      case 'spacer':
        return FiMinus;
      default:
        return FiSquare;
    }
  };

  // Get element label
  const getElementLabel = (el: Element) => {
    if (el.type === 'text' || el.type === 'heading') {
      const content = el.settings.content || '';
      if (content.length > 20) {
        return content.substring(0, 20) + '...';
      }
      return content || el.type;
    }
    if (el.type === 'button') {
      return el.settings.text || 'Button';
    }
    return el.type.charAt(0).toUpperCase() + el.type.slice(1);
  };

  const Icon = getElementIcon(element.type);
  const isSelected = selectedElementId === element.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElement(element.id);
  };

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateElement(element.id, { is_visible: !element.is_visible });
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        className={`
          flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
          ${isSelected
            ? 'bg-brand-primary text-white'
            : 'text-light-text hover:bg-dark-hover'
          }
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            onClick={handleToggleExpand}
            className="flex-shrink-0 p-0.5 hover:bg-dark-panel rounded"
          >
            {isExpanded ? (
              <FiChevronDown size={14} />
            ) : (
              <FiChevronRight size={14} />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Element Icon */}
        <Icon size={14} className="flex-shrink-0" />

        {/* Element Label */}
        <span className="flex-1 text-sm truncate">
          {getElementLabel(element)}
        </span>

        {/* Visibility Toggle */}
        <button
          onClick={handleToggleVisibility}
          className={`flex-shrink-0 p-1 rounded transition-opacity ${
            isSelected ? 'text-white' : 'text-light-muted hover:text-light-text'
          }`}
          title={element.is_visible ? 'Hide' : 'Show'}
        >
          {element.is_visible ? (
            <FiEye size={14} />
          ) : (
            <FiEyeOff size={14} />
          )}
        </button>
      </div>

      {/* Render Children */}
      {hasChildren && isExpanded && (
        <div>
          {children.map(child => (
            <LayerItem key={child.id} element={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const LayerTree: React.FC = () => {
  const { elements } = useBuilderStore();

  // Get root sections (elements without parent)
  const sections = elements.filter(el => !el.parent_id && el.type === 'section');

  return (
    <div className="h-full bg-dark-surface">
      <div className="p-4 border-b border-dark-border">
        <h2 className="text-sm font-semibold text-light-text">Layer Tree</h2>
      </div>

      <div className="overflow-y-auto">
        {sections.length === 0 ? (
          <div className="p-4 text-center text-light-muted text-sm">
            No elements yet. Drag elements from the Elements panel to get started.
          </div>
        ) : (
          sections.map(section => (
            <LayerItem key={section.id} element={section} level={0} />
          ))
        )}
      </div>
    </div>
  );
};
