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
        <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2 mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    What best describes you?
                </h2>
                <p className="text-white/60 text-lg font-light">
                    Help us personalize your experience
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto">
                {roles.map((roleOption) => {
                    const Icon = roleOption.icon;
                    const isSelected = role === roleOption.id;

                    return (
                        <button
                            key={roleOption.id}
                            onClick={() => setRole(roleOption.id)}
                            className={cn(
                                'group relative p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center h-full',
                                'hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]',
                                isSelected
                                    ? 'border-white/40 bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-105'
                                    : 'border-white/5 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06]'
                            )}
                        >
                            {/* Icon with gradient background */}
                            <div className={cn(
                                'w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-all duration-300 shadow-lg',
                                'bg-gradient-to-br',
                                roleOption.color,
                                isSelected ? 'scale-110 shadow-xl' : 'group-hover:scale-110 group-hover:shadow-lg'
                            )}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>

                            {/* Title and description */}
                            <h3 className="text-lg font-semibold text-white mb-1 tracking-tight">
                                {roleOption.title}
                            </h3>
                            <p className="text-xs leading-relaxed text-white/50 group-hover:text-white/70 transition-colors">
                                {roleOption.description}
                            </p>

                            {/* Selection indicator */}
                            {isSelected && (
                                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white text-[#1a103c] flex items-center justify-center animate-scale-in shadow-lg">
                                    <svg
                                        className="w-4 h-4"
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
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
