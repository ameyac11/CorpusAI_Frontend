import { useState } from 'react';
import { AlertCircle, X, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function EmailVerificationBanner() {
    const { user, emailVerified, resendVerification } = useAuth();
    const [isDismissed, setIsDismissed] = useState(() => {
        return localStorage.getItem('emailVerificationBannerDismissed') === 'true';
    });
    const [isResending, setIsResending] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Don't show if user is not logged in, email is verified, or banner is dismissed
    if (!user || emailVerified || isDismissed) {
        return null;
    }

    const handleDismiss = () => {
        setIsDismissed(true);
        localStorage.setItem('emailVerificationBannerDismissed', 'true');
    };

    const handleResend = async () => {
        if (!user?.email || isResending) return;

        setIsResending(true);
        setShowSuccess(false);

        try {
            await resendVerification(user.email);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (error) {
            console.error('Failed to resend verification email:', error);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 border-b border-purple-500/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                                Please verify your email address
                            </p>
                            <p className="text-xs text-gray-300 mt-0.5">
                                Check your inbox for a verification link to unlock all features.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {showSuccess ? (
                            <div className="flex items-center gap-2 text-sm text-green-400">
                                <Mail className="w-4 h-4" />
                                <span>Email sent!</span>
                            </div>
                        ) : (
                            <Button
                                onClick={handleResend}
                                disabled={isResending}
                                variant="ghost"
                                size="sm"
                                className="text-purple-300 hover:text-purple-100 hover:bg-purple-500/20"
                            >
                                {isResending ? 'Sending...' : 'Resend Email'}
                            </Button>
                        )}

                        <button
                            onClick={handleDismiss}
                            className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
