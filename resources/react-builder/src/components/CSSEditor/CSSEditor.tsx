import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { FiCopy, FiRefreshCw } from 'react-icons/fi';
import { HexColorPicker } from 'react-colorful';
import { CSS_PROPERTIES, COLOR_PROPERTIES } from './cssProperties';

export const CSSEditor: React.FC = () => {
  const { customCSS, setCustomCSS, elements } = useBuilderStore();
  const [cssValue, setCssValue] = useState(customCSS || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  
  // Autocomplete state
  const [autocompleteShow, setAutocompleteShow] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  
  // Color picker state
  const [colorPickerShow, setColorPickerShow] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState({ top: 0, left: 0 });
  const [currentColor, setCurrentColor] = useState('#000000');
  const [colorProperty, setColorProperty] = useState<string>('');

  // Parse already used selectors from CSS
  const usedSelectors = useMemo(() => {
    const ids = new Set<string>();
    const classes = new Set<string>();

    const idMatches = cssValue.matchAll(/#([a-zA-Z0-9_-]+)/g);
    for (const match of idMatches) {
      ids.add(match[1]);
    }

    const classMatches = cssValue.matchAll(/\.([a-zA-Z0-9_-]+)/g);
    for (const match of classMatches) {
      classes.add(match[1]);
    }

    return { ids, classes };
  }, [cssValue]);

  // Extract all IDs and Classes from elements
  const extractedSelectors = useMemo(() => {
    const ids = new Set<string>();
    const classes = new Set<string>();

    elements.forEach((element) => {
      if (element.settings.elementId && !usedSelectors.ids.has(element.settings.elementId)) {
        ids.add(element.settings.elementId);
      }

      if (element.settings.elementClass) {
        const classList = element.settings.elementClass.split(' ').filter(Boolean);
        classList.forEach((cls: string) => {
          if (!usedSelectors.classes.has(cls)) {
            classes.add(cls);
          }
        });
      }

      // Extract column IDs and classes
      if (element.type === 'row') {
        const columnIds = element.settings.columnIds || [];
        columnIds.forEach((columnId: string) => {
          if (columnId && !usedSelectors.ids.has(columnId)) {
            ids.add(columnId);
          }
        });

        const columnClasses = element.settings.columnClasses || [];
        columnClasses.forEach((columnClass: string) => {
          if (columnClass) {
            const classList = columnClass.split(' ').filter(Boolean);
            classList.forEach((cls: string) => {
              if (!usedSelectors.classes.has(cls)) {
                classes.add(cls);
              }
            });
          }
        });
      }
    });

    return {
      ids: Array.from(ids).sort(),
      classes: Array.from(classes).sort(),
    };
  }, [elements, usedSelectors]);

  // Update local state when store changes
  useEffect(() => {
    setCssValue(customCSS || '');
  }, [customCSS]);

  // Apply CSS changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setCustomCSS(cssValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [cssValue, setCustomCSS]);

  // Handle autocomplete
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCssValue(newValue);

    // Get cursor position
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    
    // Check if we're typing a CSS property (after a '{' or ';' and before a ':')
    const lastBrace = Math.max(textBeforeCursor.lastIndexOf('{'), textBeforeCursor.lastIndexOf(';'));
    const lastColon = textBeforeCursor.lastIndexOf(':');
    
    if (lastBrace > lastColon || lastColon === -1) {
      // We're potentially typing a property name
      const propertyMatch = textBeforeCursor.substring(lastBrace + 1).trim().match(/([a-z-]+)$/i);
      
      if (propertyMatch && propertyMatch[1].length > 0) {
        const query = propertyMatch[1].toLowerCase();
        const matches = CSS_PROPERTIES.filter(prop => prop.startsWith(query)).slice(0, 10);
        
        if (matches.length > 0) {
          setAutocompleteSuggestions(matches);
          setSelectedSuggestionIndex(0);
          
          // Calculate position
          if (textareaRef.current) {
            const { lineHeight } = window.getComputedStyle(textareaRef.current);
            const lines = textBeforeCursor.split('\n').length;
            const top = parseInt(lineHeight) * lines;
            
            setAutocompletePosition({ top, left: 20 });
            setAutocompleteShow(true);
          }
          return;
        }
      }
    }
    
    // Check if we're on a color property
    if (lastColon > lastBrace) {
      const propertyText = newValue.substring(lastBrace + 1, lastColon).trim();
      if (COLOR_PROPERTIES.includes(propertyText)) {
        // Extract current color value
        const valueAfterColon = newValue.substring(lastColon + 1, cursorPos).trim();
        const colorMatch = valueAfterColon.match(/#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/);
        
        if (colorMatch) {
          setCurrentColor(colorMatch[0].startsWith('#') ? colorMatch[0] : '#000000');
          setColorProperty(propertyText);
          
          if (textareaRef.current) {
            const { lineHeight } = window.getComputedStyle(textareaRef.current);
            const lines = textBeforeCursor.split('\n').length;
            const top = parseInt(lineHeight) * lines;
            
            setColorPickerPosition({ top, left: 200 });
            setColorPickerShow(true);
          }
          return;
        }
      }
    }
    
    setAutocompleteShow(false);
    setColorPickerShow(false);
  };

  // Handle autocomplete selection
  const selectSuggestion = (suggestion: string) => {
    if (!textareaRef.current) return;
    
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = cssValue.substring(0, cursorPos);
    const textAfterCursor = cssValue.substring(cursorPos);
    
    const lastBrace = Math.max(textBeforeCursor.lastIndexOf('{'), textBeforeCursor.lastIndexOf(';'));
    const propertyStart = textBeforeCursor.substring(lastBrace + 1).search(/[a-z-]/i);
    
    if (propertyStart !== -1) {
      const replaceStart = lastBrace + 1 + propertyStart;
      const newValue = cssValue.substring(0, replaceStart) + suggestion + ': ' + textAfterCursor;
      setCssValue(newValue);
      
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = replaceStart + suggestion.length + 2;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
          textareaRef.current.focus();
        }
      }, 0);
    }
    
    setAutocompleteShow(false);
  };

  // Handle keyboard navigation in autocomplete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (autocompleteShow) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => 
          Math.min(prev + 1, autocompleteSuggestions.length - 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && autocompleteSuggestions.length > 0) {
        e.preventDefault();
        selectSuggestion(autocompleteSuggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setAutocompleteShow(false);
      }
    }
    
    if (colorPickerShow && e.key === 'Escape') {
      setColorPickerShow(false);
    }
  };

  const handleCopySelectors = () => {
    let text = '/* Available IDs */\n';
    extractedSelectors.ids.forEach((id) => {
      text += `#${id} {\n  \n}\n\n`;
    });

    text += '\n/* Available Classes */\n';
    extractedSelectors.classes.forEach((cls) => {
      text += `.${cls} {\n  \n}\n\n`;
    });

    navigator.clipboard.writeText(text);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all custom CSS?')) {
      setCssValue('');
      setCustomCSS('');
    }
  };

  const highlightCSS = (css: string) => {
    if (!css) return '';

    let highlighted = css
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(#[a-zA-Z0-9_-]+)/g, '<span style="color: #3b82f6;">$1</span>')
      .replace(/(\.[a-zA-Z0-9_-]+)/g, '<span style="color: #3b82f6;">$1</span>');

    return highlighted;
  };

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-surface relative">
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-light-text">CSS Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={handleCopySelectors}
              className="p-2 text-light-muted hover:text-light-text hover:bg-dark-hover rounded transition-colors"
              title="Copy all selectors"
            >
              <FiCopy size={14} />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-light-muted hover:text-light-text hover:bg-dark-hover rounded transition-colors"
              title="Reset CSS"
            >
              <FiRefreshCw size={14} />
            </button>
          </div>
        </div>
        <p className="text-xs text-light-muted">
          Live preview with autocomplete - Type to get suggestions
        </p>
      </div>

      {/* Available Selectors */}
      {(extractedSelectors.ids.length > 0 || extractedSelectors.classes.length > 0) && (
        <div className="p-4 border-b border-dark-border bg-dark-panel">
          <h3 className="text-xs font-semibold text-light-muted uppercase mb-2">
            Available Selectors
          </h3>

          {extractedSelectors.ids.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-light-muted mb-1">IDs:</p>
              <div className="flex flex-wrap gap-1">
                {extractedSelectors.ids.map((id) => (
                  <button
                    key={id}
                    onClick={() => {
                      const selector = `#${id} {\n  \n}\n\n`;
                      setCssValue((prev) => prev + selector);
                    }}
                    className="px-2 py-1 text-xs bg-dark-surface text-brand-primary border border-dark-border rounded hover:bg-dark-hover transition-colors font-mono"
                    title="Click to add to CSS"
                  >
                    #{id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {extractedSelectors.classes.length > 0 && (
            <div>
              <p className="text-xs text-light-muted mb-1">Classes:</p>
              <div className="flex flex-wrap gap-1">
                {extractedSelectors.classes.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => {
                      const selector = `.${cls} {\n  \n}\n\n`;
                      setCssValue((prev) => prev + selector);
                    }}
                    className="px-2 py-1 text-xs bg-dark-surface text-green-400 border border-dark-border rounded hover:bg-dark-hover transition-colors font-mono"
                    title="Click to add to CSS"
                  >
                    .{cls}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSS Editor with Autocomplete */}
      <div className="flex-1 overflow-hidden relative bg-dark-bg">
        <pre
          ref={highlightRef}
          className="absolute inset-0 p-4 bg-transparent font-mono text-sm pointer-events-none overflow-auto whitespace-pre-wrap break-words"
          style={{
            margin: 0,
            border: 'none',
            outline: 'none',
            lineHeight: '1.5',
            color: '#d1d5db',
          }}
          dangerouslySetInnerHTML={{
            __html: cssValue ? highlightCSS(cssValue) : ''
          }}
        />

        <textarea
          ref={textareaRef}
          value={cssValue}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          className="absolute inset-0 w-full h-full p-4 bg-transparent font-mono text-sm resize-none focus:outline-none"
          style={{
            color: cssValue ? 'transparent' : '#9ca3af',
            background: 'transparent',
            lineHeight: '1.5',
            caretColor: '#d1d5db',
          }}
          placeholder="/* Enter your custom CSS here... */

/* Example: */
#my-element {
  background-color: #ff0000;
  padding: 20px;
}

.my-class {
  color: #ffffff;
  font-size: 18px;
}"
          spellCheck={false}
        />

        {/* Autocomplete dropdown */}
        {autocompleteShow && (
          <div
            className="absolute bg-dark-surface border border-dark-border rounded shadow-lg z-50"
            style={{
              top: `${autocompletePosition.top}px`,
              left: `${autocompletePosition.left}px`,
              maxWidth: '300px',
            }}
          >
            {autocompleteSuggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => selectSuggestion(suggestion)}
                className={`block w-full text-left px-3 py-1.5 text-sm font-mono transition-colors ${
                  index === selectedSuggestionIndex
                    ? 'bg-brand-primary text-white'
                    : 'text-light-text hover:bg-dark-hover'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Color picker */}
        {colorPickerShow && (
          <div
            className="absolute bg-dark-surface border border-dark-border rounded shadow-lg p-3 z-50"
            style={{
              top: `${colorPickerPosition.top}px`,
              left: `${colorPickerPosition.left}px`,
            }}
          >
            <div className="mb-2 text-xs text-light-text font-mono">{colorProperty}</div>
            <HexColorPicker color={currentColor} onChange={setCurrentColor} />
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                className="flex-1 px-2 py-1 bg-dark-panel border border-dark-border rounded text-xs font-mono text-light-text"
              />
              <button
                onClick={() => {
                  // Insert color at cursor position
                  if (textareaRef.current) {
                    const cursorPos = textareaRef.current.selectionStart;
                    const newValue = 
                      cssValue.substring(0, cursorPos) +
                      currentColor +
                      cssValue.substring(cursorPos);
                    setCssValue(newValue);
                    setColorPickerShow(false);
                  }
                }}
                className="px-2 py-1 bg-brand-primary text-white rounded text-xs hover:bg-primary-600"
              >
                Insert
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-dark-border bg-dark-panel">
        <p className="text-xs text-light-muted">
          {extractedSelectors.ids.length} IDs, {extractedSelectors.classes.length} Classes found
        </p>
      </div>
    </div>
  );
};
