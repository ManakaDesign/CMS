import type { Page, Element } from '../types';

const STORAGE_KEYS = {
  PAGES: 'builder_demo_pages',
  ELEMENTS: 'builder_demo_elements',
  CURRENT_PAGE_ID: 'builder_demo_current_page_id',
  CUSTOM_CSS: 'builder_demo_custom_css',
};

// Initialize with sample data if storage is empty
const initializeDemoData = () => {
  const existingPages = localStorage.getItem(STORAGE_KEYS.PAGES);

  if (!existingPages) {
    const samplePage: Page = {
      id: 1,
      title: 'Demo Page',
      slug: 'demo-page',
      content: null,
      status: 'draft',
      user_id: 1,
      order: 0,
      show_in_menu: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const sampleElements: Element[] = [
      {
        id: 1,
        page_id: 1,
        type: 'section',
        settings: { minHeight: '300px' },
        styles: {
          desktop: {
            backgroundColor: '#f9fafb',
            padding: '40px 20px',
          },
        },
        order: 0,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        page_id: 1,
        parent_id: 1,
        type: 'row',
        settings: { gap: '20px', columns: 2 },
        styles: {
          desktop: {},
        },
        order: 0,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        page_id: 1,
        parent_id: 2,
        type: 'heading',
        settings: {
          tag: 'h1',
          content: 'Welcome to the Builder Demo!',
          columnIndex: 0,
        },
        styles: {
          desktop: {
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#1f2937',
          },
        },
        order: 0,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 4,
        page_id: 1,
        parent_id: 2,
        type: 'text',
        settings: {
          content: 'This is a demo version running entirely in your browser with LocalStorage. Try dragging elements, editing text, and adjusting styles!',
          columnIndex: 0,
        },
        styles: {
          desktop: {
            fontSize: '16px',
            color: '#6b7280',
            marginTop: '10px',
          },
        },
        order: 1,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify([samplePage]));
    localStorage.setItem(STORAGE_KEYS.ELEMENTS, JSON.stringify(sampleElements));
    localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE_ID, '1');
  }
};

export const localStorageService = {
  // Initialize demo data on first load
  init: () => {
    initializeDemoData();
  },

  // Page operations
  getPage: (pageId: number): Page | null => {
    const pages: Page[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAGES) || '[]');
    return pages.find(p => p.id === pageId) || null;
  },

  getAllPages: (): Page[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAGES) || '[]');
  },

  savePage: (page: Page): void => {
    const pages: Page[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAGES) || '[]');
    const index = pages.findIndex(p => p.id === page.id);

    if (index >= 0) {
      pages[index] = { ...page, updated_at: new Date().toISOString() };
    } else {
      pages.push(page);
    }

    localStorage.setItem(STORAGE_KEYS.PAGES, JSON.stringify(pages));
  },

  // Element operations
  getElements: (pageId: number): Element[] => {
    const elements: Element[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ELEMENTS) || '[]');
    return elements.filter(el => el.page_id === pageId);
  },

  saveElements: (pageId: number, elements: Element[]): void => {
    const allElements: Element[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ELEMENTS) || '[]');

    // Remove existing elements for this page
    const otherElements = allElements.filter(el => el.page_id !== pageId);

    // Add updated elements
    const updatedElements = [...otherElements, ...elements];

    localStorage.setItem(STORAGE_KEYS.ELEMENTS, JSON.stringify(updatedElements));
  },

  // Current page
  getCurrentPageId: (): number => {
    return parseInt(localStorage.getItem(STORAGE_KEYS.CURRENT_PAGE_ID) || '1');
  },

  setCurrentPageId: (pageId: number): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PAGE_ID, pageId.toString());
  },

  // Custom CSS
  getCustomCSS: (pageId: number): string => {
    const cssData = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_CSS) || '{}');
    return cssData[pageId] || '';
  },

  saveCustomCSS: (pageId: number, css: string): void => {
    const cssData = JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_CSS) || '{}');
    cssData[pageId] = css;
    localStorage.setItem(STORAGE_KEYS.CUSTOM_CSS, JSON.stringify(cssData));
  },

  // Clear all data
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};
