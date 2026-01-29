import React from 'react';
import { BookOpen, Briefcase, User, Users, BarChart2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PurposeStepProps {
    purpose: string;
    setPurpose: (purpose: string) => void;
}

const purposes = [
    {
        id: 'research',
        label: 'Research & Learning',
        icon: BookOpen,
        color: 'from-blue-500/20 to-cyan-500/20',
        activeColor: 'bg-blue-500/20',
        iconColor: 'text-blue-400'
    },
    {
        id: 'work',
        label: 'Work Projects',
        icon: Briefcase,
        color: 'from-emerald-500/20 to-teal-500/20',
        activeColor: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400'
    },
    {
        id: 'personal',
        label: 'Personal Use',
        icon: User,
        color: 'from-purple-500/20 to-pink-500/20',
        activeColor: 'bg-purple-500/20',
        iconColor: 'text-purple-400'
    },
    {
        id: 'collaboration',
        label: 'Team Collaboration',
        icon: Users,
        color: 'from-orange-500/20 to-amber-500/20',
        activeColor: 'bg-orange-500/20',
        iconColor: 'text-orange-400'
    },
    {
        id: 'analysis',
        label: 'Data Analysis',
        icon: BarChart2,
        color: 'from-indigo-500/20 to-violet-500/20',
        activeColor: 'bg-indigo-500/20',
        iconColor: 'text-indigo-400'
    },
    {
        id: 'other',
        label: 'Other',
        icon: MoreHorizontal,
        color: 'from-gray-500/20 to-slate-500/20',
        activeColor: 'bg-gray-500/20',
        iconColor: 'text-gray-400'
    },
];

export function PurposeStep({ purpose, setPurpose }: PurposeStepProps) {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    What will you use CorpusAI for?
                </h2>
                <p className="text-white/60 text-lg font-light">
                    Help us personalize your experience
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {purposes.map((option) => {
                    const isSelected = purpose === option.id;
                    const Icon = option.icon;

                    return (
                        <button
                            key={option.id}
                            onClick={() => setPurpose(option.id)}
                            className={cn(
                                'group px-5 py-4 rounded-xl border transition-all duration-300 text-left relative overflow-hidden flex items-center gap-4',
                                'hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]',
                                isSelected
                                    ? 'border-white/40 bg-white/10 shadow-[0_0_25px_rgba(255,255,255,0.1)]'
                                    : 'border-white/5 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06]'
                            )}
                        >
                            {/* Gradient Background for active/hover state */}
                            <div className={cn(
                                'absolute inset-0 opacity-0 transition-opacity duration-300 bg-gradient-to-br pointer-events-none',
                                option.color,
                                isSelected ? 'opacity-100' : 'group-hover:opacity-30'
                            )} />

                            {/* Icon Container */}
                            <div className={cn(
                                'relative z-10 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 border border-white/10',
                                isSelected ? 'bg-white/20 shadow-inner' : 'bg-white/5 group-hover:bg-white/10'
                            )}>
                                <Icon className={cn(
                                    "w-5 h-5 transition-colors duration-300",
                                    isSelected ? 'text-white' : option.iconColor
                                )} />
                            </div>

                            {/* Text Content */}
                            <div className="relative z-10 flex-1 flex items-center justify-between min-w-0 gap-3">
                                <span className={cn(
                                    'font-semibold text-base transition-colors duration-200 text-white truncate'
                                )}>
                                    {option.label}
                                </span>

                                {/* Checkmark - Always rendered for layout stability */}
                                <div className={cn(
                                    "w-5 h-5 shrink-0 rounded-full bg-white text-[#1a103c] flex items-center justify-center shadow-lg transition-all duration-300",
                                    isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90"
                                )}>
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
