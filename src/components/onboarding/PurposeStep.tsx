import React from 'react';
import { Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PurposeStepProps {
    purpose: string;
    setPurpose: (purpose: string) => void;
}

const purposes = [
    { id: 'research', label: 'Research & Learning' },
    { id: 'work', label: 'Work Projects' },
    { id: 'personal', label: 'Personal Use' },
    { id: 'collaboration', label: 'Team Collaboration' },
    { id: 'analysis', label: 'Data Analysis' },
    { id: 'other', label: 'Other' },
];

export function PurposeStep({ purpose, setPurpose }: PurposeStepProps) {
    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    What "Job" are you hiring CorpusAI for?
                </h2>
                <p className="text-white/60 text-lg font-light">
                    Help us personalize your experience
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {purposes.map((option) => {
                    const isSelected = purpose === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => setPurpose(option.id)}
                            className={cn(
                                'px-6 py-5 rounded-xl border transition-all duration-200',
                                'hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] text-left',
                                isSelected
                                    ? 'border-white/50 bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.15)] scale-[1.02]'
                                    : 'border-white/10 hover:border-white/30 bg-white/5'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    'font-medium text-lg',
                                    isSelected ? 'text-white' : 'text-white/80'
                                )}>
                                    {option.label}
                                </span>
                                {isSelected && (
                                    <div className="w-6 h-6 rounded-full bg-white text-[#1a103c] flex items-center justify-center shadow-md">
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
