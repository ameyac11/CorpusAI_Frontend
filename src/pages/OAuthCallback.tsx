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
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                        <p className="text-muted-foreground">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                        <p className="text-foreground font-medium">{message}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-destructive mx-auto" />
                        <p className="text-destructive font-medium">{message}</p>
                        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
                    </>
                )}
            </div>
        </div>
    );
}
