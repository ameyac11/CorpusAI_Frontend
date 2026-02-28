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

    // bounce to login if they somehow landed here without auth
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // skip onboarding if they already completed it
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
        <div className="min-h-screen relative flex flex-col overflow-hidden bg-[#1a103c]">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("/background.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-[#2d1b69]/40 to-[#1a103c]/90" />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative z-10 w-full overflow-y-auto">

                {/* Progress indicator - Dots */}
                {step < totalSteps && (
                    <div className="flex items-center justify-center gap-2 mb-8">
                        {[...Array(totalSteps - 1)].map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 rounded-full transition-all duration-300 ${index + 1 === step
                                    ? 'w-8 bg-white'
                                    : 'w-1.5 bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                <div className="max-w-5xl backdrop-blur-2xl bg-white/10 border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-[32px] p-6 md:p-10 relative overflow-hidden">

                    {/* Step content */}
                    <div className="w-full text-center">
                        {renderStep()}
                    </div>

                    {/* Navigation buttons */}
                    {step < totalSteps && (
                        <div className="flex items-center justify-between mt-12 pt-4">
                            <Button
                                variant="ghost"
                                onClick={handleBack}
                                disabled={step === 1}
                                className={`text-white/60 hover:text-white hover:bg-white/10 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>

                            <Button
                                onClick={handleNext}
                                disabled={!canProceed() || isLoading}
                                className="min-w-[140px] bg-white text-[#1a103c] hover:bg-white/90 rounded-xl h-12 text-sm font-medium transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">Processing...</span>
                                ) : step === totalSteps - 1 ? (
                                    <>
                                        Finish
                                        <Check className="w-4 h-4 ml-2" />
                                    </>
                                ) : (
                                    <>
                                        Continue
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
