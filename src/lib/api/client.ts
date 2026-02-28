// Central API client utility
// All API calls must go through this client

import { API_CONFIG, buildEndpoint } from './config';
import { tokenStorage } from './tokenStorage';

// Error response structure
export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

// Standardized response wrapper
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  success: boolean;
}

// Error codes for handling
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  NOT_FOUND: 'NOT_FOUND',
} as const;

// Map HTTP status to error codes
const mapStatusToErrorCode = (status: number): string => {
  switch (status) {
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 429:
      return ERROR_CODES.RATE_LIMIT;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 422:
    case 400:
      return ERROR_CODES.VALIDATION_ERROR;
    case 500:
    case 502:
    case 503:
      return ERROR_CODES.SERVER_ERROR;
    default:
      return ERROR_CODES.SERVER_ERROR;
  }
};

// skip Content-Type for FormData — browser sets the multipart boundary automatically
const createHeaders = (customHeaders?: HeadersInit, isFormData: boolean = false): Headers => {
  const headers = new Headers(customHeaders);

  if (!headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json');
  }

  // No longer need Authorization header - cookies are sent automatically

  return headers;
};

// Main API client
export const apiClient = {
  async request<T>(
    route: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = buildEndpoint(route);

    try {
      // abort controller gives us a hard timeout so we don't hang forever
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const isFormData = options.body instanceof FormData;

      const response = await fetch(url, {
        ...options,
        headers: createHeaders(options.headers, isFormData),
        credentials: 'include', // CRITICAL: Send cookies with every request
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      let responseData: T | null = null;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        responseData = await response.json();
      }

      if (!response.ok) {
        const error: ApiError = {
          code: mapStatusToErrorCode(response.status),
          message: (responseData as unknown as { message?: string })?.message || 'An error occurred',
          status: response.status,
          details: responseData as Record<string, unknown>,
        };

        return { data: null, error, success: false };
      }

      return { data: responseData, error: null, success: true };
    } catch (err) {
      // Handle network errors or timeouts
      const isAbortError = err instanceof Error && err.name === 'AbortError';

      const error: ApiError = {
        code: isAbortError ? 'TIMEOUT' : ERROR_CODES.NETWORK_ERROR,
        message: isAbortError ? 'Request timed out' : 'Network error occurred',
        status: 0,
      };

      return { data: null, error, success: false };
    }
  },

};

// Convenience methods as standalone functions
export async function apiGet<T>(route: string): Promise<ApiResponse<T>> {
  return apiClient.request<T>(route, { method: 'GET' });
}

export async function apiPost<T>(route: string, body?: unknown): Promise<ApiResponse<T>> {
  return apiClient.request<T>(route, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiPut<T>(route: string, body?: unknown): Promise<ApiResponse<T>> {
  return apiClient.request<T>(route, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T>(route: string): Promise<ApiResponse<T>> {
  return apiClient.request<T>(route, { method: 'DELETE' });
}

// file uploads go through here — don't set Content-Type, let FormData handle it
export async function apiUpload<T>(route: string, formData: FormData): Promise<ApiResponse<T>> {
  // Cookies are sent automatically with credentials: 'include'
  // No Authorization header needed for file uploads
  return apiClient.request<T>(route, {
    method: 'POST',
    body: formData,
  });
}
