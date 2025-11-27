import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../store/builderStore';
import type { Element, MenuNav, MenuItemNav } from '../types';
import { getElementComponent } from './elements/ElementRegistry';
import { DropZone } from './DropZone';
import api from '../services/api';

// MenuItem Component for submenu support
interface MenuItemComponentProps {
  item: MenuItemNav;
  depth: number;
  settings: any;
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({ item, depth, settings }) => {
  const [showSubmenu, setShowSubmenu] = useState(false);
  const childItems = (item as any).childrenRecursive || item.children_recursive || item.children || [];
  const hasChildren = childItems.length > 0;

  return (
    <li
      style={{
        display: depth === 0 ? 'inline-block' : 'block',
        position: 'relative',
      }}
      onMouseEnter={() => setShowSubmenu(true)}
      onMouseLeave={() => setShowSubmenu(false)}
    >
      <a
        href={item.computed_url || '#'}
        onClick={(e) => e.preventDefault()}
        style={{
          display: 'block',
          padding: depth === 0 ? '12px 16px' : '8px 12px',
          color: settings?.colors?.link_color || '#333',
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          fontSize: depth === 0 ? '16px' : '14px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = settings?.colors?.link_hover || '#007bff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = settings?.colors?.link_color || '#333';
        }}
      >
        {item.label} {hasChildren && <span>▾</span>}
      </a>
      {hasChildren && showSubmenu && (
        <ul style={{
          listStyle: 'none',
          padding: '8px 0',
          margin: 0,
          position: 'absolute',
          top: '100%',
          left: 0,
          backgroundColor: settings?.colors?.background || '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          minWidth: '200px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000,
        }}>
          {childItems.map((child: MenuItemNav) => (
            <MenuItemComponent key={child.id} item={child} depth={depth + 1} settings={settings} />
          ))}
        </ul>
      )}
    </li>
  );
};

export const Canvas: React.FC = () => {
  const {
    elements,
    selectedElementId,
    hoveredElementId,
    selectElement,
    hoverElement,
    isPreviewMode,
    customCSS,
    activeBreakpoint,
  } = useBuilderStore();

  const [globalMenu, setGlobalMenu] = useState<MenuNav | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Load global menu on mount
  useEffect(() => {
    const loadGlobalMenu = async () => {
      try {
        const response = await api.get('/menus');
        const menus = Array.isArray(response.data) ? response.data : (response.data.data || []);
        const globalMenuData = menus.find((m: MenuNav) => m.is_global && m.is_active);
        if (globalMenuData) {
          // Load full menu with items
          const menuResponse = await api.get(`/menus/${globalMenuData.id}`);
          setGlobalMenu(menuResponse.data);
        } else {
          setGlobalMenu(null);
        }
      } catch (error) {
        console.error('Failed to load global menu:', error);
      }
    };

    loadGlobalMenu();

    // Listen for menu updates
    const handleMenuUpdate = async (event: Event) => {
      const updatedMenu = (event as CustomEvent).detail;

      // If this is the current global menu, update it
      if (globalMenu && updatedMenu.id === globalMenu.id) {
        // Reload full menu data with items
        try {
          const menuResponse = await api.get(`/menus/${updatedMenu.id}`);
          setGlobalMenu(menuResponse.data);
        } catch (error) {
          console.error('Failed to reload menu:', error);
        }
      }

      // If is_global changed, reload all menus to find new global
      if ('is_global' in updatedMenu) {
        loadGlobalMenu();
      }
    };

    // Listen for menu items updates
    const handleMenuItemsUpdate = async (event: Event) => {
      const { menuId } = (event as CustomEvent).detail;

      // If this is the current global menu, reload it
      if (globalMenu && menuId === globalMenu.id) {
        try {
          const menuResponse = await api.get(`/menus/${menuId}`);
          setGlobalMenu(menuResponse.data);
        } catch (error) {
          console.error('Failed to reload menu items:', error);
        }
      }
    };

    window.addEventListener('menuUpdated', handleMenuUpdate);
    window.addEventListener('menuItemsUpdated', handleMenuItemsUpdate);
    return () => {
      window.removeEventListener('menuUpdated', handleMenuUpdate);
      window.removeEventListener('menuItemsUpdated', handleMenuItemsUpdate);
    };
  }, [globalMenu]);

  const renderElement = (element: Element): React.ReactNode => {
    const Component = getElementComponent(element.type);
    const children = elements
      .filter((el) => el.parent_id === element.id)
      .sort((a, b) => a.order - b.order)
      .map((child) => <React.Fragment key={child.id}>{renderElement(child)}</React.Fragment>);

    const isSelected = selectedElementId === element.id;
    const isHovered = hoveredElementId === element.id && !isSelected;

    return (
      <Component
        key={element.id}
        element={element}
        isSelected={!isPreviewMode && isSelected}
        isHovered={!isPreviewMode && isHovered}
        onClick={() => !isPreviewMode && selectElement(element.id)}
        onMouseEnter={() => !isPreviewMode && hoverElement(element.id)}
        onMouseLeave={() => !isPreviewMode && hoverElement(null)}
      >
        {children.length > 0 ? children : undefined}
      </Component>
    );
  };

  const rootElements = elements
    .filter((el) => !el.parent_id)
    .sort((a, b) => a.order - b.order);

  const renderGlobalMenu = () => {
    if (!globalMenu) return null;

    const settings = globalMenu.design_settings;
    const rootItems = globalMenu.items?.filter((item) => !item.parent_id) || [];

    if (rootItems.length === 0) return null;

    // Logo renderer
    const renderLogo = () => {
      if (globalMenu.logo_url) {
        return (
          <img
            src={globalMenu.logo_url}
            alt="Logo"
            style={{
              maxWidth: settings?.logo?.width || '150px',
              maxHeight: settings?.logo?.height || '60px',
              objectFit: 'contain',
            }}
          />
        );
      }
      return (
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: settings?.colors?.link_color || '#fff',
        }}>
          Logo
        </div>
      );
    };

    // Check if mobile view should be shown
    const isMobileView = activeBreakpoint === 'mobile' || activeBreakpoint === 'tablet';

    // Render based on layout type
    const renderLayout = () => {
      // Mobile burger menu
      if (isMobileView && settings?.mobile_view === 'burger_sidebar') {
        return (
          <div style={{ backgroundColor: settings?.colors?.background || '#1a1a1a', minHeight: '60px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 16px',
              minHeight: '60px',
            }}>
              {renderLogo()}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={settings?.colors?.link_color || '#fff'} strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>
            {showMobileMenu && (
              <div style={{
                backgroundColor: settings?.colors?.background || '#1a1a1a',
                borderTop: '1px solid #e5e7eb',
                padding: '16px',
              }}>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {rootItems.map((item) => (
                    <li key={item.id} style={{ marginBottom: '8px' }}>
                      <a
                        href={item.computed_url || '#'}
                        onClick={(e) => e.preventDefault()}
                        style={{
                          display: 'block',
                          padding: '12px',
                          color: settings?.colors?.link_color || '#fff',
                          textDecoration: 'none',
                        }}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }

      // Desktop layouts
      switch (settings?.layout_type) {
        case 'centered':
          return (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 24px',
              gap: '16px',
            }}>
              {renderLogo()}
              <nav>
                <ul style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  gap: '4px',
                }}>
                  {rootItems.map((item) => (
                    <MenuItemComponent key={item.id} item={item} depth={0} settings={settings} />
                  ))}
                </ul>
              </nav>
            </div>
          );

        case 'split':
          const leftItems = rootItems.slice(0, Math.ceil(rootItems.length / 2));
          const rightItems = rootItems.slice(Math.ceil(rootItems.length / 2));
          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              minHeight: '60px',
            }}>
              <nav>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '4px' }}>
                  {leftItems.map((item) => (
                    <MenuItemComponent key={item.id} item={item} depth={0} settings={settings} />
                  ))}
                </ul>
              </nav>
              {renderLogo()}
              <nav>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '4px' }}>
                  {rightItems.map((item) => (
                    <MenuItemComponent key={item.id} item={item} depth={0} settings={settings} />
                  ))}
                </ul>
              </nav>
            </div>
          );

        case 'vertical_sidebar':
          return (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '16px',
              minHeight: '200px',
            }}>
              <div style={{ marginBottom: '24px' }}>
                {renderLogo()}
              </div>
              <nav>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {rootItems.map((item) => (
                    <MenuItemComponent key={item.id} item={item} depth={0} settings={settings} />
                  ))}
                </ul>
              </nav>
            </div>
          );

        case 'horizontal_standard':
        default:
          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
              minHeight: '60px',
            }}>
              {renderLogo()}
              <nav>
                <ul style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  gap: '4px',
                }}>
                  {rootItems.map((item) => (
                    <MenuItemComponent key={item.id} item={item} depth={0} settings={settings} />
                  ))}
                </ul>
              </nav>
            </div>
          );
      }
    };

    return (
      <div
        style={{
          backgroundColor: settings?.colors?.background || '#1a1a1a',
          borderBottom: '1px solid #e5e7eb',
          position: 'relative',
        }}
      >
        {!isPreviewMode && (
          <div style={{
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
            zIndex: 10,
          }}>
            Global Menu
          </div>
        )}
        {renderLayout()}
      </div>
    );
  };

  return (
    <>
      {/* Custom CSS */}
      {customCSS && (
        <style dangerouslySetInnerHTML={{ __html: customCSS }} />
      )}

      <div
        className="builder-canvas bg-white min-h-full w-full"
        onClick={(e) => {
          // Click on canvas background deselects all
          if (e.target === e.currentTarget) {
            selectElement(null);
          }
        }}
      >
      {/* Global Menu - Always displayed at top if set */}
      {renderGlobalMenu()}

      {rootElements.length > 0 ? (
        <>
          {/* Drop zone before first element */}
          <DropZone
            id="canvas-drop-before-0"
            parentId={null}
            position="before"
            accepts={['section', 'menu']}
            index={0}
          />

          {rootElements.map((element, index) => (
            <React.Fragment key={element.id}>
              {renderElement(element)}

              {/* Drop zone after each element */}
              <DropZone
                id={`canvas-drop-after-${element.id}`}
                parentId={null}
                position="after"
                accepts={['section', 'menu']}
                index={index + 1}
              />
            </React.Fragment>
          ))}
        </>
      ) : (
        <div className="flex items-center justify-center h-full min-h-[400px] text-gray-400">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Your canvas is empty</p>
            <p className="text-sm">Drag elements from the left sidebar to start building</p>
          </div>
        </div>
      )}
      </div>
    </>
  );
};
