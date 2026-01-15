import React, { useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export function WelcomeStep() {
    const [dots, setDots] = React.useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
            {/* Animated logo */}
            <div className="relative">
                <div className="absolute inset-0 gradient-bg opacity-20 blur-3xl rounded-full animate-pulse" />
                <div className="relative w-24 h-24 rounded-full gradient-bg flex items-center justify-center animate-float">
                    <Sparkles className="w-12 h-12 text-primary-foreground" />
                </div>
            </div>

            {/* Welcome message */}
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-foreground">
                    Welcome to CorpusAI!
                </h2>
                <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <p>
                        Setting up your account{dots}
                    </p>
                </div>
            </div>

            {/* Progress indicators */}
            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-primary animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                    />
                ))}
            </div>
        </div>
    );
}
