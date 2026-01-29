import React from 'react';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NameStepProps {
    name: string;
    setName: (name: string) => void;
}

export function NameStep({ name, setName }: NameStepProps) {
    return (
        <div className="space-y-8 animate-fade-in flex flex-col items-center">
            {/* Logo Icon */}
            <div className="w-16 h-16 mb-4 relative">
                <img src="/DataNesTX_Logo_Dark_Frontend.png" alt="Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            </div>

            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    Welcome to CorpusAI
                </h2>
                <p className="text-white/60 text-lg font-light">
                    Let's personalize your experience
                </p>
            </div>

            <div className="w-full max-w-xs mx-auto pt-4 space-y-2">
                <label className="text-sm font-medium text-white/50 block text-left pl-1">
                    What should we call you?
                </label>
                <div className="relative group">
                    <Input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="text-lg py-6 px-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-[#8b5cf6] focus:bg-white/10 focus:ring-0 transition-all duration-300"
                        autoFocus
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#8b5cf6]/20 to-[#d946ef]/20 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 blur-xl" />
                </div>
            </div>
        </div>
    );
}
