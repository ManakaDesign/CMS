// ============================================
// Core Types
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: number;
  title: string;
  slug: string;
  content: any;
  template_id?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  status: 'draft' | 'published';
  published_at?: string;
  user_id: number;
  order: number;
  show_in_menu: boolean;
  parent_id?: number;
  created_at: string;
  updated_at: string;

  // Relationships
  user?: User;
  template?: Template;
  elements?: Element[];
  parent?: Page;
  children?: Page[];
}

export interface Element {
  id: number;
  page_id: number;
  type: ElementType;
  settings: Record<string, any>;
  styles: ElementStyles;
  parent_id?: number;
  order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;

  // Relationships
  children?: Element[];
}

export type ElementType =
  | 'section'
  | 'row'
  | 'column'
  | 'text'
  | 'heading'
  | 'image'
  | 'button'
  | 'spacer'
  | 'divider'
  | 'video'
  | 'code'
  | 'icon';

export interface ElementStyles {
  desktop?: CSSProperties;
  tablet?: CSSProperties;
  mobile?: CSSProperties;
}

export interface CSSProperties {
  // Layout
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  gap?: string;

  // Spacing
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;

  // Size
  width?: string;
  height?: string;
  minWidth?: string;
  maxWidth?: string;
  minHeight?: string;
  maxHeight?: string;

  // Typography
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  textAlign?: string;
  color?: string;
  fontFamily?: string;

  // Background
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;

  // Border
  border?: string;
  borderRadius?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;

  // Effects
  boxShadow?: string;
  opacity?: string;

  // Position
  position?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  zIndex?: string;

  // Other
  overflow?: string;
  cursor?: string;
  transition?: string;
  transform?: string;
}

export interface Template {
  id: number;
  name: string;
  slug: string;
  type: 'page' | 'header' | 'footer' | 'global';
  structure?: any;
  description?: string;
  thumbnail?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: number;
  filename: string;
  original_filename: string;
  path: string;
  webp_path?: string;
  thumbnail_path?: string;
  medium_path?: string;
  disk: string;
  mime_type: string;
  size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  is_svg_colorable?: boolean;
  metadata?: Record<string, any>;
  user_id: number;
  folder_id?: number;
  created_at: string;
  updated_at: string;

  // Computed
  url?: string;
  webp_url?: string;
  thumbnail_url?: string;
  medium_url?: string;
  human_size?: string;
  is_image?: boolean;
  is_video?: boolean;
  is_svg?: boolean;
  dimensions?: string;

  // Relations
  folder?: MediaFolder;
  user?: {
    id: number;
    name: string;
  };
}

export interface MediaFolder {
  id: number;
  name: string;
  parent_id?: number;
  user_id: number;
  order: number;
  created_at: string;
  updated_at: string;

  // Computed
  path?: string;
  child_ids?: number[];

  // Relations
  parent?: MediaFolder;
  children?: MediaFolder[];
  media?: Media[];
  media_count?: number;
}

export interface Menu {
  id: number;
  name: string;
  slug: string;
  location?: string;
  type: MenuLayoutType;
  design_settings: MenuDesignSettings;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;

  // Relations
  items?: MenuItemNav[];
}

export interface MenuItemNav {
  id: number;
  menu_id: number;
  parent_id?: number;
  type: 'page' | 'url' | 'group';
  label: string;
  url?: string;
  page_id?: number;
  open_in_new_tab: boolean;
  is_group: boolean;
  columns?: number;
  icon?: string;
  icon_type?: 'react' | 'svg';
  icon_svg_url?: string;
  custom_styles?: Record<string, any>;
  visibility_desktop: boolean;
  visibility_mobile: boolean;
  order: number;
  created_at: string;
  updated_at: string;

  // Relations
  menu?: Menu;
  parent?: MenuItemNav;
  children?: MenuItemNav[];
  page?: Page;
}

export type MenuLayoutType =
  | 'horizontal'
  | 'centered'
  | 'split'
  | 'vertical'
  | 'fullscreen';

export type SubmenuStyle =
  | 'dropdown'
  | 'mega'
  | 'fullscreen'
  | 'sidebar';

export type MobileMenuStyle =
  | 'burger-sidebar'
  | 'burger-fullscreen'
  | 'bottom-nav'
  | 'desktop';

export interface MenuDesignSettings {
  // Layout
  layout?: MenuLayoutType;
  submenuStyle?: SubmenuStyle;
  mobileStyle?: MobileMenuStyle;

  // Colors
  backgroundColor?: string;
  linkColor?: string;
  linkHoverColor?: string;
  activeTextColor?: string;
  activeBackgroundColor?: string;

  // Logo
  logoUrl?: string;
  logoAlt?: string;
  logoWidth?: number;
  logoHeight?: number;

  // Features
  stickyHeader?: boolean;
  transparentToSolid?: boolean;
  showSearchBar?: boolean;
  showCtaButton?: boolean;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  showSocialIcons?: boolean;
  socialLinks?: {
    platform: string;
    url: string;
  }[];

  // Custom styles
  customCss?: string;
}

export interface CreateMenuRequest {
  name: string;
  slug?: string;
  location?: string;
  type?: MenuLayoutType;
  design_settings?: MenuDesignSettings;
  is_active?: boolean;
  order?: number;
}

export interface UpdateMenuRequest extends Partial<CreateMenuRequest> {}

export interface CreateMenuItemRequest {
  menu_id: number;
  parent_id?: number;
  type: 'page' | 'url' | 'group';
  label: string;
  url?: string;
  page_id?: number;
  open_in_new_tab?: boolean;
  is_group?: boolean;
  columns?: number;
  icon?: string;
  icon_type?: 'react' | 'svg';
  icon_svg_url?: string;
  custom_styles?: Record<string, any>;
  visibility_desktop?: boolean;
  visibility_mobile?: boolean;
  order?: number;
}

export interface UpdateMenuItemRequest extends Partial<Omit<CreateMenuItemRequest, 'menu_id'>> {}

export interface ReorderMenuItemsRequest {
  items: Array<{
    id: number;
    order: number;
    parent_id?: number;
  }>;
}

// ============================================
// Builder Types
// ============================================

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export interface BuilderState {
  // Current page
  page: Page | null;
  elements: Element[];

  // UI State
  selectedElementId: number | null;
  hoveredElementId: number | null;
  activeBreakpoint: Breakpoint;
  isPreviewMode: boolean;
  isDragging: boolean;

  // History
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
}

export interface HistoryState {
  elements: Element[];
  timestamp: number;
}

export interface ElementDefinition {
  type: ElementType;
  label: string;
  icon: string;
  category: 'layout' | 'content' | 'media' | 'form';
  defaultSettings: Record<string, any>;
  defaultStyles: ElementStyles;
  canHaveChildren: boolean;
  allowedParents?: ElementType[];
  allowedChildren?: ElementType[];
}

// ============================================
// API Types
// ============================================

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface PageListParams {
  status?: 'draft' | 'published';
  search?: string;
  parent_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreatePageRequest {
  title: string;
  slug?: string;
  content?: any;
  template_id?: number;
  meta_title?: string;
  meta_description?: string;
  status?: 'draft' | 'published';
  parent_id?: number;
  show_in_menu?: boolean;
}

export interface UpdatePageRequest extends Partial<CreatePageRequest> {}

export interface CreateElementRequest {
  page_id: number;
  type: ElementType;
  settings?: Record<string, any>;
  styles?: ElementStyles;
  parent_id?: number;
  order?: number;
  is_visible?: boolean;
}

export interface UpdateElementRequest extends Partial<Omit<CreateElementRequest, 'page_id'>> {}

export interface ReorderElementsRequest {
  elements: Array<{
    id: number;
    order: number;
    parent_id?: number;
  }>;
}

export interface UploadMediaRequest {
  file: File;
  alt_text?: string;
  caption?: string;
}

// ============================================
// UI Component Types
// ============================================

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick?: () => void;
  shortcut?: string;
  divider?: boolean;
  submenu?: MenuItem[];
}

export interface PanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
