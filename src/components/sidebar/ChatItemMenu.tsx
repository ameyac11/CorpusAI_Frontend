import React, { useState } from 'react';
import { MoreHorizontal, Pencil, Pin, Trash2, Check, X, MessageSquare, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatItemMenuProps {
  chatId: string;
  chatTitle: string;
  isStarred?: boolean;
  isActive?: boolean;
  onRename: (chatId: string, newTitle: string) => void;
  onStar: (chatId: string) => void;
  onDelete: (chatId: string) => void;
  onSelect: (chatId: string) => void;
  updatedAt: Date;
}

export function ChatItemMenu({
  chatId,
  chatTitle,
  isStarred = false,
  isActive = false,
  onRename,
  onStar,
  onDelete,
  onSelect,
  updatedAt,
}: ChatItemMenuProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(chatTitle);

  const handleSaveRename = () => {
    if (newTitle.trim()) {
      onRename(chatId, newTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancelRename = () => {
    setNewTitle(chatTitle);
    setIsEditing(false);
  };

  // When editing, show full-width clean edit UI
  if (isEditing) {
    return (
      <div
        className="w-full px-3 py-2.5 rounded-lg bg-sidebar-accent border-2 border-primary/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="h-8 text-sm px-3 flex-1 bg-background border-border focus:border-primary"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename();
              if (e.key === 'Escape') handleCancelRename();
              e.stopPropagation();
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={handleSaveRename}
            className="p-2 rounded-md bg-green-500/15 text-green-600 hover:bg-green-500/25 transition-colors shrink-0"
            title="Save (Enter)"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancelRename}
            className="p-2 rounded-md bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors shrink-0"
            title="Cancel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Normal chat item display
  return (
    <button
      onClick={() => onSelect(chatId)}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-sidebar-accent/50 transition-colors group",
        isActive && "bg-sidebar-accent"
      )}
    >
      <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-sm text-sidebar-foreground truncate">{chatTitle}</p>
          {isStarred && (
            <Pin className="w-2.5 h-2.5 text-primary shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-popover border border-border z-50 min-w-[150px]"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            onClick={() => {
              setNewTitle(chatTitle);
              setIsEditing(true);
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            <span>Rename</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onStar(chatId)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Pin className={cn("w-4 h-4", isStarred && "fill-primary text-primary")} />
            <span>{isStarred ? 'Unpin' : 'Pin'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(chatId)}
            className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </button>
  );
}
