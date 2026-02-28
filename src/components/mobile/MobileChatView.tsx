import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Menu, Plus, ArrowUp, Loader2, FileText, Image as ImageIcon, X, Check, Copy,
    ThumbsUp, ThumbsDown, Share, MoreHorizontal, Globe, Mic, FolderOpen, Settings2,
    Camera, FolderOpen as Gallery, Paperclip, Cloud, ChevronDown
} from 'lucide-react';
import { useChat, Message } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AttachedFile } from '@/components/chat/AttachmentMenu';
import { useNotification } from '@/components/notifications/NotificationProvider';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MobileChatViewProps {
    onOpenSidebar: () => void;
}

const supportedDocFormats = ['.pdf', '.docx', '.doc', '.txt', '.md', '.png', '.jpg', '.jpeg'];

// Quick action suggestions for new chat
const quickActions = [
    { icon: '📝', label: 'Summarize docs', action: 'Summarize my documents' },
    { icon: '🔍', label: 'Find answers', action: 'Find key information in my documents' },
    { icon: '💡', label: 'Explain concept', action: 'Explain this concept simply' },
    { icon: '📊', label: 'Compare data', action: 'Compare and analyze the data' },
];

export function MobileChatView({ onOpenSidebar }: MobileChatViewProps) {
    const {
        currentChat,
        sendMessage,
        addAttachments,
        removeAttachment,
        model,
        internetSearch,
        setInternetSearch,
        isStreaming,
        isThinking,
    } = useChat();
    const { user, isAnonymous, incrementMessageCount } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    const [input, setInput] = useState('');
    const [attachmentSheetOpen, setAttachmentSheetOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const hasMessages = currentChat && currentChat.messages.length > 0;
    const isNewChat = !currentChat || currentChat.messages.length === 0;
    const userName = user?.username?.split(' ')[0] || 'there';

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentChat?.messages, isStreaming]);

    // auto-grow textarea as user types, capped at 120px
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [input]);

    const handleSend = async () => {
        if (!input.trim()) return;

        if (isAnonymous && !incrementMessageCount()) {
            showNotification('rate_limit_daily', 'Daily Limit Reached', 'Your daily usage limit has been reached.');
            return;
        }

        const message = input;
        setInput('');
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

    const getFileExtension = (filename: string) => {
        return filename.split('.').pop()?.toUpperCase() || 'FILE';
    };

    const isImageFile = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '');
    };

    // Animated dots for loading
    const AnimatedDots = () => (
        <span className="inline-flex ml-1">
            <span className="animate-pulse duration-1000">.</span>
            <span className="animate-pulse duration-1000 delay-150">.</span>
            <span className="animate-pulse duration-1000 delay-300">.</span>
        </span>
    );

    // Message bubble component
    const MessageBubble = ({ message }: { message: Message }) => {
        const isUser = message.role === 'user';
        const [copied, setCopied] = useState(false);

        // strip <think> blocks so the user only sees the final answer
        const displayContent = message.content.replace(/<think>[\s\S]*?(?:<\/think>|$)/g, '').trim();

        const handleCopy = async (text: string) => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        if (isUser) {
            return (
                <div className="flex justify-end mb-4">
                    <div className="max-w-[85%] bg-primary text-primary-foreground px-4 py-3 rounded-3xl rounded-br-lg">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-start mb-4">
                <div className="max-w-[90%] text-sm text-foreground leading-relaxed">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code({ node, inline, className, children, ...props }: any) {
                                if (inline) {
                                    return (
                                        <code className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[0.85em]" {...props}>
                                            {children}
                                        </code>
                                    );
                                }
                                const codeString = String(children).replace(/\n$/, '');
                                return (
                                    <div className="relative my-3 rounded-xl overflow-hidden border border-border bg-secondary/50">
                                        <div className="flex items-center justify-between px-3 py-2 bg-secondary border-b border-border">
                                            <span className="text-xs font-medium text-muted-foreground uppercase">Code</span>
                                            <button
                                                onClick={() => handleCopy(codeString)}
                                                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            </button>
                                        </div>
                                        <pre className="p-3 overflow-x-auto text-sm">
                                            <code className="text-foreground font-mono" {...props}>{children}</code>
                                        </pre>
                                    </div>
                                );
                            },
                            pre({ children }: any) {
                                return <>{children}</>;
                            },
                        }}
                    >
                        {displayContent}
                    </ReactMarkdown>
                </div>
                {/* Action buttons */}
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-full text-muted-foreground hover:bg-secondary transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full text-muted-foreground hover:bg-secondary transition-colors">
                        <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-full text-muted-foreground hover:bg-secondary transition-colors">
                        <Copy className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    };

    // Render uploaded files
    const renderUploadedFiles = () => {
        const attachments = currentChat?.attachments || [];
        if (attachments.length === 0) return null;

        return (
            <div className="flex gap-2 overflow-x-auto pb-2 px-4 -mx-4 scrollbar-hide">
                {attachments.map(attachment => (
                    <div
                        key={attachment.id}
                        className="flex items-center gap-2 px-3 py-2 bg-secondary/80 rounded-2xl border border-border/50 shrink-0"
                    >
                        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center">
                            {attachment.loading ? (
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            ) : isImageFile(attachment.name) ? (
                                <ImageIcon className="w-4 h-4 text-primary" />
                            ) : (
                                <FileText className="w-4 h-4 text-primary" />
                            )}
                        </div>
                        <span className="text-xs font-medium truncate max-w-[80px]">{attachment.name}</span>
                        <button
                            onClick={() => removeAttachment(attachment.id)}
                            className="w-5 h-5 rounded-full bg-muted-foreground/20 hover:bg-destructive/80 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Mobile Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
                <button
                    onClick={onOpenSidebar}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <h1 className="text-lg font-semibold text-foreground">CorpusAI</h1>

                {/* Empty div for spacing to keep title centered */}
                <div className="w-10" />
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

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                {isNewChat ? (
                    /* Welcome Screen */
                    <div className="flex flex-col px-5 pt-12 pb-4">
                        <div className="mb-8">
                            <p className="text-muted-foreground text-base mb-1">Hi {userName}</p>
                            <h2 className="text-2xl font-medium text-foreground leading-tight">
                                Where should we start?
                            </h2>
                        </div>

                        {/* Quick Action Pills */}
                        <div className="flex flex-col gap-2">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickAction(action.action)}
                                    className="flex items-center gap-3 px-4 py-3 bg-secondary/60 hover:bg-secondary rounded-2xl text-left transition-colors"
                                >
                                    <span className="text-lg">{action.icon}</span>
                                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Chat Messages */
                    <div className="px-4 py-4 space-y-2">
                        {currentChat?.messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                        {isStreaming && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">
                                    {isThinking ? <>Thinking<AnimatedDots /></> : <>Generating<AnimatedDots /></>}
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Bottom Input Area */}
            <div className="border-t border-border bg-background px-4 py-3 pb-safe">
                {/* Uploaded Files */}
                {renderUploadedFiles()}

                {/* Input Container */}
                <div className="bg-secondary/50 border border-border/60 rounded-3xl overflow-hidden">
                    <div className="flex items-end gap-2 px-4 py-3">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask CorpusAI"
                            className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground min-h-[24px] max-h-[120px] text-base py-1 leading-normal"
                            rows={1}
                        />
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex items-center justify-between px-3 pb-3">
                        <div className="flex items-center gap-1">
                            {/* Attachment Button */}
                            <button
                                onClick={() => setAttachmentSheetOpen(true)}
                                className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>

                            {/* Web Search Toggle */}
                            <button
                                onClick={() => setInternetSearch(!internetSearch)}
                                className={cn(
                                    'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
                                    internetSearch
                                        ? 'bg-primary/20 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                                )}
                            >
                                <Globe className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Model indicator */}
                            <span className="text-xs text-muted-foreground bg-secondary/80 px-2 py-1 rounded-full">
                                {model === 'compound' ? 'Fast' : model.split('-')[0]}
                            </span>

                            {/* Voice button (placeholder) */}
                            <button className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors">
                                <Mic className="w-5 h-5" />
                            </button>

                            {/* Send Button */}
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isStreaming || (currentChat?.attachments?.some(a => a.loading) ?? false)}
                                size="icon"
                                className={cn(
                                    'rounded-full h-9 w-9 transition-all',
                                    input.trim() && !isStreaming
                                        ? 'bg-primary text-primary-foreground'
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
                    </div>
                </div>
            </div>

            {/* Attachment Bottom Sheet */}
            <Sheet open={attachmentSheetOpen} onOpenChange={setAttachmentSheetOpen}>
                <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-8">
                    {/* Drag Handle */}
                    <div className="flex justify-center py-3">
                        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
                    </div>

                    {/* Attachment Options */}
                    <div className="grid grid-cols-4 gap-4 px-6 pt-2">
                        <button
                            onClick={() => documentInputRef.current?.click()}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                                <Camera className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <span className="text-xs text-muted-foreground">Camera</span>
                        </button>

                        <button
                            onClick={() => documentInputRef.current?.click()}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <span className="text-xs text-muted-foreground">Gallery</span>
                        </button>

                        <button
                            onClick={() => documentInputRef.current?.click()}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                                <Paperclip className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <span className="text-xs text-muted-foreground">Files</span>
                        </button>

                        <button
                            onClick={() => {
                                navigate('/documents');
                                setAttachmentSheetOpen(false);
                            }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                                <Cloud className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <span className="text-xs text-muted-foreground">Resources</span>
                        </button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
