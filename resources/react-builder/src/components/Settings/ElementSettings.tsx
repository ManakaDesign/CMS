import React from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { FiTrash2, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';

export const ElementSettings: React.FC = () => {
  const { selectedElementId, getElementById, updateElement, deleteElement, duplicateElement } =
    useBuilderStore();

  const element = selectedElementId ? getElementById(selectedElementId) : null;

  if (!element) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>Select an element to edit its settings</p>
      </div>
    );
  }

  const updateSetting = (key: string, value: any) => {
    updateElement(element.id, {
      settings: { ...element.settings, [key]: value },
    });
  };

  const updateStyle = (property: string, value: string, breakpoint: 'desktop' | 'tablet' | 'mobile' = 'desktop') => {
    updateElement(element.id, {
      styles: {
        ...element.styles,
        [breakpoint]: {
          ...element.styles[breakpoint],
          [property]: value,
        },
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Element Settings</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => duplicateElement(element.id)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title="Duplicate"
          >
            <FiCopy size={14} />
            Duplicate
          </button>
          <button
            onClick={() => updateElement(element.id, { is_visible: !element.is_visible })}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            title={element.is_visible ? 'Hide' : 'Show'}
          >
            {element.is_visible ? <FiEye size={14} /> : <FiEyeOff size={14} />}
            {element.is_visible ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={() => deleteElement(element.id)}
            className="px-3 py-2 text-sm bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors"
            title="Delete"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content Settings */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Content</h3>

        {/* Text/Heading Content */}
        {(element.type === 'text' || element.type === 'heading') && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              value={element.settings.content || ''}
              onChange={(e) => updateSetting('content', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
              rows={3}
            />
          </div>
        )}

        {/* Heading Tag */}
        {element.type === 'heading' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
            <select
              value={element.settings.tag || 'h2'}
              onChange={(e) => updateSetting('tag', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="h1">H1</option>
              <option value="h2">H2</option>
              <option value="h3">H3</option>
              <option value="h4">H4</option>
              <option value="h5">H5</option>
              <option value="h6">H6</option>
            </select>
          </div>
        )}

        {/* Button Settings */}
        {element.type === 'button' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Text</label>
              <input
                type="text"
                value={element.settings.text || ''}
                onChange={(e) => updateSetting('text', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
              <input
                type="text"
                value={element.settings.url || ''}
                onChange={(e) => updateSetting('url', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={element.settings.openInNewTab || false}
                  onChange={(e) => updateSetting('openInNewTab', e.target.checked)}
                  className="mr-2"
                />
                Open in new tab
              </label>
            </div>
          </>
        )}

        {/* Image Settings */}
        {element.type === 'image' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                type="text"
                value={element.settings.src || ''}
                onChange={(e) => updateSetting('src', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
              <input
                type="text"
                value={element.settings.alt || ''}
                onChange={(e) => updateSetting('alt', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              />
            </div>
          </>
        )}

        {/* Spacer Height */}
        {element.type === 'spacer' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Height</label>
            <input
              type="text"
              value={element.settings.height || '50px'}
              onChange={(e) => updateSetting('height', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="50px"
            />
          </div>
        )}
      </div>

      {/* Style Settings */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Styles (Desktop)</h3>

        {/* Typography */}
        {(element.type === 'text' || element.type === 'heading' || element.type === 'button') && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
              <input
                type="text"
                value={element.styles.desktop?.fontSize || ''}
                onChange={(e) => updateStyle('fontSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="16px"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Font Weight</label>
              <select
                value={element.styles.desktop?.fontWeight || 'normal'}
                onChange={(e) => updateStyle('fontWeight', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="300">Light</option>
                <option value="500">Medium</option>
                <option value="600">Semi Bold</option>
                <option value="700">Bold</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
              <input
                type="color"
                value={element.styles.desktop?.color || '#000000'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded"
              />
            </div>
          </>
        )}

        {/* Spacing */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
          <input
            type="text"
            value={element.styles.desktop?.padding || ''}
            onChange={(e) => updateStyle('padding', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="10px 20px"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Margin</label>
          <input
            type="text"
            value={element.styles.desktop?.margin || ''}
            onChange={(e) => updateStyle('margin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="10px 0"
          />
        </div>

        {/* Background */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
          <input
            type="color"
            value={element.styles.desktop?.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyle('backgroundColor', e.target.value)}
            className="w-full h-10 border border-gray-300 rounded"
          />
        </div>

        {/* Border */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Border</label>
          <input
            type="text"
            value={element.styles.desktop?.border || ''}
            onChange={(e) => updateStyle('border', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="1px solid #000"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
          <input
            type="text"
            value={element.styles.desktop?.borderRadius || ''}
            onChange={(e) => updateStyle('borderRadius', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="4px"
          />
        </div>
      </div>
    </div>
  );
};
