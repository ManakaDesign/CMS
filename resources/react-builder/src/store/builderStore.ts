import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Element, Page, Breakpoint, HistoryState } from '../types';

interface BuilderStore {
  // Current page
  page: Page | null;
  elements: Element[];

  // UI State
  selectedElementId: number | null;
  hoveredElementId: number | null;
  activeBreakpoint: Breakpoint;
  isPreviewMode: boolean;
  isDragging: boolean;
  isSaving: boolean;

  // History (Undo/Redo)
  history: HistoryState[];
  historyIndex: number;

  // Actions - Page
  setPage: (page: Page | null) => void;
  setElements: (elements: Element[]) => void;

  // Actions - Element Selection
  selectElement: (elementId: number | null) => void;
  hoverElement: (elementId: number | null) => void;

  // Actions - Element CRUD
  addElement: (element: Element) => void;
  updateElement: (elementId: number, updates: Partial<Element>) => void;
  deleteElement: (elementId: number) => void;
  moveElement: (elementId: number, newParentId: number | null, newOrder: number) => void;
  duplicateElement: (elementId: number) => void;

  // Actions - UI
  setActiveBreakpoint: (breakpoint: Breakpoint) => void;
  togglePreviewMode: () => void;
  setIsDragging: (isDragging: boolean) => void;
  setIsSaving: (isSaving: boolean) => void;

  // Actions - History
  addToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Actions - Helpers
  getElementById: (elementId: number) => Element | undefined;
  getElementChildren: (elementId: number | null) => Element[];
  getElementPath: (elementId: number) => Element[];
  reset: () => void;
}

const MAX_HISTORY = 50;

export const useBuilderStore = create<BuilderStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      page: null,
      elements: [],
      selectedElementId: null,
      hoveredElementId: null,
      activeBreakpoint: 'desktop',
      isPreviewMode: false,
      isDragging: false,
      isSaving: false,
      history: [],
      historyIndex: -1,

      // Page Actions
      setPage: (page) => set({ page }),

      setElements: (elements) => {
        set({ elements });
        get().addToHistory();
      },

      // Selection Actions
      selectElement: (elementId) => set({ selectedElementId: elementId }),

      hoverElement: (elementId) => set({ hoveredElementId: elementId }),

      // Element CRUD Actions
      addElement: (element) => {
        const { elements } = get();
        set({ elements: [...elements, element] });
        get().addToHistory();
        get().selectElement(element.id);
      },

      updateElement: (elementId, updates) => {
        const { elements } = get();
        const updatedElements = elements.map((el) =>
          el.id === elementId ? { ...el, ...updates } : el
        );
        set({ elements: updatedElements });
        get().addToHistory();
      },

      deleteElement: (elementId) => {
        const { elements, selectedElementId } = get();

        // Get all descendants to delete
        const toDelete = new Set<number>();
        const addDescendants = (id: number) => {
          toDelete.add(id);
          elements
            .filter((el) => el.parent_id === id)
            .forEach((child) => addDescendants(child.id));
        };
        addDescendants(elementId);

        // Filter out deleted elements
        const updatedElements = elements.filter((el) => !toDelete.has(el.id));

        set({
          elements: updatedElements,
          selectedElementId: selectedElementId === elementId ? null : selectedElementId,
        });

        get().addToHistory();
      },

      moveElement: (elementId, newParentId, newOrder) => {
        const { elements } = get();

        // Update element's parent and order
        const updatedElements = elements.map((el) => {
          if (el.id === elementId) {
            return { ...el, parent_id: newParentId, order: newOrder };
          }
          // Adjust order of siblings
          if (el.parent_id === newParentId && el.order >= newOrder && el.id !== elementId) {
            return { ...el, order: el.order + 1 };
          }
          return el;
        });

        set({ elements: updatedElements });
        get().addToHistory();
      },

      duplicateElement: (elementId) => {
        const { elements } = get();
        const element = elements.find((el) => el.id === elementId);

        if (!element) return;

        // Generate new ID (temporary, will be replaced by server)
        const newId = Math.max(...elements.map((el) => el.id), 0) + 1;

        const duplicated: Element = {
          ...element,
          id: newId,
          order: element.order + 1,
        };

        // Duplicate children recursively
        const duplicateChildren = (parentId: number, newParentId: number): Element[] => {
          const children = elements.filter((el) => el.parent_id === parentId);
          const duplicatedChildren: Element[] = [];

          children.forEach((child) => {
            const childNewId = Math.max(...elements.map((el) => el.id), ...duplicatedChildren.map((el) => el.id), 0) + 1;
            const duplicatedChild: Element = {
              ...child,
              id: childNewId,
              parent_id: newParentId,
            };
            duplicatedChildren.push(duplicatedChild);
            duplicatedChildren.push(...duplicateChildren(child.id, childNewId));
          });

          return duplicatedChildren;
        };

        const allDuplicated = [duplicated, ...duplicateChildren(elementId, newId)];

        set({ elements: [...elements, ...allDuplicated] });
        get().addToHistory();
        get().selectElement(newId);
      },

      // UI Actions
      setActiveBreakpoint: (breakpoint) => set({ activeBreakpoint: breakpoint }),

      togglePreviewMode: () => set((state) => ({ isPreviewMode: !state.isPreviewMode })),

      setIsDragging: (isDragging) => set({ isDragging }),

      setIsSaving: (isSaving) => set({ isSaving }),

      // History Actions
      addToHistory: () => {
        const { elements, history, historyIndex } = get();

        // Remove future history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1);

        // Add current state
        newHistory.push({
          elements: JSON.parse(JSON.stringify(elements)),
          timestamp: Date.now(),
        });

        // Limit history size
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
        }

        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undo: () => {
        const { history, historyIndex } = get();

        if (historyIndex > 0) {
          const previousState = history[historyIndex - 1];
          set({
            elements: JSON.parse(JSON.stringify(previousState.elements)),
            historyIndex: historyIndex - 1,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();

        if (historyIndex < history.length - 1) {
          const nextState = history[historyIndex + 1];
          set({
            elements: JSON.parse(JSON.stringify(nextState.elements)),
            historyIndex: historyIndex + 1,
          });
        }
      },

      canUndo: () => {
        const { historyIndex } = get();
        return historyIndex > 0;
      },

      canRedo: () => {
        const { history, historyIndex } = get();
        return historyIndex < history.length - 1;
      },

      // Helper Actions
      getElementById: (elementId) => {
        const { elements } = get();
        return elements.find((el) => el.id === elementId);
      },

      getElementChildren: (elementId) => {
        const { elements } = get();
        return elements
          .filter((el) => el.parent_id === elementId)
          .sort((a, b) => a.order - b.order);
      },

      getElementPath: (elementId) => {
        const { elements } = get();
        const path: Element[] = [];
        let currentId: number | undefined = elementId;

        while (currentId) {
          const element = elements.find((el) => el.id === currentId);
          if (!element) break;
          path.unshift(element);
          currentId = element.parent_id;
        }

        return path;
      },

      reset: () =>
        set({
          page: null,
          elements: [],
          selectedElementId: null,
          hoveredElementId: null,
          activeBreakpoint: 'desktop',
          isPreviewMode: false,
          isDragging: false,
          isSaving: false,
          history: [],
          historyIndex: -1,
        }),
    }),
    { name: 'BuilderStore' }
  )
);
