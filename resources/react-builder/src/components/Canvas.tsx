import React, { useState, useEffect } from 'react';
import { useBuilderStore } from '../store/builderStore';
import type { Element, MenuNav, MenuItemNav } from '../types';
import { getElementComponent } from './elements/ElementRegistry';
import { DropZone } from './DropZone';
import api from '../services/api';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaGithub, FaTiktok } from 'react-icons/fa';

// Convert hex to rgba with transparency
const hexToRgba = (hex: string, alpha: number = 0.8): string => {
  if (!hex) return `rgba(26, 26, 26, ${alpha})`;

  // Handle rgba already
  if (hex.startsWith('rgba')) return hex;
  if (hex.startsWith('rgb')) {
    const match = hex.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${alpha})`;
    }
  }

  // Remove # if present
  hex = hex.replace('#', '');

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
      {hasChildren && showSubmenu && depth === 0 && (
        <>
          {/* Dropdown Flyout Style */}
          {settings?.submenu_style === 'dropdown_flyout' && (
            <ul style={{
              listStyle: 'none',
              padding: '8px 0',
              margin: 0,
              position: 'absolute',
              top: '100%',
              marginTop: '4px',
              backgroundColor: settings?.colors?.background || '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              minWidth: settings?.submenu_config?.width || '200px',
              width: settings?.submenu_config?.width === 'full' ? '100%' : settings?.submenu_config?.width || 'auto',
              left: settings?.submenu_config?.position === 'left' ? '0' :
                    settings?.submenu_config?.position === 'center' ? '50%' : 'auto',
              right: settings?.submenu_config?.position === 'right' ? '0' : 'auto',
              transform: settings?.submenu_config?.position === 'center' ? 'translateX(-50%)' : 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              zIndex: 1000,
              transition: settings?.submenu_config?.animation === 'none' ? 'none' :
                settings?.submenu_config?.animation === 'fade' ? `opacity ${settings?.submenu_config?.delay || 200}ms ease-in-out` :
                settings?.submenu_config?.animation === 'slide' ? `transform ${settings?.submenu_config?.delay || 200}ms ease-in-out, opacity ${settings?.submenu_config?.delay || 200}ms ease-in-out` :
                `opacity ${settings?.submenu_config?.delay || 200}ms ease-in-out`,
            }}>
              {childItems.map((child: MenuItemNav) => (
                <MenuItemComponent key={child.id} item={child} depth={depth + 1} settings={settings} />
              ))}
            </ul>
          )}

          {/* Mega Menu Style */}
          {settings?.submenu_style === 'mega_menu' && (
            <div style={{
              position: 'absolute',
              top: '100%',
              marginTop: '4px',
              backgroundColor: settings?.colors?.background || '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              minWidth: settings?.submenu_config?.width || '600px',
              width: settings?.submenu_config?.width === 'full' ? '100%' : settings?.submenu_config?.width || 'auto',
              left: settings?.submenu_config?.position === 'left' ? '0' :
                    settings?.submenu_config?.position === 'center' ? '50%' : 'auto',
              right: settings?.submenu_config?.position === 'right' ? '0' : 'auto',
              transform: settings?.submenu_config?.position === 'center' ? 'translateX(-50%)' : 'none',
              padding: '24px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              transition: settings?.submenu_config?.animation === 'none' ? 'none' :
                settings?.submenu_config?.animation === 'fade' ? `opacity ${settings?.submenu_config?.delay || 200}ms ease-in-out` :
                settings?.submenu_config?.animation === 'slide' ? `transform ${settings?.submenu_config?.delay || 200}ms ease-in-out, opacity ${settings?.submenu_config?.delay || 200}ms ease-in-out` :
                `opacity ${settings?.submenu_config?.delay || 200}ms ease-in-out`,
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '24px',
              }}>
                {childItems.map((child: MenuItemNav) => (
                  <div key={child.id}>
                    <a
                      href={child.computed_url || '#'}
                      onClick={(e) => e.preventDefault()}
                      style={{
                        display: 'block',
                        padding: '8px 0',
                        color: settings?.colors?.link_color || '#333',
                        fontWeight: '600',
                        textDecoration: 'none',
                      }}
                    >
                      {child.label}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sidebar Flyout Style */}
          {settings?.submenu_style === 'sidebar_flyout' && (
            <div style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              backgroundColor: settings?.colors?.background || '#fff',
              border: '1px solid #e5e7eb',
              width: settings?.submenu_config?.width ?
                (settings.submenu_config.width === 'full' ? '400px' :
                 settings.submenu_config.width.replace(/px$/, '') + 'px') : '300px',
              padding: '24px',
              boxShadow: '-4px 0 12px rgba(0,0,0,0.15)',
              zIndex: 1000,
              overflowY: 'auto',
              transition: settings?.submenu_config?.animation === 'none' ? 'none' :
                settings?.submenu_config?.animation === 'fade' ? `opacity ${settings?.submenu_config?.delay || 200}ms ease-in-out` :
                settings?.submenu_config?.animation === 'slide' ? `transform ${settings?.submenu_config?.delay || 200}ms ease-in-out` :
                `opacity ${settings?.submenu_config?.delay || 200}ms ease-in-out`,
            }}>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {childItems.map((child: MenuItemNav) => (
                  <li key={child.id} style={{ marginBottom: '12px' }}>
                    <a
                      href={child.computed_url || '#'}
                      onClick={(e) => e.preventDefault()}
                      style={{
                        display: 'block',
                        padding: '8px 0',
                        color: settings?.colors?.link_color || '#333',
                        textDecoration: 'none',
                        fontSize: '16px',
                      }}
                    >
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fullscreen Overlay Style */}
          {settings?.submenu_style === 'fullscreen_overlay' && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              zIndex: 1000,
              transition: settings?.submenu_config?.animation === 'none' ? 'none' :
                settings?.submenu_config?.animation === 'fade' ? `opacity ${settings?.submenu_config?.delay || 200}ms ease-in-out` :
                `opacity ${settings?.submenu_config?.delay || 200}ms ease-in-out`,
            }}>
              {childItems.map((child: MenuItemNav) => (
                <a
                  key={child.id}
                  href={child.computed_url || '#'}
                  onClick={(e) => e.preventDefault()}
                  style={{
                    fontSize: '32px',
                    fontWeight: '600',
                    color: settings?.colors?.link_color || '#fff',
                    textDecoration: 'none',
                  }}
                >
                  {child.label}
                </a>
              ))}
            </div>
          )}

          {/* Default fallback to dropdown_flyout if no style set */}
          {!settings?.submenu_style && (
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
        </>
      )}
      {hasChildren && showSubmenu && depth > 0 && (
        <ul style={{
          listStyle: 'none',
          padding: '8px 0',
          margin: 0,
          position: 'absolute',
          top: '0',
          left: '100%',
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
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for transparent on top feature
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    // CTA Button renderer
    const renderCTAButton = () => {
      if (!settings?.features?.cta_button || !settings?.cta_button_config) return null;

      const config = settings.cta_button_config;

      return (
        <button
          style={{
            backgroundColor: config.styling.bg_color,
            color: config.styling.text_color,
            borderRadius: config.styling.border_radius,
            padding: config.styling.padding,
            border: `${config.styling.border_width} solid ${config.styling.border_color}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: '500',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = config.styling.hover_bg_color;
            e.currentTarget.style.color = config.styling.hover_text_color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = config.styling.bg_color;
            e.currentTarget.style.color = config.styling.text_color;
          }}
        >
          {config.text}
        </button>
      );
    };

    // Social Icons renderer
    const renderSocialIcons = () => {
      if (!settings?.features?.social_icons || !settings?.social_icons_config) return null;

      const config = settings.social_icons_config;
      const iconMap = {
        facebook: FaFacebook,
        instagram: FaInstagram,
        twitter: FaTwitter,
        linkedin: FaLinkedin,
        youtube: FaYoutube,
        github: FaGithub,
        tiktok: FaTiktok,
      };

      return (
        <div style={{ display: 'flex', gap: config.styling.spacing, alignItems: 'center' }}>
          {config.icons.map((iconConfig) => {
            const Icon = iconMap[iconConfig.platform];

            return (
              <a
                key={iconConfig.platform}
                href={iconConfig.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: config.styling.color,
                  fontSize: config.styling.size,
                  transition: 'color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = config.styling.hover_color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = config.styling.color;
                }}
                onClick={(e) => e.preventDefault()}
              >
                <Icon />
              </a>
            );
          })}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {settings?.features?.social_icons && renderSocialIcons()}
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

      // Mobile bottom navigation
      if (isMobileView && settings?.mobile_view === 'bottom_navigation') {
        return (
          <div style={{ backgroundColor: settings?.colors?.background || '#1a1a1a' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid #374151',
            }}>
              {renderLogo()}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '12px 16px',
              borderTop: '1px solid #374151',
              marginTop: '32px',
            }}>
              {rootItems.slice(0, 4).map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: settings?.colors?.link_color || '#fff',
                    opacity: 0.5,
                  }}></div>
                  <div style={{
                    fontSize: '12px',
                    color: settings?.colors?.link_color || '#fff',
                  }}>
                    {item.label.substring(0, 8)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Mobile fullscreen burger
      if (isMobileView && settings?.mobile_view === 'burger_fullscreen') {
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {settings?.features?.social_icons && renderSocialIcons()}
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
            </div>
            {showMobileMenu && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                zIndex: 1000,
              }}>
                {rootItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.computed_url || '#'}
                    onClick={(e) => e.preventDefault()}
                    style={{
                      fontSize: '24px',
                      fontWeight: '600',
                      color: settings?.colors?.link_color || '#fff',
                      textDecoration: 'none',
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      }

      // Desktop keep - show desktop layout even on mobile (fall through to desktop layouts)
      if (isMobileView && settings?.mobile_view === 'desktop_keep') {
        // Fall through to desktop layouts below
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {renderLogo()}
                {settings?.cta_button_config?.position === 'after_logo' && renderCTAButton()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                {settings?.cta_button_config?.position === 'right_of_nav' && renderCTAButton()}
                {settings?.social_icons_config?.position === 'right_of_nav' && renderSocialIcons()}
                {settings?.social_icons_config?.position === 'after_cta' && renderSocialIcons()}
              </div>
              {settings?.cta_button_config?.position === 'far_right' && <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>{renderCTAButton()}</div>}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {renderLogo()}
                {settings?.cta_button_config?.position === 'after_logo' && renderCTAButton()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <nav>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', gap: '4px' }}>
                    {rightItems.map((item) => (
                      <MenuItemComponent key={item.id} item={item} depth={0} settings={settings} />
                    ))}
                  </ul>
                </nav>
                {settings?.cta_button_config?.position === 'right_of_nav' && renderCTAButton()}
                {settings?.social_icons_config?.position === 'right_of_nav' && renderSocialIcons()}
                {settings?.social_icons_config?.position === 'after_cta' && renderSocialIcons()}
                {settings?.cta_button_config?.position === 'far_right' && renderCTAButton()}
              </div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {renderLogo()}
                {settings?.cta_button_config?.position === 'after_logo' && renderCTAButton()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                {settings?.cta_button_config?.position === 'right_of_nav' && renderCTAButton()}
                {settings?.social_icons_config?.position === 'right_of_nav' && renderSocialIcons()}
                {settings?.social_icons_config?.position === 'after_cta' && renderSocialIcons()}
              </div>
              {settings?.cta_button_config?.position === 'far_right' && renderCTAButton()}
            </div>
          );
      }
    };

    return (
      <div
        style={{
          backgroundColor: settings?.features?.transparent_on_top && !isScrolled
            ? hexToRgba(settings?.colors?.background || '#1a1a1a', 0.3)
            : settings?.colors?.background || '#1a1a1a',
          borderBottom: '1px solid #e5e7eb',
          position: (settings?.features?.transparent_on_top || settings?.features?.sticky_header) ? 'sticky' : 'relative',
          top: '0',
          zIndex: (settings?.features?.transparent_on_top || settings?.features?.sticky_header) ? 50 : 'auto',
          transition: 'background-color 0.3s ease',
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
        className="builder-canvas bg-white min-h-full w-full relative"
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
        <div
          style={{
            marginTop: (globalMenu?.design_settings?.features?.transparent_on_top || globalMenu?.design_settings?.features?.sticky_header)
              ? '-80px'
              : '0',
          }}
        >
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
        </div>
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
