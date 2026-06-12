// SSE streaming chat service

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
  model?: string;  // LLM model: llama-scout-4, gpt-oss-120b, gpt-4o, gpt-4o-mini, compound, kimi-k2
  web_search?: boolean;  // Enable external web search for non-compound models
  attachments?: File[];
  resource_ids?: string[];
  behavior_mode?: string;  // "grounded" | "balanced" | "creative"
}

export interface StreamToken {
  token: string;
  done: boolean;
  chunks?: Array<{
    page?: number;
    score?: number;
    text?: string;
    source?: string;
    resource_id?: string;
  }>;
  mode?: string;
  chat_id?: string;
  type?: string;
  error?: string;
  message?: string;
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
  /** Stream response tokens via SSE. */
  async *sendMessageStream(payload: SendMessagePayload): AsyncGenerator<StreamToken> {
    const url = `${getApiBasePath()}/chat/send`;

    const body = {
      chat_id: payload.chatId || null,
      content: payload.content,
      mode: payload.mode || 'hybrid',
      model: payload.model || 'llama-scout-4',
      web_search: payload.web_search || false,
      resource_ids: payload.resource_ids,
      behavior_mode: payload.behavior_mode || 'balanced',
    };

    try {
      // Cookies sent via credentials: 'include'
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Send cookies automatically
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // 429: rate limit, suggest fallback
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
        // 400: chat message limit
        if (response.status === 400) {
          try {
            const errorData = await response.json();
            if (errorData.detail?.error === 'CHAT_MESSAGE_LIMIT') {
              yield {
                token: '',
                done: true,
                error: 'CHAT_MESSAGE_LIMIT',
                message: errorData.detail?.message,
              };
              return;
            }
          } catch { /* fall through */ }
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

      // SSE parser, accumulate chunks then split on newlines
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split('\n');
        // Keep last partial line in buffer
        buffer = lines.pop() || '';

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

  /** Create a new chat. */
  async createChat(title?: string, mode?: string): Promise<ApiResponse<{ id: string; title: string; mode: string }>> {
    return apiPost(API_ROUTES.CHAT.CREATE, {
      title: title || 'New Chat',
      mode: mode || 'hybrid',
    });
  },

  /** Get chat history for current user. */
  async getChatHistory(): Promise<ApiResponse<{ chats: Chat[] }>> {
    return apiGet(API_ROUTES.CHAT.HISTORY);
  },

  /** Get messages for a specific chat. */
  async getChatMessages(chatId: string): Promise<ApiResponse<{ chat: Chat; messages: ChatMessage[] }>> {
    return apiGet(API_ROUTES.CHAT.MESSAGES(chatId));
  },

  /** Delete a chat. */
  async deleteChat(chatId: string): Promise<ApiResponse<void>> {
    return apiDelete<void>(API_ROUTES.CHAT.DELETE(chatId));
  },

  /** Rename a chat. */
  async renameChat(chatId: string, newTitle: string): Promise<ApiResponse<Chat>> {
    return apiPut<Chat>(API_ROUTES.CHAT.RENAME(chatId), { title: newTitle });
  },

  /** Star or unstar a chat. */
  async starChat(chatId: string, starred: boolean): Promise<ApiResponse<{ id: string; starred: boolean }>> {
    return apiPut<{ id: string; starred: boolean }>(API_ROUTES.CHAT.STAR(chatId), { starred });
  },

  /** Upload a file for the chat. */
  async uploadFile(file: File, chatId?: string): Promise<ApiResponse<{ filename: string; stored_as: string; status: string; chunk_count: number; id: string; expires_at?: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (chatId) {
      formData.append('chat_id', chatId);
    }

    const url = `${getApiBasePath()}${API_ROUTES.CHAT.UPLOAD}`;

    try {
      // Cookies sent automatically
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Send cookies automatically
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

  /** Poll resource status until processing is done. */
  async pollResourceStatus(resourceId: string, intervalMs = 1000, maxAttempts = 60): Promise<{ status: string; chunk_count: number }> {
    const url = `${getApiBasePath()}/chat/resource/${resourceId}/status`;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(url, { credentials: 'include' });
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
};

