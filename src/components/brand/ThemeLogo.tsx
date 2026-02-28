import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  forceTheme?: 'light' | 'dark';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  custom: '',
};

export function ThemeLogo({ className = '', size = 'md', forceTheme }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const activeTheme = forceTheme || resolvedTheme;

  return (
    <img
      src={activeTheme === 'dark' ? '/DataNesTX_Logo_Light_Frontend.png' : '/DataNesTX_Logo_Dark_Frontend.png'}
      alt="CorpusAI Logo"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}
