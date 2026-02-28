/**
 * Resources Service for CorpusAI.
 * Handles API calls for permanent resources (web imports, file uploads).
 */

import { getApiBasePath } from '@/lib/api/config';

export interface WebSearchResult {
    title: string;
    url: string;
    snippet: string;
}

export interface SearchResponse {
    success: boolean;
    data?: {
        search_id: string;
        query: string;
        results: WebSearchResult[];
        count: number;
        usage: {
            used: number;
            limit: number;
        };
    };
    error?: string;
    message?: string;
    usage?: {  // Also at root level for error responses
        used: number;
        limit: number;
    };
}

export interface ResourceItem {
    id: string;
    file_name: string;
    file_type: string;
    resource_type: 'file_upload' | 'web_import' | 'chat_upload';
    is_permanent: boolean;
    source_url?: string;
    created_at: string;
    status: string;
}

export interface ResourcesResponse {
    success: boolean;
    data?: {
        resources: ResourceItem[];
    };
    error?: string;
}

export interface ImportResponse {
    success: boolean;
    data?: {
        imported: Array<{
            id: string;
            title: string;
            url: string;
            status: string;
        }>;
        errors: Array<{
            index: number;
            title?: string;
            error: string;
        }>;
        imported_count: number;
    };
    error?: string;
}

// uses raw fetch instead of apiClient — this service was built before the central client existed
// TODO: migrate to apiClient for consistency

// Cookies are sent automatically with credentials: 'include'
// No need for manual auth headers

export const resourcesService = {
    /**
     * List all permanent resources for the current user.
     */
    async listResources(): Promise<ResourcesResponse> {
        const response = await fetch(`${getApiBasePath()}/resources`, {
            credentials: 'include', // Send cookies
        });
        return response.json();
    },

    /**
     * Search web using Perplexity (Resource Page only).
     * Makes EXACTLY ONE API call, returns up to 20 results.
     * Careful: each call counts against the user's daily search quota.
     */
    async searchWeb(query: string): Promise<SearchResponse> {
        const response = await fetch(`${getApiBasePath()}/resources/search`, {
            method: 'POST',
            credentials: 'include', // Send cookies
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });
        return response.json();
    },

    /**
     * Import selected web search results as permanent resources.
     */
    async importResources(searchId: string, selectedIndices: number[]): Promise<ImportResponse> {
        const response = await fetch(`${getApiBasePath()}/resources/import`, {
            method: 'POST',
            credentials: 'include', // Send cookies
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                search_id: searchId,
                selected_indices: selectedIndices,
            }),
        });
        return response.json();
    },

    /**
     * Upload a file to Resource Page (permanent).
     */
    async uploadResource(file: File): Promise<{ success: boolean; data?: ResourceItem; error?: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${getApiBasePath()}/resources/upload`, {
            method: 'POST',
            credentials: 'include', // Send cookies
            body: formData,
        });
        return response.json();
    },

    /**
     * Poll ingestion status for a permanent resource until processing completes.
     */
    async pollResourceStatus(resourceId: string, intervalMs = 1000, maxAttempts = 60): Promise<{ status: string; chunk_count: number }> {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await fetch(`${getApiBasePath()}/resources/${resourceId}/status`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.status !== 'pending') {
                        return { status: data.status, chunk_count: data.chunk_count || 0 };
                    }
                }
            } catch {
                // ignore transient network errors
            }
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
        return { status: 'failed', chunk_count: 0 };
    },

    /**
     * Delete a resource (permanent removal).
     */
    async deleteResource(resourceId: string): Promise<{ success: boolean; message?: string; error?: string }> {
        const response = await fetch(`${getApiBasePath()}/resources/${resourceId}`, {
            method: 'DELETE',
            credentials: 'include', // Send cookies
        });
        return response.json();
    },
};
