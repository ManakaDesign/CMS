import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSettings, FiEye, FiSave, FiMonitor, FiTablet, FiSmartphone, FiArrowLeft, FiLayers, FiGrid, FiCode } from 'react-icons/fi';
import { useBuilderStore } from '../store/builderStore';
import type { Breakpoint } from '../types';
import { DragAndDropProvider } from '../components/DragAndDropProvider';
import { DroppableCanvas } from '../components/DroppableCanvas';
import { ElementsSidebar } from '../components/Sidebar/ElementsSidebar';
import { ElementSettings } from '../components/Settings/ElementSettings';
import { BreakpointSettings } from '../components/Settings/BreakpointSettings';
import { GlobalSettings } from '../components/Settings/GlobalSettings';
import { LayerTree } from '../components/LayerTree/LayerTree';
import { CSSEditor } from '../components/CSSEditor/CSSEditor';
import { pagesApi } from '../api/services';
import { DragContextProvider } from '../contexts/DragContext';

export const Builder: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();

  const {
    page,
    elements,
    selectedElementId,
    selectedElementIds,
    activeBreakpoint,
    breakpointWidths,
    isPreviewMode,
    isSaving,
    setPage,
    setElements,
    setCustomCSS,
    setGlobalColors,
    setActiveBreakpoint,
    togglePreviewMode,
    canUndo,
    canRedo,
    undo,
    redo,
    setIsSaving,
  } = useBuilderStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showBreakpointSettings, setShowBreakpointSettings] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [leftPanel, setLeftPanel] = useState<'elements' | 'layers' | 'css' | 'settings'>('elements');

  // Load page on mount
  useEffect(() => {
    if (!pageId) {
      setLoadError('Keine Page ID angegeben');
      setLoading(false);
      return;
    }

    const loadPage = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const loadedPage = await pagesApi.get(parseInt(pageId));
        setPage(loadedPage);

        // Load elements from page content (JSON field)
        const pageElements = loadedPage.content?.elements || [];
        setElements(pageElements);

        // Load custom CSS and global colors
        const pageCustomCSS = loadedPage.content?.customCSS || '';
        setCustomCSS(pageCustomCSS);

        const pageGlobalColors = loadedPage.content?.globalColors || [];
        setGlobalColors(pageGlobalColors);
      } catch (err: any) {
        setLoadError(err.response?.data?.message || 'Fehler beim Laden der Seite');
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [pageId, setPage, setElements, setCustomCSS, setGlobalColors]);

  const handleSave = async () => {
    if (!page) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      // Get current state from store
      const store = useBuilderStore.getState();

      await pagesApi.update(page.id, {
        content: {
          elements,
          customCSS: store.customCSS,
          globalColors: store.globalColors,
        },
      });
      console.log('Seite erfolgreich gespeichert');
    } catch (error: any) {
      setSaveError(error.message || 'Fehler beim Speichern');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToDashboard = () => {
    if (canUndo() && !confirm('Du hast ungespeicherte Änderungen. Möchtest du wirklich zurück?')) {
      return;
    }
    navigate('/dashboard');
  };

  const breakpoints: { value: Breakpoint; icon: typeof FiMonitor; label: string }[] = [
    { value: 'desktop', icon: FiMonitor, label: 'Desktop' },
    { value: 'tablet', icon: FiTablet, label: 'Tablet' },
    { value: 'mobile', icon: FiSmartphone, label: 'Mobile' },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Lade Seite...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <p className="text-red-800 mb-4">{loadError}</p>
            <button
              onClick={handleBackToDashboard}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Zurück zum Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DragContextProvider>
      <DragAndDropProvider>
        <div className="min-h-screen bg-dark-bg">
        {/* Top Toolbar */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-dark-surface border-b border-dark-border z-50 flex items-center justify-between px-4">
          {/* Left */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="p-2 text-light-text hover:text-white rounded-lg hover:bg-dark-hover"
              title="Zurück zum Dashboard"
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="w-px h-6 bg-dark-border" />
            <h1 className="text-xl font-bold text-light-text">{page?.title || 'Untitled Page'}</h1>
            <span className="text-sm text-light-muted">
              {page?.status === 'draft' ? '• Entwurf' : '• Veröffentlicht'}
            </span>
          </div>

          {/* Center - Breakpoint Switcher */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-dark-panel rounded-lg p-1">
              {breakpoints.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveBreakpoint(value)}
                  className={`
                    flex items-center justify-center p-2 rounded-md transition-colors
                    ${
                      activeBreakpoint === value
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-light-muted hover:text-light-text hover:bg-dark-hover'
                    }
                  `}
                  title={label}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowBreakpointSettings(true)}
              className="p-2 text-light-muted hover:text-light-text hover:bg-dark-hover rounded-lg"
              title="Breakpoint Einstellungen"
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
              title="Rückgängig"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={redo}
              disabled={!canRedo()}
              className="p-2 text-light-text hover:text-white hover:bg-dark-hover rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
              title="Wiederholen"
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
              <span className="text-sm">Vorschau</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving || !page}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
              title={saveError || ''}
            >
              <FiSave size={18} />
              <span className="text-sm">{isSaving ? 'Speichert...' : 'Speichern'}</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-light-text hover:text-white hover:bg-dark-hover rounded-lg"
              title="Einstellungen"
            >
              <FiSettings size={20} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex pt-16 h-screen">
          {/* Left Panel Switcher */}
          {!isPreviewMode && (
            <div className="w-12 bg-dark-surface border-r border-dark-border flex flex-col flex-shrink-0">
              <button
                onClick={() => setLeftPanel('elements')}
                className={`
                  flex items-center justify-center p-3 transition-colors border-b border-dark-border
                  ${leftPanel === 'elements'
                    ? 'bg-brand-primary text-white'
                    : 'text-light-muted hover:text-light-text hover:bg-dark-hover'
                  }
                `}
                title="Elements"
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setLeftPanel('layers')}
                className={`
                  flex items-center justify-center p-3 transition-colors border-b border-dark-border
                  ${leftPanel === 'layers'
                    ? 'bg-brand-primary text-white'
                    : 'text-light-muted hover:text-light-text hover:bg-dark-hover'
                  }
                `}
                title="Layer Tree"
              >
                <FiLayers size={18} />
              </button>
              <button
                onClick={() => setLeftPanel('css')}
                className={`
                  flex items-center justify-center p-3 transition-colors border-b border-dark-border
                  ${leftPanel === 'css'
                    ? 'bg-brand-primary text-white'
                    : 'text-light-muted hover:text-light-text hover:bg-dark-hover'
                  }
                `}
                title="CSS Editor"
              >
                <FiCode size={18} />
              </button>
              <button
                onClick={() => setLeftPanel('settings')}
                className={`
                  flex items-center justify-center p-3 transition-colors border-b border-dark-border
                  ${leftPanel === 'settings'
                    ? 'bg-brand-primary text-white'
                    : 'text-light-muted hover:text-light-text hover:bg-dark-hover'
                  }
                `}
                title="Global Settings"
              >
                <FiSettings size={18} />
              </button>
            </div>
          )}

          {/* Left Sidebar - Elements Library, Layer Tree, CSS Editor, or Settings */}
          {!isPreviewMode && (
            <div className="w-64 bg-dark-surface border-r border-dark-border overflow-y-auto flex-shrink-0">
              {leftPanel === 'elements' && <ElementsSidebar />}
              {leftPanel === 'layers' && <LayerTree />}
              {leftPanel === 'css' && <CSSEditor />}
              {leftPanel === 'settings' && <GlobalSettings />}
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
          {!isPreviewMode && (selectedElementId || selectedElementIds.length > 0) && (
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
    </DragContextProvider>
  );
};
