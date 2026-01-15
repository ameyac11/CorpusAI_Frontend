import React, { useState } from 'react';
import { ArrowUp, ChevronDown, Globe, Database, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChat, AIModel, DataSource } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const models: { value: AIModel; label: string }[] = [
  { value: 'gpt-4.1', label: 'GPT-4.1' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'qwen3-32b', label: 'Qwen 3 32B' },
  { value: 'llama-3.3-70b', label: 'Llama 3.3 70B' },
];

const dataSources: { value: DataSource; label: string }[] = [
  { value: 'documents', label: 'Documents' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'ai-only', label: 'AI Only' },
];

export function ChatInput() {
  const [input, setInput] = useState('');
  const { model, setModel, dataSource, setDataSource, internetSearch, setInternetSearch, sendMessage, createNewChat, currentChat } = useChat();
  const { incrementMessageCount, isAnonymous } = useAuth();

  const handleSend = () => {
    if (!input.trim()) return;

    if (isAnonymous && !incrementMessageCount()) {
      return;
    }

    if (!currentChat) {
      createNewChat();
    }

    sendMessage(input);
    setInput('');
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-secondary/50 border border-border rounded-2xl p-2 shadow-sm">
        {/* Controls Row - Top */}
        <div className="flex items-center gap-1 px-2 pb-2 border-b border-border/50">
          {/* Internet Search Toggle */}
          <button
            onClick={toggleInternetSearch}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all',
              internetSearch
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            )}
          >
            <Globe className={cn('w-3.5 h-3.5', internetSearch && 'text-primary')} />
            {internetSearch && <span>Web Search</span>}
          </button>

          {/* Data Source Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{dataSources.find(d => d.value === dataSource)?.label}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover border border-border z-50">
              {dataSources.map((d) => (
                <DropdownMenuItem
                  key={d.value}
                  onClick={() => setDataSource(d.value)}
                  className={cn(dataSource === d.value && 'bg-accent')}
                >
                  {d.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1" />

          {/* Model Selection */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Cpu className="w-3.5 h-3.5" />
                <span>{models.find(m => m.value === model)?.label}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border z-50">
              {models.map((m) => (
                <DropdownMenuItem
                  key={m.value}
                  onClick={() => setModel(m.value)}
                  className={cn(model === m.value && 'bg-accent')}
                >
                  {m.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Input Row */}
        <div className="flex items-end gap-2 pt-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent border-0 resize-none focus:outline-none text-foreground placeholder:text-muted-foreground min-h-[40px] max-h-[120px] text-sm px-2 py-1"
            rows={1}
          />

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            size="icon"
            className="rounded-xl h-8 w-8 shrink-0"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}