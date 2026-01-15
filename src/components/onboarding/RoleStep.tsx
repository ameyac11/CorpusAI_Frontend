import React from 'react';
import { GraduationCap, Code, Rocket, Microscope, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleStepProps {
    role: string;
    setRole: (role: string) => void;
}

const roles = [
    {
        id: 'student',
        title: 'Student',
        description: 'Learning and research',
        icon: GraduationCap,
        color: 'from-blue-500 to-blue-600',
    },
    {
        id: 'developer',
        title: 'Developer',
        description: 'Building applications',
        icon: Code,
        color: 'from-green-500 to-green-600',
    },
    {
        id: 'startup',
        title: 'Startup',
        description: 'Growing a business',
        icon: Rocket,
        color: 'from-purple-500 to-purple-600',
    },
    {
        id: 'researcher',
        title: 'Researcher',
        description: 'Academic work',
        icon: Microscope,
        color: 'from-pink-500 to-pink-600',
    },
    {
        id: 'business',
        title: 'Business',
        description: 'Enterprise solutions',
        icon: Building2,
        color: 'from-orange-500 to-orange-600',
    },
    {
        id: 'other',
        title: 'Other',
        description: 'Something else',
        icon: User,
        color: 'from-gray-500 to-gray-600',
    },
];

export function RoleStep({ role, setRole }: RoleStepProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    What best describes you?
                </h2>
                <p className="text-muted-foreground">
                    Help us personalize your experience
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {roles.map((roleOption) => {
                    const Icon = roleOption.icon;
                    const isSelected = role === roleOption.id;

                    return (
                        <button
                            key={roleOption.id}
                            onClick={() => setRole(roleOption.id)}
                            className={cn(
                                'group relative p-6 rounded-2xl border-2 transition-all duration-300',
                                'hover:scale-105 hover:shadow-lg',
                                isSelected
                                    ? 'border-primary bg-primary/5 shadow-lg scale-105'
                                    : 'border-border hover:border-primary/50 bg-card'
                            )}
                        >
                            {/* Icon with gradient background */}
                            <div className={cn(
                                'w-14 h-14 rounded-xl mb-4 flex items-center justify-center transition-transform',
                                'bg-gradient-to-br',
                                roleOption.color,
                                isSelected ? 'scale-110' : 'group-hover:scale-110'
                            )}>
                                <Icon className="w-7 h-7 text-white" />
                            </div>

                            {/* Title and description */}
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                                {roleOption.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {roleOption.description}
                            </p>

                            {/* Selection indicator */}
                            {isSelected && (
                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                                    <svg
                                        className="w-4 h-4 text-primary-foreground"
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
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
