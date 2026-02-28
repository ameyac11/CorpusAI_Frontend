import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, BookOpen, Code2, Rocket, Microscope, Building2, User, Briefcase, BarChart2, Users, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { apiPost, apiGet } from '@/lib/api';
import { toast } from 'sonner';
import { ThemeLogo } from '@/components/brand/ThemeLogo';
import { cn } from '@/lib/utils';

const ROLES = [
    { id: 'student', label: 'Student', icon: BookOpen },
    { id: 'developer', label: 'Developer', icon: Code2 },
    { id: 'startup', label: 'Startup', icon: Rocket },
    { id: 'researcher', label: 'Researcher', icon: Microscope },
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'other', label: 'Other', icon: User },
];

const PURPOSES = [
    { id: 'research', label: 'Research & Learning', icon: BookOpen },
    { id: 'work', label: 'Work Projects', icon: Briefcase },
    { id: 'personal', label: 'Personal Use', icon: User },
    { id: 'collaboration', label: 'Team Collaboration', icon: Users },
    { id: 'analysis', label: 'Data Analysis', icon: BarChart2 },
    { id: 'other', label: 'Other', icon: MoreHorizontal },
];

export default function Onboarding() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();

    const [step, setStep] = useState(0);
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [purpose, setPurpose] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    // bounce to login if no auth
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // skip onboarding if already completed
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
        if (user) checkOnboarding();
    }, [user, navigate]);

    const handleNext = async () => {
        if (step === 3) {
            // Final step visible — navigate
            navigate('/chat');
        } else if (step === 2) {
            // Submit onboarding data on step 2 → show welcome
            setIsLoading(true);
            try {
                const response = await apiPost('/onboarding/complete', { name, role, purpose });
                if (response.success) {
                    setStep(3);
                    setTimeout(() => navigate('/chat'), 2000);
                } else {
                    toast.error('Failed to save your information. Please try again.');
                }
            } catch (error) {
                console.error('Onboarding error:', error);
                toast.error('Something went wrong. Please try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => setStep(prev => Math.max(0, prev - 1));

    const stepVariants = {
        initial: { opacity: 0, x: 16 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -16 }
    };

    // Loading state
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
        <div className="min-h-screen w-full flex items-center justify-center bg-background transition-colors relative overflow-hidden">
            {/* Gradient background orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 -left-24 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 -right-24 w-80 h-80 bg-orange-500/6 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
            </div>
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none transform-gpu" />

            <div className="w-full max-w-md px-6 relative z-10">
                {/* Progress dots */}
                <div className="flex gap-1.5 mb-5 justify-center">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1 rounded-full transition-all duration-400",
                                i <= step
                                    ? "w-6 bg-gradient-to-r from-purple-500 to-orange-500"
                                    : "bg-border w-1.5"
                            )}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="relative border border-border/30 rounded-2xl bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/10 overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />
                    <div className="p-6 flex-1 flex flex-col items-center text-center justify-center overflow-y-auto relative z-10">
                        {step !== 3 && (
                            <div className="w-10 h-10 mb-4 flex-shrink-0">
                                <ThemeLogo size="custom" className="w-full h-full object-contain" />
                            </div>
                        )}

                        <AnimatePresence mode="wait" custom={step}>
                            {step === 0 && (
                                <motion.div key="step0" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="w-full max-w-xs">
                                    <h2 className="text-lg font-semibold mb-1 tracking-tight">Welcome to CorpusAI</h2>
                                    <p className="text-sm text-muted-foreground mb-5">Let's personalize your experience.</p>
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-xs font-medium text-muted-foreground">What should we call you?</label>
                                        <Input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your name"
                                            className="h-10 px-3 text-sm rounded-lg"
                                            autoFocus
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {step === 1 && (
                                <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="w-full">
                                    <h2 className="text-lg font-semibold mb-1 tracking-tight">What best describes you?</h2>
                                    <p className="text-sm text-muted-foreground mb-5">Help us tailor the experience.</p>
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        {ROLES.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setRole(option.id)}
                                                className={cn(
                                                    "p-3 rounded-lg border text-left transition-all flex items-center gap-2.5 text-sm",
                                                    role === option.id
                                                        ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white border-transparent shadow-sm shadow-purple-500/15"
                                                        : "bg-card/60 border-border/30 hover:bg-card/80 text-foreground backdrop-blur-sm"
                                                )}
                                            >
                                                <option.icon className="w-4 h-4 shrink-0" />
                                                <span className="font-medium text-xs">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="w-full">
                                    <h2 className="text-lg font-semibold mb-1 tracking-tight">What will you use CorpusAI for?</h2>
                                    <p className="text-sm text-muted-foreground mb-5">Select your primary use case.</p>
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        {PURPOSES.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => setPurpose(option.id)}
                                                className={cn(
                                                    "p-3 rounded-lg border text-left transition-all flex items-center gap-2.5 text-sm",
                                                    purpose === option.id
                                                        ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white border-transparent shadow-sm shadow-purple-500/15"
                                                        : "bg-card/60 border-border/30 hover:bg-card/80 text-foreground backdrop-blur-sm"
                                                )}
                                            >
                                                <option.icon className="w-4 h-4 shrink-0" />
                                                <span className="font-medium text-xs">{option.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="w-full py-4">
                                    <div className="w-16 h-16 flex items-center justify-center mx-auto mb-5">
                                        <ThemeLogo size="custom" className="w-14 h-14 object-contain" />
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2 tracking-tight">You're all set, {name}!</h2>
                                    <p className="text-sm text-muted-foreground">Your workspace is ready.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-4 px-6 border-t border-border/30 flex items-center justify-between relative z-10">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBack}
                            disabled={step === 0 || step === 3}
                            className={cn("text-xs text-muted-foreground", step === 0 && "opacity-0 pointer-events-none")}
                        >
                            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                        </Button>

                        <div>
                            {step === 0 && !name.trim() ? (
                                <span className="text-xs text-muted-foreground">Type your name to continue</span>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={
                                        (step === 0 && name.trim().length < 2) ||
                                        (step === 1 && !role) ||
                                        (step === 2 && !purpose) ||
                                        isLoading
                                    }
                                    className="px-6 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white border-0 shadow-sm shadow-purple-500/15"
                                >
                                    {isLoading ? 'Processing...' : step === 3 ? 'Launch CorpusAI' : 'Continue'} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
