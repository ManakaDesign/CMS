import apiClient from './client';
import type {
  Page,
  Element,
  Media,
  Template,
  User,
  LoginRequest,
  LoginResponse,
  CreatePageRequest,
  UpdatePageRequest,
  PageListParams,
  CreateElementRequest,
  UpdateElementRequest,
  ReorderElementsRequest,
  UploadMediaRequest,
  PaginatedResponse,
} from '../types';

// ============================================
// Auth API
// ============================================

export const authApi = {
  login: async (credentials: LoginRequest) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return data;
  },

  logout: async () => {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  register: async (userData: { name: string; email: string; password: string; password_confirmation: string }) => {
    const { data } = await apiClient.post<LoginResponse>('/auth/register', userData);
    return data;
  },
};

// ============================================
// Pages API
// ============================================

export const pagesApi = {
  list: async (params?: PageListParams) => {
    const { data } = await apiClient.get<PaginatedResponse<Page>>('/pages', { params });
    return data;
  },

  get: async (pageId: number) => {
    const { data } = await apiClient.get<Page>(`/pages/${pageId}`);
    return data;
  },

  create: async (pageData: CreatePageRequest) => {
    const { data } = await apiClient.post<{ page: Page; message: string }>('/pages', pageData);
    return data;
  },

  update: async (pageId: number, pageData: UpdatePageRequest) => {
    const { data } = await apiClient.put<{ page: Page; message: string }>(
      `/pages/${pageId}`,
      pageData
    );
    return data;
  },

  delete: async (pageId: number) => {
    const { data } = await apiClient.delete<{ message: string }>(`/pages/${pageId}`);
    return data;
  },

  publish: async (pageId: number) => {
    const { data } = await apiClient.post<{ page: Page; message: string }>(
      `/pages/${pageId}/publish`
    );
    return data;
  },

  unpublish: async (pageId: number) => {
    const { data } = await apiClient.post<{ page: Page; message: string }>(
      `/pages/${pageId}/unpublish`
    );
    return data;
  },

  duplicate: async (pageId: number) => {
    const { data} = await apiClient.post<{ page: Page; message: string }>(
      `/pages/${pageId}/duplicate`
    );
    return data;
  },
};

// ============================================
// Elements API
// ============================================

export const elementsApi = {
  list: async (pageId: number) => {
    const { data } = await apiClient.get<Element[]>(`/elements/pages/${pageId}`);
    return data;
  },

  get: async (elementId: number) => {
    const { data } = await apiClient.get<Element>(`/elements/${elementId}`);
    return data;
  },

  create: async (elementData: CreateElementRequest) => {
    const { data } = await apiClient.post<{ element: Element; message: string }>(
      '/elements',
      elementData
    );
    return data;
  },

  update: async (elementId: number, elementData: UpdateElementRequest) => {
    const { data } = await apiClient.put<{ element: Element; message: string }>(
      `/elements/${elementId}`,
      elementData
    );
    return data;
  },

  delete: async (elementId: number) => {
    const { data } = await apiClient.delete<{ message: string }>(`/elements/${elementId}`);
    return data;
  },

  duplicate: async (elementId: number) => {
    const { data } = await apiClient.post<{ element: Element; message: string }>(
      `/elements/${elementId}/duplicate`
    );
    return data;
  },

  reorder: async (reorderData: ReorderElementsRequest) => {
    const { data } = await apiClient.post<{ message: string }>('/elements/reorder', reorderData);
    return data;
  },
};

// ============================================
// Media API
// ============================================

export const mediaApi = {
  list: async (params?: { type?: string; search?: string; per_page?: number; page?: number }) => {
    const { data } = await apiClient.get<PaginatedResponse<Media>>('/media', { params });
    return data;
  },

  get: async (mediaId: number) => {
    const { data } = await apiClient.get<Media>(`/media/${mediaId}`);
    return data;
  },

  upload: async (file: File, altText?: string, caption?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('alt_text', altText);
    if (caption) formData.append('caption', caption);

    const { data } = await apiClient.post<{ media: Media; message: string }>('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  update: async (mediaId: number, updates: { alt_text?: string; caption?: string }) => {
    const { data } = await apiClient.put<{ media: Media; message: string }>(
      `/media/${mediaId}`,
      updates
    );
    return data;
  },

  delete: async (mediaId: number) => {
    const { data } = await apiClient.delete<{ message: string }>(`/media/${mediaId}`);
    return data;
  },
};

// ============================================
// Templates API
// ============================================

export const templatesApi = {
  list: async (params?: { type?: string; is_default?: boolean }) => {
    const { data } = await apiClient.get<Template[]>('/templates', { params });
    return data;
  },

  get: async (templateId: number) => {
    const { data } = await apiClient.get<Template>(`/templates/${templateId}`);
    return data;
  },

  create: async (templateData: Partial<Template>) => {
    const { data } = await apiClient.post<{ template: Template; message: string }>(
      '/templates',
      templateData
    );
    return data;
  },

  update: async (templateId: number, templateData: Partial<Template>) => {
    const { data } = await apiClient.put<{ template: Template; message: string }>(
      `/templates/${templateId}`,
      templateData
    );
    return data;
  },

  delete: async (templateId: number) => {
    const { data } = await apiClient.delete<{ message: string }>(`/templates/${templateId}`);
    return data;
  },
};
