import React from 'react';
import { Sparkles, History, FileText, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui/dialog';
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface LoginPromptModalProps {
  open: boolean;
  onClose: () => void;
  autoShow?: boolean;
}

const features = [
  { icon: History, text: 'Save chat history' },
  { icon: FileText, text: 'Upload more documents' },
  { icon: Zap, text: 'Access advanced AI models' },
];

export function LoginPromptModal({ open, onClose, autoShow = false }: LoginPromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-[90vw] max-w-[340px] translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-border/60 bg-card p-5 shadow-xl animate-scale-in focus:outline-none"
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center glow-effect">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-center text-base font-semibold text-foreground mb-1">
            Log in to unlock more features
          </h2>
          <p className="text-center text-xs text-muted-foreground mb-4">
            Create a free account to access all features
          </p>

          {/* Features list */}
          <div className="space-y-2 mb-5">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/50 border border-border/30 animate-fade-in"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <Link to="/login" onClick={onClose} className="w-full">
              <Button
                variant="hero"
                className="w-full h-10 text-sm font-semibold"
              >
                Login
              </Button>
            </Link>
            <Link to="/signup" onClick={onClose} className="w-full">
              <Button
                variant="outline"
                className="w-full h-10 text-sm font-semibold border-border/60 hover:bg-secondary/80"
              >
                Sign Up
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
            >
              Continue as Guest
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
