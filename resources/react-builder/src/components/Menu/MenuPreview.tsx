import React, { useState, useEffect } from 'react';
import type { MenuNav, MenuItemNav } from '../../types';
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaGithub, FaTiktok } from 'react-icons/fa';

interface MenuPreviewProps {
  menu: MenuNav;
}

type BreakpointType = 'desktop' | 'tablet' | 'mobile';

export const MenuPreview: React.FC<MenuPreviewProps> = ({ menu: initialMenu }) => {
  const [activeBreakpoint, setActiveBreakpoint] = useState<BreakpointType>('desktop');
  const [menu, setMenu] = useState<MenuNav>(initialMenu);
  const [isScrolled, setIsScrolled] = useState(false);

  // Listen for menu updates
  useEffect(() => {
    const handleMenuUpdate = (event: Event) => {
      const updatedMenu = (event as CustomEvent).detail;
      if (updatedMenu.id === menu.id) {
        setMenu(updatedMenu);
      }
    };

    window.addEventListener('menuUpdated', handleMenuUpdate);
    return () => window.removeEventListener('menuUpdated', handleMenuUpdate);
  }, [menu.id]);

  // Update menu when prop changes
  useEffect(() => {
    setMenu(initialMenu);
  }, [initialMenu]);

  const settings = menu.design_settings;
  const rootItems = menu.items?.filter((item) => !item.parent_id) || [];

  // Logo renderer
  const renderLogo = (size: 'small' | 'normal' | 'large' = 'normal') => {
    const sizes = {
      small: { maxWidth: '100px', maxHeight: '40px' },
      normal: { maxWidth: settings.logo?.width || '150px', maxHeight: settings.logo?.height || '60px' },
      large: { maxWidth: '200px', maxHeight: '80px' },
    };

    if (menu.logo_url) {
      return (
        <img
          src={menu.logo_url}
          alt="Logo"
          style={{
            ...sizes[size],
            objectFit: 'contain',
          }}
        />
      );
    }

    return (
      <div
        className="font-bold"
        style={{
          color: settings.colors?.link_color || '#fff',
          fontSize: size === 'small' ? '16px' : size === 'large' ? '28px' : '20px',
        }}
      >
        Logo
      </div>
    );
  };

  // CTA Button renderer
  const renderCTAButton = () => {
    if (!settings.features?.cta_button || !settings.cta_button_config) return null;

    const config = settings.cta_button_config;
    const [isHovered, setIsHovered] = React.useState(false);

    return (
      <button
        style={{
          backgroundColor: isHovered ? config.styling.hover_bg_color : config.styling.bg_color,
          color: isHovered ? config.styling.hover_text_color : config.styling.text_color,
          borderRadius: config.styling.border_radius,
          padding: config.styling.padding,
          border: `${config.styling.border_width} solid ${config.styling.border_color}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '14px',
          fontWeight: '500',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {config.text}
      </button>
    );
  };

  // Social Icons renderer
  const renderSocialIcons = () => {
    if (!settings.features?.social_icons || !settings.social_icons_config) return null;

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
          const [isHovered, setIsHovered] = React.useState(false);

          return (
            <a
              key={iconConfig.platform}
              href={iconConfig.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: isHovered ? config.styling.hover_color : config.styling.color,
                fontSize: config.styling.size,
                transition: 'color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={(e) => e.preventDefault()}
            >
              <Icon />
            </a>
          );
        })}
      </div>
    );
  };

  // Menu item renderer with submenu support
  const renderMenuItem = (
    item: MenuItemNav,
    isActive: boolean = false,
    small: boolean = false,
    fullWidth: boolean = false,
    depth: number = 0
  ) => {
    const childItems = (item as any).childrenRecursive || item.children_recursive || item.children || [];
    const hasChildren = childItems.length > 0;

    return (
      <div key={item.id} className={`${fullWidth ? 'w-full' : ''} relative group`}>
        <div
          className={`px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
            fullWidth ? 'w-full' : ''
          }`}
          style={{
            color: isActive ? settings.colors?.active_text : settings.colors?.link_color,
            backgroundColor: isActive ? settings.colors?.active_background : 'transparent',
            fontSize: small ? '0.75rem' : depth > 0 ? '0.875rem' : undefined,
          }}
        >
          {item.label}
          {hasChildren && <span className="ml-1">▾</span>}
        </div>

        {/* Submenu preview on hover */}
        {hasChildren && settings.submenu_style === 'dropdown_flyout' && (
          <div
            className="absolute left-0 top-full mt-1 hidden group-hover:block z-10"
            style={{
              backgroundColor: settings.colors?.background || '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              minWidth: '200px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
          >
            <div className="py-2">
              {childItems.slice(0, 5).map((child: MenuItemNav) => (
                <div
                  key={child.id}
                  className="px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-opacity-50"
                  style={{
                    color: settings.colors?.link_color,
                  }}
                >
                  {child.label}
                </div>
              ))}
              {childItems.length > 5 && (
                <div className="px-4 py-2 text-xs text-gray-400">
                  +{childItems.length - 5} weitere
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLayoutPreview = () => {
    // Show placeholder if no items
    if (rootItems.length === 0) {
      return (
        <div className="flex items-center justify-center py-8 text-sm" style={{ color: settings.colors?.link_color }}>
          Keine Menü-Einträge vorhanden - Fügen Sie Seiten im "Menü-Struktur" Tab hinzu
        </div>
      );
    }

    // Mobile view
    const isMobileView = activeBreakpoint === 'mobile' || activeBreakpoint === 'tablet';
    if (isMobileView && settings.mobile_view === 'burger_sidebar') {
      return (
        <div className="min-h-[60px]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              {renderLogo('small')}
            </div>
            <div className="flex items-center gap-3">
              {settings.features?.social_icons && renderSocialIcons()}
              <div className="flex flex-col gap-0.5">
                <div className="w-6 h-0.5 rounded" style={{ backgroundColor: settings.colors?.link_color }}></div>
                <div className="w-6 h-0.5 rounded" style={{ backgroundColor: settings.colors?.link_color }}></div>
                <div className="w-6 h-0.5 rounded" style={{ backgroundColor: settings.colors?.link_color }}></div>
              </div>
            </div>
          </div>
          <div className="px-4 py-2 text-xs text-gray-400 italic border-t border-gray-700">
            Burger-Menü: Klick öffnet Sidebar mit allen Items
          </div>
        </div>
      );
    }

    if (isMobileView && settings.mobile_view === 'bottom_navigation') {
      return (
        <div className="flex flex-col">
          <div className="flex items-center justify-center py-3 border-b border-gray-700">
            {renderLogo('small')}
          </div>
          <div className="flex items-center justify-around py-3 border-t border-gray-700 mt-8">
            {rootItems.slice(0, 4).map((item) => (
              <div key={item.id} className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: settings.colors?.link_color, opacity: 0.5 }}></div>
                <div className="text-xs" style={{ color: settings.colors?.link_color }}>
                  {item.label.substring(0, 8)}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Desktop views
    switch (settings.layout_type) {
      case 'horizontal_standard':
        return (
          <div className="flex items-center justify-between px-6 py-4 min-h-[80px]">
            <div className="flex items-center gap-4">
              {renderLogo()}
              {settings.cta_button_config?.position === 'after_logo' && renderCTAButton()}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {rootItems.map((item, i) => renderMenuItem(item, i === 0))}
              </div>
              {settings.cta_button_config?.position === 'right_of_nav' && renderCTAButton()}
              {settings.social_icons_config?.position === 'right_of_nav' && renderSocialIcons()}
              {settings.social_icons_config?.position === 'after_cta' && renderSocialIcons()}
            </div>
            {settings.cta_button_config?.position === 'far_right' && renderCTAButton()}
          </div>
        );

      case 'centered':
        return (
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="flex items-center gap-4">
              {renderLogo('large')}
              {settings.cta_button_config?.position === 'after_logo' && renderCTAButton()}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {rootItems.map((item, i) => renderMenuItem(item, i === 0, true))}
              </div>
              {settings.cta_button_config?.position === 'right_of_nav' && renderCTAButton()}
              {settings.social_icons_config?.position === 'right_of_nav' && renderSocialIcons()}
              {settings.social_icons_config?.position === 'after_cta' && renderSocialIcons()}
            </div>
            {settings.cta_button_config?.position === 'far_right' && <div className="flex items-center gap-4">{renderCTAButton()}</div>}
          </div>
        );

      case 'split':
        const leftItems = rootItems.slice(0, Math.ceil(rootItems.length / 2));
        const rightItems = rootItems.slice(Math.ceil(rootItems.length / 2));
        return (
          <div className="flex items-center justify-between px-6 py-4 min-h-[80px]">
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {leftItems.map((item, i) => renderMenuItem(item, i === 0, true))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {renderLogo()}
              {settings.cta_button_config?.position === 'after_logo' && renderCTAButton()}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {rightItems.map((item) => renderMenuItem(item, false, true))}
              </div>
              {settings.cta_button_config?.position === 'right_of_nav' && renderCTAButton()}
              {settings.social_icons_config?.position === 'right_of_nav' && renderSocialIcons()}
              {settings.social_icons_config?.position === 'after_cta' && renderSocialIcons()}
              {settings.cta_button_config?.position === 'far_right' && renderCTAButton()}
            </div>
          </div>
        );

      case 'vertical_sidebar':
        return (
          <div className="flex flex-col items-start py-4 px-4 space-y-3 min-h-[200px]">
            <div className="mb-2 flex items-center gap-3">
              {renderLogo()}
              {settings.cta_button_config?.position === 'after_logo' && renderCTAButton()}
            </div>
            {rootItems.map((item, i) => (
              <div key={item.id} className="w-full">
                {renderMenuItem(item, i === 0, false, true)}
              </div>
            ))}
            {(settings.cta_button_config?.position === 'right_of_nav' || settings.cta_button_config?.position === 'far_right') && (
              <div className="mt-3">{renderCTAButton()}</div>
            )}
            {settings.social_icons_config && <div className="mt-3">{renderSocialIcons()}</div>}
          </div>
        );

      case 'fullscreen_overlay':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 min-h-[200px]">
            {rootItems.map((item, i) => (
              <div
                key={item.id}
                className="text-2xl font-bold transition-colors cursor-pointer"
                style={{
                  color: i === 0 ? settings.colors?.active_text : settings.colors?.link_color,
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const renderSubmenuPreview = () => {
    // Find an item with children for preview
    const itemWithChildren = rootItems.find((item) => {
      const children = (item as any).childrenRecursive || item.children_recursive || item.children || [];
      return children.length > 0;
    });

    const childItems = itemWithChildren
      ? ((itemWithChildren as any).childrenRecursive || itemWithChildren.children_recursive || itemWithChildren.children || [])
      : [];

    if (childItems.length === 0) {
      return (
        <div className="text-xs text-light-muted italic">
          Keine Submenüs vorhanden. Ziehen Sie im "Menü-Struktur" Tab ein Element auf ein anderes, um Submenüs zu erstellen.
        </div>
      );
    }

    switch (settings.submenu_style) {
      case 'dropdown_flyout':
        return (
          <div className="mt-4">
            <div className="text-xs font-semibold text-light-muted mb-2 uppercase tracking-wide">
              Submenü Vorschau: {itemWithChildren?.label}
            </div>
            <div className="bg-dark-surface border border-dark-border rounded-lg p-3 max-w-[200px]">
              {childItems.map((item: MenuItemNav) => (
                <div
                  key={item.id}
                  className="px-3 py-2 rounded text-xs transition-colors cursor-pointer mb-1 last:mb-0"
                  style={{
                    color: settings.colors?.link_color,
                    backgroundColor: 'transparent',
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        );

      case 'mega_menu':
        return (
          <div className="mt-4">
            <div className="text-xs font-semibold text-light-muted mb-2 uppercase tracking-wide">
              Submenü Vorschau: Mega Menu
            </div>
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4 grid grid-cols-3 gap-4">
              {[1, 2, 3].map((col) => (
                <div key={col}>
                  <div className="text-xs font-semibold mb-2" style={{ color: settings.colors?.active_text }}>
                    Kategorie {col}
                  </div>
                  {childItems.slice((col - 1) * 2, col * 2).map((item: MenuItemNav) => (
                    <div
                      key={item.id}
                      className="text-xs py-1"
                      style={{ color: settings.colors?.link_color }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        );

      case 'sidebar_flyout':
        return (
          <div className="mt-4">
            <div className="text-xs font-semibold text-light-muted mb-2 uppercase tracking-wide">
              Submenü Vorschau: Sidebar Flyout
            </div>
            <div className="bg-dark-surface border border-dark-border rounded-lg p-3 max-w-[180px]">
              <div className="text-xs font-semibold mb-2" style={{ color: settings.colors?.active_text }}>
                {itemWithChildren?.label}
              </div>
              {childItems.map((item: MenuItemNav) => (
                <div
                  key={item.id}
                  className="px-2 py-1.5 rounded text-xs mb-1 last:mb-0"
                  style={{ color: settings.colors?.link_color }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Breakpoint Selector */}
      <div className="flex items-center gap-2 justify-center pb-2 border-b border-dark-border">
        <button
          onClick={() => setActiveBreakpoint('desktop')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeBreakpoint === 'desktop'
              ? 'bg-brand-primary text-white'
              : 'bg-dark-surface text-light-muted hover:bg-dark-surface/80'
          }`}
        >
          Desktop
        </button>
        <button
          onClick={() => setActiveBreakpoint('tablet')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeBreakpoint === 'tablet'
              ? 'bg-brand-primary text-white'
              : 'bg-dark-surface text-light-muted hover:bg-dark-surface/80'
          }`}
        >
          Tablet
        </button>
        <button
          onClick={() => setActiveBreakpoint('mobile')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeBreakpoint === 'mobile'
              ? 'bg-brand-primary text-white'
              : 'bg-dark-surface text-light-muted hover:bg-dark-surface/80'
          }`}
        >
          Mobile
        </button>
      </div>

      {/* Transparent on Top Toggle */}
      {settings.features?.transparent_on_top && (
        <div className="flex items-center gap-2 justify-center pb-2 border-b border-dark-border">
          <span className="text-xs text-light-muted">Scroll-Status Vorschau:</span>
          <button
            onClick={() => setIsScrolled(false)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              !isScrolled
                ? 'bg-brand-primary text-white'
                : 'bg-dark-surface text-light-muted hover:bg-dark-surface/80'
            }`}
          >
            Oben (Transparent)
          </button>
          <button
            onClick={() => setIsScrolled(true)}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isScrolled
                ? 'bg-brand-primary text-white'
                : 'bg-dark-surface text-light-muted hover:bg-dark-surface/80'
            }`}
          >
            Gescrollt (Solid)
          </button>
        </div>
      )}

      {/* Main Preview */}
      <div className="bg-dark-panel border border-dark-border rounded-lg overflow-hidden">
        {/* Browser Header */}
        <div className="border-b border-dark-border p-3 bg-dark-surface">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-light-muted ml-2">
              Browser Vorschau ({activeBreakpoint})
            </span>
          </div>
        </div>

        {/* Menu Preview */}
        <div
          style={{
            backgroundColor: settings.features?.transparent_on_top && !isScrolled
              ? 'rgba(0, 0, 0, 0.3)'
              : settings.colors?.background || '#1a1a1a',
            position: settings.features?.sticky_header ? 'sticky' : 'relative',
            top: settings.features?.sticky_header ? '0' : 'auto',
            zIndex: settings.features?.sticky_header ? 50 : 'auto',
            transition: 'background-color 0.3s ease',
          }}
        >
          {renderLayoutPreview()}
        </div>

        {/* Preview Info */}
        <div className="p-3 bg-dark-surface border-t border-dark-border">
          <div className="text-xs text-light-muted space-y-1">
            <div>
              <span className="font-semibold">Items:</span> {rootItems.length} Haupteinträge
            </div>
            <div>
              <span className="font-semibold">Layout:</span>{' '}
              {getLayoutLabel(settings.layout_type)}
            </div>
            <div>
              <span className="font-semibold">Submenü:</span>{' '}
              {getSubmenuLabel(settings.submenu_style)}
            </div>
            <div>
              <span className="font-semibold">Mobile:</span>{' '}
              {getMobileLabel(settings.mobile_view)}
            </div>
          </div>
        </div>
      </div>

      {/* Submenu Preview */}
      <div className="bg-dark-panel border border-dark-border rounded-lg p-4">
        {renderSubmenuPreview()}
      </div>

      {/* Submenu Configuration Info */}
      {settings.submenu_config && (
        <div className="bg-dark-panel border border-dark-border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-light-text mb-3">Submenü-Einstellungen</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-light-muted">Animation:</span>{' '}
              <span className="text-light-text font-medium">{settings.submenu_config.animation}</span>
            </div>
            <div>
              <span className="text-light-muted">Verzögerung:</span>{' '}
              <span className="text-light-text font-medium">{settings.submenu_config.delay}ms</span>
            </div>
            <div>
              <span className="text-light-muted">Breite:</span>{' '}
              <span className="text-light-text font-medium">{settings.submenu_config.width}</span>
            </div>
            <div>
              <span className="text-light-muted">Position:</span>{' '}
              <span className="text-light-text font-medium">{settings.submenu_config.position}</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Features */}
      {settings.features && (
        <div className="bg-dark-panel border border-dark-border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-light-text mb-3">Aktive Features</h4>
          <div className="flex flex-wrap gap-2">
            {settings.features.sticky_header && (
              <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded">
                Sticky Header
              </span>
            )}
            {settings.features.transparent_on_top && (
              <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded">
                Transparent on Top
              </span>
            )}
            {settings.features.search_bar && (
              <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded">
                Search Bar
              </span>
            )}
            {settings.features.cta_button && (
              <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded">
                CTA Button
              </span>
            )}
            {settings.features.social_icons && (
              <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded">
                Social Icons
              </span>
            )}
            {!settings.features.sticky_header &&
              !settings.features.transparent_on_top &&
              !settings.features.search_bar &&
              !settings.features.cta_button &&
              !settings.features.social_icons && (
                <span className="text-xs text-light-muted">Keine Features aktiviert</span>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getLayoutLabel = (type: string): string => {
  const labels: Record<string, string> = {
    horizontal_standard: 'Horizontal Standard',
    centered: 'Centered',
    split: 'Split Navigation',
    vertical_sidebar: 'Vertical Sidebar',
    fullscreen_overlay: 'Fullscreen Overlay',
  };
  return labels[type] || type;
};

const getSubmenuLabel = (type: string): string => {
  const labels: Record<string, string> = {
    dropdown_flyout: 'Dropdown Flyout',
    mega_menu: 'Mega Menu',
    fullscreen_overlay: 'Fullscreen Overlay',
    sidebar_flyout: 'Sidebar Flyout',
  };
  return labels[type] || type;
};

const getMobileLabel = (type: string): string => {
  const labels: Record<string, string> = {
    burger_sidebar: 'Burger → Sidebar',
    burger_fullscreen: 'Burger → Fullscreen',
    bottom_navigation: 'Bottom Navigation',
    desktop_keep: 'Desktop beibehalten',
  };
  return labels[type] || type;
};
