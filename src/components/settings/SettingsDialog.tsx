import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Moon, Sun, Shield, HelpCircle, Mail, X, BarChart2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useChat, AIModel, DataSource } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

type SettingsTab = 'appearance' | 'ai' | 'usage' | 'help';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'ai', label: 'AI Preferences', icon: Shield },
  { id: 'usage', label: 'Usage', icon: BarChart2 },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];


interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { model, setModel, dataSource, setDataSource, userUsage } = useChat();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

  // navigate to landing page and smooth-scroll to contact section
  const handleContactUs = () => {
    onOpenChange(false);
    navigate('/');

    setTimeout(() => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-foreground mb-1">Theme</h3>
              <p className="text-sm text-muted-foreground mb-4">Customize how CorpusAI looks on your device</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 h-24',
                    theme === option.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
                  )}
                >
                  <option.icon className={cn(
                    'w-6 h-6',
                    theme === option.value ? 'text-primary' : 'text-muted-foreground'
                  )} />
                  <span className={cn(
                    'text-xs font-medium',
                    theme === option.value ? 'text-primary' : 'text-foreground'
                  )}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-foreground mb-1">AI Preferences</h3>
              <p className="text-sm text-muted-foreground mb-4">Configure your default AI behavior</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Default Model</p>
                  <p className="text-xs text-muted-foreground">Select the AI model for new chats</p>
                </div>
                <Select value={model} onValueChange={(v) => setModel(v as AIModel)}>
                  <SelectTrigger className="w-40 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llama-scout-4">Llama 4 Scout</SelectItem>
                    <SelectItem value="compound">Compound</SelectItem>
                    <SelectItem value="compound-mini">Compound Mini</SelectItem>
                    <SelectItem value="kimi-k2">Kimi K2</SelectItem>
                    <SelectItem value="gpt-oss-120b">GPT OSS 120B</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">Data Source</p>
                  <p className="text-xs text-muted-foreground">Default search scope</p>
                </div>
                <Select value={dataSource} onValueChange={(v) => setDataSource(v as DataSource)}>
                  <SelectTrigger className="w-40 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="documents">Documents Only</SelectItem>
                    <SelectItem value="hybrid">Hybrid Search</SelectItem>
                    <SelectItem value="ai-only">AI Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'usage':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-medium text-foreground mb-1">Daily Usage</h3>
              <p className="text-sm text-muted-foreground mb-4">Resets daily at midnight UTC</p>
            </div>
            {userUsage ? (
              <div className="space-y-4">
                {/* Queries */}
                <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Queries</p>
                      <p className="text-xs text-muted-foreground">Chat messages sent today</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {userUsage.queries.used}
                      <span className="text-muted-foreground font-normal">/{userUsage.queries.limit}</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        (userUsage.queries.used / userUsage.queries.limit) > 0.85 ? "bg-red-500" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(100, (userUsage.queries.used / userUsage.queries.limit) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userUsage.queries.limit - userUsage.queries.used} remaining
                  </p>
                </div>
                {/* Pages */}
                <div className="p-4 rounded-xl border border-border bg-card/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Pages Processed</p>
                      <p className="text-xs text-muted-foreground">PDF pages ingested today</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {userUsage.pages.used}
                      <span className="text-muted-foreground font-normal">/{userUsage.pages.limit}</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        (userUsage.pages.used / userUsage.pages.limit) > 0.85 ? "bg-red-500" : "bg-primary"
                      )}
                      style={{ width: `${Math.min(100, (userUsage.pages.used / userUsage.pages.limit) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {userUsage.pages.limit - userUsage.pages.used} remaining
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-border bg-card/50 text-center text-sm text-muted-foreground">
                Usage data not available
              </div>
            )}
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-foreground mb-1">Help & Support</h3>
              <p className="text-sm text-muted-foreground mb-4">We're here to help you</p>
            </div>

            <div className="rounded-xl border border-border p-4 bg-card/50">
              <h4 className="text-sm font-medium text-foreground mb-3">Contact Support</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">contact@corpusai.datanestx.tech</p>
                    <p className="text-xs text-muted-foreground">Response time: &lt; 24h</p>
                  </div>
                </div>
              </div>
              <Button onClick={handleContactUs} className="w-full mt-4" size="sm">
                Send Message
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[750px] w-full xl:w-[750px] h-screen xl:h-[550px] p-0 gap-0 overflow-hidden bg-background dark:bg-[#0A0A0A] xl:border-border dark:xl:border-white/20 border-0 xl:rounded-2xl rounded-none [&>button]:hidden shadow-2xl dark:xl:shadow-[0_0_50px_-12px_rgba(0,0,0,0.8)] ring-1 ring-border dark:ring-white/10 data-[state=open]:duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
        <div className="flex flex-col xl:flex-row h-full">
          {/* Sidebar - Horizontal on mobile, vertical on desktop */}
          <div className="xl:w-56 bg-secondary/20 border-b xl:border-b-0 xl:border-r border-border p-3 xl:p-4 flex xl:flex-col backdrop-blur-sm shrink-0">
            <div className="hidden xl:block mb-6 px-2 pt-2">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-2 h-6 rounded-full bg-primary/80" />
                Settings
              </h2>
            </div>

            {/* Mobile: horizontal scroll tabs */}
            <nav className="flex xl:flex-col gap-1 xl:gap-1.5 flex-1 overflow-x-auto xl:overflow-visible pb-1 xl:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 xl:gap-3 px-3 py-2 xl:py-2.5 rounded-lg text-sm transition-all duration-200 group whitespace-nowrap shrink-0 xl:shrink xl:w-full',
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary font-medium shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <tab.icon className={cn(
                    "w-4 h-4 transition-colors shrink-0",
                    activeTab === tab.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="hidden xl:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
            <div className="hidden xl:block mt-auto px-2">
              <p className="text-[10px] text-muted-foreground text-center opacity-50">
                v2.4.0 (Build 8902)
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-background/50 overflow-hidden">
            {/* Header with Close */}
            <div className="flex items-center justify-between xl:justify-end p-3 xl:p-4 pb-0 shrink-0">
              <h2 className="xl:hidden text-base font-semibold text-foreground">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 xl:p-8 pt-2">
              {renderContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
