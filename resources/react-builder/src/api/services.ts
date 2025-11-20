import apiClient from './client';
import type {
  Page,
  Element,
  Media,
  MediaFolder,
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
  list: async (params?: { type?: string; search?: string; folder_id?: number | null; per_page?: number; page?: number }) => {
    const { data } = await apiClient.get<PaginatedResponse<Media>>('/media', { params });
    return data;
  },

  get: async (mediaId: number) => {
    const { data } = await apiClient.get<Media>(`/media/${mediaId}`);
    return data;
  },

  upload: async (file: File, options?: { alt_text?: string; caption?: string; folder_id?: number; make_svg_colorable?: boolean }) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.alt_text) formData.append('alt_text', options.alt_text);
    if (options?.caption) formData.append('caption', options.caption);
    if (options?.folder_id) formData.append('folder_id', String(options.folder_id));
    if (options?.make_svg_colorable) formData.append('make_svg_colorable', '1');

    const { data } = await apiClient.post<{ media: Media; message: string }>('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  update: async (mediaId: number, updates: { alt_text?: string; caption?: string; folder_id?: number | null }) => {
    const { data } = await apiClient.put<{ media: Media; message: string }>(
      `/media/${mediaId}`,
      updates
    );
    return data;
  },

  delete: async (mediaId: number) => {
    const { data} = await apiClient.delete<{ message: string }>(`/media/${mediaId}`);
    return data;
  },

  bulkMove: async (mediaIds: number[], folderId: number | null) => {
    const { data } = await apiClient.post<{ message: string; count: number }>('/media/bulk/move', {
      media_ids: mediaIds,
      folder_id: folderId,
    });
    return data;
  },

  bulkDelete: async (mediaIds: number[]) => {
    const { data } = await apiClient.post<{ message: string; count: number }>('/media/bulk/delete', {
      media_ids: mediaIds,
    });
    return data;
  },
};

// ============================================
// Media Folders API
// ============================================

export const mediaFoldersApi = {
  list: async () => {
    const { data } = await apiClient.get<{ data: MediaFolder[] }>('/media/folders');
    return data.data;
  },

  get: async (folderId: number) => {
    const { data } = await apiClient.get<MediaFolder>(`/media/folders/${folderId}`);
    return data;
  },

  create: async (folderData: { name: string; parent_id?: number }) => {
    const { data } = await apiClient.post<{ folder: MediaFolder; message: string }>(
      '/media/folders',
      folderData
    );
    return data;
  },

  update: async (folderId: number, updates: { name?: string; parent_id?: number | null }) => {
    const { data } = await apiClient.put<{ folder: MediaFolder; message: string }>(
      `/media/folders/${folderId}`,
      updates
    );
    return data;
  },

  delete: async (folderId: number) => {
    const { data } = await apiClient.delete<{ message: string }>(`/media/folders/${folderId}`);
    return data;
  },

  reorder: async (folders: Array<{ id: number; order: number }>) => {
    const { data } = await apiClient.post<{ message: string }>('/media/folders/reorder', { folders });
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
