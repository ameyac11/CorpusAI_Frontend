import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// Semantic animated icons using React state for hover
// Following enterprise-grade animation guidelines

interface AnimatedIconProps {
  className?: string;
  style?: React.CSSProperties;
  isHovered?: boolean; // External hover state from parent
}

// Mind Map / Network Icon - nodes pulse sequentially
export const AnimatedNetworkIcon: React.FC<AnimatedIconProps> = ({ className, isHovered: externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover !== undefined ? externalHover : internalHover;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <circle
        cx="12" cy="5" r="2"
        className={cn("transition-all duration-300", isHovered && "stroke-purple-500 opacity-100")}
        style={{ opacity: isHovered ? 1 : 0.7 }}
      />
      <circle
        cx="5" cy="19" r="2"
        className={cn("transition-all duration-500", isHovered && "stroke-purple-500")}
        style={{ opacity: isHovered ? 1 : 0.7 }}
      />
      <circle
        cx="19" cy="19" r="2"
        className={cn("transition-all duration-700", isHovered && "stroke-purple-500")}
        style={{ opacity: isHovered ? 1 : 0.7 }}
      />
      <line
        x1="12" y1="7" x2="5" y2="17"
        className={cn("transition-all duration-300", isHovered && "stroke-purple-400")}
      />
      <line
        x1="12" y1="7" x2="19" y2="17"
        className={cn("transition-all duration-500", isHovered && "stroke-purple-400")}
      />
      <line
        x1="7" y1="19" x2="17" y2="19"
        className={cn("transition-all duration-700", isHovered && "stroke-purple-400")}
      />
    </svg>
  );
};

// Audio / Headphones Icon - sound waves pulse
export const AnimatedHeadphonesIcon: React.FC<AnimatedIconProps> = ({ className, isHovered: externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover !== undefined ? externalHover : internalHover;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      {/* Sound waves */}
      <line
        x1="10" y1="10" x2="10" y2="14"
        strokeWidth="1.5"
        className={cn("transition-all origin-center", isHovered && "stroke-purple-500")}
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'scaleY(1)' : 'scaleY(0.5)',
          transition: 'all 0.3s ease-out'
        }}
      />
      <line
        x1="12" y1="9" x2="12" y2="15"
        strokeWidth="1.5"
        className={cn("transition-all origin-center", isHovered && "stroke-purple-500")}
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'scaleY(1)' : 'scaleY(0.5)',
          transition: 'all 0.4s ease-out 0.1s'
        }}
      />
      <line
        x1="14" y1="10" x2="14" y2="14"
        strokeWidth="1.5"
        className={cn("transition-all origin-center", isHovered && "stroke-purple-500")}
        style={{
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'scaleY(1)' : 'scaleY(0.5)',
          transition: 'all 0.5s ease-out 0.2s'
        }}
      />
    </svg>
  );
};

// Video Icon - play triangle pulses
export const AnimatedVideoIcon: React.FC<AnimatedIconProps> = ({ className, isHovered: externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover !== undefined ? externalHover : internalHover;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <polygon
        points="10 8 16 12 10 16"
        className="transition-all duration-300"
        style={{
          fill: isHovered ? 'rgba(139, 92, 246, 0.3)' : 'none',
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor'
        }}
      />
      <circle
        cx="18" cy="7" r="1.5"
        className="transition-all duration-500"
        style={{
          fill: isHovered ? 'rgb(239, 68, 68)' : 'currentColor',
          opacity: isHovered ? 1 : 0.3
        }}
      />
    </svg>
  );
};

// Report / FileText Icon - lines animate sequentially
export const AnimatedFileTextIcon: React.FC<AnimatedIconProps> = ({ className, isHovered: externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover !== undefined ? externalHover : internalHover;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line
        x1="8" y1="13" x2="16" y2="13"
        className="transition-all duration-300"
        style={{
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          strokeDasharray: 8,
          strokeDashoffset: isHovered ? 0 : 8
        }}
      />
      <line
        x1="8" y1="17" x2="14" y2="17"
        className="transition-all duration-400"
        style={{
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          strokeDasharray: 6,
          strokeDashoffset: isHovered ? 0 : 6,
          transitionDelay: '0.1s'
        }}
      />
      <line
        x1="8" y1="9" x2="12" y2="9"
        className="transition-all duration-500"
        style={{
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          strokeDasharray: 4,
          strokeDashoffset: isHovered ? 0 : 4,
          transitionDelay: '0.2s'
        }}
      />
    </svg>
  );
};

// Slides / Presentation Icon - bars rise inside
export const AnimatedPresentationIcon: React.FC<AnimatedIconProps> = ({ className, isHovered: externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover !== undefined ? externalHover : internalHover;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <rect
        x="3" y="3" width="18" height="13" rx="2"
        className="transition-all duration-300"
        style={{ stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor' }}
      />
      <path d="M12 16v5" />
      <path d="M8 21h8" />
      {/* Chart bars */}
      <line
        x1="7" y1="12" x2="7" y2="9"
        strokeWidth="2"
        className="transition-all origin-bottom"
        style={{
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          opacity: isHovered ? 1 : 0.5,
          transform: isHovered ? 'scaleY(1)' : 'scaleY(0.6)',
          transition: 'all 0.3s ease-out'
        }}
      />
      <line
        x1="10" y1="12" x2="10" y2="7"
        strokeWidth="2"
        className="transition-all origin-bottom"
        style={{
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          opacity: isHovered ? 1 : 0.5,
          transform: isHovered ? 'scaleY(1)' : 'scaleY(0.6)',
          transition: 'all 0.4s ease-out 0.1s'
        }}
      />
      <line
        x1="13" y1="12" x2="13" y2="10"
        strokeWidth="2"
        className="transition-all origin-bottom"
        style={{
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          opacity: isHovered ? 1 : 0.5,
          transform: isHovered ? 'scaleY(1)' : 'scaleY(0.6)',
          transition: 'all 0.5s ease-out 0.2s'
        }}
      />
    </svg>
  );
};

// Flashcards / CreditCard Icon - stripe draws
export const AnimatedCreditCardIcon: React.FC<AnimatedIconProps> = ({ className, isHovered: externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover !== undefined ? externalHover : internalHover;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line
        x1="1" y1="10" x2="23" y2="10"
        className="transition-all duration-500"
        style={{
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          strokeDasharray: 22,
          strokeDashoffset: isHovered ? 0 : 22
        }}
      />
      <rect
        x="4" y="13" width="4" height="3" rx="0.5"
        className="transition-all duration-300"
        style={{
          fill: isHovered ? 'rgba(139, 92, 246, 0.3)' : 'currentColor',
          opacity: isHovered ? 1 : 0.5
        }}
      />
    </svg>
  );
};

// Quiz / HelpCircle Icon - question mark glows
export const AnimatedHelpCircleIcon: React.FC<AnimatedIconProps> = ({ className, isHovered: externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover !== undefined ? externalHover : internalHover;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <circle cx="12" cy="12" r="10" />
      <path
        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
        className="transition-all duration-300"
        style={{ stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor' }}
      />
      <circle
        cx="12" cy="17" r="1"
        className="transition-all duration-500"
        style={{
          fill: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          transformOrigin: 'center'
        }}
      />
    </svg>
  );
};

// Infographics / BarChart Icon - bars animate up
export const AnimatedBarChartIcon: React.FC<AnimatedIconProps> = ({ className, isHovered: externalHover }) => {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHover !== undefined ? externalHover : internalHover;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <line x1="3" y1="21" x2="21" y2="21" />
      <rect
        x="5" y="10" width="4" height="11" rx="1"
        className="transition-all origin-bottom"
        style={{
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          fill: isHovered ? 'rgba(139, 92, 246, 0.2)' : 'none',
          transform: isHovered ? 'scaleY(1)' : 'scaleY(0.7)',
          transition: 'all 0.3s ease-out'
        }}
      />
      <rect
        x="10" y="5" width="4" height="16" rx="1"
        className="transition-all origin-bottom"
        style={{
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          fill: isHovered ? 'rgba(139, 92, 246, 0.2)' : 'none',
          transform: isHovered ? 'scaleY(1)' : 'scaleY(0.7)',
          transition: 'all 0.4s ease-out 0.1s'
        }}
      />
      <rect
        x="15" y="8" width="4" height="13" rx="1"
        className="transition-all origin-bottom"
        style={{
          stroke: isHovered ? 'rgb(139, 92, 246)' : 'currentColor',
          fill: isHovered ? 'rgba(139, 92, 246, 0.2)' : 'none',
          transform: isHovered ? 'scaleY(1)' : 'scaleY(0.7)',
          transition: 'all 0.5s ease-out 0.2s'
        }}
      />
    </svg>
  );
};

// Export all animated icons with their mapping keys
export const AnimatedIcons = {
  'mind-map': AnimatedNetworkIcon,
  'audio': AnimatedHeadphonesIcon,
  'video': AnimatedVideoIcon,
  'report': AnimatedFileTextIcon,
  'slides': AnimatedPresentationIcon,
  'flashcards': AnimatedCreditCardIcon,
  'quiz': AnimatedHelpCircleIcon,
  'infographics': AnimatedBarChartIcon,
} as const;

export type AnimatedIconType = keyof typeof AnimatedIcons;
