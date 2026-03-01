import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Target, Scale, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export type BehaviorMode = 'grounded' | 'balanced' | 'creative';

interface BehaviorSliderProps {
  value: BehaviorMode;
  onChange: (mode: BehaviorMode) => void;
  disabled?: boolean;
}

const MODES = [
  {
    value: 'grounded' as BehaviorMode,
    label: 'Grounded — precise and factual',
    short: 'Grounded',
    icon: Target,
    activeClass: 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
  },
  {
    value: 'balanced' as BehaviorMode,
    label: 'Balanced — default tone',
    short: 'Balanced',
    icon: Scale,
    activeClass: 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
  },
  {
    value: 'creative' as BehaviorMode,
    label: 'Creative — expressive and varied',
    short: 'Creative',
    icon: Sparkles,
    activeClass: 'bg-gradient-to-r from-orange-400 to-pink-500 shadow-[0_0_12px_rgba(249,115,22,0.4)]'
  },
];

const positionIndex: Record<BehaviorMode, number> = {
  grounded: 0,
  balanced: 1,
  creative: 2,
};

export function BehaviorSlider({ value, onChange, disabled }: BehaviorSliderProps) {
  const idx = positionIndex[value] ?? 1;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative flex items-center select-none',
              'h-7 rounded-full p-0.5',
              'bg-background/40 border border-border/30 shadow-sm',
              disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
            )}
          >
            {/* Track */}
            <div className="relative flex items-center w-full gap-0.5">
              {MODES.map((mode) => {
                const isActive = value === mode.value;
                const Icon = mode.icon;

                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => onChange(mode.value)}
                    className={cn(
                      'relative z-10 flex items-center justify-center gap-1.5',
                      'px-2 py-1 text-[10px] font-medium rounded-full outline-none',
                      'transition-colors duration-300 ease-in-out',
                      'whitespace-nowrap leading-none',
                      isActive
                        ? 'text-white'
                        : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5',
                    )}
                    title={mode.label}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="behavior-slider-active-pill"
                        className={cn("absolute inset-0 rounded-full", mode.activeClass)}
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        style={{ zIndex: -1 }}
                      />
                    )}
                    <Icon className={cn("w-3 h-3 transition-transform", isActive ? "scale-110" : "opacity-70")} />
                    <span className="relative z-10">{mode.short}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-[10px] font-medium border border-border/40 bg-background/95 backdrop-blur-xl">
          Behavior: <span className="text-primary">{MODES[idx].label}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

