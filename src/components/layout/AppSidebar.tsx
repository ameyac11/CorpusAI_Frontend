import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, History, Plus, PanelLeft, MessageSquare, Clock, Search, Pin, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useChat } from '@/contexts/ChatContext';
import { UserMenu } from './UserMenu';
import { formatDistanceToNow } from 'date-fns';
import { ChatItemMenu } from '@/components/sidebar/ChatItemMenu';
import { ChatSearchPopup } from '@/components/chat/ChatSearchPopup';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
  onItemClick?: () => void;
}

const navItems = [
  {
    icon: FileText,
    label: 'Resources',
    path: '/documents'
  },
  {
    icon: History,
    label: 'History',
    path: '/history'
  }
];

export function AppSidebar({ collapsed, onToggle, isMobile = false, onItemClick }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { chats, currentChat, selectChat, deleteChat, renameChat, starChat, createNewChat } = useChat();
  const [searchOpen, setSearchOpen] = useState(false);

  const { resolvedTheme } = useTheme();

  // Debug logging
  console.log('[AppSidebar] Chats from context:', chats);
  console.log('[AppSidebar] Current chat:', currentChat);

  // pinned first, then most recently active — matches what users expect
  const recentChats = [...chats].sort((a, b) => {
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  console.log('[AppSidebar] Recent chats after sort:', recentChats);

  const handleNewChat = () => {
    createNewChat();
    navigate('/chat');
    onItemClick?.(); // Close mobile drawer
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    navigate('/chat');
    onItemClick?.(); // Close mobile drawer
  };

  const handleRename = (chatId: string, newTitle: string) => {
    renameChat(chatId, newTitle);
  };

  const handlePin = (chatId: string) => {
    starChat(chatId);
  };

  const handleDelete = (chatId: string) => {
    deleteChat(chatId);
  };

  // clicking logo when collapsed re-expands the sidebar
  const handleLogoClick = () => {
    if (collapsed) {
      onToggle();
    }
  };

  return (
    <>
      <aside className={cn(
        'h-screen border-r flex flex-col transition-all duration-300 ease-in-out',
        // Mobile: always full width, no collapse
        isMobile ? 'w-64 bg-sidebar border-sidebar-border' : '',
        // Desktop: support collapse
        !isMobile && collapsed ? 'w-[72px] bg-background border-border' : '',
        !isMobile && !collapsed ? 'w-64 bg-sidebar border-sidebar-border' : ''
      )}>
        {/* Header with Logo */}
        <div className={cn(
          "flex items-center border-b",
          collapsed ? "justify-center h-[60px] border-border" : "h-[60px] px-3 border-sidebar-border"
        )}>
          {collapsed ? (
            <button
              onClick={handleLogoClick}
              className="w-12 h-12 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img src={resolvedTheme === 'dark' ? "/DataNesTX_Logo_Dark_Frontend.png" : "/DataNesTX_Logo_Light_Frontend.png"} alt="DataNesTX Logo" className="w-12 h-12" />
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <img src={resolvedTheme === 'dark' ? "/DataNesTX_Logo_Dark_Frontend.png" : "/DataNesTX_Logo_Light_Frontend.png"} alt="DataNesTX Logo" className="w-12 h-12" />
                <span className="font-semibold text-sm text-sidebar-foreground">CorpusAI</span>
                <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-0.5 rounded-full ml-2 flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]"></span>
                  </span>
                  Beta
                </span>
              </div>
              <button
                onClick={onToggle}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Creative Space Button */}
        <div className={cn(
          "flex justify-center",
          !isMobile && collapsed ? "py-3" : "p-3"
        )}>
          <Link to="/creative-space" id="tour-creative-space" className={!isMobile && collapsed ? "" : "w-full"} onClick={onItemClick}>
            <Button
              variant="default"
              className={cn(
                'gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white border-0 transition-all duration-300',
                // Glow effect on hover
                'hover:shadow-[0_0_20px_rgba(168,85,247,0.6),0_0_40px_rgba(236,72,153,0.4),0_0_60px_rgba(249,115,22,0.3)]',
                'hover:scale-105 active:scale-100',
                // Touch-friendly on mobile
                'h-11 xl:h-10',
                !isMobile && collapsed ? 'w-10 p-0' : 'w-full justify-start',
                location.pathname === '/creative-space' && 'ring-2 ring-white/30 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
              )}
            >
              <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
              {(isMobile || !collapsed) && (
                <span className="font-semibold whitespace-nowrap">
                  Creative Space
                </span>
              )}
            </Button>
          </Link>
        </div>

        {/* New Chat Button */}
        <div className={cn(
          "flex justify-center",
          !isMobile && collapsed ? "pb-3" : "px-3 pb-2"
        )}>
          <Button
            onClick={handleNewChat}
            variant="outline"
            id="tour-new-chat"
            className={cn(
              'gap-2 border-dashed transition-all duration-300',
              // Touch-friendly on mobile
              'h-11 xl:h-10',
              !isMobile && collapsed ? 'w-10 p-0' : 'w-full justify-start'
            )}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {(isMobile || !collapsed) && <span className="whitespace-nowrap">New Chat</span>}
          </Button>
        </div>

        {/* Search Chat Button - Below New Chat */}
        {(isMobile || !collapsed) && (
          <div className="px-3 pb-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 xl:py-2 rounded-lg transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50 min-h-[44px] xl:min-h-0"
            >
              <Search className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Search Chats</span>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          "flex flex-col gap-1",
          !isMobile && collapsed ? "items-center py-2" : "px-3 pt-2"
        )}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onItemClick}
                id={item.label === 'Resources' ? 'tour-nav-resources' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                  // Touch-friendly on mobile
                  'min-h-[44px] xl:min-h-0',
                  !isMobile && collapsed ? 'h-10 w-10 justify-center' : 'w-full px-3 py-2.5'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(isMobile || !collapsed) && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Recent Chats */}
        {(isMobile || !collapsed) && (
          <div
            className="flex-1 overflow-y-auto px-3 py-2 min-h-0"
            onWheel={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-medium text-muted-foreground mb-2 px-3">Recent</p>
            <div className="space-y-1">
              {recentChats.map(chat => (
                <ChatItemMenu
                  key={chat.id}
                  chatId={chat.id}
                  chatTitle={chat.title}
                  isStarred={chat.starred}
                  isActive={currentChat?.id === chat.id}
                  onRename={handleRename}
                  onStar={handlePin}
                  onDelete={handleDelete}
                  onSelect={handleSelectChat}
                  updatedAt={chat.updatedAt}
                />
              ))}
              {recentChats.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No chats yet
                </p>
              )}
            </div>
          </div>
        )}

        {/* User Section */}
        <div className={cn(
          "mt-auto border-t flex",
          collapsed ? "justify-center py-3 border-border" : "p-3 border-sidebar-border"
        )}>
          <UserMenu collapsed={collapsed} />
        </div>
      </aside>

      <ChatSearchPopup open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
