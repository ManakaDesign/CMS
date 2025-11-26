import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../store/builderStore';
import type { Element, MenuNav } from '../types';
import { getElementComponent } from './elements/ElementRegistry';
import { DropZone } from './DropZone';
import api from '../services/api';

export const Canvas: React.FC = () => {
  const {
    elements,
    selectedElementId,
    hoveredElementId,
    selectElement,
    hoverElement,
    isPreviewMode,
    customCSS,
  } = useBuilderStore();

  const [globalMenu, setGlobalMenu] = useState<MenuNav | null>(null);

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

    return (
      <div
        style={{
          backgroundColor: settings.colors.background,
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          minHeight: '60px',
        }}>
          {globalMenu.logo_url ? (
            <img
              src={globalMenu.logo_url}
              alt="Logo"
              style={{
                maxWidth: settings.logo.width || '150px',
                maxHeight: settings.logo.height || '60px',
                objectFit: 'contain',
              }}
            />
          ) : (
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: settings.colors.link_color,
            }}>
              Logo
            </div>
          )}
          <nav>
            <ul style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              gap: '4px',
            }}>
              {rootItems.map((item) => (
                <li key={item.id} style={{ display: 'inline-block' }}>
                  <a
                    href={item.computed_url || '#'}
                    onClick={(e) => e.preventDefault()}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      color: settings.colors.link_color,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      fontSize: '16px',
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
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
