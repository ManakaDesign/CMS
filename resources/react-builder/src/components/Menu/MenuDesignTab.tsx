import React, { useState } from 'react';
import type {
  MenuNav,
  MenuDesignSettings,
  MenuLayoutType,
  SubmenuStyle,
  MobileView,
  Media,
} from '../../types';
import { FiCheck, FiImage, FiTrash2 } from 'react-icons/fi';
import MediaPicker from '../admin/media/MediaPicker';

interface MenuDesignTabProps {
  menu: MenuNav;
  onUpdate: (settings: Partial<MenuDesignSettings>) => void;
}

export const MenuDesignTab: React.FC<MenuDesignTabProps> = ({ menu, onUpdate }) => {
  const settings = menu.design_settings;
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const handleLayoutTypeChange = (layoutType: MenuLayoutType) => {
    onUpdate({ layout_type: layoutType });
  };

  const handleSubmenuStyleChange = (submenuStyle: SubmenuStyle) => {
    onUpdate({ submenu_style: submenuStyle });
  };

  const handleMobileViewChange = (mobileView: MobileView) => {
    onUpdate({ mobile_view: mobileView });
  };

  const handleColorChange = (key: keyof typeof settings.colors, value: string) => {
    onUpdate({
      colors: {
        ...settings.colors,
        [key]: value,
      },
    });
  };

  const handleFeatureToggle = (key: keyof typeof settings.features) => {
    onUpdate({
      features: {
        ...settings.features,
        [key]: !settings.features[key],
      },
    });
  };

  const handleSubmenuConfigChange = (
    key: keyof typeof settings.submenu_config,
    value: any
  ) => {
    onUpdate({
      submenu_config: {
        ...settings.submenu_config,
        [key]: value,
      },
    });
  };

  const handleLogoSelect = (media: Media) => {
    onUpdate({
      logo: {
        ...settings.logo,
        media_id: media.id,
      },
    });
    setShowMediaPicker(false);
  };

  const handleLogoRemove = () => {
    onUpdate({
      logo: {
        ...settings.logo,
        media_id: undefined,
      },
    });
  };

  const handleLogoSizeChange = (key: 'width' | 'height', value: string) => {
    onUpdate({
      logo: {
        ...settings.logo,
        [key]: value,
      },
    });
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Layout Type Section */}
      <Section title="Layout-Typ">
        <div className="space-y-3">
          <OptionCard
            title="Horizontal Standard"
            description="Klassisches Menü oben, Logo links, Menüpunkte rechts"
            selected={settings.layout_type === 'horizontal_standard'}
            onClick={() => handleLayoutTypeChange('horizontal_standard')}
          />
          <OptionCard
            title="Centered (Logo in Mitte)"
            description="Logo zentriert oben, Menüpunkte darunter zentriert"
            selected={settings.layout_type === 'centered'}
            onClick={() => handleLayoutTypeChange('centered')}
          />
          <OptionCard
            title="Split Navigation"
            description="Logo mittig, Menüpunkte links & rechts aufgeteilt"
            selected={settings.layout_type === 'split'}
            onClick={() => handleLayoutTypeChange('split')}
          />
          <OptionCard
            title="Vertical Sidebar"
            description="Vertikales Menü an der Seite (links oder rechts)"
            selected={settings.layout_type === 'vertical_sidebar'}
            onClick={() => handleLayoutTypeChange('vertical_sidebar')}
          />
          <OptionCard
            title="Fullscreen Overlay"
            description="Großes Overlay-Menü über kompletter Seite"
            selected={settings.layout_type === 'fullscreen_overlay'}
            onClick={() => handleLayoutTypeChange('fullscreen_overlay')}
          />
        </div>
      </Section>

      {/* Submenu Style Section */}
      <Section title="Submenü-Stil">
        <div className="space-y-3">
          <OptionCard
            title="Dropdown Flyout"
            description="Klassisches Dropdown direkt unter dem Menüpunkt"
            selected={settings.submenu_style === 'dropdown_flyout'}
            onClick={() => handleSubmenuStyleChange('dropdown_flyout')}
          />
          <OptionCard
            title="Mega Menu"
            description="Multi-Column Layout mit Kategorien und Icons"
            selected={settings.submenu_style === 'mega_menu'}
            onClick={() => handleSubmenuStyleChange('mega_menu')}
          />
          <OptionCard
            title="Fullscreen Overlay"
            description="Vollbild-Submenü mit großen, animierten Links"
            selected={settings.submenu_style === 'fullscreen_overlay'}
            onClick={() => handleSubmenuStyleChange('fullscreen_overlay')}
          />
          <OptionCard
            title="Sidebar Flyout"
            description="Submenü fliegt von der Seite ein (links/rechts)"
            selected={settings.submenu_style === 'sidebar_flyout'}
            onClick={() => handleSubmenuStyleChange('sidebar_flyout')}
          />
        </div>
      </Section>

      {/* Submenu Configuration */}
      <Section title="Submenü-Konfiguration">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Animation
            </label>
            <select
              value={settings.submenu_config.animation}
              onChange={(e) =>
                handleSubmenuConfigChange(
                  'animation',
                  e.target.value as 'fade' | 'slide' | 'none'
                )
              }
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
            >
              <option value="fade">Fade</option>
              <option value="slide">Slide</option>
              <option value="none">Keine</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Verzögerung (ms)
            </label>
            <input
              type="number"
              value={settings.submenu_config.delay}
              onChange={(e) =>
                handleSubmenuConfigChange('delay', parseInt(e.target.value))
              }
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Breite
            </label>
            <input
              type="text"
              value={settings.submenu_config.width}
              onChange={(e) => handleSubmenuConfigChange('width', e.target.value)}
              placeholder="auto, 200px, 100%"
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Position
            </label>
            <select
              value={settings.submenu_config.position}
              onChange={(e) =>
                handleSubmenuConfigChange(
                  'position',
                  e.target.value as 'left' | 'center' | 'right'
                )
              }
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
            >
              <option value="left">Links</option>
              <option value="center">Mitte</option>
              <option value="right">Rechts</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Mobile View Section */}
      <Section title="Mobile-Ansicht">
        <div className="space-y-3">
          <OptionCard
            title="Burger → Sidebar"
            description="Hamburger-Menü öffnet Slide-in Menü von der Seite"
            selected={settings.mobile_view === 'burger_sidebar'}
            onClick={() => handleMobileViewChange('burger_sidebar')}
          />
          <OptionCard
            title="Burger → Fullscreen"
            description="Hamburger-Menü öffnet Vollbild-Overlay"
            selected={settings.mobile_view === 'burger_fullscreen'}
            onClick={() => handleMobileViewChange('burger_fullscreen')}
          />
          <OptionCard
            title="Bottom Navigation"
            description="Fixierte Navigation am unteren Bildschirmrand"
            selected={settings.mobile_view === 'bottom_navigation'}
            onClick={() => handleMobileViewChange('bottom_navigation')}
          />
          <OptionCard
            title="Desktop beibehalten"
            description="Auch auf Mobile die Desktop-Ansicht anzeigen"
            selected={settings.mobile_view === 'desktop_keep'}
            onClick={() => handleMobileViewChange('desktop_keep')}
          />
        </div>
      </Section>

      {/* Logo Section */}
      <Section title="Logo">
        <div className="space-y-4">
          {settings.logo?.media_id ? (
            <div className="border-2 border-dark-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-light-text">Logo ausgewählt</span>
                <button
                  onClick={handleLogoRemove}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  title="Logo entfernen"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
              <div className="bg-dark-surface rounded p-4 flex items-center justify-center min-h-[120px]">
                <img
                  src={`/storage/media/${settings.logo.media_id}`}
                  alt="Logo"
                  style={{
                    maxWidth: settings.logo.width || 'auto',
                    maxHeight: settings.logo.height || 'auto',
                  }}
                  className="max-w-full max-h-32 object-contain"
                />
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowMediaPicker(true)}
              className="w-full border-2 border-dashed border-dark-border hover:border-brand-primary rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-colors group"
            >
              <FiImage className="text-light-muted group-hover:text-brand-primary" size={32} />
              <span className="text-sm font-medium text-light-text">Logo aus Mediathek wählen</span>
              <span className="text-xs text-light-muted">Klicken zum Auswählen</span>
            </button>
          )}

          {settings.logo?.media_id && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Breite
                </label>
                <input
                  type="text"
                  value={settings.logo.width}
                  onChange={(e) => handleLogoSizeChange('width', e.target.value)}
                  placeholder="auto, 200px"
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Höhe
                </label>
                <input
                  type="text"
                  value={settings.logo.height}
                  onChange={(e) => handleLogoSizeChange('height', e.target.value)}
                  placeholder="auto, 60px"
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Colors Section */}
      <Section title="Farben & Styling">
        <div className="space-y-4">
          <ColorInput
            label="Hintergrundfarbe"
            value={settings.colors.background}
            onChange={(value) => handleColorChange('background', value)}
          />
          <ColorInput
            label="Link-Farbe (Normal)"
            value={settings.colors.link_color}
            onChange={(value) => handleColorChange('link_color', value)}
          />
          <ColorInput
            label="Link-Farbe (Hover)"
            value={settings.colors.link_hover}
            onChange={(value) => handleColorChange('link_hover', value)}
          />
          <ColorInput
            label="Active State Text"
            value={settings.colors.active_text}
            onChange={(value) => handleColorChange('active_text', value)}
          />
          <ColorInput
            label="Active State Background"
            value={settings.colors.active_background}
            onChange={(value) => handleColorChange('active_background', value)}
          />
        </div>
      </Section>

      {/* Features Section */}
      <Section title="Zusatz-Features">
        <div className="space-y-3">
          <CheckboxCard
            title="Sticky Header"
            description="Menü bleibt beim Scrollen oben fixiert"
            checked={settings.features.sticky_header}
            onChange={() => handleFeatureToggle('sticky_header')}
          />
          <CheckboxCard
            title="Transparent → Solid on Scroll"
            description="Startet transparent, wird beim Scrollen solid"
            checked={settings.features.transparent_on_top}
            onChange={() => handleFeatureToggle('transparent_on_top')}
          />
          <CheckboxCard
            title="Search Bar"
            description="Integriertes Suchfeld im Menü"
            checked={settings.features.search_bar}
            onChange={() => handleFeatureToggle('search_bar')}
          />
          <CheckboxCard
            title="CTA Button"
            description="Hervorgehobener Call-to-Action Button"
            checked={settings.features.cta_button}
            onChange={() => handleFeatureToggle('cta_button')}
          />
          <CheckboxCard
            title="Social Icons"
            description="Social Media Links/Icons anzeigen"
            checked={settings.features.social_icons}
            onChange={() => handleFeatureToggle('social_icons')}
          />
        </div>
      </Section>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPicker
          onSelect={handleLogoSelect}
          onClose={() => setShowMediaPicker(false)}
          accept="image"
          title="Logo auswählen"
        />
      )}
    </div>
  );
};

// Helper Components
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  return (
    <div className="bg-dark-panel border border-dark-border rounded-lg p-6">
      <h3 className="text-sm font-bold text-light-text uppercase tracking-wide mb-4 flex items-center gap-2">
        <div className="w-1 h-4 bg-brand-primary rounded"></div>
        {title}
      </h3>
      {children}
    </div>
  );
};

const OptionCard: React.FC<{
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}> = ({ title, description, selected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all
        ${
          selected
            ? 'border-brand-primary bg-brand-primary/10'
            : 'border-dark-border bg-dark-surface hover:border-dark-border/60'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
          ${selected ? 'border-brand-primary bg-brand-primary' : 'border-dark-border'}
        `}
        >
          {selected && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-light-text mb-1">{title}</div>
          <div className="text-xs text-light-muted leading-relaxed">{description}</div>
        </div>
      </div>
    </div>
  );
};

const CheckboxCard: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}> = ({ title, description, checked, onChange }) => {
  return (
    <div
      onClick={onChange}
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-all
        ${
          checked
            ? 'border-brand-primary bg-brand-primary/10'
            : 'border-dark-border bg-dark-surface hover:border-dark-border/60'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
          ${checked ? 'border-brand-primary bg-brand-primary' : 'border-dark-border'}
        `}
        >
          {checked && <FiCheck className="text-white" size={14} />}
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-light-text mb-1">{title}</div>
          <div className="text-xs text-light-muted leading-relaxed">{description}</div>
        </div>
      </div>
    </div>
  );
};

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  // Normalize color value for color input (only accepts #rrggbb format)
  const normalizeColorForInput = (color: string): string => {
    if (!color) return '#000000';

    // If it's already a valid 6-digit hex color, return it
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) return color;

    // If it's a 3-digit hex, expand it
    if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
      const [, r, g, b] = color.match(/#(.)(.)(.)/)!;
      return `#${r}${r}${g}${g}${b}${b}`;
    }

    // If it's rgba or other format, extract RGB or use default
    if (color.startsWith('rgba') || color.startsWith('rgb')) {
      // For now, just return a default - proper parsing would be complex
      return '#000000';
    }

    // Default fallback
    return '#000000';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-light-text mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={normalizeColorForInput(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg border-2 border-dark-border cursor-pointer bg-dark-surface"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text font-mono text-sm focus:outline-none focus:border-brand-primary"
        />
      </div>
    </div>
  );
};
