import React, { useState, useEffect } from 'react';
import { X, Search, MessageSquare, Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChat } from '@/contexts/ChatContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { isToday, isYesterday, isThisWeek } from 'date-fns';
import { Button } from '@/components/ui/button';

interface ChatSearchPopupProps {
  open: boolean;
  onClose: () => void;
}

export function ChatSearchPopup({ open, onClose }: ChatSearchPopupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { chats, selectChat } = useChat();
  const navigate = useNavigate();

  // Handle open/close with smooth animation
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setSearchQuery('');
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!isVisible) return null;

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group chats by date
  const groupedChats = filteredChats.reduce((groups, chat) => {
    let groupKey = 'Older';
    
    if (isToday(chat.updatedAt)) {
      groupKey = 'Today';
    } else if (isYesterday(chat.updatedAt)) {
      groupKey = 'Yesterday';
    } else if (isThisWeek(chat.updatedAt)) {
      groupKey = 'This Week';
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(chat);
    return groups;
  }, {} as Record<string, typeof chats>);

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    navigate('/chat');
    onClose();
  };

  const handleNewChat = () => {
    navigate('/chat');
    onClose();
  };

  return (
    <>
      {/* Backdrop - reduced blur */}
      <div
        className={cn(
          "fixed inset-0 bg-background/60 backdrop-blur-[2px] z-50 transition-opacity duration-200",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Popup */}
      <div className={cn(
        "fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:w-[500px] md:max-h-[600px] bg-card border border-border rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-200 ease-out",
        isAnimating 
          ? "md:-translate-y-1/2 opacity-100" 
          : "md:-translate-y-[calc(50%+20px)] opacity-0"
      )}>
        {/* Header with Search and Close */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="px-4 py-3 border-b border-border">
          <Button onClick={handleNewChat} variant="outline" className="w-full gap-2">
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          {Object.keys(groupedChats).length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No chats found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            Object.entries(groupedChats).map(([group, groupChats]) => (
              <div key={group} className="mb-4">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1">{group}</p>
                <div className="space-y-1">
                  {groupChats.map(chat => (
                    <button
                      key={chat.id}
                      onClick={() => handleSelectChat(chat.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-secondary transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{chat.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
