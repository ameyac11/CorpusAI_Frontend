// Resource service wrapper

import { apiGet, apiPost, apiDelete, apiUpload, API_ROUTES, type ApiResponse } from '@/lib/api';

export interface Resource {
  id: string;
  file_name: string;
  file_type: string;
  resource_type: string;
  is_permanent: boolean;
  source_url?: string;
  created_at: string;
  status: 'processing' | 'processed' | 'error';
  size?: number;
  metadata?: Record<string, unknown>;
  expires_at?: string;
}

export interface UsageStats {
  documents: { used: number; limit: number };
  images: { used: number; limit: number };
  storage_mb: { used: number; limit: number };
}

export interface UploadResourcePayload {
  files: File[];
}

export interface WebImportPayload {
  search_id: string;
  selected_indices: number[];
}

export interface WebSearchPayload {
  query: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface ResourcePreview {
  id: string;
  content: string;
  contentType: string;
  thumbnail?: string;
}

// Thin wrappers around api client
export const resourceService = {
  async listResources(): Promise<ApiResponse<{ resources: Resource[] }>> {
    return apiGet<{ resources: Resource[] }>(API_ROUTES.RESOURCES.LIST);
  },

  async uploadResource(file: File): Promise<ApiResponse<Resource>> {
    const formData = new FormData();
    formData.append('file', file);

    return apiUpload<Resource>(API_ROUTES.RESOURCES.UPLOAD, formData);
  },

  async searchWeb(query: string): Promise<ApiResponse<{ search_id: string; results: WebSearchResult[]; count: number; usage: { used: number; limit: number } }>> {
    return apiPost<{ search_id: string; results: WebSearchResult[]; count: number; usage: { used: number; limit: number } }>(
      API_ROUTES.RESOURCES.WEB_SEARCH,
      { query }
    );
  },

  async importFromWeb(payload: WebImportPayload): Promise<ApiResponse<{ imported: any[]; errors: any[]; imported_count: number }>> {
    return apiPost<{ imported: any[]; errors: any[]; imported_count: number }>(
      API_ROUTES.RESOURCES.WEB_IMPORT,
      payload
    );
  },

  async deleteResource(resourceId: string): Promise<ApiResponse<void>> {
    return apiDelete<void>(API_ROUTES.RESOURCES.DELETE(resourceId));
  },

  async getResourcePreview(resourceId: string): Promise<ApiResponse<ResourcePreview>> {
    return apiGet<ResourcePreview>(API_ROUTES.RESOURCES.PREVIEW(resourceId));
  },

  async getUsageStats(): Promise<ApiResponse<UsageStats>> {
    return apiGet<UsageStats>(API_ROUTES.RESOURCES.USAGE);
  },

  async pollResourceStatus(resourceId: string, intervalMs = 1000, maxAttempts = 60): Promise<{ status: string; chunk_count: number }> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await apiGet<{ status: string; chunk_count: number }>(API_ROUTES.RESOURCES.STATUS(resourceId));
        if (result.data && result.data.status !== 'pending') {
          return { status: result.data.status, chunk_count: result.data.chunk_count || 0 };
        }
      } catch {
        // ignore transient errors
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    return { status: 'failed', chunk_count: 0 };
  },
};
