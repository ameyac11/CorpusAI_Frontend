import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Moon, Sun, User, Bell, Shield, HelpCircle, Mail, Clock, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
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

type SettingsTab = 'appearance' | 'ai' | 'account' | 'notifications' | 'help';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'appearance', label: 'Appearance', icon: Sun },
  { id: 'ai', label: 'AI Preferences', icon: Shield },
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
];


interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { model, setModel, dataSource, setDataSource } = useChat();
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');

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
                  <SelectTrigger className="w-32 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4.1">GPT-4.1</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="qwen3-32b">Qwen 3 32B</SelectItem>
                    <SelectItem value="llama-3.3-70b">Llama 3.3 70B</SelectItem>
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

      case 'account':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-foreground mb-1">Account</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage your profile and plan</p>
            </div>

            {isAuthenticated ? (
              <div className="p-5 rounded-xl border border-border bg-card/50 flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-foreground">{user?.username}</h4>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20 uppercase tracking-wider">
                      Free Plan
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="pt-2 flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs">Edit Profile</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">Sign Out</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center bg-card/30">
                <div className="w-12 h-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="text-sm font-medium text-foreground mb-1">Guest Access</h4>
                <p className="text-xs text-muted-foreground mb-4 max-w-[200px] mx-auto">Create an account to sync your chats and access advanced features.</p>
                <Button size="sm" onClick={() => navigate('/login')}>Sign In / Register</Button>
              </div>
            )}


          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-foreground mb-1">Notifications</h3>
              <p className="text-sm text-muted-foreground mb-4">Choose what alerts you want to receive</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Email Notifications', desc: 'Receive updates about your account', default: true },
                { label: 'Desktop Alerts', desc: 'Show notifications when app is in background', default: false },
                { label: 'Weekly Digest', desc: 'Summary of your weekly learning progress', default: true },
                { label: 'Product Updates', desc: 'New features and improvement announcements', default: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card/30">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  {/* Mock Toggle */}
                  <div className={cn(
                    "w-9 h-5 rounded-full relative transition-colors cursor-pointer",
                    item.default ? "bg-primary" : "bg-zinc-700"
                  )}>
                    <div className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                      item.default ? "left-[18px]" : "left-0.5"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-foreground mb-1">Help & Support</h3>
              <p className="text-sm text-muted-foreground mb-4">We're here to help you</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <button className="p-4 rounded-xl border border-border bg-card/30 hover:bg-accent/50 transition-colors text-left group">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-foreground">Documentation</p>
                <p className="text-xs text-muted-foreground mt-1">Read guides and docs</p>
              </button>
              <button className="p-4 rounded-xl border border-border bg-card/30 hover:bg-accent/50 transition-colors text-left group">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Monitor className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-foreground">Keyboard Shortcuts</p>
                <p className="text-xs text-muted-foreground mt-1">View all shortcuts</p>
              </button>
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
                SendMessage
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[95vw] sm:w-[800px] h-[85vh] sm:h-[600px] p-0 gap-0 overflow-hidden bg-background border-zinc-800 [&>button]:hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row h-full">
          {/* Sidebar - Horizontal on mobile, vertical on desktop */}
          <div className="sm:w-60 bg-secondary/20 border-b sm:border-b-0 sm:border-r border-border p-3 sm:p-4 flex sm:flex-col backdrop-blur-sm shrink-0">
            <div className="hidden sm:block mb-6 px-2 pt-2">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-2 h-6 rounded-full bg-primary/80" />
                Settings
              </h2>
            </div>

            {/* Mobile: horizontal scroll tabs */}
            <nav className="flex sm:flex-col gap-1 sm:gap-1.5 flex-1 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 sm:gap-3 px-3 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 group whitespace-nowrap shrink-0 sm:shrink sm:w-full',
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary font-medium shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <tab.icon className={cn(
                    "w-4 h-4 transition-colors shrink-0",
                    activeTab === tab.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
            <div className="hidden sm:block mt-auto px-2">
              <p className="text-[10px] text-muted-foreground text-center opacity-50">
                v2.4.0 (Build 8902)
              </p>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-background/50 overflow-hidden">
            {/* Header with Close */}
            <div className="flex items-center justify-between sm:justify-end p-3 sm:p-4 pb-0 shrink-0">
              <h2 className="sm:hidden text-base font-semibold text-foreground">
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-2">
              {renderContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
