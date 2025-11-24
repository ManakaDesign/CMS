import React, { useState, useEffect } from 'react';
import type { Element } from '../../types';
import type { MenuNav, MenuItemNav } from '../../types';
import { BaseElement } from './BaseElement';
import { useBuilderStore } from '../../store/builderStore';
import api from '../../services/api';

interface MenuProps {
  element: Element;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Menu: React.FC<MenuProps> = (props) => {
  const { element, onClick, ...baseProps } = props;
  const { activeBreakpoint, toggleElementSelection } = useBuilderStore();
  const [menu, setMenu] = useState<MenuNav | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load active menu from backend
  useEffect(() => {
    const loadMenu = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/menus');
        const menus = Array.isArray(response.data) ? response.data : (response.data.data || []);
        // Get first active menu or first menu
        const activeMenu = menus.find((m: MenuNav) => m.is_active) || menus[0];
        if (activeMenu) {
          // Load menu with items
          const menuResponse = await api.get(`/menus/${activeMenu.id}`);
          setMenu(menuResponse.data);
        }
      } catch (error) {
        console.error('Failed to load menu:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadMenu();
  }, []);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.shiftKey) {
      toggleElementSelection(element.id);
    } else {
      onClick?.();
    }
  };

  // Get menu styles with proper inheritance
  let breakpointStyles: Record<string, any> = { ...element.styles.desktop };

  if (activeBreakpoint === 'tablet' || activeBreakpoint === 'mobile') {
    breakpointStyles = { ...breakpointStyles, ...element.styles.tablet };
  }

  if (activeBreakpoint === 'mobile') {
    breakpointStyles = { ...breakpointStyles, ...element.styles.mobile };
  }

  const renderMenuItem = (item: MenuItemNav, depth: number = 0): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0;
    const settings = menu?.design_settings;

    return (
      <li key={item.id} style={{ display: depth === 0 ? 'inline-block' : 'block' }}>
        <a
          href={item.computed_url || '#'}
          onClick={(e) => e.preventDefault()}
          style={{
            display: 'block',
            padding: depth === 0 ? '12px 16px' : '8px 12px',
            color: settings?.colors.link_color || '#333',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            fontSize: depth === 0 ? '16px' : '14px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = settings?.colors.link_hover || '#007bff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = settings?.colors.link_color || '#333';
          }}
        >
          {item.label}
        </a>
        {hasChildren && (
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'none', // Simplified - no dropdown in builder
          }}>
            {item.children?.map((child) => renderMenuItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  const menuContent = () => {
    if (isLoading) {
      return (
        <div style={{ padding: '16px', color: '#999', textAlign: 'center' }}>
          Loading menu...
        </div>
      );
    }

    if (!menu) {
      return (
        <div style={{ padding: '16px', color: '#999', textAlign: 'center' }}>
          No active menu found. Create a menu in the Menu Management section.
        </div>
      );
    }

    const settings = menu.design_settings;
    const rootItems = menu.items?.filter((item) => !item.parent_id) || [];

    // Render based on layout type
    const renderLayout = () => {
      switch (settings.layout_type) {
        case 'horizontal_standard':
          return (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 24px',
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: settings.colors.link_color,
              }}>
                Logo
              </div>
              <nav>
                <ul style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  gap: '4px',
                }}>
                  {rootItems.map((item) => renderMenuItem(item))}
                </ul>
              </nav>
            </div>
          );

        case 'centered':
          return (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 24px',
              gap: '16px',
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: settings.colors.link_color,
              }}>
                Logo
              </div>
              <nav>
                <ul style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  gap: '4px',
                }}>
                  {rootItems.map((item) => renderMenuItem(item))}
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
            }}>
              <nav>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '4px' }}>
                  {leftItems.map((item) => renderMenuItem(item))}
                </ul>
              </nav>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: settings.colors.link_color,
              }}>
                Logo
              </div>
              <nav>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '4px' }}>
                  {rightItems.map((item) => renderMenuItem(item))}
                </ul>
              </nav>
            </div>
          );

        case 'vertical_sidebar':
          return (
            <div style={{
              padding: '16px',
              minHeight: '200px',
            }}>
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: settings.colors.link_color,
                marginBottom: '16px',
              }}>
                Logo
              </div>
              <nav>
                <ul style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  {rootItems.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.computed_url || '#'}
                        onClick={(e) => e.preventDefault()}
                        style={{
                          display: 'block',
                          padding: '12px 16px',
                          color: settings.colors.link_color,
                          textDecoration: 'none',
                          borderRadius: '4px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = settings.colors.active_background;
                          e.currentTarget.style.color = settings.colors.active_text;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = settings.colors.link_color;
                        }}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          );

        default:
          return (
            <nav style={{ padding: '16px 24px' }}>
              <ul style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                gap: '4px',
              }}>
                {rootItems.map((item) => renderMenuItem(item))}
              </ul>
            </nav>
          );
      }
    };

    return (
      <div style={{
        backgroundColor: settings.colors.background,
        minHeight: '60px',
      }}>
        {renderLayout()}
      </div>
    );
  };

  return (
    <BaseElement
      element={element}
      onClick={() => onClick?.()}
      {...baseProps}
    >
      <div onClick={handleMenuClick}>
        {menuContent()}
      </div>
    </BaseElement>
  );
};
