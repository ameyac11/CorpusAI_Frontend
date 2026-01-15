import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const userId = searchParams.get('userId');
      const secret = searchParams.get('secret');

      if (!userId || !secret) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }

      try {
        const response = await authService.verifyEmail(userId, secret);
        
        if (response.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
        } else {
          setStatus('error');
          setMessage(response.error?.message || 'Verification failed. The link may have expired.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Verification failed. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            {status === 'verifying' && (
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground">
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </h1>

          {/* Message */}
          <p className="text-muted-foreground">{message}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {status === 'success' && (
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Go to Login
            </Button>
          )}
          
          {status === 'error' && (
            <>
              <Button
                onClick={() => navigate('/signup')}
                className="w-full"
              >
                Try Signing Up Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Return to Home
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
