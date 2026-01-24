import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, X, Search, ArrowUp, ChevronDown, Globe, Database, Cpu, Plus, Lock, Loader2, Copy, ThumbsUp, ThumbsDown, Share, MoreHorizontal, Image as ImageIcon, ZoomIn, Check, File, AlertCircle, HelpCircle, Mail, Send, ArrowLeft } from 'lucide-react';
import { useChat, AIModel, DataSource, Message } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AttachedFile } from '@/components/chat/AttachmentMenu';
import { useNotification } from '@/components/notifications/NotificationProvider';
import { resourceService } from '@/services/resourceService';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Documents are now managed through the backend API

const models: {
  value: AIModel;
  label: string;
  requiresAuth: boolean;
  visionSupport?: boolean;
  webSearch?: boolean;
  isDefault?: boolean;
}[] = [
    { value: 'compound', label: 'Compound', requiresAuth: false, webSearch: true },
    { value: 'compound-mini', label: 'Compound Mini', requiresAuth: false, webSearch: true },
    { value: 'llama-scout-4', label: 'Llama 4 Scout', requiresAuth: false, visionSupport: true, isDefault: true },
    { value: 'gpt-oss-120b', label: 'GPT OSS 120B', requiresAuth: false },
    { value: 'gpt-4.1', label: 'GPT-4.1', requiresAuth: false },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', requiresAuth: false, visionSupport: true },
  ];

const dataSources: { value: DataSource; label: string; icon: string }[] = [
  { value: 'documents', label: 'Documents', icon: 'Doc' },
  { value: 'hybrid', label: 'Hybrid', icon: 'Hybrid' },
  { value: 'ai-only', label: 'AI Only', icon: 'AI' },
];

const supportedDocFormats = ['.pdf', '.docx', '.doc', '.txt', '.md', '.png', '.jpg', '.jpeg'];

// Loading status messages
const loadingStatuses = [
  'Reading documents...',
  'Analyzing context...',
  'Thinking....',
  'Generating response...',
];

interface ChatProps {
  docsSidebarOpen: boolean;
  setDocsSidebarOpen: (open: boolean) => void;
}

// Store attachments per message for display
interface MessageAttachments {
  [messageId: string]: AttachedFile[];
}

export default function Chat({ docsSidebarOpen, setDocsSidebarOpen }: ChatProps) {
  const { currentChat, sendMessage, addAttachments, removeAttachment, clearAttachments, updateAttachmentLoading, model, setModel, dataSource, setDataSource, internetSearch, setInternetSearch, createNewChat, isStreaming, isThinking, streamError, disabledModels } = useChat();
  const { isAnonymous, messageCount, maxAnonymousMessages, incrementMessageCount } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  // Documents removed - using real backend data
  const [searchQuery, setSearchQuery] = useState('');
  const [input, setInput] = useState('');
  const [permanentResources, setPermanentResources] = useState<any[]>([]);
  const [selectedResources, setSelectedResources] = useState<Set<string>>(new Set());

  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [withReasoning, setWithReasoning] = useState(false);
  const [messageAttachments, setMessageAttachments] = useState<MessageAttachments>({});
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1280); // xl breakpoint

  // Attachment preview state
  const [attachmentPreviewOpen, setAttachmentPreviewOpen] = useState(false);
  const [attachmentPreviewLoading, setAttachmentPreviewLoading] = useState(false);
  const [attachmentPreviewData, setAttachmentPreviewData] = useState<{
    type: 'image' | 'pdf' | 'docx' | 'text' | 'web' | 'binary';
    content: string | null;
    mime_type?: string;
    file_name?: string;
    source_url?: string;
  } | null>(null);
  const [previewAttachmentInfo, setPreviewAttachmentInfo] = useState<{ name: string; type: string } | null>(null);

  // Help menu state
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Fetch permanent resources from Resources page
  useEffect(() => {
    const fetchPermanentResources = async () => {
      try {
        const response = await resourceService.listResources();
        if (response.success && response.data) {
          // Flatten wrapper if double wrapped (safeguard) or use direct array
          const resources = response.data.resources || response.data;
          setPermanentResources(Array.isArray(resources) ? resources : (resources as any).resources || []);
        }
      } catch (error) {
        console.error('Failed to fetch permanent resources:', error);
      }
    };
    fetchPermanentResources();
  }, []);

  const toggleResource = (resourceId: string) => {
    setSelectedResources(prev => {
      const next = new Set(prev);
      if (next.has(resourceId)) {
        next.delete(resourceId);
      } else {
        next.add(resourceId);
      }
      return next;
    });
  };

  // Detect desktop screen size
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1280);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, isLoading]);

  // Display rate limit / stream errors as notifications
  useEffect(() => {
    if (streamError) {
      showNotification('warning', 'Model Status', streamError);
    }
  }, [streamError, showNotification]);

  const hasMessages = currentChat && currentChat.messages.length > 0;
  const isNewChat = !currentChat || currentChat.messages.length === 0;

  const suggestions = [
    'Summarize my documents',
    'Key findings?',
    'Compare papers',
    'Explain simply',
  ];

  // Simulate loading animation
  const simulateLoading = async () => {
    setIsLoading(true);
    for (let i = 0; i < loadingStatuses.length; i++) {
      setLoadingStatus(loadingStatuses[i]);
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
    }
    setIsLoading(false);
    setLoadingStatus('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Fill input instead of sending directly
    setInput(suggestion);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (isAnonymous && !incrementMessageCount()) {
      showNotification('rate_limit_daily', 'Daily Limit Reached', 'Your daily usage limit has been reached. Upgrade your plan or try again tomorrow.');
      return;
    }

    const message = input;
    const currentAttachments = [...(currentChat?.attachments || [])];
    setInput('');

    // Send message - attachments will be included automatically from currentChat
    await sendMessage(message, Array.from(selectedResources));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleInternetSearch = () => {
    setInternetSearch(!internetSearch);
  };

  const handleModelSelect = (m: typeof models[0]) => {
    if (m.requiresAuth && isAnonymous) {
      showNotification('login_required', 'Login Required', 'Please log in to access this model.');
      return;
    }
    setModel(m.value);
  };

  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Check file format
    const invalidFiles = Array.from(files).filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return !supportedDocFormats.includes(ext);
    });

    if (invalidFiles.length > 0) {
      showNotification('unsupported_format', 'Unsupported Format', 'Unsupported file format. Please upload PDF, DOCX, TXT, or image files.');
      return;
    }

    const timestamp = Date.now();
    const newAttachments: AttachedFile[] = Array.from(files).map((file, index) => {
      // Detect if it's an image
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '');

      return {
        id: `${timestamp}_${index}`,
        name: file.name,
        type: isImage ? 'image' : 'document',
        file,
        loading: false, // Loading handled by addAttachments
      };
    });

    // Upload and process files - this will wait for backend to complete
    await addAttachments(newAttachments);
    e.target.value = '';
    setAttachmentMenuOpen(false);
  };

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const isImageFile = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '');
  };

  // Open preview for message attachments
  const openAttachmentPreview = async (attachment: { id: string; name: string; type?: string; file?: File }, resourceId?: string) => {
    setPreviewAttachmentInfo({ name: attachment.name, type: attachment.type || 'document' });
    setAttachmentPreviewOpen(true);
    setAttachmentPreviewLoading(true);
    setAttachmentPreviewData(null);

    // If we have a resourceId (backend upload), fetch from API
    if (resourceId) {
      try {
        const response = await resourceService.getResourcePreview(resourceId);
        if (response.success && response.data) {
          setAttachmentPreviewData(response.data as any);
        }
      } catch (error) {
        console.error('[Chat] Attachment preview error:', error);
      }
    }
    // For local file attachments (not yet uploaded), use local file data
    else if (attachment.file) {
      const ext = attachment.name.split('.').pop()?.toLowerCase() || '';

      if (isImageFile(attachment.name)) {
        // Convert to base64 for images
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          setAttachmentPreviewData({
            type: 'image',
            content: base64,
            mime_type: attachment.file?.type || 'image/png',
            file_name: attachment.name
          });
          setAttachmentPreviewLoading(false);
        };
        reader.readAsDataURL(attachment.file);
        return; // Loading will be set to false in onload callback
      } else if (ext === 'pdf') {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          setAttachmentPreviewData({
            type: 'pdf',
            content: base64,
            mime_type: 'application/pdf',
            file_name: attachment.name
          });
          setAttachmentPreviewLoading(false);
        };
        reader.readAsDataURL(attachment.file);
        return;
      } else if (['txt', 'md'].includes(ext)) {
        const reader = new FileReader();
        reader.onload = () => {
          setAttachmentPreviewData({
            type: 'text',
            content: reader.result as string,
            file_name: attachment.name
          });
          setAttachmentPreviewLoading(false);
        };
        reader.readAsText(attachment.file);
        return;
      }
    }

    setAttachmentPreviewLoading(false);
  };

  // Render uploaded files display above search bar with close button inside
  const renderUploadedFiles = () => {
    const attachments = currentChat?.attachments || [];
    if (attachments.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-3 px-1">
        {attachments.map(attachment => {
          const isImage = isImageFile(attachment.name);
          const imageUrl = attachment.file ? URL.createObjectURL(attachment.file) : null;

          return (
            <div
              key={attachment.id}
              className={cn(
                "relative flex items-center gap-2 pl-2 pr-8 py-2 bg-secondary/60 dark:bg-secondary/80 rounded-xl border border-border/50 transition-all group",
                !attachment.loading && "hover:border-primary/30"
              )}
            >
              {/* Thumbnail for images */}
              {isImage && imageUrl && !attachment.loading ? (
                <div
                  className="w-10 h-10 rounded-lg overflow-hidden bg-background cursor-pointer relative group/thumb"
                  onClick={() => setPreviewImage({ url: imageUrl, name: attachment.name })}
                >
                  <img
                    src={imageUrl}
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                  {attachment.loading ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 text-primary" />
                  )}
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                  {attachment.name}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  {attachment.loading ? 'Uploading...' : getFileExtension(attachment.name)}
                </span>
              </div>

              {/* Close button inside the box on right side */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeAttachment(attachment.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-destructive/80 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // Render search bar UI inline to prevent re-mount on state change
  const renderSearchBar = () => (
    <div className="bg-secondary/40 dark:bg-secondary/60 border border-border/60 dark:border-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-sm group focus-within:shadow-md focus-within:border-border">
      {/* Input Row */}
      <div className="flex items-end gap-2 px-4 py-3">
        {/* Plus/Attachment Button */}
        <DropdownMenu open={attachmentMenuOpen} onOpenChange={setAttachmentMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all duration-200 shrink-0 mb-1 active:scale-95">
              <Plus className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="bg-popover border border-border z-50 min-w-[180px] shadow-xl rounded-xl">
            <DropdownMenuItem
              onClick={() => documentInputRef.current?.click()}
              className="flex items-center gap-2 cursor-pointer py-2.5"
            >
              <FileText className="w-4 h-4" />
              <span>Add files & photos</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/70 min-h-[44px] max-h-[160px] text-sm py-2.5 leading-relaxed"
          rows={1}
        />
      </div>

      {/* Controls Row - Bottom */}
      <div className="flex items-center gap-2 px-3 pb-3">
        <div className="flex items-center gap-0.5 p-1 rounded-full bg-background/40 border border-border/30 shadow-sm">
          {/* Internet Search Toggle */}
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <button
                  onClick={['compound', 'compound-mini'].includes(model) ? undefined : toggleInternetSearch}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95',
                    // Compound models: always enabled, can't toggle off
                    ['compound', 'compound-mini'].includes(model)
                      ? 'bg-primary text-primary-foreground shadow-sm cursor-default'
                      : internetSearch
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                  title={['compound', 'compound-mini'].includes(model) ? 'Web Search always enabled for this model' : undefined}
                >
                  <Globe className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {['compound', 'compound-mini'].includes(model) ? 'Web Search (Always On)' : 'Web Search'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Docs Source Toggle */}
          <Separator orientation="vertical" className="h-4 bg-border/50 mx-0.5" />

          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      id="tour-mode-selector"
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 relative active:scale-95 text-foreground">
                      <Database className="w-3.5 h-3.5" />
                      {/* Only show badge when NOT in ai-only mode */}
                      {dataSource !== 'ai-only' && selectedResources.size > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center">
                          {selectedResources.size}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" side="top" className="bg-popover border border-border z-50 shadow-xl rounded-xl">
                    {dataSources.map((d) => {
                      const isLocked = hasMessages && dataSource === d.value;
                      const menuItem = (
                        <DropdownMenuItem
                          key={d.value}
                          onClick={() => !hasMessages && setDataSource(d.value)}
                          disabled={hasMessages && dataSource !== d.value}
                          className={cn(
                            dataSource === d.value && 'bg-accent',
                            "py-2 flex items-center justify-between gap-2",
                            hasMessages && dataSource !== d.value && "cursor-not-allowed opacity-40"
                          )}
                        >
                          <span>{d.label}</span>
                          {isLocked && (
                            <span className="text-[10px] text-muted-foreground italic">
                              Locked
                            </span>
                          )}
                        </DropdownMenuItem>
                      );

                      if (isLocked) {
                        return (
                          <TooltipProvider key={d.value}>
                            <Tooltip delayDuration={200}>
                              <TooltipTrigger asChild>
                                {menuItem}
                              </TooltipTrigger>
                              <TooltipContent side="right" className="text-xs">
                                Mode locked after first message
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }

                      return menuItem;
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Data Source
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex-1" />

        {/* Model Selection */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
              "bg-background/50 border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-background hover:shadow-sm active:scale-95"
            )}>
              <Cpu className="w-3.5 h-3.5" />
              <span>{models.find(m => m.value === model)?.label}</span>
              {withReasoning && (
                <span className="text-primary font-semibold flex items-center gap-0.5 text-[10px] bg-primary/10 px-1.5 py-0.5 rounded-full animate-in fade-in duration-300">
                  +Reasoning
                </span>
              )}
              <ChevronDown className="w-3 h-3 opacity-50" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="bg-popover border border-border z-50 min-w-[200px] shadow-xl rounded-xl p-1">
            {models.map((m) => {
              const isDisabled = disabledModels.has(m.value) || (m.requiresAuth && isAnonymous);
              return (
                <DropdownMenuItem
                  key={m.value}
                  onClick={() => handleModelSelect(m)}
                  disabled={isDisabled}
                  className={cn(
                    model === m.value && 'bg-accent',
                    isDisabled && 'opacity-50',
                    "py-2 rounded-lg"
                  )}
                >
                  <span className="flex items-center gap-2 flex-1">
                    <span className="flex-1">{m.label}</span>
                    {m.isDefault && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Default</span>
                    )}
                    {m.visionSupport && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <ImageIcon className="w-2.5 h-2.5" />
                        Vision
                      </span>
                    )}
                    {m.webSearch && (
                      <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Globe className="w-2.5 h-2.5" />
                        Web
                      </span>
                    )}
                    {disabledModels.has(m.value) && (
                      <span className="text-[10px] bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-full">At Capacity</span>
                    )}
                    {m.requiresAuth && isAnonymous && (
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    )}
                  </span>
                </DropdownMenuItem>
              );
            })}

          </DropdownMenuContent>
        </DropdownMenu>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={
            !input.trim() ||
            isStreaming ||
            (currentChat?.attachments?.some(a => a.loading) ?? false) ||
            // Only require documents/resources for FIRST message in Documents/Hybrid mode
            // If chat already has messages, don't require new uploads
            (hasMessages
              ? false  // Follow-up messages: never require documents
              : (dataSource === 'documents' || dataSource === 'hybrid') &&
              (!currentChat?.attachments || currentChat.attachments.length === 0) &&
              selectedResources.size === 0)
          }
          size="icon"
          className={cn(
            "rounded-full h-9 w-9 shrink-0 transition-all duration-300 shadow-sm",
            input.trim() &&
              !isStreaming &&
              !(currentChat?.attachments?.some(a => a.loading) ?? false) &&
              !(hasMessages
                ? false
                : (dataSource === 'documents' || dataSource === 'hybrid') &&
                (!currentChat?.attachments || currentChat.attachments.length === 0) &&
                selectedResources.size === 0)
              ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90 hover:-translate-y-0.5"
              : "bg-muted text-muted-foreground opacity-50 shadow-none cursor-not-allowed"
          )}
        >
          {currentChat?.attachments?.some(a => a.loading) ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowUp className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );

  // ChatGPT-style message component with attachments visible
  const ChatMessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';
    const attachedFiles = message.attachments || [];

    if (isUser) {
      return (
        <div className="flex flex-col items-end gap-2">
          {/* User attachments above message - same style as search bar */}
          {attachedFiles && attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end max-w-[80%]">
              {attachedFiles.map(file => {
                const isImage = file.type === 'image';

                return (
                  <div
                    key={file.id}
                    onClick={() => openAttachmentPreview(file, file.id)}
                    className="flex items-center gap-2 pl-2 pr-3 py-2 bg-secondary/60 dark:bg-secondary/80 rounded-xl border border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
                  >
                    {/* Icon for file type */}
                    <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                      {isImage ? (
                        <ImageIcon className="w-4 h-4 text-primary" />
                      ) : (
                        <FileText className="w-4 h-4 text-primary" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase">
                        {getFileExtension(file.name)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {/* User message box */}
          <div className="max-w-[80%] bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      );
    }

    // Assistant message - left aligned, no box
    // Strip think tags from display (but keep for thinking animation detection)
    // Matches: <think>... (until </think> OR end of string)
    const displayContent = message.content.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim();

    // Code block with copy button
    const CodeBlock = ({ className, children, ...props }: any) => {
      const [copied, setCopied] = useState(false);
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');

      const handleCopy = async () => {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      return (
        <div className="relative group my-3 rounded-lg overflow-hidden border border-border/60 bg-[#1a1a2e] dark:bg-[#0d0d1a]">
          {/* Header with language tag */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#16162a] dark:bg-[#0a0a14] border-b border-border/40">
            <span className="text-xs font-medium text-primary/80 uppercase tracking-wide">
              {language || 'code'}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          {/* Code content */}
          <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
            <code className={cn("text-gray-200 font-mono", className)} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    };

    // Inline code styling
    const InlineCode = ({ children, ...props }: any) => (
      <code
        className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[0.85em] border border-primary/20"
        {...props}
      >
        {children}
      </code>
    );

    return (
      <div className="flex flex-col items-start gap-2 max-w-[85%]">
        <div className="text-sm text-foreground/90 leading-relaxed overflow-hidden">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Enhanced code blocks
              code({ node, inline, className, children, ...props }: any) {
                if (inline) {
                  return <InlineCode {...props}>{children}</InlineCode>;
                }
                return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
              },
              // Enhanced pre (wrapper removed, handled by CodeBlock)
              pre({ children, ...props }: any) {
                return <>{children}</>;
              },
              // Professional table styling
              table({ children, ...props }: any) {
                return (
                  <div className="my-4 overflow-x-auto rounded-lg border-2 border-border">
                    <table className="w-full text-sm border-collapse" {...props}>
                      {children}
                    </table>
                  </div>
                );
              },
              thead({ children, ...props }: any) {
                return (
                  <thead className="bg-primary/5 border-b-2 border-border" {...props}>
                    {children}
                  </thead>
                );
              },
              th({ children, ...props }: any) {
                return (
                  <th className="px-4 py-2.5 text-left font-semibold text-foreground/90 text-xs uppercase tracking-wide" {...props}>
                    {children}
                  </th>
                );
              },
              tbody({ children, ...props }: any) {
                return <tbody className="divide-y-2 divide-border" {...props}>{children}</tbody>;
              },
              tr({ children, ...props }: any) {
                return (
                  <tr className="hover:bg-secondary/30 transition-colors border-b border-border" {...props}>
                    {children}
                  </tr>
                );
              },
              td({ children, ...props }: any) {
                return (
                  <td className="px-4 py-2.5 text-foreground/80 border-r border-border/50 last:border-r-0" {...props}>
                    {children}
                  </td>
                );
              },
              // Enhanced headings
              h1({ children, ...props }: any) {
                return <h1 className="text-xl font-bold text-foreground mt-6 mb-3 pb-2 border-b border-border/40" {...props}>{children}</h1>;
              },
              h2({ children, ...props }: any) {
                return <h2 className="text-lg font-semibold text-foreground mt-5 mb-2" {...props}>{children}</h2>;
              },
              h3({ children, ...props }: any) {
                return <h3 className="text-base font-semibold text-foreground mt-4 mb-2" {...props}>{children}</h3>;
              },
              // Enhanced lists
              ul({ children, ...props }: any) {
                return <ul className="my-2 ml-4 space-y-1 list-disc marker:text-primary/60" {...props}>{children}</ul>;
              },
              ol({ children, ...props }: any) {
                return <ol className="my-2 ml-4 space-y-1 list-decimal marker:text-primary/60" {...props}>{children}</ol>;
              },
              li({ children, ...props }: any) {
                return <li className="text-foreground/85 pl-1" {...props}>{children}</li>;
              },
              // Enhanced paragraphs
              p({ children, ...props }: any) {
                return <p className="my-2 text-foreground/85 leading-relaxed" {...props}>{children}</p>;
              },
              // Enhanced blockquotes
              blockquote({ children, ...props }: any) {
                return (
                  <blockquote className="my-3 pl-4 border-l-2 border-primary/40 text-muted-foreground italic" {...props}>
                    {children}
                  </blockquote>
                );
              },
              // Enhanced links
              a({ children, href, ...props }: any) {
                return (
                  <a
                    href={href}
                    className="text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/40 hover:decoration-primary transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                  >
                    {children}
                  </a>
                );
              },
              // Horizontal rule
              hr({ ...props }: any) {
                return <hr className="my-4 border-border/50" {...props} />;
              },
              // Strong/Bold
              strong({ children, ...props }: any) {
                return <strong className="font-semibold text-foreground" {...props}>{children}</strong>;
              },
              // Emphasis/Italic
              em({ children, ...props }: any) {
                return <em className="italic text-foreground/90" {...props}>{children}</em>;
              },
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
        {/* Action buttons - only show when message is complete (has content and not streaming) */}
        {message.content && !isStreaming && (
          <div className="flex items-center gap-1 mt-1">
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Copy className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <ThumbsDown className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Share className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Animated dots component for "Thinking" status
  const AnimatedDots = () => {
    return (
      <span className="inline-flex ml-1">
        <span className="animate-pulse duration-1000">.</span>
        <span className="animate-pulse duration-1000 delay-150">.</span>
        <span className="animate-pulse duration-1000 delay-300">.</span>
      </span>
    );
  };

  // Loading indicator - Clean minimal style
  const LoadingIndicator = () => {
    return (
      <div className="flex items-start gap-3 max-w-[85%]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">
            {isThinking ? (
              <span>Thinking<AnimatedDots /></span>
            ) : (
              <span>Generating response<AnimatedDots /></span>
            )}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={cn(
        "flex flex-col h-screen relative transition-all duration-300",
        // Desktop: margin for fixed sidebar
        "xl:mr-0",
        docsSidebarOpen && "xl:mr-72"
      )}>
        {/* Documents button - positioned absolutely in top-right */}
        {!docsSidebarOpen && (
          <div className="absolute top-4 right-4 z-30 flex items-center gap-2">

            <Button
              variant="outline"
              size="sm"
              id="tour-documents-trigger"
              onClick={() => setDocsSidebarOpen(!docsSidebarOpen)}
              className="gap-2 bg-background/80 backdrop-blur-sm h-9 sm:h-8"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </Button>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={documentInputRef}
          type="file"
          accept={supportedDocFormats.join(',')}
          multiple
          className="hidden"
          onChange={handleDocumentSelect}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto pb-safe">
          {isNewChat ? (
            // Centered search bar for new chat
            <div className="h-full flex flex-col items-center justify-center p-4 md:p-6 pt-16 sm:pt-6">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-foreground mb-2">
                Welcome to CorpusAI
              </h2>
              <p className="text-muted-foreground text-center max-w-md text-xs sm:text-sm mb-6 sm:mb-8 px-4">
                Upload documents and ask questions. I'll help you find answers using AI-powered retrieval.
              </p>

              {/* Uploaded files display */}
              <div className="w-full max-w-2xl px-4 sm:px-0" id="tour-chat-input">
                {renderUploadedFiles()}
                {renderSearchBar()}

                {/* Try Example Suggestions - Click fills input */}
                <div className={cn(
                  "flex items-center justify-center gap-2 mt-4 flex-wrap transition-opacity duration-200 min-h-[32px]",
                  input.trim() ? "opacity-0 pointer-events-none" : "opacity-100"
                )}>
                  <span className="text-xs text-muted-foreground hidden sm:inline">Try:</span>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors min-h-[32px] sm:min-h-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // ChatGPT-style conversation layout
            <div className="max-w-3xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-24 sm:pb-6">
              {/* Scope Lock Indicator */}
              {currentChat?.scope_locked && (currentChat?.scope_resources?.length > 0 || currentChat?.scope_images?.length > 0) && (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground mb-1">
                      🔒 This chat is locked to selected documents
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {currentChat.scope_resources?.map((r) => (
                        <span key={r.id} className="text-xs px-2 py-1 bg-background rounded border border-border inline-flex items-center gap-1.5">
                          <FileText className="w-3 h-3" />
                          {r.file_name}
                          {r.expires_at && new Date(r.expires_at) < new Date() && (
                            <span className="text-red-500">(Expired)</span>
                          )}
                        </span>
                      ))}
                      {currentChat.scope_images?.map((i) => (
                        <span key={i.id} className="text-xs px-2 py-1 bg-background rounded border border-border inline-flex items-center gap-1.5">
                          <ImageIcon className="w-3 h-3" />
                          {i.file_name}
                        </span>
                      ))}
                    </div>
                    {currentChat.scope_resources?.some(r => r.expires_at) && (
                      <p className="text-xs text-muted-foreground mt-2">
                        📅 Chat uploads are available for 24 hours
                      </p>
                    )}
                  </div>
                </div>
              )}
              {currentChat?.messages.map((message) => (
                <ChatMessageBubble key={message.id} message={message} />
              ))}
              {isStreaming && <LoadingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Fixed bottom on mobile, relative on desktop */}
        {hasMessages && (
          <div className="sticky bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-background via-background to-transparent pb-safe sm:relative">
            <div className="w-full mx-auto" style={{ maxWidth: '720px' }}>
              {renderUploadedFiles()}
              {renderSearchBar()}
            </div>
          </div>
        )}

        {/* Image Preview Dialog */}
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-3xl p-1 bg-background/95 backdrop-blur-sm border border-border">
            <div className="relative">
              {previewImage && (
                <>
                  <img
                    src={previewImage.url}
                    alt={previewImage.name}
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white">
                    {previewImage.name}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Document Selection Sidebar - Sheet on mobile/tablet, fixed on desktop */}
        {/* Mobile/Tablet Drawer - Only render on mobile/tablet */}
        {!isDesktop && (
          <Sheet open={docsSidebarOpen} onOpenChange={setDocsSidebarOpen}>
            <SheetContent side="right" className="w-80 p-0">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Select Resources</h3>
                </div>

                <div className="p-3 border-b border-border">
                  <div className="relative flex items-center">
                    <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 flex items-center justify-center">
                  <div className="text-center max-w-sm">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-sm text-muted-foreground mb-4">
                      No permanent resources available
                    </p>
                    <Button
                      onClick={() => {
                        setDocsSidebarOpen(false);
                        navigate('/documents', { state: { openAddDialog: true } });
                      }}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Resources
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Add documents to permanent storage
                    </p>
                  </div>
                </div>

                <div className="p-3 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center">
                    Or upload temporary files using the attachment button
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Desktop Fixed Sidebar */}
        <div className={cn(
          "hidden xl:flex fixed top-0 right-0 h-full w-80 bg-card border-l border-border z-[100] flex-col transition-transform duration-300 ease-in-out shadow-xl",
          docsSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Select Resources</h3>
            <button
              onClick={() => setDocsSidebarOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 border-b border-border">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {permanentResources.length > 0 ? (
              <div className="space-y-2">
                {permanentResources
                  .filter(r => r.file_name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((resource) => (
                    <div
                      key={resource.id}
                      onClick={() => toggleResource(resource.id)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedResources.has(resource.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 bg-card"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn(
                          "w-4 h-4 mt-0.5 flex-shrink-0 grid place-items-center rounded-sm border",
                          selectedResources.has(resource.id)
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/30"
                        )}>
                          {selectedResources.has(resource.id) && <Check className="w-3 h-3" />}
                        </div>
                        <FileText className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {resource.file_name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {resource.resource_type === 'file_upload' ? 'Uploaded' : 'Web Import'} •
                            {resource.status === 'processed' ? ' Ready' : ' Processing'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No permanent resources available
                  </p>
                  <Button
                    onClick={() => {
                      setDocsSidebarOpen(false);
                      navigate('/documents', { state: { openAddDialog: true } });
                    }}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Resources
                  </Button>
                  <p className="text-xs text-muted-foreground mt-3">
                    Add documents to permanent storage
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Or upload temporary files using the attachment button
            </p>
          </div>
        </div>
      </div>

      {/* Attachment Preview Modal */}
      <Dialog open={attachmentPreviewOpen} onOpenChange={setAttachmentPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 gap-0 [&>button]:hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {previewAttachmentInfo?.type === 'image' ? (
                  <ImageIcon className="w-5 h-5 text-primary" />
                ) : (
                  <FileText className="w-5 h-5 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{previewAttachmentInfo?.name || 'File Preview'}</h3>
                <p className="text-xs text-muted-foreground">{previewAttachmentInfo?.type?.toUpperCase() || 'DOCUMENT'}</p>
              </div>
            </div>
            <button
              onClick={() => setAttachmentPreviewOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {attachmentPreviewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Loading preview...</span>
              </div>
            ) : attachmentPreviewData ? (
              <>
                {/* Image Preview */}
                {attachmentPreviewData.type === 'image' && attachmentPreviewData.content && (
                  <div className="flex items-center justify-center bg-secondary/30 rounded-lg p-4">
                    <img
                      src={`data:${attachmentPreviewData.mime_type};base64,${attachmentPreviewData.content}`}
                      alt={attachmentPreviewData.file_name || 'Image preview'}
                      className="max-w-full max-h-[60vh] object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* PDF Preview */}
                {attachmentPreviewData.type === 'pdf' && attachmentPreviewData.content && (
                  <div className="w-full h-[70vh] rounded-lg overflow-hidden border border-border">
                    <iframe
                      src={`data:application/pdf;base64,${attachmentPreviewData.content}`}
                      className="w-full h-full"
                      title={attachmentPreviewData.file_name || 'PDF Preview'}
                    />
                  </div>
                )}

                {/* Text Preview */}
                {(attachmentPreviewData.type === 'text' || attachmentPreviewData.type === 'web') && (
                  <div className="bg-secondary/30 rounded-lg p-4">
                    {attachmentPreviewData.source_url && (
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                        <Globe className="w-4 h-4 text-primary" />
                        <a
                          href={attachmentPreviewData.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate"
                        >
                          {attachmentPreviewData.source_url}
                        </a>
                      </div>
                    )}
                    <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed max-h-[50vh] overflow-y-auto">
                      {attachmentPreviewData.content || 'No content available'}
                    </pre>
                  </div>
                )}

                {/* DOCX/Binary - offer download */}
                {(attachmentPreviewData.type === 'docx' || attachmentPreviewData.type === 'binary') && (
                  <div className="bg-secondary/30 rounded-lg p-8 text-center">
                    <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground mb-2">{attachmentPreviewData.file_name}</p>
                    <p className="text-xs text-muted-foreground mb-4">This file type cannot be previewed.</p>
                    {attachmentPreviewData.content && (
                      <a
                        href={`data:${attachmentPreviewData.mime_type || 'application/octet-stream'};base64,${attachmentPreviewData.content}`}
                        download={attachmentPreviewData.file_name}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <File className="w-4 h-4" />
                        Download File
                      </a>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Could not load preview</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Menu and Contact Popover */}
      <div className="fixed bottom-6 right-6 z-50">
        <Popover open={helpMenuOpen} onOpenChange={(open) => {
          setHelpMenuOpen(open);
          if (!open) {
            // Reset to menu view after a short delay to allow closing animation
            setTimeout(() => setShowContactForm(false), 300);
          }
        }}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-10 h-10 rounded-full transition-all duration-300 shadow-sm",
                helpMenuOpen ? "bg-primary text-primary-foreground rotate-90" : "bg-transparent hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {helpMenuOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="top"
            sideOffset={10}
            className={cn(
              "mb-2 p-0 overflow-hidden rounded-3xl border border-border shadow-xl",
              "transition-[width,height] duration-500 ease-&lsqb;cubic-bezier(0.32,0.72,0,1)&rsqb;",
              showContactForm ? "w-[400px]" : "w-64",
              // Ensure entry animation is from bottom
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=top]:slide-in-from-bottom-2"
            )}
          >
            <div className={cn(
              "transition-all duration-500 ease-&lsqb;cubic-bezier(0.32,0.72,0,1)&rsqb;",
              // Use a wrapper to help smooth height transitions if possible, or just let content dictate
            )}>
              {!showContactForm ? (
                <div className="flex flex-col p-1.5 animate-in fade-in zoom-in-95 duration-300">
                  <a
                    href="/get-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-secondary hover:text-secondary-foreground"
                    onClick={() => setHelpMenuOpen(false)}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mr-2.5 text-primary">
                      <HelpCircle className="h-3.5 w-3.5" />
                    </div>
                    <span>Get Started</span>
                  </a>
                  <div
                    onClick={() => setShowContactForm(true)}
                    className="relative flex cursor-pointer select-none items-center rounded-xl px-3 py-2 text-sm font-medium outline-none transition-colors hover:bg-secondary hover:text-secondary-foreground"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 mr-2.5 text-primary">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <span>Contact Support</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-secondary/30">
                    <h4 className="font-semibold">Contact Support</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 rounded-full hover:bg-background"
                      onClick={() => setShowContactForm(false)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="name">
                        Name
                      </label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="h-10 rounded-xl bg-secondary/50 border-transparent focus:border-primary focus:bg-background transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="email">
                        Email
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="h-10 rounded-xl bg-secondary/50 border-transparent focus:border-primary focus:bg-background transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="message">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="How can we help?"
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="min-h-[100px] rounded-xl bg-secondary/50 border-transparent focus:border-primary focus:bg-background resize-none transition-all"
                      />
                    </div>
                    <Button
                      className="w-full h-11 rounded-xl font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                      onClick={async () => {
                        if (!contactName || !contactEmail || !contactMessage) return;

                        setContactSubmitting(true);

                        try {
                          const formPayload = new FormData();
                          formPayload.append('access_key', import.meta.env.VITE_WEB3FORMS_ACCESS_KEY);
                          formPayload.append('name', contactName);
                          formPayload.append('email', contactEmail);
                          formPayload.append('subject', 'Contact Support - CorpusAI Chat');
                          formPayload.append('message', contactMessage);

                          const response = await fetch('https://api.web3forms.com/submit', {
                            method: 'POST',
                            body: formPayload,
                          });

                          const data = await response.json();

                          if (data.success) {
                            showNotification('success', 'Message Sent', 'We\'ll get back to you soon!');
                            setContactName('');
                            setContactEmail('');
                            setContactMessage('');
                            setHelpMenuOpen(false);
                            setTimeout(() => setShowContactForm(false), 300);
                          } else {
                            showNotification('error', 'Failed to Send', 'Please try again later.');
                          }
                        } catch (error) {
                          showNotification('error', 'Error', 'An error occurred. Please try again.');
                        } finally {
                          setContactSubmitting(false);
                        }
                      }}
                      disabled={contactSubmitting || !contactName || !contactEmail || !contactMessage}
                    >
                      {contactSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}