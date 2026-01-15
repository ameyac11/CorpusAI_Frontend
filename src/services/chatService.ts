// Chat service with SSE streaming support
// Connects to FastAPI backend

import { apiGet, apiPost, apiPut, apiDelete, API_ROUTES, type ApiResponse } from '@/lib/api';
import { getApiBasePath } from '@/lib/api/config';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  attachments?: ChatAttachment[];
  sources?: MessageSource[];
  createdAt: string;
  context_attachment_ids?: string[];
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  url?: string;
}

export interface MessageSource {
  id: string;
  title: string;
  snippet: string;
  url?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  starred: boolean;
  createdAt: string;
  updatedAt: string;
  mode?: string;
  scope_locked?: boolean;
  scope_resources?: Array<{
    id: string;
    file_name: string;
    file_type: string;
    expires_at?: string;
    storage_url?: string;
  }>;
  scope_images?: Array<{
    id: string;
    file_name: string;
    file_type: string;
    expires_at?: string;
    storage_url?: string;
  }>;
}

export interface SendMessagePayload {
  chatId?: string;
  content: string;
  mode?: string;
  model?: string;  // LLM model: llama-guard-4, llama-scout-4, gpt-oss-120b, gpt-4.1, gpt-4o-mini, compound
  web_search?: boolean;  // Enable external web search for non-compound models
  attachments?: File[];
  resource_ids?: string[];
}

export interface StreamToken {
  token: string;
  done: boolean;
  chunks?: Array<{
    page?: number;
    score?: number;
    text?: string;
    source?: string;
  }>;
  mode?: string;
  chat_id?: string;
  type?: string;
  error?: string;
  // Rate limit error fields
  model?: string;
  suggested_fallback?: string;
}

export interface SendMessageResponse {
  chatId: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export const chatService = {
  /**
   * Send a message and stream the response using SSE.
   * Returns an async generator that yields tokens.
   * Requires authentication.
   */
  async *sendMessageStream(payload: SendMessagePayload): AsyncGenerator<StreamToken> {
    const url = `${getApiBasePath()}/chat/send`;

    const body = {
      chat_id: payload.chatId || null,
      content: payload.content,
      mode: payload.mode || 'hybrid',
      model: payload.model || 'gpt-4o-mini',
      web_search: payload.web_search || false,
      resource_ids: payload.resource_ids,
    };

    try {
      const token = localStorage.getItem('corpus_access_token');
      if (!token) {
        yield { token: '', done: true, error: 'Not authenticated' };
        return;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // Handle 429 rate limit errors specially
        if (response.status === 429) {
          try {
            const errorData = await response.json();
            yield {
              token: '',
              done: true,
              error: 'MODEL_LIMIT_REACHED',
              model: errorData.detail?.model,
              suggested_fallback: errorData.detail?.suggested_fallback
            };
            return;
          } catch {
            yield { token: '', done: true, error: 'Rate limit exceeded' };
            return;
          }
        }
        yield { token: '', done: true, error: `HTTP error: ${response.status}` };
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        yield { token: '', done: true, error: 'No response body' };
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data as StreamToken;
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      // Process any remaining data in buffer
      if (buffer.startsWith('data: ')) {
        try {
          const data = JSON.parse(buffer.slice(6));
          yield data as StreamToken;
        } catch {
          // Skip malformed JSON
        }
      }
    } catch (error) {
      yield {
        token: '',
        done: true,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  },

  /**
   * Create a new chat.
   * Requires authentication.
   */
  async createChat(title?: string, mode?: string): Promise<ApiResponse<{ id: string; title: string; mode: string }>> {
    return apiPost(API_ROUTES.CHAT.CREATE, {
      title: title || 'New Chat',
      mode: mode || 'hybrid',
    });
  },

  /**
   * Get chat history for current authenticated user.
   * Requires authentication.
   */
  async getChatHistory(): Promise<ApiResponse<{ chats: Chat[] }>> {
    return apiGet(API_ROUTES.CHAT.HISTORY);
  },

  /**
   * Get messages for a specific chat.
   */
  async getChatMessages(chatId: string): Promise<ApiResponse<{ chat: Chat; messages: ChatMessage[] }>> {
    return apiGet(API_ROUTES.CHAT.MESSAGES(chatId));
  },

  /**
   * Delete a chat.
   */
  async deleteChat(chatId: string): Promise<ApiResponse<void>> {
    return apiDelete<void>(API_ROUTES.CHAT.DELETE(chatId));
  },

  /**
   * Rename a chat.
   */
  async renameChat(chatId: string, newTitle: string): Promise<ApiResponse<Chat>> {
    return apiPut<Chat>(API_ROUTES.CHAT.RENAME(chatId), { title: newTitle });
  },

  /**
   * Star/unstar a chat (pin/unpin).
   */
  async starChat(chatId: string, starred: boolean): Promise<ApiResponse<{ id: string; starred: boolean }>> {
    return apiPut<{ id: string; starred: boolean }>(API_ROUTES.CHAT.STAR(chatId), { starred });
  },

  /**
   * Upload a file for the chat.
   * Requires authentication.
   */
  async uploadFile(file: File, chatId?: string): Promise<ApiResponse<{ filename: string; stored_as: string; status: string; chunk_count: number; id: string; expires_at?: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (chatId) {
      formData.append('chat_id', chatId);
    }

    const url = `${getApiBasePath()}${API_ROUTES.CHAT.UPLOAD}`;

    try {
      const token = localStorage.getItem('corpus_access_token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          data: null,
          error: {
            code: 'UPLOAD_ERROR',
            message: errorData.detail || `HTTP ${response.status}`,
            status: response.status
          },
        };
      }

      const data = await response.json();

      return {
        success: true,
        data: data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Upload failed',
          status: 0
        },
      };
    }
  },
};

