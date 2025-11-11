import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Element, Page, Breakpoint, HistoryState } from '../types';

interface BreakpointWidths {
  desktop: number;
  tablet: number;
  mobile: number;
}

interface BuilderStore {
  // Current page
  page: Page | null;
  elements: Element[];
  customCSS: string;

  // UI State
  selectedElementId: number | null;
  selectedElementIds: number[]; // Multi-select support
  selectedColumnIndex: number | null;
  hoveredElementId: number | null;
  activeBreakpoint: Breakpoint;
  breakpointWidths: BreakpointWidths;
  isPreviewMode: boolean;
  isDragging: boolean;
  isSaving: boolean;

  // History (Undo/Redo)
  history: HistoryState[];
  historyIndex: number;

  // Actions - Page
  setPage: (page: Page | null) => void;
  setElements: (elements: Element[]) => void;
  setCustomCSS: (css: string) => void;

  // Actions - Element Selection
  selectElement: (elementId: number | null) => void;
  selectColumn: (columnIndex: number | null) => void;
  hoverElement: (elementId: number | null) => void;
  toggleElementSelection: (elementId: number) => void;
  clearMultiSelection: () => void;

  // Actions - Element CRUD
  addElement: (element: Element) => void;
  updateElement: (elementId: number, updates: Partial<Element>) => void;
  updateMultipleElements: (elementIds: number[], updates: Partial<Element>) => void;
  deleteElement: (elementId: number) => void;
  moveElement: (elementId: number, newParentId: number | null, newOrder: number) => void;
  duplicateElement: (elementId: number) => void;

  // Actions - UI
  setActiveBreakpoint: (breakpoint: Breakpoint) => void;
  setBreakpointWidths: (widths: BreakpointWidths) => void;
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
      customCSS: '',
      selectedElementId: null,
      selectedElementIds: [],
      selectedColumnIndex: null,
      hoveredElementId: null,
      activeBreakpoint: 'desktop',
      breakpointWidths: {
        desktop: 1920,
        tablet: 768,
        mobile: 480,
      },
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

      setCustomCSS: (customCSS) => set({ customCSS }),

      // Selection Actions
      selectElement: (elementId) => set({ selectedElementId: elementId, selectedElementIds: [], selectedColumnIndex: null }),

      selectColumn: (columnIndex) => set({ selectedColumnIndex: columnIndex }),

      hoverElement: (elementId) => set({ hoveredElementId: elementId }),

      toggleElementSelection: (elementId) => {
        const { elements, selectedElementIds } = get();
        const element = elements.find((el) => el.id === elementId);

        if (!element) return;

        // If this is the first element being selected in multi-select mode
        if (selectedElementIds.length === 0) {
          set({
            selectedElementIds: [elementId],
            selectedElementId: null,
            selectedColumnIndex: null,
          });
          return;
        }

        // Check if all currently selected elements are of the same type
        const selectedElements = elements.filter((el) => selectedElementIds.includes(el.id));
        const firstType = selectedElements[0]?.type;

        // Only allow selecting elements of the same type
        if (element.type !== firstType) {
          return; // Ignore selection if type doesn't match
        }

        // Toggle selection
        if (selectedElementIds.includes(elementId)) {
          // Remove from selection
          const newSelection = selectedElementIds.filter((id) => id !== elementId);
          set({
            selectedElementIds: newSelection,
            // If only one element left, convert back to single selection
            selectedElementId: newSelection.length === 1 ? newSelection[0] : null,
          });
        } else {
          // Add to selection
          set({
            selectedElementIds: [...selectedElementIds, elementId],
            selectedElementId: null,
          });
        }
      },

      clearMultiSelection: () => set({ selectedElementIds: [] }),

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

      updateMultipleElements: (elementIds, updates) => {
        const { elements } = get();
        const updatedElements = elements.map((el) =>
          elementIds.includes(el.id) ? { ...el, ...updates } : el
        );
        set({ elements: updatedElements });
        get().addToHistory();
      },

      deleteElement: (elementId) => {
        const { elements, selectedElementId, selectedElementIds } = get();

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

        // Clean up selectedElementIds - remove any deleted element IDs
        const updatedSelectedElementIds = selectedElementIds.filter(id => !toDelete.has(id));

        set({
          elements: updatedElements,
          selectedElementId: selectedElementId === elementId ? null : selectedElementId,
          selectedElementIds: updatedSelectedElementIds,
        });

        get().addToHistory();
      },

      moveElement: (elementId, newParentId, newOrder) => {
        const { elements } = get();

        // Find the element being moved
        const movedElement = elements.find((el) => el.id === elementId);
        if (!movedElement) return;

        const oldParentId = movedElement.parent_id ?? null;
        const oldOrder = movedElement.order;
        const normalizedNewParentId = newParentId ?? null;

        // Update element's parent and order
        const updatedElements = elements.map((el) => {
          // Update the moved element itself
          if (el.id === elementId) {
            return { ...el, parent_id: newParentId ?? undefined, order: newOrder };
          }

          // Moving within the same parent
          if (oldParentId === normalizedNewParentId && el.parent_id === oldParentId) {
            // Moving down (from lower order to higher order)
            if (newOrder > oldOrder && el.order > oldOrder && el.order <= newOrder) {
              return { ...el, order: el.order - 1 };
            }
            // Moving up (from higher order to lower order)
            if (newOrder < oldOrder && el.order >= newOrder && el.order < oldOrder) {
              return { ...el, order: el.order + 1 };
            }
          }
          // Moving to a different parent
          else {
            // Decrement order in old parent for elements after the moved element
            if (el.parent_id === oldParentId && el.order > oldOrder) {
              return { ...el, order: el.order - 1 };
            }
            // Increment order in new parent for elements at or after insertion point
            if (el.parent_id === normalizedNewParentId && el.order >= newOrder) {
              return { ...el, order: el.order + 1 };
            }
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

        // Generate unique IDs for all duplicated elements
        let nextId = Math.max(...elements.map((el) => el.id), 0) + 1;
        const idMap = new Map<number, number>(); // Map old IDs to new IDs

        // Duplicate children recursively with unique IDs
        const duplicateWithChildren = (originalElement: Element, newParentId?: number): Element[] => {
          const newId = nextId++;
          idMap.set(originalElement.id, newId);

          const duplicatedElement: Element = {
            ...originalElement,
            id: newId,
            parent_id: newParentId,
            order: originalElement.id === elementId ? originalElement.order + 1 : originalElement.order,
          };

          const result: Element[] = [duplicatedElement];

          // Find and duplicate all children
          const children = elements.filter((el) => el.parent_id === originalElement.id);
          children.forEach((child) => {
            result.push(...duplicateWithChildren(child, newId));
          });

          return result;
        };

        const allDuplicated = duplicateWithChildren(element, element.parent_id);

        set({ elements: [...elements, ...allDuplicated] });
        get().addToHistory();
        get().selectElement(allDuplicated[0].id);
      },

      // UI Actions
      setActiveBreakpoint: (breakpoint) => set({ activeBreakpoint: breakpoint }),

      setBreakpointWidths: (widths) => set({ breakpointWidths: widths }),

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
          selectedElementIds: [],
          hoveredElementId: null,
          activeBreakpoint: 'desktop',
          breakpointWidths: {
            desktop: 1920,
            tablet: 768,
            mobile: 480,
          },
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
