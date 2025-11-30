import React, { useState } from 'react';
import type {
  MenuNav,
  MenuDesignSettings,
  MenuLayoutType,
  SubmenuStyle,
  MobileView,
  Media,
  CTAButtonConfig,
  SocialIconsConfig,
  Page,
} from '../../types';
import { FiCheck, FiImage, FiTrash2, FiChevronRight } from 'react-icons/fi';
import { HexColorPicker } from 'react-colorful';
import MediaPicker from '../admin/media/MediaPicker';
import api from '../../services/api';
import { useBuilderStore } from '../../store/builderStore';
import { GlobalColorSwatches } from '../Settings/GlobalColorSwatches';

interface MenuDesignTabProps {
  menu: MenuNav;
  onUpdate: (settings: Partial<MenuDesignSettings>) => void;
}

export const MenuDesignTab: React.FC<MenuDesignTabProps> = ({ menu, onUpdate }) => {
  const settings = menu.design_settings;
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showCTAModal, setShowCTAModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);

  // Load pages for CTA button page selector
  React.useEffect(() => {
    const loadPages = async () => {
      try {
        const response = await api.get('/pages');
        setPages(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (error) {
        console.error('Failed to load pages:', error);
      }
    };
    loadPages();
  }, []);

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

  const handleCTAConfigUpdate = (config: CTAButtonConfig) => {
    onUpdate({
      cta_button_config: config,
    });
  };

  const handleSocialConfigUpdate = (config: SocialIconsConfig) => {
    onUpdate({
      social_icons_config: config,
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

        {/* Submenu Styling */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-light-text mb-3">Submenü Styling (Optional)</h4>
          <div className="space-y-4">
            <ColorInput
              label="Submenü Hintergrundfarbe"
              value={settings.submenu_config?.styling?.background || settings.colors.background}
              onChange={(value) => {
                onUpdate({
                  submenu_config: {
                    ...settings.submenu_config,
                    styling: {
                      ...settings.submenu_config?.styling,
                      background: value,
                    },
                  },
                });
              }}
            />
            <ColorInput
              label="Submenü Textfarbe"
              value={settings.submenu_config?.styling?.text_color || settings.colors.link_color}
              onChange={(value) => {
                onUpdate({
                  submenu_config: {
                    ...settings.submenu_config,
                    styling: {
                      ...settings.submenu_config?.styling,
                      text_color: value,
                    },
                  },
                });
              }}
            />
            <div className="grid grid-cols-2 gap-4">
              <ColorInput
                label="Hover Hintergrund"
                value={settings.submenu_config?.styling?.hover_background || ''}
                onChange={(value) => {
                  onUpdate({
                    submenu_config: {
                      ...settings.submenu_config,
                      styling: {
                        ...settings.submenu_config?.styling,
                        hover_background: value,
                      },
                    },
                  });
                }}
              />
              <ColorInput
                label="Hover Text"
                value={settings.submenu_config?.styling?.hover_text || settings.colors.link_hover}
                onChange={(value) => {
                  onUpdate({
                    submenu_config: {
                      ...settings.submenu_config,
                      styling: {
                        ...settings.submenu_config?.styling,
                        hover_text: value,
                      },
                    },
                  });
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">Padding</label>
                <input
                  type="text"
                  value={settings.submenu_config?.styling?.padding || '8px 12px'}
                  onChange={(e) => {
                    onUpdate({
                      submenu_config: {
                        ...settings.submenu_config,
                        styling: {
                          ...settings.submenu_config?.styling,
                          padding: e.target.value,
                        },
                      },
                    });
                  }}
                  placeholder="8px 12px"
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">Border Radius</label>
                <input
                  type="text"
                  value={settings.submenu_config?.styling?.border_radius || '4px'}
                  onChange={(e) => {
                    onUpdate({
                      submenu_config: {
                        ...settings.submenu_config,
                        styling: {
                          ...settings.submenu_config?.styling,
                          border_radius: e.target.value,
                        },
                      },
                    });
                  }}
                  placeholder="4px"
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
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
          {settings.logo?.media_id && menu.logo_url ? (
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
                  src={menu.logo_url}
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
                <DebouncedInput
                  value={settings.logo.width}
                  onChange={(value) => handleLogoSizeChange('width', value)}
                  placeholder="auto, 200px"
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Höhe
                </label>
                <DebouncedInput
                  value={settings.logo.height}
                  onChange={(value) => handleLogoSizeChange('height', value)}
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
          {settings.features.transparent_on_top && (
            <ColorInput
              label="Transparente Hintergrundfarbe (bei Scroll-Top)"
              value={settings.colors.transparent_background || '#1a1a1a80'}
              onChange={(value) => handleColorChange('transparent_background', value)}
            />
          )}
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
          <CheckboxCardWithConfig
            title="CTA Button"
            description="Hervorgehobener Call-to-Action Button"
            checked={settings.features.cta_button}
            onChange={() => handleFeatureToggle('cta_button')}
            onConfigureClick={() => setShowCTAModal(true)}
            hasConfig={true}
          />
          <CheckboxCardWithConfig
            title="Social Icons"
            description="Social Media Links/Icons anzeigen"
            checked={settings.features.social_icons}
            onChange={() => handleFeatureToggle('social_icons')}
            onConfigureClick={() => setShowSocialModal(true)}
            hasConfig={true}
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

      {/* CTA Button Configuration Modal */}
      {showCTAModal && (
        <CTAButtonConfigModal
          config={settings.cta_button_config || {
            text: 'Get Started',
            action_type: 'none',
            position: 'right_of_nav',
            styling: {
              bg_color: '#3b82f6',
              text_color: '#ffffff',
              border_radius: '6px',
              padding: '10px 24px',
              hover_bg_color: '#2563eb',
              hover_text_color: '#ffffff',
              border_width: '0px',
              border_color: '#3b82f6',
            },
          }}
          pages={pages}
          onSave={handleCTAConfigUpdate}
          onClose={() => setShowCTAModal(false)}
        />
      )}

      {/* Social Icons Configuration Modal */}
      {showSocialModal && (
        <SocialIconsConfigModal
          config={settings.social_icons_config || {
            icons: [],
            position: 'right_of_nav',
            styling: {
              size: '20px',
              color: '#64748b',
              hover_color: '#3b82f6',
              spacing: '16px',
            },
          }}
          onSave={handleSocialConfigUpdate}
          onClose={() => setShowSocialModal(false)}
        />
      )}
    </div>
  );
};

// Helper Components
const DebouncedInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className }) => {
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  // Update local value when prop changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  const handleBlur = () => {
    // Clear timeout and immediately update
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onChange(localValue);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
};

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

const CheckboxCardWithConfig: React.FC<{
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  onConfigureClick: () => void;
  hasConfig: boolean;
}> = ({ title, description, checked, onChange, onConfigureClick, hasConfig }) => {
  return (
    <div
      className={`
        p-4 rounded-lg border-2 transition-all
        ${
          checked
            ? 'border-brand-primary bg-brand-primary/10'
            : 'border-dark-border bg-dark-surface hover:border-dark-border/60'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          onClick={onChange}
          className={`
          w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer
          ${checked ? 'border-brand-primary bg-brand-primary' : 'border-dark-border'}
        `}
        >
          {checked && <FiCheck className="text-white" size={14} />}
        </div>
        <div className="flex-1 cursor-pointer" onClick={onChange}>
          <div className="text-sm font-semibold text-light-text mb-1">{title}</div>
          <div className="text-xs text-light-muted leading-relaxed">{description}</div>
        </div>
        {hasConfig && checked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfigureClick();
            }}
            className="p-2 pl-3 ml-2 border-l border-dark-border hover:bg-brand-primary/20 transition-colors flex-shrink-0"
            title="Konfigurieren"
          >
            <FiChevronRight className="text-brand-primary" size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

const ColorInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  // Update local value when prop changes (but only if picker is closed)
  React.useEffect(() => {
    if (!showPicker) {
      setLocalValue(value);
    }
  }, [value, showPicker]);

  // Normalize to valid hex
  const normalizeColor = (color: string): string => {
    if (!color) return '#000000';
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) return color;
    if (/^#[0-9A-Fa-f]{3}$/.test(color)) {
      const [, r, g, b] = color.match(/#(.)(.)(.)/)!;
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return '#000000';
  };

  const handlePickerChange = (newColor: string) => {
    setLocalValue(newColor);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClosePicker = () => {
    setShowPicker(false);
    onChange(localValue);
  };

  const handleTextBlur = () => {
    onChange(localValue);
  };

  const { globalColors } = useBuilderStore();

  return (
    <div>
      <label className="block text-sm font-medium text-light-text mb-2">{label}</label>
      <div className="flex items-center gap-3 relative">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="w-12 h-12 rounded-lg border-2 border-dark-border cursor-pointer"
            style={{ backgroundColor: normalizeColor(localValue) }}
          />
          {showPicker && (
            <div className="absolute top-14 left-0 z-50">
              <div
                className="fixed inset-0"
                onClick={handleClosePicker}
              />
              <div className="relative bg-dark-surface border border-dark-border rounded-lg p-3 shadow-xl">
                <HexColorPicker
                  color={normalizeColor(localValue)}
                  onChange={handlePickerChange}
                />
                <input
                  type="text"
                  value={localValue}
                  onChange={handleTextChange}
                  onBlur={handleTextBlur}
                  className="w-full mt-2 px-2 py-1 bg-dark-bg border border-dark-border rounded text-xs text-light-text font-mono"
                  placeholder="#000000"
                />
                {globalColors.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-dark-border">
                    <div className="text-xs text-light-muted mb-2">Globale Farben</div>
                    <div className="flex flex-wrap gap-1.5">
                      {globalColors.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => {
                            setLocalValue(color.value);
                            onChange(color.value);
                          }}
                          className="w-7 h-7 rounded border-2 border-dark-border hover:border-brand-primary transition-all hover:scale-110"
                          style={{ backgroundColor: color.value }}
                          title={`${color.name} (${color.value})`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <input
          type="text"
          value={localValue}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          placeholder="#000000"
          className="flex-1 px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text font-mono text-sm focus:outline-none focus:border-brand-primary"
        />
      </div>
    </div>
  );
};

// CTA Button Configuration Modal
const CTAButtonConfigModal: React.FC<{
  config: CTAButtonConfig;
  pages: Page[];
  onSave: (config: CTAButtonConfig) => void;
  onClose: () => void;
}> = ({ config, pages, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState<CTAButtonConfig>(config);

  const updateConfig = (updates: Partial<CTAButtonConfig>) => {
    setLocalConfig((prev) => ({ ...prev, ...updates }));
  };

  const updateStyling = (key: keyof CTAButtonConfig['styling'], value: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      styling: { ...prev.styling, [key]: value },
    }));
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-dark-panel border border-dark-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-panel z-10">
          <h3 className="text-lg font-bold text-light-text">CTA Button konfigurieren</h3>
          <button
            onClick={onClose}
            className="text-light-muted hover:text-light-text transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Button Text */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Button Text
            </label>
            <input
              type="text"
              value={localConfig.text}
              onChange={(e) => updateConfig({ text: e.target.value })}
              placeholder="z.B. Get Started"
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Aktion
            </label>
            <select
              value={localConfig.action_type}
              onChange={(e) => updateConfig({ action_type: e.target.value as 'page' | 'url' | 'none' })}
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
            >
              <option value="none">Keine Aktion</option>
              <option value="page">Seite</option>
              <option value="url">URL</option>
            </select>
          </div>

          {/* Page Selector */}
          {localConfig.action_type === 'page' && (
            <div>
              <label className="block text-sm font-medium text-light-text mb-2">
                Seite auswählen
              </label>
              <select
                value={localConfig.page_id || ''}
                onChange={(e) => updateConfig({ page_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
              >
                <option value="">-- Seite wählen --</option>
                {pages.filter((p) => p.status === 'published').map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* URL Input */}
          {localConfig.action_type === 'url' && (
            <div>
              <label className="block text-sm font-medium text-light-text mb-2">
                URL
              </label>
              <input
                type="url"
                value={localConfig.url || ''}
                onChange={(e) => updateConfig({ url: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
              />
            </div>
          )}

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Position
            </label>
            <select
              value={localConfig.position}
              onChange={(e) => updateConfig({ position: e.target.value as any })}
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
            >
              <option value="right_of_nav">Rechts neben Navigation</option>
              <option value="after_logo">Nach dem Logo</option>
              <option value="far_right">Ganz rechts</option>
            </select>
          </div>

          {/* Styling */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-light-text border-b border-dark-border pb-2">
              Styling
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <ColorInput
                label="Hintergrundfarbe"
                value={localConfig.styling.bg_color}
                onChange={(value) => updateStyling('bg_color', value)}
              />
              <ColorInput
                label="Textfarbe"
                value={localConfig.styling.text_color}
                onChange={(value) => updateStyling('text_color', value)}
              />
              <ColorInput
                label="Hover Hintergrund"
                value={localConfig.styling.hover_bg_color}
                onChange={(value) => updateStyling('hover_bg_color', value)}
              />
              <ColorInput
                label="Hover Textfarbe"
                value={localConfig.styling.hover_text_color}
                onChange={(value) => updateStyling('hover_text_color', value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Border Radius
                </label>
                <input
                  type="text"
                  value={localConfig.styling.border_radius}
                  onChange={(e) => updateStyling('border_radius', e.target.value)}
                  placeholder="6px"
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Padding
                </label>
                <input
                  type="text"
                  value={localConfig.styling.padding}
                  onChange={(e) => updateStyling('padding', e.target.value)}
                  placeholder="10px 24px"
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Border Width
                </label>
                <input
                  type="text"
                  value={localConfig.styling.border_width}
                  onChange={(e) => updateStyling('border_width', e.target.value)}
                  placeholder="0px"
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
                />
              </div>
              <ColorInput
                label="Border Color"
                value={localConfig.styling.border_color}
                onChange={(value) => updateStyling('border_color', value)}
              />
            </div>
          </div>

          {/* Preview */}
          <div>
            <h4 className="text-sm font-semibold text-light-text mb-3">Vorschau</h4>
            <div className="bg-dark-surface p-4 rounded-lg flex items-center justify-center">
              <button
                style={{
                  backgroundColor: localConfig.styling.bg_color,
                  color: localConfig.styling.text_color,
                  borderRadius: localConfig.styling.border_radius,
                  padding: localConfig.styling.padding,
                  border: `${localConfig.styling.border_width} solid ${localConfig.styling.border_color}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = localConfig.styling.hover_bg_color;
                  e.currentTarget.style.color = localConfig.styling.hover_text_color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = localConfig.styling.bg_color;
                  e.currentTarget.style.color = localConfig.styling.text_color;
                }}
              >
                {localConfig.text}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-dark-border flex items-center justify-end gap-3 sticky bottom-0 bg-dark-panel">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-surface text-light-text rounded-lg hover:bg-dark-surface/80 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

// Social Icons Configuration Modal
const SocialIconsConfigModal: React.FC<{
  config: SocialIconsConfig;
  onSave: (config: SocialIconsConfig) => void;
  onClose: () => void;
}> = ({ config, onSave, onClose }) => {
  const [localConfig, setLocalConfig] = useState<SocialIconsConfig>(config);

  const platforms: Array<{ id: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'github' | 'tiktok'; label: string }> = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'twitter', label: 'Twitter/X' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'github', label: 'GitHub' },
    { id: 'tiktok', label: 'TikTok' },
  ];

  const togglePlatform = (platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'github' | 'tiktok') => {
    setLocalConfig((prev) => {
      const exists = prev.icons.some((icon) => icon.platform === platform);
      if (exists) {
        return {
          ...prev,
          icons: prev.icons.filter((icon) => icon.platform !== platform),
        };
      } else {
        return {
          ...prev,
          icons: [...prev.icons, { platform, url: '' }],
        };
      }
    });
  };

  const updatePlatformUrl = (platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'github' | 'tiktok', url: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      icons: prev.icons.map((icon) =>
        icon.platform === platform ? { ...icon, url } : icon
      ),
    }));
  };

  const updateStyling = (key: keyof SocialIconsConfig['styling'], value: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      styling: { ...prev.styling, [key]: value },
    }));
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-dark-panel border border-dark-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-dark-border flex items-center justify-between sticky top-0 bg-dark-panel z-10">
          <h3 className="text-lg font-bold text-light-text">Social Icons konfigurieren</h3>
          <button
            onClick={onClose}
            className="text-light-muted hover:text-light-text transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Platform Selection */}
          <div>
            <h4 className="text-sm font-semibold text-light-text mb-3">Plattformen auswählen</h4>
            <div className="space-y-3">
              {platforms.map((platform) => {
                const isSelected = localConfig.icons.some((icon) => icon.platform === platform.id);
                const iconData = localConfig.icons.find((icon) => icon.platform === platform.id);

                return (
                  <div key={platform.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => togglePlatform(platform.id)}
                          className="w-4 h-4 rounded border-dark-border"
                        />
                        <span className="text-sm text-light-text">{platform.label}</span>
                      </label>
                    </div>
                    {isSelected && (
                      <input
                        type="url"
                        value={iconData?.url || ''}
                        onChange={(e) => updatePlatformUrl(platform.id, e.target.value)}
                        placeholder={`${platform.label} URL`}
                        className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text text-sm focus:outline-none focus:border-brand-primary ml-6"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-light-text mb-2">
              Position
            </label>
            <select
              value={localConfig.position}
              onChange={(e) => setLocalConfig((prev) => ({ ...prev, position: e.target.value as any }))}
              className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
            >
              <option value="right_of_nav">Rechts neben Navigation</option>
              <option value="after_cta">Nach CTA Button</option>
              <option value="separate_row">Separate Zeile</option>
            </select>
          </div>

          {/* Styling */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-light-text border-b border-dark-border pb-2">
              Styling
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Icon Größe
                </label>
                <input
                  type="text"
                  value={localConfig.styling.size}
                  onChange={(e) => updateStyling('size', e.target.value)}
                  placeholder="20px"
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-light-text mb-2">
                  Abstand
                </label>
                <input
                  type="text"
                  value={localConfig.styling.spacing}
                  onChange={(e) => updateStyling('spacing', e.target.value)}
                  placeholder="16px"
                  className="w-full px-3 py-2 bg-dark-surface border border-dark-border rounded-lg text-light-text focus:outline-none focus:border-brand-primary"
                />
              </div>
              <ColorInput
                label="Farbe"
                value={localConfig.styling.color}
                onChange={(value) => updateStyling('color', value)}
              />
              <ColorInput
                label="Hover Farbe"
                value={localConfig.styling.hover_color}
                onChange={(value) => updateStyling('hover_color', value)}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-dark-border flex items-center justify-end gap-3 sticky bottom-0 bg-dark-panel">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-surface text-light-text rounded-lg hover:bg-dark-surface/80 transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};
