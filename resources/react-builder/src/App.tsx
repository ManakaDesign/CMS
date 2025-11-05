import { useState } from 'react';
import { FiSettings, FiEye, FiSave, FiMonitor, FiTablet, FiSmartphone } from 'react-icons/fi';
import { useBuilderStore } from './store/builderStore';
import type { Breakpoint } from './types';
import { DragAndDropProvider } from './components/DragAndDropProvider';
import { DroppableCanvas } from './components/DroppableCanvas';
import { ElementsSidebar } from './components/Sidebar/ElementsSidebar';
import { ElementSettings } from './components/Settings/ElementSettings';
import { pagesApi } from './api/services';

function App() {
  const {
    page,
    elements,
    selectedElementId,
    activeBreakpoint,
    isPreviewMode,
    isSaving,
    setActiveBreakpoint,
    togglePreviewMode,
    canUndo,
    canRedo,
    undo,
    redo,
    setIsSaving,
  } = useBuilderStore();

  const [showSettings, setShowSettings] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!page) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await pagesApi.update(page.id, {
        content: { elements },
      });
      // Success feedback could be shown here
      console.log('Page saved successfully');
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save page');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const breakpoints: { value: Breakpoint; icon: typeof FiMonitor; label: string }[] = [
    { value: 'desktop', icon: FiMonitor, label: 'Desktop' },
    { value: 'tablet', icon: FiTablet, label: 'Tablet' },
    { value: 'mobile', icon: FiSmartphone, label: 'Mobile' },
  ];

  return (
    <DragAndDropProvider>
      <div className="flex h-screen bg-gray-100">
        {/* Top Toolbar */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        {/* Left */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">
            {page?.title || 'Untitled Page'}
          </h1>
          <span className="text-sm text-gray-500">
            {page?.status === 'draft' ? '• Draft' : '• Published'}
          </span>
        </div>

        {/* Center - Breakpoint Switcher */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          {breakpoints.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setActiveBreakpoint(value)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-md transition-colors
                ${
                  activeBreakpoint === value
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
              title={label}
            >
              <Icon size={18} />
              <span className="hidden md:inline text-sm">{label}</span>
            </button>
          ))}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Preview Toggle */}
          <button
            onClick={togglePreviewMode}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md transition-colors
              ${
                isPreviewMode
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <FiEye size={18} />
            <span className="text-sm">Preview</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !page}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
            title={saveError || ''}
          >
            <FiSave size={18} />
            <span className="text-sm">{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900"
            title="Settings"
          >
            <FiSettings size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex pt-16 w-full">
        {/* Left Sidebar - Elements Library */}
        {!isPreviewMode && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
            <ElementsSidebar />
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className="p-8">
            <div
              className={`
                bg-white shadow-lg mx-auto builder-canvas
                ${activeBreakpoint === 'desktop' ? 'max-w-none' : ''}
                ${activeBreakpoint === 'tablet' ? 'max-w-3xl' : ''}
                ${activeBreakpoint === 'mobile' ? 'max-w-sm' : ''}
              `}
            >
              <DroppableCanvas />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Element Settings */}
        {!isPreviewMode && selectedElementId && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <ElementSettings />
          </div>
        )}
      </div>
    </div>
    </DragAndDropProvider>
  );
}

export default App;
