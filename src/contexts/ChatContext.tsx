import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AttachedFile } from '@/components/chat/AttachmentMenu';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { getApiBasePath } from '@/lib/api/config';

export type AIModel = 'compound' | 'compound-mini' | 'llama-scout-4' | 'gpt-oss-120b' | 'gpt-4.1' | 'gpt-4o-mini';
export type DataSource = 'documents' | 'hybrid' | 'ai-only';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  referencedMessageId?: string;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url?: string; // Object URL for images
    storage_url?: string; // Backend storage path
    file_name?: string;
    file_type?: string;
  }>;
  context_attachment_ids?: string[]; // For follow-up references
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  starred?: boolean;
  attachments?: AttachedFile[];
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

interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  model: AIModel;
  dataSource: DataSource;
  internetSearch: boolean;
  isStreaming: boolean;
  isThinking: boolean;
  streamError: string | null;
  setModel: (model: AIModel) => void;
  setDataSource: (source: DataSource) => void;
  setInternetSearch: (enabled: boolean) => void;
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  sendMessage: (content: string, resourceIds?: string[], resourceMetadata?: Array<{ id: string; name: string; type: string; file_name: string; }>) => Promise<void>;
  addAttachments: (files: AttachedFile[]) => Promise<void>;
  removeAttachment: (attachmentId: string) => void;
  clearAttachments: () => void;
  updateAttachmentLoading: (attachmentIds: string[], loading: boolean) => void;
  deleteChat: (chatId: string) => void;
  renameChat: (chatId: string, newTitle: string) => void;
  starChat: (chatId: string) => void;
  disabledModels: Set<AIModel>;
  setDisabledModels: (models: Set<AIModel> | ((prev: Set<AIModel>) => Set<AIModel>)) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [model, setModel] = useState<AIModel>('llama-scout-4');
  const [dataSource, setDataSource] = useState<DataSource>('hybrid');
  const [internetSearch, setInternetSearch] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [disabledModels, setDisabledModelsState] = useState<Set<AIModel>>(() => {
    // Load disabled models from localStorage on initial mount
    const saved = localStorage.getItem('corpus_disabled_models');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return new Set(parsed as AIModel[]);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });
  const currentChatIdRef = useRef<string | null>(null);

  // Wrapper to persist disabled models to localStorage
  const setDisabledModels = useCallback((models: Set<AIModel> | ((prev: Set<AIModel>) => Set<AIModel>)) => {
    setDisabledModelsState(prev => {
      const next = typeof models === 'function' ? models(prev) : models;
      localStorage.setItem('corpus_disabled_models', JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  // Persist current chat ID
  useEffect(() => {
    if (currentChat?.id) {
      localStorage.setItem('corpus_active_chat', currentChat.id);
    }
  }, [currentChat?.id]);

  // Fetch rate limit status to determine disabled models
  const fetchRateLimitStatus = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${getApiBasePath()}/rate-limit/status`, {
        credentials: 'include' // Send cookies automatically
      });

      if (response.ok) {
        const data = await response.json();
        // Always update the state, even if empty, to ensure enabled models are cleared
        if (data.disabled_models !== undefined) {
          setDisabledModels(new Set(data.disabled_models as AIModel[]));
          console.log('[ChatContext] Updated disabled models:', data.disabled_models);
        }
      }
    } catch (error) {
      console.error('[ChatContext] Failed to fetch rate limit status:', error);
    }
  }, [isAuthenticated, setDisabledModels]);

  // Load chats when authenticated (triggers on login, not just mount)
  useEffect(() => {
    let mounted = true;

    const loadChats = async () => {
      if (!isAuthenticated) {
        // Clear chats when logged out
        setChats([]);
        setCurrentChat(null);
        return;
      }

      console.log('[ChatContext] Skipping chat history load - user wants fresh start on refresh');

      // Fetch rate limit status only
      await fetchRateLimitStatus();

      // DON'T load chat history on refresh - user wants clean slate
      const response = await chatService.getChatHistory();
      console.log('[ChatContext] History response:', response);

      if (!mounted) return;

      if (response.success && response.data?.chats) {
        console.log('[ChatContext] Valid response, parsing chats...');
        const mappedChats: Chat[] = response.data.chats.map((c: any) => {
          const created = c.created_at ? new Date(c.created_at) : new Date();
          return {
            id: c.id,
            title: c.title,
            messages: [],
            createdAt: isNaN(created.getTime()) ? new Date() : created,
            updatedAt: isNaN(created.getTime()) ? new Date() : created,
            starred: c.starred || false,
          };
        });
        console.log('[ChatContext] Setting chats state with', mappedChats.length, 'items:', mappedChats);
        setChats(mappedChats);

        // Restore active chat on refresh
        const lastActiveId = localStorage.getItem('corpus_active_chat');
        console.log('[ChatContext] Last active chat ID from localStorage:', lastActiveId);

        if (lastActiveId && mappedChats.length > 0) {
          const chatToRestore = mappedChats.find(c => c.id === lastActiveId);
          if (chatToRestore) {
            console.log('[ChatContext] Found chat to restore:', chatToRestore);
            currentChatIdRef.current = lastActiveId;
            setCurrentChat({ ...chatToRestore, messages: [] });

            chatService.getChatMessages(lastActiveId).then(resp => {
              if (!mounted) return;
              if (resp.success && resp.data) {
                const { chat: backendChat, messages } = resp.data;
                console.log('[ChatContext] Loaded', messages.length, 'messages for chat');

                // Build resource map for resolving context_attachment_ids
                const resourceMap = new Map<string, any>();
                [
                  ...(backendChat.scope_resources || []),
                  ...(backendChat.scope_images || [])
                ].forEach(r => {
                  resourceMap.set(r.id, {
                    id: r.id,
                    name: r.file_name,
                    type: r.file_type?.startsWith('image/') ? 'image' : 'document',
                    file_name: r.file_name,
                    file_type: r.file_type,
                    storage_url: r.storage_url
                  });
                });

                const mappedMessages: Message[] = messages.map(m => {
                  let messageAttachments = (m.attachments || []).map((att: any) => ({
                    id: att.id,
                    name: att.file_name || att.name || 'Attachment',
                    type: att.type || (att.file_type?.startsWith('image/') ? 'image' : 'document'),
                    file_name: att.file_name,
                    file_type: att.file_type,
                    storage_url: att.storage_url,
                    url: undefined
                  }));

                  // Note: context_attachment_ids is for RAG context only, not visual display

                  return {
                    id: m.id,
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                    timestamp: new Date(m.createdAt),
                    attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
                    context_attachment_ids: m.context_attachment_ids || []
                  };
                });

                setCurrentChat({
                  ...chatToRestore,
                  messages: mappedMessages,
                  title: backendChat.title,
                  mode: backendChat.mode,
                  // Preserve original updatedAt - don't update on selection
                  updatedAt: chatToRestore.updatedAt,
                  // Preserve starred state from loaded chat
                  starred: chatToRestore.starred
                });
              }
            }).catch(err => {
              console.error('[ChatContext] Failed to load messages:', err);
            });
          } else {
            console.log('[ChatContext] Chat with ID', lastActiveId, 'not found in loaded chats');
          }
        } else {
          console.log('[ChatContext] No active chat to restore or no chats loaded');
        }
      } else {
        console.log('[ChatContext] No existing chats found or failed to load. Success:', response.success);
      }
    };

    loadChats();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, fetchRateLimitStatus]);

  // Sync dataSource with current chat's mode
  useEffect(() => {
    if (currentChat?.mode) {
      // Map backend mode to frontend DataSource
      const modeMap: Record<string, DataSource> = {
        'document_only': 'documents',
        'hybrid': 'hybrid',
        'ai_only': 'ai-only',
      };
      const mappedMode = modeMap[currentChat.mode] || 'hybrid';
      if (mappedMode !== dataSource) {
        setDataSource(mappedMode);
      }
    }
  }, [currentChat?.mode]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Only set current chat, don't add to history yet
    setCurrentChat(newChat);
    currentChatIdRef.current = null; // Reset ref for new chat
  };

  const selectChat = async (chatId: string) => {
    // 1. Find the chat in local list (preview)
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChat(chat);
      currentChatIdRef.current = chatId; // Update ref to selected chat

      // 2. Fetch full details including messages from backend
      try {
        const response = await chatService.getChatMessages(chatId);
        if (response.success && response.data) {
          const { chat: backendChat, messages } = response.data;

          console.log('[loadChatMessages] Backend chat data:', backendChat);
          console.log('[loadChatMessages] Scope resources:', backendChat.scope_resources);
          console.log('[loadChatMessages] Scope images:', backendChat.scope_images);

          // Build resource map for resolving context_attachment_ids
          const resourceMap = new Map<string, any>();
          [
            ...(backendChat.scope_resources || []),
            ...(backendChat.scope_images || [])
          ].forEach(r => {
            resourceMap.set(r.id, {
              id: r.id,
              name: r.file_name,
              type: r.file_type?.startsWith('image/') ? 'image' : 'document',
              file_name: r.file_name,
              file_type: r.file_type,
              storage_url: r.storage_url
            });
          });

          console.log('[loadChatMessages] Resource map:', resourceMap);

          const mappedMessages: Message[] = messages.map(m => {
            let messageAttachments = (m.attachments || []).map((att: any) => ({
              id: att.id,
              name: att.file_name || att.name || 'Attachment',
              type: att.type || (att.file_type?.startsWith('image/') ? 'image' : 'document'),
              file_name: att.file_name,
              file_type: att.file_type,
              storage_url: att.storage_url,
              url: undefined
            }));

            // Note: context_attachment_ids is for RAG context only, not visual display

            return {
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              timestamp: new Date(m.createdAt),
              attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
              context_attachment_ids: m.context_attachment_ids || []
            };
          });

          console.log('[loadChatMessages] Mapped messages with attachments:', mappedMessages);

          console.log('[loadChatMessages] Mapped messages with attachments:', mappedMessages);

          const fullChat: Chat = {
            ...chat,
            messages: mappedMessages,
            title: backendChat.title,
            mode: backendChat.mode,
            // Preserve original updatedAt - don't update on selection
            updatedAt: chat.updatedAt,
            // Preserve starred state from local chat
            starred: chat.starred,
            scope_locked: backendChat.scope_locked,
            scope_resources: backendChat.scope_resources,
            scope_images: backendChat.scope_images
          };

          setCurrentChat(fullChat);

          // Also update the chat in the main list - preserve order
          setChats(prev => prev.map(c => c.id === chatId ? fullChat : c));
        }
      } catch (error) {
        console.error('Failed to load chat messages:', error);
      }
    }
  };

  // Helper functions for attachment management (must be before sendMessage)
  const updateAttachmentLoading = useCallback((attachmentIds: string[], loading: boolean) => {
    // Use functional updates to avoid stale state
    setCurrentChat(prev => {
      if (!prev || !prev.attachments) return prev;

      const updatedAttachments = prev.attachments.map(a =>
        attachmentIds.includes(a.id) ? { ...a, loading } : a
      );

      return { ...prev, attachments: updatedAttachments };
    });

    setChats(prev => prev.map(chat => {
      if (chat.attachments && chat.attachments.length > 0) {
        const updatedAttachments = chat.attachments.map(a =>
          attachmentIds.includes(a.id) ? { ...a, loading } : a
        );
        return { ...chat, attachments: updatedAttachments };
      }
      return chat;
    }));
  }, []);

  const clearAttachments = useCallback(() => {
    console.log('[clearAttachments] Called');

    // Use functional updates to avoid using stale state
    setCurrentChat(prev => {
      if (!prev) return prev;
      console.log('[clearAttachments] Clearing attachments from chat with', prev.messages.length, 'messages');
      const updated = { ...prev, attachments: [] };
      console.log('[clearAttachments] Updated chat still has', updated.messages.length, 'messages');
      return updated;
    });

    setChats(prev => prev.map(chat => {
      // Use the functional update version of currentChat
      if (chat.attachments && chat.attachments.length > 0) {
        return { ...chat, attachments: [] };
      }
      return chat;
    }));
  }, []);

  const sendMessage = useCallback(async (content: string, resourceIds?: string[], resourceMetadata?: Array<{ id: string; name: string; type: string; file_name: string; }>): Promise<void> => {
    console.log('[sendMessage] Called with content:', content);
    console.log('[sendMessage] Current chat state:', currentChat);
    console.log('[sendMessage] Current chat attachments:', currentChat?.attachments);
    console.log('[sendMessage] Resource metadata:', resourceMetadata);
    setStreamError(null);
    setIsStreaming(true);
    setIsThinking(false);

    // Capture attachments to include in user message
    const attachedFiles = currentChat?.attachments || [];
    const hasAttachments = attachedFiles.length > 0;

    // Collect resource IDs from attachments (for backend vision processing)
    const attachmentResourceIds = attachedFiles
      .map(a => a.resourceId)
      .filter((id): id is string => !!id);

    console.log('[sendMessage] Attachments to include:', attachedFiles.length, attachedFiles);
    console.log('[sendMessage] Attachment Resource IDs:', attachmentResourceIds);
    console.log('[sendMessage] Selected Resource IDs:', resourceIds);

    // Check if all attachments have resource IDs
    const attachmentsWithoutIds = attachedFiles.filter(a => !a.resourceId);
    if (attachmentsWithoutIds.length > 0) {
      console.error('[sendMessage] Some attachments missing resourceIds:', attachmentsWithoutIds);
      setStreamError(`Files still uploading: ${attachmentsWithoutIds.map(a => a.name).join(', ')}`);
      setIsStreaming(false);
      return;
    }

    const totalResourceIds = [...(resourceIds || []), ...attachmentResourceIds];
    console.log('[sendMessage] TOTAL Resource IDs being sent:', totalResourceIds);
    console.log('[sendMessage] Number of resource IDs:', totalResourceIds.length);

    // Combine uploaded file attachments and selected resource metadata
    const uploadedFileAttachments = hasAttachments ? attachedFiles.map(a => ({
      id: a.resourceId || a.id,
      name: a.name,
      type: a.type,
      // Store just metadata, not blob URL (will be lost on refresh anyway)
      url: undefined,
    })) : [];

    const resourceAttachments = resourceMetadata || [];
    const allAttachments = [...uploadedFileAttachments, ...resourceAttachments];

    // Create user message locally first with attachments
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments: allAttachments.length > 0 ? allAttachments : undefined,
    };

    console.log('[sendMessage] Created user message:', userMessage);
    console.log('[sendMessage] User message attachments:', userMessage.attachments);

    // Create placeholder for assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    // Get current chat ID for API
    let chatId = currentChatIdRef.current;

    // Update local state with both messages
    setCurrentChat(prev => {
      const chatToUpdate = prev || {
        id: Date.now().toString(),
        title: content.slice(0, 30) + '...',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = {
        ...chatToUpdate,
        title: chatToUpdate.messages.length === 0 ? content.slice(0, 30) + '...' : chatToUpdate.title,
        messages: [...chatToUpdate.messages, userMessage, assistantMessage],
        updatedAt: new Date(),
        attachments: [], // Clear attachments from chat after adding to message
      };

      // Update ref for API call
      if (!chatId) {
        chatId = chatToUpdate.id;
        currentChatIdRef.current = chatId;
      }

      return updated;
    });

    setChats(prev => {
      const chatToUpdate = prev.find(c => c.id === chatId) || {
        id: chatId || Date.now().toString(),
        title: content.slice(0, 30) + '...',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = {
        ...chatToUpdate,
        messages: [...chatToUpdate.messages, userMessage, assistantMessage],
        // Update timestamp when sending message to move chat to top
        updatedAt: new Date(),
        attachments: [], // Clear attachments from chat after adding to message
      };

      const otherChats = prev.filter(c => c.id !== updated.id);
      // Move chat to top of list when sending message
      return [updated, ...otherChats];
    });

    // Map dataSource to backend mode
    const modeMap: Record<DataSource, string> = {
      'documents': 'document_only',
      'hybrid': 'hybrid',
      'ai-only': 'ai_only',
    };

    try {
      // Stream response from backend
      // For compound and compound-mini models, web search is always enabled via backend
      // For other models, use the internetSearch toggle
      const stream = chatService.sendMessageStream({
        chatId: chatId || undefined,
        content,
        mode: modeMap[dataSource],
        model,  // Pass selected model to backend
        web_search: ['compound', 'compound-mini'].includes(model) ? false : internetSearch,  // Compound models have built-in search; others use external
        resource_ids: [...(resourceIds || []), ...attachmentResourceIds], // Merge selected resources and uploaded attachments
      });

      let accumulatedContent = '';

      for await (const token of stream) {
        // Handle init message with chat_id
        if (token.type === 'init' && token.chat_id) {
          currentChatIdRef.current = token.chat_id;
          // Update chat ID in state
          setCurrentChat(prev => prev ? { ...prev, id: token.chat_id! } : prev);
          setChats(prev => {
            if (prev.length > 0 && prev[0].id !== token.chat_id) {
              const [first, ...rest] = prev;
              return [{ ...first, id: token.chat_id! }, ...rest];
            }
            return prev;
          });
          continue;
        }

        // Handle error
        if (token.error) {
          if (token.error === 'MODEL_LIMIT_REACHED') {
            // Handle rate limit fallback
            if (token.model) {
              console.log('[RATE LIMIT] Disabling model:', token.model);
              setDisabledModels(prev => {
                const newSet = new Set([...prev, token.model! as AIModel]);
                console.log('[RATE LIMIT] Updated disabledModels:', Array.from(newSet));
                return newSet;
              });
            }
            if (token.suggested_fallback) {
              console.log('[RATE LIMIT] Switching to fallback:', token.suggested_fallback);
              setModel(token.suggested_fallback as AIModel);
              setStreamError(`Model at capacity. Switching to ${token.suggested_fallback}...`);
            } else {
              setStreamError(`Model at capacity. Please try another model.`);
            }
          } else {
            setStreamError(token.error);
          }
          setIsStreaming(false);
          return;
        }

        // Accumulate tokens
        if (token.token) {
          accumulatedContent += token.token;

          // Detect think tags to update isThinking state
          // Count opening and closing tags to determine if we're inside a think block
          const openThinkCount = (accumulatedContent.match(/<think>/g) || []).length;
          const closeThinkCount = (accumulatedContent.match(/<\/think>/g) || []).length;

          // If we have more opening tags than closing tags, we're thinking
          const currentlyThinking = openThinkCount > closeThinkCount;
          setIsThinking(currentlyThinking);

          // Update assistant message content
          setCurrentChat(prev => {
            if (!prev) return prev;
            const messages = [...prev.messages];
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              messages[messages.length - 1] = {
                ...lastMsg,
                content: accumulatedContent,
              };
            }
            // Don't update timestamp during streaming
            return { ...prev, messages };
          });

          setChats(prev => {
            if (prev.length === 0) return prev;
            const [first, ...rest] = prev;
            const messages = [...first.messages];
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant') {
              messages[messages.length - 1] = {
                ...lastMsg,
                content: accumulatedContent,
              };
            }
            // Don't update timestamp during streaming
            return [{ ...first, messages }, ...rest];
          });
        }

        // Handle completion
        if (token.done) {
          console.log('[sendMessage] Stream complete');

          // Always clear attachments after message is sent
          // The scope keeps track of resources on the backend
          if (hasAttachments) {
            console.log('[sendMessage] Clearing attachments after send');
            clearAttachments();
          }

          // Refetch chat history to get updated timestamps from backend
          try {
            const response = await chatService.getChatHistory();
            if (response.success && response.data?.chats) {
              const mappedChats: Chat[] = response.data.chats.map((c: any) => {
                const created = c.created_at ? new Date(c.created_at) : new Date();
                const updated = c.updated_at ? new Date(c.updated_at) : created;
                return {
                  id: c.id,
                  title: c.title,
                  messages: [], // Messages will be loaded when chat is selected
                  createdAt: isNaN(created.getTime()) ? new Date() : created,
                  updatedAt: isNaN(updated.getTime()) ? created : updated,
                  starred: c.starred || false,
                };
              });
              // Update chats list while preserving messages for current chat
              setChats(prev => {
                return mappedChats.map(newChat => {
                  const existingChat = prev.find(c => c.id === newChat.id);
                  // Preserve messages if it's the current chat
                  if (existingChat && existingChat.id === currentChatIdRef.current) {
                    return { ...newChat, messages: existingChat.messages };
                  }
                  return newChat;
                });
              });
            }
          } catch (error) {
            console.error('[sendMessage] Failed to refetch chat history:', error);
          }

          break;
        }
      }
    } catch (error) {
      console.error('[sendMessage] Stream error:', error);
      setStreamError(error instanceof Error ? error.message : 'Failed to get response');
    } finally {
      setIsStreaming(false);
      setIsThinking(false);
    }
  }, [dataSource, currentChat, clearAttachments, updateAttachmentLoading, model, setModel, setDisabledModels, internetSearch]);


  const addAttachments = async (files: AttachedFile[]) => {
    console.log('[addAttachments] Called with files:', files.map(f => f.name));

    // Create chat if it doesn't exist
    let chatToUpdate = currentChat;

    if (!chatToUpdate) {
      console.log('[addAttachments] No current chat, creating new one');
      const newChat: Chat = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: files,
      };
      setCurrentChat(newChat);
      chatToUpdate = newChat;
    } else {
      console.log('[addAttachments] Current chat exists, attachments before:', chatToUpdate.attachments?.map(a => a.name));
      // Update current chat immediately with new attachments
      const updatedCurrentChat = {
        ...chatToUpdate,
        attachments: [...(chatToUpdate.attachments || []), ...files],
      };
      console.log('[addAttachments] Updated attachments after:', updatedCurrentChat.attachments?.map(a => a.name));
      setCurrentChat(updatedCurrentChat);
      chatToUpdate = updatedCurrentChat;

      // Update in history list if it exists there
      setChats(prev => {
        const chatExists = prev.some(c => c.id === chatToUpdate!.id);
        if (chatExists) {
          const otherChats = prev.filter(c => c.id !== chatToUpdate!.id);
          return [updatedCurrentChat, ...otherChats];
        }
        return prev;
      });
    }

    // Upload files immediately to backend
    const attachmentIds = files.map(f => f.id);
    updateAttachmentLoading(attachmentIds, true);

    try {
      for (const file of files) {
        if (file.file) {
          console.log('[addAttachments] Uploading file to backend:', file.name);

          const uploadResult = await chatService.uploadFile(
            file.file,
            currentChatIdRef.current || undefined
          );

          if (!uploadResult.success) {
            console.error('[addAttachments] Upload failed:', uploadResult.error);
            const errorMsg = uploadResult.error?.message || 'Unknown error';
            if (errorMsg.includes('limit') || errorMsg.includes('exceeds')) {
              setStreamError(errorMsg);
            } else {
              setStreamError(`Failed to upload ${file.name}: ${errorMsg}`);
            }
            // Remove failed attachment
            setCurrentChat(prev => prev ? {
              ...prev,
              attachments: prev.attachments?.filter(a => a.id !== file.id)
            } : prev);
          } else {
            console.log('[addAttachments] Upload successful:', uploadResult.data);
            console.log(`[addAttachments] Processed: ${uploadResult.data?.chunk_count} chunks stored in Qdrant`);

            // Update attachment with returned resource ID
            if (uploadResult.data?.id) {
              const resourceId = uploadResult.data.id;
              console.log(`[addAttachments] Setting resourceId ${resourceId} for file ${file.name}`);

              setChats(prev => prev.map(c => {
                if (c.id === (currentChatIdRef.current || chatToUpdate?.id)) {
                  const updated = {
                    ...c,
                    attachments: c.attachments?.map(a =>
                      a.id === file.id ? { ...a, resourceId, loading: false } : a
                    )
                  };
                  console.log(`[addAttachments] Updated chat attachments:`, updated.attachments?.map(a => `${a.name}:${a.resourceId}`));
                  return updated;
                }
                return c;
              }));

              // Also update current chat state
              setCurrentChat(prev => {
                if (!prev) return prev;
                const updated = {
                  ...prev,
                  attachments: prev.attachments?.map(a =>
                    a.id === file.id ? { ...a, resourceId, loading: false } : a
                  )
                };
                console.log(`[addAttachments] Updated currentChat attachments:`, updated.attachments?.map(a => `${a.name}:${a.resourceId}`));
                return updated;
              });
            } else {
              console.error('[addAttachments] No resource ID returned for', file.name);
            }
          }
        }
      }
      console.log('[addAttachments] All files uploaded and processed');
    } catch (error) {
      console.error('[addAttachments] Upload error:', error);
      setStreamError('Failed to upload files');
    } finally {
      updateAttachmentLoading(attachmentIds, false);
    }
  };

  const removeAttachment = (attachmentId: string) => {
    if (!currentChat) return;

    const updatedChat = {
      ...currentChat,
      attachments: (currentChat.attachments || []).filter(a => a.id !== attachmentId),
    };
    setCurrentChat(updatedChat);

    setChats(prev => {
      const chatExists = prev.some(c => c.id === currentChat.id);
      if (chatExists) {
        return prev.map(chat => {
          if (chat.id === currentChat.id) {
            return updatedChat;
          }
          return chat;
        });
      }
      return prev;
    });
  };



  const renameChat = async (chatId: string, newTitle: string) => {
    // Update local state immediately
    setChats(prev => prev.map(c =>
      c.id === chatId ? { ...c, title: newTitle } : c
    ));
    if (currentChat?.id === chatId) {
      setCurrentChat(prev => prev ? { ...prev, title: newTitle } : null);
    }

    // Persist to backend
    try {
      const response = await chatService.renameChat(chatId, newTitle);
      if (!response.success) {
        console.error('Failed to rename chat on backend:', response.error);
        // Optionally revert the local change
      }
    } catch (error) {
      console.error('Error renaming chat:', error);
    }
  };

  const deleteChat = async (chatId: string) => {
    // Update local state immediately
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
    }

    // Persist to backend (soft delete)
    try {
      const response = await chatService.deleteChat(chatId);
      if (!response.success) {
        console.error('Failed to delete chat on backend:', response.error);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const starChat = async (chatId: string) => {
    // Find current starred state
    const chat = chats.find(c => c.id === chatId);
    const newStarredState = chat ? !chat.starred : true;

    // Update local state immediately
    setChats(prev => prev.map(c =>
      c.id === chatId ? { ...c, starred: newStarredState } : c
    ));
    if (currentChat?.id === chatId) {
      setCurrentChat(prev => prev ? { ...prev, starred: newStarredState } : null);
    }

    // Persist to backend
    try {
      const response = await chatService.starChat(chatId, newStarredState);
      if (!response.success) {
        console.error('Failed to star/unstar chat on backend:', response.error);
      }
    } catch (error) {
      console.error('Error starring chat:', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        model,
        dataSource,
        internetSearch,
        isStreaming,
        isThinking,
        streamError,
        setModel,
        setDataSource,
        setInternetSearch,
        createNewChat,
        selectChat,
        sendMessage,
        addAttachments,
        removeAttachment,
        clearAttachments,
        updateAttachmentLoading,
        deleteChat,
        renameChat,
        starChat,
        disabledModels,
        setDisabledModels,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Mock response function removed - now using real backend API

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
