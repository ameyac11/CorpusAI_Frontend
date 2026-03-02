import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Sparkles, ChevronDown, FileText,
  Loader2, MessageSquare, X, Search,
  Download, Trash2, Zap,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext';
import { AnimatedIcons, AnimatedIconType } from '@/components/icons/AnimatedIcons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { creativeService, type OutputType, type CreativeOutput } from '@/services/creativeService';
import { API_ROUTES, buildEndpoint } from '@/lib/api';
import { toast } from 'sonner';

// ── Tile definitions ────────────────────────────────────────────────────────

type TileCategory = 'text' | 'image';
type FilterTab = 'all' | 'text' | 'image';

interface CreativeTile {
  id: OutputType;
  title: string;
  description: string;
  gradient: string;
  category: TileCategory;
  iconKey: AnimatedIconType;
}

const tiles: CreativeTile[] = [
  // Text tiles
  {
    id: 'report',
    title: 'Report',
    description: 'Structured professional document',
    gradient: 'from-orange-500 via-amber-500 to-yellow-600',
    category: 'text',
    iconKey: 'report',
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Test your knowledge',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    category: 'text',
    iconKey: 'quiz',
  },
  {
    id: 'cheatsheet',
    title: 'Cheatsheet',
    description: 'Quick revision bullets',
    gradient: 'from-emerald-500 via-green-500 to-lime-600',
    category: 'text',
    iconKey: 'flashcards',
  },
  {
    id: 'debate',
    title: 'Debate',
    description: 'Pros, cons & balanced view',
    gradient: 'from-sky-500 via-cyan-500 to-teal-600',
    category: 'text',
    iconKey: 'slides',
  },
  // Image tiles
  {
    id: 'infographic',
    title: 'Infographic',
    description: 'Visual data layout',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
    category: 'image',
    iconKey: 'infographics',
  },
  {
    id: 'mind_map',
    title: 'Mind Map',
    description: 'Concept map visualization',
    gradient: 'from-purple-500 via-fuchsia-500 to-pink-600',
    category: 'image',
    iconKey: 'mind-map',
  },
  {
    id: 'timeline',
    title: 'Timeline',
    description: 'Chronological sequence',
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    category: 'image',
    iconKey: 'video',
  },
  {
    id: 'visual_slides',
    title: 'Visual Slides',
    description: 'Presentation slide deck',
    gradient: 'from-blue-500 via-indigo-500 to-violet-600',
    category: 'image',
    iconKey: 'slides',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

interface LocalOutput {
  id: string;
  type: OutputType;
  title: string;
  chatTitle?: string;
  createdAt: Date;
  status: 'generating' | 'completed' | 'failed';
  error?: string;
  data?: CreativeOutput;
}

const formatTimeAgo = (date: Date) => {
  const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getTypeLabel = (type: OutputType) => tiles.find(t => t.id === type)?.title || type;
const getTileCategory = (type: OutputType): TileCategory =>
  tiles.find(t => t.id === type)?.category ?? 'text';

// ── Component ───────────────────────────────────────────────────────────────

export default function CreativeSpace() {
  const { chats } = useChat();

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<LocalOutput[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [selectionSearch, setSelectionSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewOutput, setPreviewOutput] = useState<LocalOutput | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // ── Fetch file blob when preview modal opens ─────────────────────────
  useEffect(() => {
    // Cleanup previous blob URLs
    if (!previewOpen || !previewOutput?.data?.id) {
      if (previewImageUrl) { URL.revokeObjectURL(previewImageUrl); setPreviewImageUrl(null); }
      if (previewPdfUrl)  { URL.revokeObjectURL(previewPdfUrl);  setPreviewPdfUrl(null);  }
      return;
    }
    const fmt = previewOutput.data.file_format;
    const url = buildEndpoint(API_ROUTES.CREATIVE.FILE(previewOutput.data.id));
    fetch(url, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error('fetch failed'); return r.blob(); })
      .then(blob => {
        // Ensure correct MIME so the iframe / img renders correctly
        const typed = fmt === 'image/png'
          ? new Blob([blob], { type: 'image/png' })
          : new Blob([blob], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(typed);
        if (fmt === 'image/png') setPreviewImageUrl(objectUrl);
        else setPreviewPdfUrl(objectUrl);
      })
      .catch(() => toast.error('Failed to load preview'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewOpen, previewOutput?.data?.id]);

  // ── Load previous outputs from backend ────────────────────────────────
  useEffect(() => {
    if (historyLoaded) return;
    creativeService.getHistory().then((res) => {
      if (res.success && res.data) {
        const items: CreativeOutput[] = (res.data as any).data ?? res.data;
        if (Array.isArray(items)) {
          const loaded: LocalOutput[] = items.map((o) => ({
            id: o.id,
            type: o.output_type,
            title: o.title,
            createdAt: new Date(o.created_at),
            status: 'completed' as const,
            data: o,
          }));
          setOutputs(loaded);
        }
      }
      setHistoryLoaded(true);
    }).catch(() => setHistoryLoaded(true));
  }, [historyLoaded]);

  // ── Derived state ─────────────────────────────────────────────────────
  const filteredOutputs = useMemo(() => {
    let filtered = [...outputs];
    if (activeFilter === 'text') {
      filtered = filtered.filter(o => getTileCategory(o.type) === 'text');
    } else if (activeFilter === 'image') {
      filtered = filtered.filter(o => getTileCategory(o.type) === 'image');
    }
    return filtered.sort((a, b) => {
      if (sortBy === 'oldest') return a.createdAt.getTime() - b.createdAt.getTime();
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [outputs, activeFilter, sortBy]);

  const selectedChatTitle = useMemo(() => {
    if (!selectedChat) return null;
    return chats.find(c => c.id === selectedChat)?.title ?? 'Selected Chat';
  }, [selectedChat, chats]);

  const filteredModalChats = useMemo(() => {
    const sorted = [...chats].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    if (!selectionSearch) return sorted;
    return sorted.filter(c =>
      c.title.toLowerCase().includes(selectionSearch.toLowerCase())
    );
  }, [chats, selectionSearch]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleGenerateOutput = useCallback(async (type: OutputType) => {
    if (!selectedChat) {
      toast.error('Please select a chat first', {
        description: 'Click "Select Chat" to choose which conversation to generate from.',
      });
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tile = tiles.find(t => t.id === type)!;
    const tempOutput: LocalOutput = {
      id: tempId,
      type,
      title: `Generating ${tile.title}...`,
      chatTitle: selectedChatTitle ?? undefined,
      createdAt: new Date(),
      status: 'generating',
    };
    setOutputs(prev => [tempOutput, ...prev]);

    try {
      const res = await creativeService.generate({ chat_id: selectedChat, output_type: type });

      if (res.success && res.data) {
        const output: CreativeOutput = (res.data as any).data ?? res.data;
        setOutputs(prev =>
          prev.map(o =>
            o.id === tempId
              ? {
                  ...o,
                  id: output.id,
                  title: output.title,
                  status: 'completed' as const,
                  data: output,
                }
              : o
          )
        );
        toast.success(`${tile.title} generated!`);
      } else {
        const errMsg = (res.data as any)?.detail ?? res.error?.message ?? 'Generation failed';
        setOutputs(prev =>
          prev.map(o =>
            o.id === tempId ? { ...o, status: 'failed' as const, error: errMsg } : o
          )
        );
        toast.error(`Failed to generate ${tile.title}`, { description: errMsg });
      }
    } catch {
      setOutputs(prev =>
        prev.map(o =>
          o.id === tempId
            ? { ...o, status: 'failed' as const, error: 'Network error. Please try again.' }
            : o
        )
      );
      toast.error('Generation failed');
    }
  }, [selectedChat, selectedChatTitle]);

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(prev => (prev === chatId ? null : chatId));
  };

  const handleDeleteOutput = async (outputId: string) => {
    const prev = outputs;
    setOutputs(o => o.filter(x => x.id !== outputId));
    try {
      await creativeService.deleteOutput(outputId);
    } catch {
      setOutputs(prev);
      toast.error('Failed to delete output');
    }
  };

  const handleDownload = async (output: LocalOutput) => {
    if (!output.data) return;
    try {
      const url = buildEndpoint(API_ROUTES.CREATIVE.FILE(output.data.id)) + '?download=true';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = output.data.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      toast.error('Download failed');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      {/* Header */}
      <div className="relative p-3 sm:p-4 border-b border-border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 blur-3xl" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 shadow-lg shadow-primary/20 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent truncate">
                Creative Space
              </h1>
              <p className="hidden sm:flex text-xs text-muted-foreground items-center gap-1.5 mt-0.5">
                <Zap className="w-3 h-3" />
                Transform your conversations into powerful content
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectionModalOpen(true)}
            className="gap-1 sm:gap-2 shadow-sm hover:shadow-md transition-shadow shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline truncate max-w-[160px]">
              {selectedChatTitle ?? 'Select Chat'}
            </span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 sm:p-6 relative" onWheel={(e) => e.stopPropagation()}>
        {/* Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {tiles.map(tile => {
            const IconComponent = AnimatedIcons[tile.iconKey];
            const [isHovered, setIsHovered] = React.useState(false);

            return (
              <button
                key={tile.id}
                onClick={() => handleGenerateOutput(tile.id)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative group overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg"
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-55 transition-opacity duration-300",
                  tile.gradient
                )} />

                <div className="relative p-3 sm:p-5 bg-card/30 backdrop-blur-[2px]">
                  <div className="mb-2 sm:mb-4 w-6 h-6 sm:w-8 sm:h-8">
                    <IconComponent
                      isHovered={isHovered}
                      className="w-6 h-6 sm:w-8 sm:h-8 text-foreground group-hover:text-foreground transition-colors duration-300"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-foreground transition-colors">
                      {tile.title}
                    </h3>
                    {tile.category === 'image' && (
                      <ImageIcon className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-foreground/80 leading-relaxed line-clamp-2">
                    {tile.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Generated Outputs Panel */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-primary" />
              Generated Outputs
            </h2>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg">
                {(['all', 'text', 'image'] as FilterTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveFilter(tab)}
                    className={cn(
                      'px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium rounded-md whitespace-nowrap transition-all duration-200',
                      activeFilter === tab
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    )}
                  >
                    {tab === 'all' ? 'All' : tab === 'text' ? 'Text' : 'Images'}
                  </button>
                ))}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 h-7 sm:h-8 text-[10px] sm:text-xs shadow-sm">
                    <span className="hidden sm:inline">Sort:</span> {sortBy === 'newest' ? 'Newest' : 'Oldest'}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('newest')}>Newest</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('oldest')}>Oldest</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filteredOutputs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm border-2 border-dashed border-border rounded-2xl bg-secondary/20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary opacity-50" />
              </div>
              <p className="font-medium mb-1">No outputs yet</p>
              <p className="text-xs">Select a chat, then click a tile above to start generating</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOutputs.map(output => (
                <div
                  key={output.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/5",
                    output.status === 'completed' && "cursor-pointer hover:border-primary/30 hover:bg-card"
                  )}
                  onClick={() => {
                    if (output.status === 'completed') {
                      setPreviewOutput(output);
                      setPreviewOpen(true);
                    }
                  }}
                >
                  {/* Icon */}
                  <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
                    {output.status === 'generating' ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : getTileCategory(output.type) === 'image' ? (
                      <ImageIcon className="w-5 h-5 text-primary" />
                    ) : (
                      <FileText className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{output.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {output.chatTitle && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {output.chatTitle}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">• {formatTimeAgo(output.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        {getTypeLabel(output.type)}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 text-[10px] rounded-full font-medium",
                        getTileCategory(output.type) === 'image'
                          ? "bg-violet-500/10 text-violet-500 border border-violet-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      )}>
                        {getTileCategory(output.type) === 'image' ? 'Image' : 'Text'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {output.status === 'generating' && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generating
                      </span>
                    )}
                    {output.status === 'completed' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleDownload(output)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteOutput(output.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {output.status === 'failed' && (
                      <Button size="sm" variant="outline" onClick={() => handleGenerateOutput(output.type)}>
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Chat Selection Modal ───────────────────────────────────────── */}
      <Dialog open={selectionModalOpen} onOpenChange={setSelectionModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-card border border-border [&>button]:hidden">
          <button
            onClick={() => setSelectionModalOpen(false)}
            className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="px-8 pt-8 pb-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary border border-border">
                <MessageSquare className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">Select a Chat</h3>
                <p className="text-xs text-muted-foreground">Choose one conversation to generate from</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chats..."
                value={selectionSearch}
                onChange={(e) => setSelectionSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-secondary/50 border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:bg-secondary transition-all"
              />
            </div>

            {/* Chat list */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              <label className="text-xs font-medium text-muted-foreground px-1">
                Select one chat ({filteredModalChats.length} available)
              </label>

              {filteredModalChats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {chats.length === 0 ? 'No chats yet — start a conversation first.' : 'No chats match your search.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredModalChats.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                        selectedChat === chat.id
                          ? "bg-accent border border-border"
                          : "bg-background/50 border border-border/50 hover:bg-muted hover:border-border"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        selectedChat === chat.id ? "border-primary bg-primary" : "border-muted-foreground"
                      )}>
                        {selectedChat === chat.id && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate">{chat.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selectedChat ? `1 chat selected` : 'No chat selected'}
            </p>
            <button
              onClick={() => setSelectionModalOpen(false)}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Preview Modal ──────────────────────────────────────────────── */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[95vw] max-w-[960px] max-h-[95vh] h-[95vh] p-0 gap-0 flex flex-col [&>button]:hidden">
          {previewOutput && (
            <>
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                    {getTileCategory(previewOutput.type) === 'image' ? (
                      <ImageIcon className="w-5 h-5 text-primary-foreground" />
                    ) : (
                      <FileText className="w-5 h-5 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{previewOutput.title}</h3>
                    <p className="text-xs text-muted-foreground">{getTypeLabel(previewOutput.type)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => handleDownload(previewOutput)}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden">
                {previewOutput.data?.file_format === 'image/png' ? (
                  /* ── Image preview via authenticated blob URL ── */
                  <div className="flex items-center justify-center p-6 overflow-y-auto max-h-[calc(95vh-120px)]" onWheel={(e) => e.stopPropagation()}>
                    {previewImageUrl ? (
                      <img
                        src={previewImageUrl}
                        alt={previewOutput.title}
                        className="max-w-full rounded-lg border border-border shadow-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm">Loading image…</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* ── PDF preview via authenticated blob URL ── */
                  previewPdfUrl ? (
                    <iframe
                      src={previewPdfUrl}
                      title={previewOutput.title}
                      className="w-full border-0"
                      style={{ height: 'calc(95vh - 120px)' }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm">Loading PDF…</p>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
