import { useState, useEffect } from 'react';
import { FiSettings, FiEye, FiMonitor, FiTablet, FiSmartphone, FiDownload } from 'react-icons/fi';
import { useBuilderStore } from '../store/builderStore';
import type { Breakpoint } from '../types';
import { DragAndDropProvider } from '../components/DragAndDropProvider';
import { DroppableCanvas } from '../components/DroppableCanvas';
import { ElementsSidebar } from '../components/Sidebar/ElementsSidebar';
import { ElementSettings } from '../components/Settings/ElementSettings';
import { BreakpointSettings } from '../components/Settings/BreakpointSettings';
import { localStorageService } from '../api/localStorageService';

export const BuilderDemo: React.FC = () => {
  const {
    page,
    elements,
    selectedElementId,
    activeBreakpoint,
    breakpointWidths,
    isPreviewMode,
    setPage,
    setElements,
    setActiveBreakpoint,
    togglePreviewMode,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useBuilderStore();

  const [showBreakpointSettings, setShowBreakpointSettings] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load demo data on mount
  useEffect(() => {
    localStorageService.init();
    const pageId = localStorageService.getCurrentPageId();
    const demoPage = localStorageService.getPage(pageId);
    const demoElements = localStorageService.getElements(pageId);

    if (demoPage) {
      setPage(demoPage);
      setElements(demoElements);
    }
  }, [setPage, setElements]);

  // Auto-save to localStorage
  useEffect(() => {
    if (page && elements.length >= 0) {
      const saveTimeout = setTimeout(() => {
        localStorageService.savePage(page);
        localStorageService.saveElements(page.id, elements);
        setLastSaved(new Date());
      }, 1000); // Debounce saves

      return () => clearTimeout(saveTimeout);
    }
  }, [page, elements]);

  const breakpoints = [
    { value: 'desktop' as Breakpoint, icon: FiMonitor, label: 'Desktop' },
    { value: 'tablet' as Breakpoint, icon: FiTablet, label: 'Tablet' },
    { value: 'mobile' as Breakpoint, icon: FiSmartphone, label: 'Mobile' },
  ];

  const handleExportHTML = () => {
    // Simple HTML export for demo
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page?.title || 'Demo Page'}</title>
  <style>
    body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    /* Add your styles here */
  </style>
</head>
<body>
  <!-- Your content would be rendered here -->
  <div id="content">
    ${elements.map(el => `<!-- ${el.type} element -->`).join('\n    ')}
  </div>
</body>
</html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page?.slug || 'page'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!page) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4" />
          <p className="text-light-text">Loading demo...</p>
        </div>
      </div>
    );
  }

  return (
    <DragAndDropProvider>
      <div className="h-screen flex flex-col bg-dark-bg">
        {/* Demo Banner */}
        <div className="bg-brand-primary text-white px-4 py-2 text-center text-sm">
          🎨 <strong>Demo Mode</strong> - All changes are saved to your browser's LocalStorage
          {lastSaved && <span className="ml-4">Last saved: {lastSaved.toLocaleTimeString()}</span>}
        </div>

        {/* Top Toolbar */}
        <div className="bg-dark-surface border-b border-dark-border px-6 py-3 flex items-center justify-between sticky top-0 z-40">
          {/* Left - Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-light-text">{page.title}</h1>
            <span className="text-sm text-light-muted">• {page.status === 'draft' ? 'Draft' : 'Published'}</span>
          </div>

          {/* Center - Breakpoint Switcher */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-dark-panel rounded-lg p-1">
              {breakpoints.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveBreakpoint(value)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-md transition-colors
                    ${
                      activeBreakpoint === value
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-light-muted hover:text-light-text hover:bg-dark-hover'
                    }
                  `}
                  title={label}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline text-sm">{label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowBreakpointSettings(true)}
              className="p-2 text-light-muted hover:text-light-text hover:bg-dark-hover rounded-lg"
              title="Breakpoint Settings"
            >
              <FiSettings size={18} />
            </button>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center space-x-2">
            {/* Undo/Redo */}
            <button
              onClick={undo}
              disabled={!canUndo()}
              className="p-2 text-light-text hover:text-white hover:bg-dark-hover rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="p-2 text-light-text hover:text-white hover:bg-dark-hover rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
              </svg>
            </button>

            <div className="w-px h-6 bg-dark-border mx-2" />

            {/* Preview Toggle */}
            <button
              onClick={togglePreviewMode}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md transition-colors
                ${
                  isPreviewMode
                    ? 'bg-brand-primary text-white'
                    : 'bg-dark-panel text-light-text hover:bg-dark-hover'
                }
              `}
            >
              <FiEye size={18} />
              <span className="text-sm">Preview</span>
            </button>

            {/* Export HTML */}
            <button
              onClick={handleExportHTML}
              className="flex items-center space-x-2 px-4 py-2 bg-dark-panel text-light-text rounded-md hover:bg-dark-hover transition-colors"
              title="Export HTML"
            >
              <FiDownload size={18} />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex pt-0 h-full overflow-hidden">
          {/* Left Sidebar - Elements Library */}
          {!isPreviewMode && (
            <div className="w-64 bg-dark-surface border-r border-dark-border overflow-y-auto flex-shrink-0">
              <ElementsSidebar />
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto bg-dark-bg">
            <div className="p-8">
              <div
                className="bg-white shadow-lg mx-auto builder-canvas min-h-full"
                style={{
                  maxWidth: activeBreakpoint === 'desktop'
                    ? `${breakpointWidths.desktop}px`
                    : activeBreakpoint === 'tablet'
                      ? `${breakpointWidths.tablet}px`
                      : `${breakpointWidths.mobile}px`,
                  width: '100%',
                }}
              >
                <DroppableCanvas />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Element Settings */}
          {!isPreviewMode && selectedElementId && (
            <div className="w-80 bg-dark-surface border-l border-dark-border overflow-y-auto flex-shrink-0">
              <ElementSettings />
            </div>
          )}
        </div>

        {/* Breakpoint Settings Dialog */}
        {showBreakpointSettings && (
          <BreakpointSettings onClose={() => setShowBreakpointSettings(false)} />
        )}
      </div>
    </DragAndDropProvider>
  );
};
