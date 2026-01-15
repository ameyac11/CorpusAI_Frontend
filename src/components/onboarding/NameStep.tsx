import React from 'react';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface NameStepProps {
    name: string;
    setName: (name: string) => void;
}

export function NameStep({ name, setName }: NameStepProps) {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full gradient-bg flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    Welcome! What's your name?
                </h2>
                <p className="text-muted-foreground">
                    Let's get to know you better
                </p>
            </div>

            <div className="max-w-md mx-auto">
                <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg py-6 text-center"
                    autoFocus
                />
            </div>
        </div>
    );
}
