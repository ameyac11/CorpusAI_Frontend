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
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                    <Lightbulb className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    What will you use CorpusAI for?
                </h2>
                <p className="text-muted-foreground">
                    This helps us tailor your experience
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {purposes.map((option) => {
                    const isSelected = purpose === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => setPurpose(option.id)}
                            className={cn(
                                'px-6 py-4 rounded-xl border-2 transition-all duration-200',
                                'hover:scale-105 hover:shadow-md text-left',
                                isSelected
                                    ? 'border-primary bg-primary/10 shadow-md scale-105'
                                    : 'border-border hover:border-primary/50 bg-card'
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    'font-medium',
                                    isSelected ? 'text-primary' : 'text-foreground'
                                )}>
                                    {option.label}
                                </span>
                                {isSelected && (
                                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <svg
                                            className="w-3 h-3 text-primary-foreground"
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
