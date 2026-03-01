import React, { useState } from 'react';
import { MessageSquare, Search, Pin, Pencil, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useChat } from '@/contexts/ChatContext';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const { chats, selectChat, deleteChat, renameChat, starChat, createNewChat } = useChat();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedChats, setSelectedChats] = useState<Set<string>>(new Set());
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  const handleNewChat = () => {
    createNewChat();
    navigate('/chat');
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // pinned chats always float to top, then sort by most recent activity
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  const handleStartRename = (e: React.MouseEvent, chatId: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingId(chatId);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameChat(chatId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const handlePin = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    starChat(chatId);
  };

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    deleteChat(chatId);
    // Remove from selection if it was selected
    setSelectedChats(prev => {
      const newSet = new Set(prev);
      newSet.delete(chatId);
      return newSet;
    });
  };

  // checkbox selection mode — toggled by clicking any checkbox
  const toggleChatSelection = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    const newSelected = new Set(selectedChats);
    if (newSelected.has(chatId)) {
      newSelected.delete(chatId);
    } else {
      newSelected.add(chatId);
    }
    setSelectedChats(newSelected);
  };

  const handleBulkDelete = () => {
    selectedChats.forEach(chatId => deleteChat(chatId));
    setSelectedChats(new Set());
  };

  const handleChatClick = (chatId: string) => {
    if (selectedChats.size === 0 || !selectedChats.has(chatId)) {
      selectChat(chatId);
    }
  };

  const isInSelectionMode = selectedChats.size > 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="flex flex-col items-center px-4 sm:px-6 py-4">
        <div className="w-full max-w-3xl flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-foreground pl-12 xl:pl-0">Chats</h1>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleNewChat}>
            + New chat
          </Button>
        </div>
        <div className="w-full max-w-3xl h-px bg-border/50" />
      </header>

      {/* Search Bar */}
      <div className="px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search your chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50"
            />
          </div>

          {/* Chat count and Select text - centered */}
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
            {isInSelectionMode ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedChats(new Set())} className="h-7">
                  <span>{selectedChats.size} selected</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedChats(new Set())}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <span>{chats.length} chats with CorpusAI</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-3xl mx-auto space-y-0">
          {sortedChats.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? 'No chats found' : 'No conversations yet'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery ? 'Try a different search term' : 'Start a new chat to see your history here'}
              </p>
            </div>
          ) : (
            sortedChats.map((chat) => {
              const isSelected = selectedChats.has(chat.id);
              const showCheckbox = isInSelectionMode || hoveredChatId === chat.id;

              return (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 cursor-pointer group transition-colors border-b border-border",
                    isSelected
                      ? "bg-primary/10"
                      : "hover:bg-secondary/50"
                  )}
                  onClick={() => handleChatClick(chat.id)}
                  onMouseEnter={() => setHoveredChatId(chat.id)}
                  onMouseLeave={() => setHoveredChatId(null)}
                >
                  {/* Checkbox - show on hover or when in selection mode */}
                  <div className={cn(
                    "shrink-0 transition-opacity",
                    showCheckbox ? "opacity-100" : "opacity-0"
                  )}>
                    <div
                      className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer",
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-muted-foreground hover:border-foreground"
                      )}
                      onClick={(e) => toggleChatSelection(e, chat.id)}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Chat content */}
                  <div className="flex-1 min-w-0">
                    {editingId === chat.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-7 text-sm flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(e as any, chat.id);
                            if (e.key === 'Escape') handleCancelRename(e as any);
                          }}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          onClick={(e) => handleSaveRename(e, chat.id)}
                        >
                          <Check className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 shrink-0"
                          onClick={handleCancelRename}
                        >
                          <X className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">
                            {chat.title}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last message {formatDistanceToNow(chat.updatedAt, { addSuffix: true })} in {chat.mode || 'CorpusAI'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Action buttons - show on hover */}
                  {!isInSelectionMode && editingId !== chat.id && (
                    <div className={cn(
                      "flex items-center gap-0.5 transition-opacity",
                      hoveredChatId === chat.id ? "opacity-100" : "opacity-0"
                    )}>
                      <button
                        onClick={(e) => handleStartRename(e, chat.id, chat.title)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="Rename"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handlePin(e, chat.id)}
                        className={cn(
                          "p-1.5 rounded-md transition-colors",
                          chat.starred
                            ? "text-primary hover:bg-secondary"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                        title={chat.starred ? "Unpin" : "Pin"}
                      >
                        <Pin className={cn("w-3.5 h-3.5", chat.starred && "fill-current")} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, chat.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}