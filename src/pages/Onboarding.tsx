import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost, apiGet } from '@/lib/api';
import { toast } from 'sonner';

import { NameStep } from '@/components/onboarding/NameStep';
import { RoleStep } from '@/components/onboarding/RoleStep';
import { PurposeStep } from '@/components/onboarding/PurposeStep';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [purpose, setPurpose] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    // Redirect to login if not authenticated (after loading completes)
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Redirect if already completed onboarding
    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const response = await apiGet<{ success: boolean; data: { onboarding_completed: boolean } }>('/onboarding/status');
                if (response.success && response.data?.data?.onboarding_completed) {
                    navigate('/chat');
                }
            } catch (error) {
                console.error('Failed to check onboarding status:', error);
            }
        };

        if (user) {
            checkOnboarding();
        }
    }, [user, navigate]);

    const totalSteps = 4;

    const canProceed = () => {
        switch (step) {
            case 1:
                return name.trim().length >= 2;
            case 2:
                return role !== '';
            case 3:
                return purpose !== '';
            case 4:
                return true;
            default:
                return false;
        }
    };

    const handleNext = async () => {
        if (!canProceed()) {
            toast.error('Please complete the current step');
            return;
        }

        if (step < totalSteps - 1) {
            setStep(step + 1);
        } else if (step === totalSteps - 1) {
            // Submit onboarding data
            setIsLoading(true);
            try {
                const response = await apiPost('/onboarding/complete', {
                    name,
                    role,
                    purpose,
                });

                if (response.success) {
                    // Show welcome screen
                    setStep(totalSteps);

                    // After 2 seconds, navigate to chat
                    setTimeout(() => {
                        navigate('/chat');
                    }, 2000);
                } else {
                    toast.error('Failed to save your information. Please try again.');
                }
            } catch (error) {
                console.error('Onboarding error:', error);
                toast.error('Something went wrong. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <NameStep name={name} setName={setName} />;
            case 2:
                return <RoleStep role={role} setRole={setRole} />;
            case 3:
                return <PurposeStep purpose={purpose} setPurpose={setPurpose} />;
            case 4:
                return <WelcomeStep />;
            default:
                return null;
        }
    };

    // Show loading while auth is being checked
    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
                {/* Progress indicator */}
                {step < totalSteps && (
                    <div className="w-full max-w-md mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                                Step {step} of {totalSteps - 1}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {Math.round((step / (totalSteps - 1)) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full gradient-bg transition-all duration-500"
                                style={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Step content */}
                <div className="w-full max-w-4xl">
                    {renderStep()}
                </div>

                {/* Navigation buttons */}
                {step < totalSteps && (
                    <div className="flex items-center gap-3 mt-8">
                        {step > 1 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="min-w-[120px]"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            disabled={!canProceed() || isLoading}
                            className="min-w-[120px]"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Saving...</span>
                            ) : step === totalSteps - 1 ? (
                                <>
                                    Finish
                                    <Check className="w-4 h-4 ml-2" />
                                </>
                            ) : (
                                <>
                                    Next
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
