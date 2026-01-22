import React, { useState, useMemo } from 'react';
import {
  Sparkles, ChevronDown, FileText,
  Loader2, MessageSquare, X, Search,
  Globe, Folder, Download, Trash2, Zap
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

type OutputType = 'mind-map' | 'report' | 'slides' | 'infographics' | 'flashcards' | 'audio' | 'video' | 'quiz';
type OutputStatus = 'generating' | 'completed' | 'failed';
type FilterTab = 'all' | 'mind-maps' | 'audio' | 'video' | 'infographics' | 'flashcards' | 'slides' | 'reports';

interface GeneratedOutput {
  id: string;
  type: OutputType;
  title: string;
  chatSource?: string;
  createdAt: Date;
  status: OutputStatus;
  preview?: string;
  error?: string;
}

interface CreativeTile {
  id: OutputType;
  title: string;
  description: string;
  gradient: string;
}

const tiles: CreativeTile[] = [
  {
    id: 'mind-map',
    title: 'Mind Map',
    description: 'Visual knowledge mapping',
    gradient: 'from-sky-500 via-cyan-500 to-teal-600'
  },
  {
    id: 'audio',
    title: 'Audio Overview',
    description: 'Listen to your content',
    gradient: 'from-purple-500 via-fuchsia-500 to-pink-600'
  },
  {
    id: 'video',
    title: 'Video Overview',
    description: 'Watch visual summaries',
    gradient: 'from-pink-500 via-rose-500 to-red-600'
  },
  {
    id: 'report',
    title: 'Reports',
    description: 'Detailed documentation',
    gradient: 'from-orange-500 via-amber-500 to-yellow-600'
  },
  {
    id: 'slides',
    title: 'Slides',
    description: 'Presentation ready',
    gradient: 'from-emerald-500 via-green-500 to-lime-600'
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Study cards for review',
    gradient: 'from-blue-500 via-indigo-500 to-violet-600'
  },
  {
    id: 'quiz',
    title: 'Quiz',
    description: 'Test your knowledge',
    gradient: 'from-amber-500 via-orange-500 to-red-500'
  },
  {
    id: 'infographics',
    title: 'Infographics',
    description: 'Data visualization',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-600'
  },
];

// Placeholder functions - replace with real API calls
const fetchChats = async () => {
  return []; // TODO: Replace with actual API call
};

const fetchResources = async () => {
  return []; // TODO: Replace with actual API call
};

const generateOutput = async (type: OutputType, chatIds: string[], resourceIds: string[]): Promise<GeneratedOutput> => {
  await new Promise(resolve => setTimeout(resolve, 3000));

  const titles: Record<OutputType, string> = {
    'mind-map': 'Foundations of Machine Learning and Neural Networks',
    'report': 'Comprehensive Analysis Report',
    'slides': 'Presentation: AI Fundamentals',
    'infographics': 'Data Visualization Summary',
    'flashcards': 'Study Flashcards Set',
    'audio': 'Audio Summary Overview',
    'video': 'Video Explanation',
    'quiz': 'Knowledge Assessment Quiz',
  };

  return {
    id: Date.now().toString(),
    type,
    title: titles[type],
    chatSource: 'Chat with LLMs for Beginners',
    createdAt: new Date(),
    status: 'completed',
    preview: '/placeholder.svg',
  };
};

export default function CreativeSpace() {
  const { chats } = useChat();

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<GeneratedOutput[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [availableChats, setAvailableChats] = useState<{ id: string; title: string }[]>([]);
  const [availableResources, setAvailableResources] = useState<{ id: string; name: string; type: string }[]>([]);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [selectionTab, setSelectionTab] = useState<'chat' | 'resources'>('chat');
  const [selectionSearch, setSelectionSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewOutput, setPreviewOutput] = useState<GeneratedOutput | null>(null);

  React.useEffect(() => {
    fetchChats().then(setAvailableChats);
    fetchResources().then(setAvailableResources);
  }, []);

  const filteredOutputs = useMemo(() => {
    let filtered = [...outputs];
    if (activeFilter !== 'all') {
      const typeMap: Record<FilterTab, OutputType | OutputType[]> = {
        'all': [],
        'mind-maps': 'mind-map',
        'audio': 'audio',
        'video': 'video',
        'infographics': 'infographics',
        'flashcards': 'flashcards',
        'slides': 'slides',
        'reports': 'report',
      };
      const types = typeMap[activeFilter];
      if (Array.isArray(types)) {
        filtered = filtered.filter(o => types.includes(o.type));
      } else {
        filtered = filtered.filter(o => o.type === types);
      }
    }
    return filtered.sort((a, b) => {
      if (sortBy === 'oldest') return a.createdAt.getTime() - b.createdAt.getTime();
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [outputs, activeFilter, sortBy]);

  const handleGenerateOutput = async (type: OutputType) => {
    const tempId = `temp-${Date.now()}`;
    const tempOutput: GeneratedOutput = {
      id: tempId,
      type,
      title: `Generating ${tiles.find(t => t.id === type)?.title}...`,
      createdAt: new Date(),
      status: 'generating',
    };
    setOutputs(prev => [tempOutput, ...prev]);
    try {
      const result = await generateOutput(type, selectedChat ? [selectedChat] : [], selectedResources);
      setOutputs(prev => prev.map(o => o.id === tempId ? result : o));
    } catch (error) {
      setOutputs(prev => prev.map(o =>
        o.id === tempId
          ? { ...o, status: 'failed', error: 'Generation failed. Please try again.' }
          : o
      ));
    }
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(prev => prev === chatId ? null : chatId);
  };

  const handleToggleResource = (resourceId: string) => {
    setSelectedResources(prev => {
      if (prev.includes(resourceId)) {
        return prev.filter(id => id !== resourceId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, resourceId];
    });
  };

  const handleDeleteOutput = (outputId: string) => {
    setOutputs(prev => prev.filter(o => o.id !== outputId));
  };

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getTypeLabel = (type: OutputType) => tiles.find(t => t.id === type)?.title || type;

  const filteredModalChats = availableChats.filter(c =>
    c.title.toLowerCase().includes(selectionSearch.toLowerCase())
  );
  const filteredModalResources = availableResources.filter(r =>
    r.name.toLowerCase().includes(selectionSearch.toLowerCase())
  );

  const getSelectionSummary = () => {
    const parts = [];
    if (selectedChat) {
      const chat = availableChats.find(c => c.id === selectedChat);
      parts.push(chat?.title || '1 Chat');
    }
    if (selectedResources.length > 0) {
      parts.push(`${selectedResources.length} Resource${selectedResources.length > 1 ? 's' : ''}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Select Sources';
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 rounded-2xl bg-black border border-white/10 flex items-center justify-center mb-6 shadow-2xl shadow-black/50 animate-pulse">
          <img src="/DataNesTX_Logo_Dark_Frontend.png" alt="DataNesTX Logo" className="w-12 h-12 object-contain" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
          Coming Soon
        </h2>
        <p className="text-muted-foreground max-w-sm text-lg">
          We're crafting powerful tools to transform your knowledge into creative outputs.
        </p>
      </div>
      {/* Enhanced Header with Gradient */}
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
            <Folder className="w-4 h-4" />
            <span className="hidden sm:inline">{getSelectionSummary()}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-auto p-3 sm:p-6 relative"
        onWheel={(e) => e.stopPropagation()}
      >


        {/* Enhanced Creative Tiles Grid - Semantic Animated Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {tiles.map(tile => {
            const IconComponent = AnimatedIcons[tile.id as AnimatedIconType];
            const [isHovered, setIsHovered] = React.useState(false);

            return (
              <button
                key={tile.id}
                onClick={() => handleGenerateOutput(tile.id)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="relative group overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg"
              >
                {/* Gradient Background */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-55 transition-opacity duration-300",
                  tile.gradient
                )} />

                {/* Content */}
                <div className="relative p-3 sm:p-5 bg-card/30 backdrop-blur-[2px]">
                  {/* Semantic Animated Icon - Controlled by tile hover */}
                  <div className="mb-2 sm:mb-4 w-6 h-6 sm:w-8 sm:h-8">
                    <IconComponent
                      isHovered={isHovered}
                      className="w-6 h-6 sm:w-8 sm:h-8 text-foreground group-hover:text-foreground transition-colors duration-300"
                    />
                  </div>

                  {/* Text */}
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-0.5 sm:mb-1 group-hover:text-foreground transition-colors">
                    {tile.title}
                  </h3>
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
          {/* Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-primary" />
              Generated Outputs
            </h2>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1 p-1 bg-secondary/50 rounded-lg overflow-x-auto">
                {(['all', 'mind-maps', 'audio', 'video'] as FilterTab[]).map(tab => (
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
                    {tab === 'all' ? 'All' : tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-2 py-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground">
                      More...
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setActiveFilter('infographics')}>Infographics</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveFilter('flashcards')}>Flashcards</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveFilter('slides')}>Slides</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveFilter('reports')}>Reports</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
              <p className="text-xs">Click a tile above to start generating creative content</p>
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
                  {/* Preview */}
                  <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden shrink-0 border border-border/50">
                    {output.status === 'generating' ? (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    ) : output.preview ? (
                      <img src={output.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-primary" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{output.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {output.chatSource && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {output.chatSource}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">• {formatTimeAgo(output.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        {getTypeLabel(output.type)}
                      </span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {output.status === 'generating' && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Generating
                      </span>
                    )}
                    {output.status === 'completed' && (
                      <>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary">
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

      {/* Selection Modal */}
      <Dialog open={selectionModalOpen} onOpenChange={setSelectionModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-black border border-zinc-800/50 [&>button]:hidden">
          <button
            onClick={() => setSelectionModalOpen(false)}
            className="absolute right-4 top-4 z-10 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="px-8 pt-8 pb-6 space-y-5">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
              <button
                onClick={() => setSelectionTab('chat')}
                className={cn(
                  "flex-1 px-4 py-2.5 text-sm rounded-md transition-all duration-200 font-medium",
                  selectionTab === 'chat'
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-zinc-300"
                )}
              >
                <MessageSquare className="w-4 h-4 inline-block mr-2" />
                Chats
              </button>
              <button
                onClick={() => setSelectionTab('resources')}
                className={cn(
                  "flex-1 px-4 py-2.5 text-sm rounded-md transition-all duration-200 font-medium",
                  selectionTab === 'resources'
                    ? "bg-white text-black"
                    : "text-zinc-400 hover:text-zinc-300"
                )}
              >
                <FileText className="w-4 h-4 inline-block mr-2" />
                Resources
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder={selectionTab === 'chat' ? 'Search chats...' : 'Search resources...'}
                value={selectionSearch}
                onChange={(e) => setSelectionSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900/80 transition-all"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              <label className="text-xs font-medium text-zinc-400 px-1">
                {selectionTab === 'chat' ? 'Select one chat' : 'Select up to 3 resources'}
              </label>

              {selectionTab === 'chat' ? (
                <div className="space-y-2">
                  {filteredModalChats.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                        selectedChat === chat.id
                          ? "bg-zinc-800 border border-zinc-700"
                          : "bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700/50"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                        selectedChat === chat.id ? "border-white bg-white" : "border-zinc-600"
                      )}>
                        {selectedChat === chat.id && (
                          <div className="w-2 h-2 rounded-full bg-black" />
                        )}
                      </div>
                      <MessageSquare className="w-4 h-4 text-zinc-500 shrink-0" />
                      <span className="text-sm text-zinc-200 truncate">{chat.title}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredModalResources.map(resource => (
                    <button
                      key={resource.id}
                      onClick={() => handleToggleResource(resource.id)}
                      disabled={!selectedResources.includes(resource.id) && selectedResources.length >= 3}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200",
                        selectedResources.includes(resource.id)
                          ? "bg-zinc-800 border border-zinc-700"
                          : "bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900/50 hover:border-zinc-700/50",
                        !selectedResources.includes(resource.id) && selectedResources.length >= 3 && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                        selectedResources.includes(resource.id) ? "border-white bg-white" : "border-zinc-600"
                      )}>
                        {selectedResources.includes(resource.id) && (
                          <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {resource.type === 'web' ? (
                        <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                      )}
                      <span className="text-sm text-zinc-200 truncate">{resource.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-zinc-800/50 flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              {selectedChat ? '1 chat' : '0 chats'} • {selectedResources.length}/3 resources
            </p>
            <button
              onClick={() => setSelectionModalOpen(false)}
              className="px-5 py-2.5 rounded-lg bg-white text-black font-medium text-sm hover:bg-zinc-100 transition-colors"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] p-0 gap-0 [&>button]:hidden">
          {previewOutput && (
            <>
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{previewOutput.title}</h3>
                    <p className="text-xs text-muted-foreground">{getTypeLabel(previewOutput.type)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-xl p-8 border border-border/50">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                      <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">{getTypeLabel(previewOutput.type)} Preview</p>
                    <p className="text-xs text-muted-foreground">{previewOutput.title}</p>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-foreground/80 leading-relaxed">
                      This is a preview of your generated {getTypeLabel(previewOutput.type).toLowerCase()}. In a real implementation, this would display the actual content using appropriate viewers for different output types (PDF viewer, image carousel, video player, etc.).
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
