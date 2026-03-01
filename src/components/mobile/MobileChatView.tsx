import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, Plus, ArrowUp, Loader2, FileText, Image as ImageIcon, X, Check, Copy,
  ThumbsUp, ThumbsDown, Globe, ChevronDown, Cpu, Database, Lock,
  Paperclip, Sparkles, SquarePen, Clock, Pin, FileType, ZoomIn, AlertCircle
} from 'lucide-react';
import { useChat, AIModel, DataSource, Message } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AttachedFile } from '@/components/chat/AttachmentMenu';
import { useNotification } from '@/components/notifications/NotificationProvider';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { BehaviorSlider } from '@/components/chat/BehaviorSlider';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/* ─────────────────────── Types & Constants ─────────────────────── */

interface MobileChatViewProps {
  onOpenSidebar: () => void;
}

const supportedDocFormats = ['.pdf', '.docx', '.doc', '.txt', '.md', '.png', '.jpg', '.jpeg'];

const models: { value: AIModel; label: string; visionSupport?: boolean; webSearch?: boolean; isDefault?: boolean }[] = [
  { value: 'compound', label: 'Compound', webSearch: true },
  { value: 'compound-mini', label: 'Compound Mini', webSearch: true },
  { value: 'llama-scout-4', label: 'Llama 4 Scout', visionSupport: true, isDefault: true },
  { value: 'kimi-k2', label: 'Kimi K2' },
  { value: 'gpt-oss-120b', label: 'GPT OSS 120B' },
  { value: 'gpt-4o', label: 'GPT-4o', visionSupport: true },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', visionSupport: true },
];

const dataSources: { value: DataSource; label: string; desc: string }[] = [
  { value: 'documents', label: 'Documents', desc: 'Search your uploaded files' },
  { value: 'hybrid', label: 'Hybrid', desc: 'Docs + AI knowledge combined' },
  { value: 'ai-only', label: 'AI Only', desc: 'Pure AI, no document context' },
];

const quickActions = [
  { icon: '📝', label: 'Summarize my documents', action: 'Summarize my documents' },
  { icon: '🔍', label: 'Find key information', action: 'Find key information in my documents' },
  { icon: '💡', label: 'Explain a concept', action: 'Explain this concept simply' },
  { icon: '📊', label: 'Compare & analyze', action: 'Compare and analyze the data' },
];

/* ─────────────────────────── Helpers ────────────────────────────── */

const getFileExtension = (filename: string) =>
  filename.split('.').pop()?.toUpperCase() || 'FILE';

const isImageFile = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '');
};

const isPdfFile = (filename: string) =>
  filename.split('.').pop()?.toLowerCase() === 'pdf';

/* ─────────────────────── Animated Dots ──────────────────────────── */

const AnimatedDots = () => (
  <span className="inline-flex ml-0.5">
    <span className="animate-pulse duration-1000">.</span>
    <span className="animate-pulse duration-1000 [animation-delay:150ms]">.</span>
    <span className="animate-pulse duration-1000 [animation-delay:300ms]">.</span>
  </span>
);

/* ─────────────────────── Citation Regex ─────────────────────────── */

const CITATION_REGEX = /\[📄\s+(.+?)\s+p\.(\d+)\]/g;

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════════ */

export function MobileChatView({ onOpenSidebar }: MobileChatViewProps) {
  const {
    currentChat,
    sendMessage,
    addAttachments,
    removeAttachment,
    model,
    setModel,
    dataSource,
    setDataSource,
    behaviorMode,
    setBehaviorMode,
    internetSearch,
    setInternetSearch,
    isStreaming,
    isThinking,
    streamError,
    createNewChat,
    disabledModels,
    userUsage,
  } = useChat();
  const { user, isAnonymous, incrementMessageCount } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);
  const [attachmentSheetOpen, setAttachmentSheetOpen] = useState(false);
  const [toolbarExpanded, setToolbarExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasMessages = currentChat && currentChat.messages.length > 0;
  const isNewChat = !currentChat || currentChat.messages.length === 0;
  const userName = user?.username?.split(' ')[0] || 'there';
  const isCompound = ['compound', 'compound-mini'].includes(model);

  /* ── Scroll to bottom on new messages ─────────────────────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, isStreaming]);

  /* ── Auto-grow textarea ───────────────────────────────────────── */
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  /* ── Show stream errors ───────────────────────────────────────── */
  useEffect(() => {
    if (streamError) {
      showNotification('stream_error', 'Error', streamError);
    }
  }, [streamError, showNotification]);

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleSend = async () => {
    if (!input.trim()) return;
    if (isAnonymous && !incrementMessageCount()) {
      showNotification('rate_limit_daily', 'Daily Limit Reached', 'Your daily usage limit has been reached.');
      return;
    }
    const message = input;
    setInput('');
    setToolbarExpanded(false);
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    textareaRef.current?.focus();
  };

  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const invalidFiles = Array.from(files).filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return !supportedDocFormats.includes(ext);
    });

    if (invalidFiles.length > 0) {
      showNotification('unsupported_format', 'Unsupported Format', 'Please upload PDF, DOCX, TXT, or image files.');
      return;
    }

    const timestamp = Date.now();
    const newAttachments: AttachedFile[] = Array.from(files).map((file, index) => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '');
      return {
        id: `${timestamp}_${index}`,
        name: file.name,
        type: isImage ? 'image' : 'document',
        file,
        loading: false,
      };
    });

    await addAttachments(newAttachments);
    e.target.value = '';
    setAttachmentSheetOpen(false);
  };

  /* ────────────────────── Citation Rendering ───────────────────── */

  const buildSourceMaps = (sourceChunks: Message['sourceChunks']) => {
    const sourceMap = new Map<string, string>();
    const sourceMapLower = new Map<string, string>();
    const indexMap = new Map<string, { fileName: string; resourceId: string }>();
    if (!sourceChunks) return { sourceMap, sourceMapLower, indexMap };

    for (let i = 0; i < sourceChunks.length; i++) {
      const chunk = sourceChunks[i];
      if (chunk.source && chunk.resource_id) {
        sourceMap.set(chunk.source, chunk.resource_id);
        sourceMapLower.set(chunk.source.toLowerCase(), chunk.resource_id);
        const docKey = `doc_${i + 1}`;
        if (!indexMap.has(docKey)) {
          indexMap.set(docKey, { fileName: chunk.source, resourceId: chunk.resource_id });
        }
      }
    }
    return { sourceMap, sourceMapLower, indexMap };
  };

  const resolveCitation = (
    rawName: string,
    maps: ReturnType<typeof buildSourceMaps>
  ): { resourceId: string; displayName: string } | null => {
    if (maps.sourceMap.has(rawName)) return { resourceId: maps.sourceMap.get(rawName)!, displayName: rawName };
    if (maps.sourceMapLower.has(rawName.toLowerCase())) return { resourceId: maps.sourceMapLower.get(rawName.toLowerCase())!, displayName: rawName };
    if (maps.indexMap.has(rawName.toLowerCase())) {
      const info = maps.indexMap.get(rawName.toLowerCase())!;
      return { resourceId: info.resourceId, displayName: info.fileName };
    }
    return null;
  };

  const renderWithCitations = (text: string, maps: ReturnType<typeof buildSourceMaps>): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const re = new RegExp(CITATION_REGEX.source, 'g');

    while ((match = re.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      const rawFileName = match[1];
      const page = parseInt(match[2], 10);
      const resolved = resolveCitation(rawFileName, maps);

      parts.push(
        resolved ? (
          <span
            key={`cite-${match.index}`}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium border border-primary/20"
          >
            <FileText className="w-3 h-3" />
            <span className="max-w-[100px] truncate">{resolved.displayName}</span>
            <span className="opacity-70">p.{page}</span>
          </span>
        ) : (
          <span
            key={`cite-${match.index}`}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md bg-muted text-muted-foreground text-[11px] font-medium border border-border/50"
          >
            <FileText className="w-3 h-3" />
            <span className="max-w-[100px] truncate">{rawFileName}</span>
            <span className="opacity-70">p.{page}</span>
          </span>
        )
      );
      lastIndex = re.lastIndex;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.length > 0 ? <>{parts}</> : text;
  };

  /* ────────────────────── Code Block ───────────────────────────── */

  const CodeBlock = ({ className: cn2, children, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const langMatch = /language-(\w+)/.exec(cn2 || '');
    const language = langMatch ? langMatch[1] : '';
    const codeString = String(children).replace(/\n$/, '');

    return (
      <div className="relative my-3 rounded-xl overflow-hidden border border-border/60 bg-[#1a1a2e] dark:bg-[#0d0d1a]">
        <div className="flex items-center justify-between px-3 py-2 bg-[#16162a] dark:bg-[#0a0a14] border-b border-border/40">
          <span className="text-xs font-medium text-primary/80 uppercase tracking-wide">
            {language || 'code'}
          </span>
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(codeString);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        <pre className="p-3 overflow-x-auto text-sm leading-relaxed">
          <code className={cn('text-gray-200 font-mono', cn2)} {...props}>{children}</code>
        </pre>
      </div>
    );
  };

  /* ────────────────────── Message Bubble ────────────────────────── */

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = useState(false);
    const displayContent = message.content.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim();
    const maps = !isUser ? buildSourceMaps(message.sourceChunks) : null;
    const attachedFiles = message.attachments || [];

    const handleCopy = async () => {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (isUser) {
      return (
        <div className="flex flex-col items-end gap-1.5">
          {/* Attachments above user message */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end max-w-[85%]">
              {attachedFiles.map(file => (
                <div key={file.id} className="flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 bg-secondary/60 rounded-xl border border-border/50 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-background flex items-center justify-center">
                    {isPdfFile(file.name) ? <FileType className="w-3.5 h-3.5 text-red-500" /> :
                      file.type === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-primary" /> :
                        <FileText className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <span className="font-medium truncate max-w-[80px]">{file.name}</span>
                </div>
              ))}
            </div>
          )}
          <div className="max-w-[85%] bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-br-md">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      );
    }

    // Assistant
    return (
      <div className="flex flex-col items-start gap-1">
        <div className="max-w-[92%] text-sm text-foreground/90 leading-relaxed overflow-hidden">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className: codeCn, children, ...p }: any) {
                if (inline) {
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[0.85em] border border-primary/20" {...p}>
                      {children}
                    </code>
                  );
                }
                return <CodeBlock className={codeCn} {...p}>{children}</CodeBlock>;
              },
              pre: ({ children }: any) => <>{children}</>,
              table: ({ children, ...p }: any) => (
                <div className="my-3 overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm border-collapse" {...p}>{children}</table>
                </div>
              ),
              thead: ({ children, ...p }: any) => <thead className="bg-primary/5 border-b border-border" {...p}>{children}</thead>,
              th: ({ children, ...p }: any) => <th className="px-3 py-2 text-left font-semibold text-foreground/90 text-xs uppercase tracking-wide" {...p}>{children}</th>,
              tbody: ({ children, ...p }: any) => <tbody className="divide-y divide-border" {...p}>{children}</tbody>,
              tr: ({ children, ...p }: any) => <tr className="hover:bg-secondary/30 transition-colors" {...p}>{children}</tr>,
              td: ({ children, ...p }: any) => <td className="px-3 py-2 text-foreground/80" {...p}>{children}</td>,
              h1: ({ children, ...p }: any) => <h1 className="text-lg font-bold text-foreground mt-5 mb-2 pb-1.5 border-b border-border/40" {...p}>{children}</h1>,
              h2: ({ children, ...p }: any) => <h2 className="text-base font-semibold text-foreground mt-4 mb-1.5" {...p}>{children}</h2>,
              h3: ({ children, ...p }: any) => <h3 className="text-sm font-semibold text-foreground mt-3 mb-1.5" {...p}>{children}</h3>,
              ul: ({ children, ...p }: any) => <ul className="my-2 ml-4 space-y-1 list-disc marker:text-primary/60" {...p}>{children}</ul>,
              ol: ({ children, ...p }: any) => <ol className="my-2 ml-4 space-y-1 list-decimal marker:text-primary/60" {...p}>{children}</ol>,
              p: ({ children, ...p }: any) => {
                const processNode = (node: React.ReactNode): React.ReactNode => {
                  if (typeof node === 'string') return maps ? renderWithCitations(node, maps) : node;
                  if (Array.isArray(node)) return node.map((n, i) => <React.Fragment key={i}>{processNode(n)}</React.Fragment>);
                  return node;
                };
                return <p className="my-1.5 text-foreground/85 leading-relaxed" {...p}>{processNode(children)}</p>;
              },
              li: ({ children, ...p }: any) => {
                const processNode = (node: React.ReactNode): React.ReactNode => {
                  if (typeof node === 'string') return maps ? renderWithCitations(node, maps) : node;
                  if (Array.isArray(node)) return node.map((n, i) => <React.Fragment key={i}>{processNode(n)}</React.Fragment>);
                  return node;
                };
                return <li className="text-foreground/85 pl-1" {...p}>{processNode(children)}</li>;
              },
              blockquote: ({ children, ...p }: any) => (
                <blockquote className="my-2 pl-3 border-l-2 border-primary/40 text-muted-foreground italic" {...p}>{children}</blockquote>
              ),
              a: ({ children, href, ...p }: any) => (
                <a href={href} className="text-primary hover:text-primary/80 underline underline-offset-2 decoration-primary/40" target="_blank" rel="noopener noreferrer" {...p}>
                  {children}
                </a>
              ),
              hr: () => <hr className="my-4 border-border/50" />,
              strong: ({ children, ...p }: any) => <strong className="font-semibold text-foreground" {...p}>{children}</strong>,
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-0.5 mt-1">
          <button onClick={handleCopy} className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary active:bg-secondary/80 transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary active:bg-secondary/80 transition-colors">
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-full text-muted-foreground hover:bg-secondary active:bg-secondary/80 transition-colors">
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  /* ────────────────────── Uploaded Files ────────────────────────── */

  const renderUploadedFiles = () => {
    const attachments = currentChat?.attachments || [];
    if (attachments.length === 0) return null;

    return (
      <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
        {attachments.map(attachment => (
          <div key={attachment.id} className="relative flex items-center gap-2 pl-2 pr-7 py-2 bg-secondary/70 rounded-xl border border-border/50 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
              {attachment.loading ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> :
                isPdfFile(attachment.name) ? <FileType className="w-4 h-4 text-red-500" /> :
                  isImageFile(attachment.name) ? <ImageIcon className="w-4 h-4 text-primary" /> :
                    <FileText className="w-4 h-4 text-primary" />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium truncate max-w-[80px]">{attachment.name}</span>
              <span className="text-[10px] text-muted-foreground uppercase">
                {attachment.loading ? 'Uploading...' : getFileExtension(attachment.name)}
              </span>
            </div>
            <button
              onClick={() => removeAttachment(attachment.id)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-destructive/80 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  /* ────────────────────── Scope Lock Banner ─────────────────────── */

  const renderScopeLock = () => {
    if (!currentChat?.scope_locked) return null;
    const resources = currentChat.scope_resources || [];
    const images = currentChat.scope_images || [];
    if (resources.length === 0 && images.length === 0) return null;

    return (
      <div className="mx-0 mb-2 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl py-2 px-3 flex items-center gap-2 overflow-hidden">
        <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {resources.map(r => (
            <span key={r.id} className="flex items-center gap-1 px-1.5 py-0.5 bg-background/50 rounded-md border border-primary/10 text-[10px] whitespace-nowrap">
              <Database className="w-2.5 h-2.5 text-primary/70" />
              <span className="font-medium text-foreground/80 truncate max-w-[80px]">{r.file_name}</span>
            </span>
          ))}
          {images.map(i => (
            <span key={i.id} className="flex items-center gap-1 px-1.5 py-0.5 bg-background/50 rounded-md border border-primary/10 text-[10px] whitespace-nowrap">
              <ImageIcon className="w-2.5 h-2.5 text-primary/70" />
              <span className="font-medium text-foreground/80 truncate max-w-[80px]">{i.file_name}</span>
            </span>
          ))}
        </div>
      </div>
    );
  };

  /* ════════════════════════ RENDER ══════════════════════════════ */

  return (
    <div className="flex flex-col h-screen w-full bg-background">

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <button
          onClick={onOpenSidebar}
          className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-secondary transition-colors active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Model selector trigger — tap to open bottom sheet */}
        <button
          onClick={() => setModelSheetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/40 active:scale-[0.97] transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {models.find(m => m.value === model)?.label || model}
          </span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>

        <button
          onClick={createNewChat}
          className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-secondary transition-colors active:scale-95"
        >
          <SquarePen className="w-5 h-5" />
        </button>
      </header>

      {/* Hidden file input */}
      <input
        ref={documentInputRef}
        type="file"
        accept={supportedDocFormats.join(',')}
        multiple
        className="hidden"
        onChange={handleDocumentSelect}
      />

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {isNewChat ? (
          /* ── Welcome Screen ─────────────────────────────────── */
          <div className="flex flex-col px-5 pt-10 pb-4">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm mb-1">Hi {userName}</p>
              <h2 className="text-2xl font-semibold text-foreground leading-tight">
                How can I help you today?
              </h2>
            </div>

            {/* Quick Action Chips */}
            <div className="flex flex-col gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex items-center gap-3 px-4 py-3.5 bg-secondary/50 hover:bg-secondary/80 active:bg-secondary rounded-2xl text-left transition-colors border border-border/30"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Usage indicator */}
            {userUsage && (
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>
                  {userUsage.queries.used}/{userUsage.queries.limit} queries &middot; {userUsage.pages.used}/{userUsage.pages.limit} pages
                </span>
              </div>
            )}
          </div>
        ) : (
          /* ── Chat Messages ──────────────────────────────────── */
          <div className="px-4 py-3 space-y-4 pb-2">
            {renderScopeLock()}
            {currentChat?.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isStreaming && (
              <div className="flex items-center gap-2 text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm">
                  {isThinking ? <>Thinking<AnimatedDots /></> : <>Generating<AnimatedDots /></>}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ── Bottom Input Area ───────────────────────────────────── */}
      <div className="border-t border-border bg-background px-3 py-2.5 pb-safe">
        {/* Uploaded Files */}
        {renderUploadedFiles()}

        {/* Input Container */}
        <div className="bg-secondary/40 border border-border/50 rounded-2xl overflow-hidden shadow-sm focus-within:border-border focus-within:shadow-md transition-all">
          {/* Textarea Row */}
          <div className="flex items-end gap-2 px-3 py-2.5">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask CorpusAI..."
              className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground/70 min-h-[24px] max-h-[120px] text-[15px] py-0.5 leading-normal"
              rows={1}
            />
          </div>

          {/* ── Toolbar Row ─────────────────────────────────── */}
          <div className="flex items-center justify-between px-2.5 pb-2.5 gap-1">
            <div className="flex items-center gap-0.5">
              {/* Attachment */}
              <button
                onClick={() => setAttachmentSheetOpen(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors active:scale-95"
              >
                <Plus className="w-5 h-5" />
              </button>

              {/* Web Search Toggle */}
              <button
                onClick={isCompound ? undefined : () => setInternetSearch(!internetSearch)}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95',
                  isCompound
                    ? 'bg-primary/20 text-primary cursor-default'
                    : internetSearch
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                )}
              >
                <Globe className="w-4 h-4" />
              </button>

              {/* Data Source */}
              <button
                onClick={() => setSourceSheetOpen(true)}
                disabled={!!hasMessages}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95',
                  hasMessages ? 'text-muted-foreground/40 cursor-not-allowed' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                )}
              >
                <Database className="w-4 h-4" />
              </button>

              {/* Expand toolbar toggle */}
              <button
                onClick={() => setToolbarExpanded(!toolbarExpanded)}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95',
                  toolbarExpanded ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                )}
              >
                <ChevronDown className={cn('w-4 h-4 transition-transform', toolbarExpanded && 'rotate-180')} />
              </button>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={
                !input.trim() || isStreaming || (currentChat?.attachments?.some(a => a.loading) ?? false)
              }
              size="icon"
              className={cn(
                'rounded-full h-8 w-8 transition-all shadow-sm',
                input.trim() && !isStreaming
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground opacity-50'
              )}
            >
              {currentChat?.attachments?.some(a => a.loading) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* ── Expanded Toolbar ─────────────────────────────── */}
          {toolbarExpanded && (
            <div className="px-3 pb-3 pt-1 border-t border-border/30 space-y-3 animate-in slide-in-from-top-2 duration-200">
              {/* Behavior Mode */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Behavior</span>
                <BehaviorSlider value={behaviorMode} onChange={setBehaviorMode} />
              </div>

              {/* Data Source (visual) */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Source</span>
                <div className="flex items-center gap-1 p-0.5 bg-background/50 rounded-full border border-border/30">
                  {dataSources.map(d => (
                    <button
                      key={d.value}
                      onClick={() => !hasMessages && setDataSource(d.value)}
                      disabled={!!hasMessages && dataSource !== d.value}
                      className={cn(
                        'px-2.5 py-1 text-[10px] font-medium rounded-full transition-all whitespace-nowrap',
                        dataSource === d.value
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : hasMessages
                            ? 'text-muted-foreground/40 cursor-not-allowed'
                            : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current mode info */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                {isCompound && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                    <Globe className="w-2.5 h-2.5" /> Web Search On
                  </span>
                )}
                {hasMessages && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                    <Lock className="w-2.5 h-2.5" /> Source Locked
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Model Selection Bottom Sheet ────────────────────────── */}
      <Sheet open={modelSheetOpen} onOpenChange={setModelSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-8 max-h-[70vh]">
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
          <h3 className="text-base font-semibold text-foreground px-5 mb-3">Choose Model</h3>
          <div className="overflow-y-auto px-4 space-y-1.5">
            {models.map(m => {
              const isDisabled = disabledModels.has(m.value);
              const isActive = model === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => {
                    if (!isDisabled) {
                      setModel(m.value);
                      setModelSheetOpen(false);
                    }
                  }}
                  disabled={isDisabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-[0.98]',
                    isActive ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/40 border border-transparent hover:bg-secondary/70',
                    isDisabled && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-background border border-border'
                  )}>
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{m.label}</span>
                      {m.isDefault && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Default</span>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {m.visionSupport && (
                        <span className="text-[9px] text-blue-500 flex items-center gap-0.5">
                          <ImageIcon className="w-2.5 h-2.5" /> Vision
                        </span>
                      )}
                      {m.webSearch && (
                        <span className="text-[9px] text-green-500 flex items-center gap-0.5">
                          <Globe className="w-2.5 h-2.5" /> Web
                        </span>
                      )}
                      {isDisabled && (
                        <span className="text-[9px] text-orange-500">At Capacity</span>
                      )}
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Data Source Bottom Sheet ─────────────────────────────── */}
      <Sheet open={sourceSheetOpen} onOpenChange={setSourceSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-8">
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
          <h3 className="text-base font-semibold text-foreground px-5 mb-1">Data Source</h3>
          <p className="text-xs text-muted-foreground px-5 mb-4">Choose how CorpusAI retrieves information</p>
          <div className="px-4 space-y-2">
            {dataSources.map(d => {
              const isActive = dataSource === d.value;
              const isLocked = !!hasMessages && dataSource !== d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => {
                    if (!isLocked) {
                      setDataSource(d.value);
                      setSourceSheetOpen(false);
                    }
                  }}
                  disabled={isLocked}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-[0.98]',
                    isActive ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/40 border border-transparent',
                    isLocked && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-background border border-border'
                  )}>
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{d.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.desc}</p>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-primary shrink-0" />}
                  {isLocked && <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Attachment Bottom Sheet ──────────────────────────────── */}
      <Sheet open={attachmentSheetOpen} onOpenChange={setAttachmentSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-8">
          <div className="flex justify-center py-3">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
          <h3 className="text-base font-semibold text-foreground px-5 mb-4">Add Attachment</h3>
          <div className="grid grid-cols-3 gap-4 px-6">
            <button
              onClick={() => {
                if (documentInputRef.current) {
                  documentInputRef.current.accept = 'image/*';
                  documentInputRef.current.click();
                }
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Photos</span>
            </button>

            <button
              onClick={() => {
                if (documentInputRef.current) {
                  documentInputRef.current.accept = supportedDocFormats.join(',');
                  documentInputRef.current.click();
                }
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Paperclip className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Files</span>
            </button>

            <button
              onClick={() => {
                navigate('/documents');
                setAttachmentSheetOpen(false);
              }}
              className="flex flex-col items-center gap-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Resources</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
