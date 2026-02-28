import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Bot, User, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { Message } from '@/contexts/ChatContext';
import { getApiBasePath } from '@/lib/api/config';

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  loadingStatus?: string;
}

export function ChatMessage({ message, isLoading = false, loadingStatus }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());

  // resolve image URLs: prefer storage_url > blob url > fallback to preview endpoint
  useEffect(() => {
    if (!message.attachments || message.attachments.length === 0) return;

    const loadImages = async () => {
      const newUrls = new Map<string, string>();

      for (const attachment of message.attachments || []) {
        if (attachment.type === 'image') {
          // Use storage_url directly if available
          if (attachment.storage_url) {
            const fullUrl = `${getApiBasePath()}${attachment.storage_url}`;
            newUrls.set(attachment.id, fullUrl);
          } else if (attachment.url) {
            newUrls.set(attachment.id, attachment.url);
          } else {
            // Fallback to preview endpoint
            try {
              const response = await fetch(`${getApiBasePath()}/resources/preview/${attachment.id}`, {
                credentials: 'include' // Send cookies automatically
              });

              if (response.ok) {
                const data = await response.json();
                if (data.type === 'image' && data.content) {
                  const dataUrl = `data:${data.mime_type || 'image/png'};base64,${data.content}`;
                  newUrls.set(attachment.id, dataUrl);
                }
              } else if (response.status === 404 || response.status === 410) {
                newUrls.set(attachment.id, 'EXPIRED');
              }
            } catch (error) {
              console.error(`Failed to load image ${attachment.id}:`, error);
              newUrls.set(attachment.id, 'ERROR');
            }
          }
        }
      }

      if (newUrls.size > 0) {
        setImageUrls(newUrls);
      }
    };

    loadImages();
  }, [message.attachments]);

  return (
    <div
      className={cn(
        'flex gap-4 p-4 rounded-xl animate-fade-in',
        isUser ? '!bg-primary/40 backdrop-blur-sm shadow-sm' : 'bg-chat-assistant'
      )}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
          isUser ? 'bg-primary text-primary-foreground' : 'gradient-bg text-primary-foreground'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground mb-1">
          {isUser ? 'You' : 'CorpusAI'}
        </p>

        {/* Render attachments ABOVE the message content */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            {message.attachments.map((attachment) => {
              const isImage = attachment.type === 'image';
              const imageUrl = imageUrls.get(attachment.id) || attachment.url;

              if (isImage) {
                if (imageUrl === 'EXPIRED' || imageUrl === 'ERROR') {
                  return (
                    <div key={attachment.id} className="relative rounded-lg overflow-hidden border border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 p-4 max-w-md">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        ⚠️ The file "{attachment.name || attachment.file_name}" is no longer available. Please re-upload.
                      </p>
                    </div>
                  );
                }

                if (imageUrl) {
                  return (
                    <div key={attachment.id} className="relative rounded-lg overflow-hidden border border-border max-w-md">
                      <img
                        src={imageUrl}
                        alt={attachment.name || attachment.file_name || 'Uploaded image'}
                        className="w-full h-auto"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1">
                        {attachment.name || attachment.file_name}
                      </div>
                    </div>
                  );
                }
              }

              return (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 px-3 py-2 bg-secondary/50 rounded-lg text-xs border border-border"
                >
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground/80 truncate">
                    {attachment.name || attachment.file_name || 'Attachment'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{loadingStatus || 'Thinking...'}</span>
          </div>
        ) : (
          <div className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading message component for streaming responses
export function LoadingMessage({ status }: { status: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl animate-fade-in bg-chat-assistant">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 gradient-bg text-primary-foreground">
        <Bot className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground mb-1">CorpusAI</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm text-muted-foreground">{status}</span>
        </div>
      </div>
    </div>
  );
}
