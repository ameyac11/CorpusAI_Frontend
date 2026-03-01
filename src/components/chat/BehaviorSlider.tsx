import React from 'react';
import { cn } from '@/lib/utils';
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

const MODES: { value: BehaviorMode; label: string; short: string }[] = [
  { value: 'grounded', label: 'Grounded — precise and factual', short: 'Grounded' },
  { value: 'balanced', label: 'Balanced — default tone', short: 'Balanced' },
  { value: 'creative', label: 'Creative — expressive and varied', short: 'Creative' },
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
              'h-7 rounded-full px-0.5',
              'bg-background/40 border border-border/30 shadow-sm',
              disabled && 'opacity-50 pointer-events-none',
            )}
          >
            {/* Track */}
            <div className="relative flex items-center w-full gap-0">
              {MODES.map((mode, i) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => onChange(mode.value)}
                  className={cn(
                    'relative z-10 flex items-center justify-center',
                    'px-2 py-1 text-[10px] font-medium rounded-full',
                    'transition-all duration-250 ease-in-out',
                    'whitespace-nowrap leading-none',
                    value === mode.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                  title={mode.label}
                >
                  {mode.short}
                </button>
              ))}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Behavior: {MODES[idx].label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
