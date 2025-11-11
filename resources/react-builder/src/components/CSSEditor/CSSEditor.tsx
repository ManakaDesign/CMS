import React, { useState, useEffect, useMemo } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { FiCopy, FiRefreshCw } from 'react-icons/fi';

export const CSSEditor: React.FC = () => {
  const { customCSS, setCustomCSS, elements } = useBuilderStore();
  const [cssValue, setCssValue] = useState(customCSS || '');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const highlightRef = React.useRef<HTMLPreElement>(null);

  // Parse already used selectors from CSS
  const usedSelectors = useMemo(() => {
    const ids = new Set<string>();
    const classes = new Set<string>();

    // Match ID selectors (#id)
    const idMatches = cssValue.matchAll(/#([a-zA-Z0-9_-]+)/g);
    for (const match of idMatches) {
      ids.add(match[1]);
    }

    // Match class selectors (.class)
    const classMatches = cssValue.matchAll(/\.([a-zA-Z0-9_-]+)/g);
    for (const match of classMatches) {
      classes.add(match[1]);
    }

    return { ids, classes };
  }, [cssValue]);

  // Extract all IDs and Classes from elements and filter out already used ones
  const extractedSelectors = useMemo(() => {
    const ids = new Set<string>();
    const classes = new Set<string>();

    elements.forEach((element) => {
      // Extract element ID
      if (element.settings.elementId && !usedSelectors.ids.has(element.settings.elementId)) {
        ids.add(element.settings.elementId);
      }

      // Extract element classes
      if (element.settings.elementClass) {
        const classList = element.settings.elementClass.split(' ').filter(Boolean);
        classList.forEach((cls) => {
          if (!usedSelectors.classes.has(cls)) {
            classes.add(cls);
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

  // Syntax highlighting for CSS
  const highlightCSS = (css: string) => {
    if (!css) return '';

    // Highlight selectors (IDs and Classes)
    let highlighted = css
      // Escape HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Highlight ID selectors
      .replace(/(#[a-zA-Z0-9_-]+)/g, '<span style="color: #3b82f6;">$1</span>')
      // Highlight class selectors
      .replace(/(\.[a-zA-Z0-9_-]+)/g, '<span style="color: #3b82f6;">$1</span>');

    return highlighted;
  };

  // Sync scroll between textarea and highlight overlay
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-surface">
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
          Live preview - Changes apply automatically
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

      {/* CSS Editor with Syntax Highlighting */}
      <div className="flex-1 overflow-hidden relative bg-dark-bg">
        {/* Highlighted overlay */}
        <pre
          ref={highlightRef}
          className="absolute inset-0 p-4 bg-transparent text-transparent font-mono text-sm pointer-events-none overflow-auto whitespace-pre-wrap break-words"
          style={{
            margin: 0,
            border: 'none',
            outline: 'none',
            lineHeight: '1.5',
          }}
          dangerouslySetInnerHTML={{
            __html: cssValue ? highlightCSS(cssValue) : ''
          }}
        />

        {/* Actual textarea */}
        <textarea
          ref={textareaRef}
          value={cssValue}
          onChange={(e) => setCssValue(e.target.value)}
          onScroll={handleScroll}
          className="absolute inset-0 w-full h-full p-4 bg-transparent text-light-text font-mono text-sm resize-none focus:outline-none"
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
