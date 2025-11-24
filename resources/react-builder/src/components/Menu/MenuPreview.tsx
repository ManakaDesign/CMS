import React from 'react';
import type { MenuNav } from '../../types';

interface MenuPreviewProps {
  menu: MenuNav;
}

export const MenuPreview: React.FC<MenuPreviewProps> = ({ menu }) => {
  const settings = menu.design_settings;

  const renderLayoutPreview = () => {
    const menuItems = ['Home', 'Über uns', 'Leistungen', 'Kontakt'];

    switch (settings.layout_type) {
      case 'horizontal_standard':
        return (
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-lg font-bold" style={{ color: settings.colors.link_color }}>
              Your Logo
            </div>
            <div className="flex gap-4">
              {menuItems.map((item, i) => renderMenuItem(item, i === 0))}
            </div>
          </div>
        );

      case 'centered':
        return (
          <div className="flex flex-col items-center py-4 space-y-4">
            <div className="text-lg font-bold" style={{ color: settings.colors.link_color }}>
              Your Logo
            </div>
            <div className="flex gap-4">
              {menuItems.map((item, i) => renderMenuItem(item, i === 0, true))}
            </div>
          </div>
        );

      case 'split':
        return (
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex gap-4">
              {menuItems.slice(0, 2).map((item, i) => renderMenuItem(item, i === 0, true))}
            </div>
            <div className="text-lg font-bold" style={{ color: settings.colors.link_color }}>
              Logo
            </div>
            <div className="flex gap-4">
              {menuItems.slice(2).map((item) => renderMenuItem(item, false, true))}
            </div>
          </div>
        );

      case 'vertical_sidebar':
        return (
          <div className="flex flex-col items-start py-4 px-4 space-y-3 min-h-[200px]">
            <div className="text-lg font-bold mb-2" style={{ color: settings.colors.link_color }}>
              Logo
            </div>
            {menuItems.map((item, i) => (
              <div key={i} className="w-full">
                {renderMenuItem(item, i === 0, false, true)}
              </div>
            ))}
          </div>
        );

      case 'fullscreen_overlay':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 min-h-[200px]">
            {menuItems.map((item, i) => (
              <div
                key={i}
                className="text-2xl font-bold transition-colors cursor-pointer"
                style={{
                  color: i === 0 ? settings.colors.active_text : settings.colors.link_color,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const renderMenuItem = (
    item: string,
    isActive: boolean,
    small: boolean = false,
    fullWidth: boolean = false
  ) => {
    return (
      <div
        key={item}
        className={`px-3 py-2 rounded text-sm transition-colors cursor-pointer ${
          fullWidth ? 'w-full' : ''
        }`}
        style={{
          color: isActive ? settings.colors.active_text : settings.colors.link_color,
          backgroundColor: isActive ? settings.colors.active_background : 'transparent',
          fontSize: small ? '0.75rem' : undefined,
        }}
      >
        {item}
      </div>
    );
  };

  const renderSubmenuPreview = () => {
    switch (settings.submenu_style) {
      case 'dropdown_flyout':
        return (
          <div className="mt-4">
            <div className="text-xs font-semibold text-light-muted mb-2 uppercase tracking-wide">
              Submenü Vorschau: Dropdown Flyout
            </div>
            <div className="bg-dark-surface border border-dark-border rounded-lg p-3 max-w-[200px]">
              {['Unterseite 1', 'Unterseite 2', 'Unterseite 3'].map((item, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded text-xs transition-colors cursor-pointer mb-1 last:mb-0"
                  style={{
                    color: settings.colors.link_color,
                    backgroundColor: 'transparent',
                  }}
                >
                  {item}
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
                  <div className="text-xs font-semibold mb-2" style={{ color: settings.colors.active_text }}>
                    Kategorie {col}
                  </div>
                  {[1, 2].map((item) => (
                    <div
                      key={item}
                      className="text-xs py-1"
                      style={{ color: settings.colors.link_color }}
                    >
                      Unterseite {item}
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
              <div className="text-xs font-semibold mb-2" style={{ color: settings.colors.active_text }}>
                Untermenü
              </div>
              {['Unterseite 1', 'Unterseite 2', 'Unterseite 3'].map((item, i) => (
                <div
                  key={i}
                  className="px-2 py-1.5 rounded text-xs mb-1 last:mb-0"
                  style={{ color: settings.colors.link_color }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        );

      case 'fullscreen_overlay':
        return (
          <div className="mt-4">
            <div className="text-xs font-semibold text-light-muted mb-2 uppercase tracking-wide">
              Submenü Vorschau: Fullscreen Overlay
            </div>
            <div className="bg-dark-surface border border-dark-border rounded-lg p-6 flex flex-col items-center justify-center min-h-[120px]">
              {['Unterseite 1', 'Unterseite 2', 'Unterseite 3'].map((item, i) => (
                <div
                  key={i}
                  className="text-lg font-semibold my-1"
                  style={{ color: settings.colors.link_color }}
                >
                  {item}
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
      {/* Main Preview */}
      <div className="bg-dark-panel border border-dark-border rounded-lg overflow-hidden">
        {/* Browser Header */}
        <div className="border-b border-dark-border p-3 bg-dark-surface">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-light-muted ml-2">Browser Vorschau</span>
          </div>
        </div>

        {/* Menu Preview */}
        <div
          className="min-h-[120px]"
          style={{
            backgroundColor: settings.colors.background,
          }}
        >
          {renderLayoutPreview()}
        </div>

        {/* Preview Info */}
        <div className="p-3 bg-dark-surface border-t border-dark-border">
          <div className="text-xs text-light-muted space-y-1">
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

      {/* Active Features */}
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
