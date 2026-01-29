import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

/**
 * OAuth Callback Page
 * Handles the redirect from OAuth providers (Google/GitHub).
 * Parses tokens from URL, stores them, and redirects to chat.
 */
export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { checkAuth } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing authentication...');

    useEffect(() => {
        const processCallback = async () => {
            // Check for error in URL
            const error = searchParams.get('error');
            if (error) {
                setStatus('error');
                setMessage(error === 'oauth_failed'
                    ? 'Authentication failed. Please try again.'
                    : error
                );
                setTimeout(() => navigate('/login'), 3000);
                return;
            }

            // Cookies are already set by backend, just verify authentication
            const provider = searchParams.get('provider');
            if (provider) {
                setStatus('success');
                setMessage('Authentication successful! Redirecting...');

                // Refresh auth state (will read from cookies)
                await checkAuth();

                // Redirect to onboarding (it will check if completed and redirect to chat)
                setTimeout(() => navigate('/onboarding'), 1500);
            } else {
                setStatus('error');
                setMessage('Invalid callback. Please try again.');
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        processCallback();
    }, [searchParams, navigate, checkAuth]);

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
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
                <div className="absolute inset-0 bg-black/40" />
            </div>

            <main className="relative z-10 w-full max-w-md px-4 animate-in fade-in zoom-in duration-500">
                {/* Glass Card */}
                <div className="backdrop-blur-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/20 shadow-2xl rounded-[32px] p-8 relative overflow-hidden text-center">
                    {status === 'loading' && (
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
                                <Loader2 className="w-8 h-8 text-white animate-spin" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Authenticating...</h2>
                            <p className="text-white/60">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Success!</h2>
                            <p className="text-white/60">{message}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-semibold text-white">Authentication Failed</h2>
                            <p className="text-white/60">{message}</p>
                            <p className="text-sm text-white/40">Redirecting to login...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
