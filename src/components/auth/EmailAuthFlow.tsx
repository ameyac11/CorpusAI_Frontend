import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface EmailAuthFlowProps {
  mode: 'login' | 'signup';
}

export function EmailAuthFlow({ mode }: EmailAuthFlowProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { login, signup, forgotPassword, resendVerification } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 2;

  const handleNext = async () => {
    setError('');

    if (step === 1) {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      if (mode === 'login') {
        setIsLoading(true);
        try {
          const result = await login(email, password);
          // Check if onboarding is completed - redirect accordingly
          // The login function returns the onboarding status
          navigate('/onboarding');
        } catch (err: any) {
          setError(err.message || 'Invalid credentials');
        } finally {
          setIsLoading(false);
        }
      } else {
        // Signup mode - validate password confirmation
        if (!confirmPassword) {
          setError('Please confirm your password');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        setIsLoading(true);
        try {
          await signup(email, password);
          // Show success screen instead of navigating
          setSignupSuccess(true);
        } catch (err: any) {
          setError(err.message || 'Signup failed');
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleResendVerification = async () => {
    setIsLoading(true);
    setError('');
    try {
      await resendVerification(email);
      // Show success feedback
    } catch (err: any) {
      setError(err.message || 'Failed to resend email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter your email first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setForgotPasswordSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  // Signup success view - Email verification required
  if (signupSuccess) {
    return (
      <div className="space-y-6 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Check your email!</h3>
          <p className="text-sm text-muted-foreground">
            We've sent a verification link to
          </p>
          <p className="text-sm font-medium text-foreground">
            {email}
          </p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Verification Required
              </p>
              <p className="text-xs text-muted-foreground">
                You must verify your email before you can log in. Click the verification link in your email to activate your account.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or
          </p>
          <Button
            variant="outline"
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Sending...' : 'Resend verification email'}
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  // Forgot password confirmation view
  if (forgotPasswordSent) {
    return (
      <div className="space-y-6 text-center animate-fade-in">
        <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground">Check your email</h3>
          <p className="text-sm text-muted-foreground mt-2">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setShowForgotPassword(false);
            setForgotPasswordSent(false);
          }}
          className="w-full"
        >
          Back to login
        </Button>
      </div>
    );
  }

  // Forgot password form
  if (showForgotPassword) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h3 className="text-lg font-medium text-foreground">Forgot password?</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-destructive text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowForgotPassword(false)}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleForgotPassword}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      {/* Hidden in new design as parent handles flow */}

      {/* Step Content */}
      <div className="space-y-4">
        {step === 1 && (
          <div className="animate-fade-in space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-medium text-white">Enter your email</h3>
              <p className="text-sm text-white/50 mt-1">
                We'll use this to {mode === 'login' ? 'find your account' : 'create your account'}
              </p>
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#8b5cf6] transition-colors" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 h-12 bg-black/40 border-2 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-[#8b5cf6] focus:bg-black/60 focus:ring-0 transition-all duration-300"
                autoFocus
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-medium text-white">Enter your password</h3>
              <p className="text-sm text-white/50 mt-1">
                {mode === 'signup' ? 'Create a secure password' : 'Welcome back!'}
              </p>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#8b5cf6] transition-colors" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 h-12 bg-black/40 border-2 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-[#8b5cf6] focus:bg-black/60 focus:ring-0 transition-all duration-300"
                autoFocus
              />
            </div>
            {mode === 'signup' && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-[#8b5cf6] transition-colors" />
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-12 h-12 bg-black/40 border-2 border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-[#8b5cf6] focus:bg-black/60 focus:ring-0 transition-all duration-300"
                />
              </div>
            )}
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-[#8b5cf6] hover:text-[#a78bfa] hover:underline w-full text-center transition-colors"
              >
                Forgot your password?
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
            {error.toLowerCase().includes('verify your email') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={isLoading}
                className="w-full text-xs border-white/20 text-white hover:bg-white/10"
              >
                {isLoading ? 'Sending...' : 'Resend verification email'}
              </Button>
            )}
            {error.toLowerCase().includes('already exists') && mode === 'signup' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="w-full text-xs text-white/60 hover:text-white"
              >
                Go to login
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-2">
        {step > 1 && (
          // Hidden back button here since parent has one, but needed for internal step 2 -> 1
          <Button
            variant="ghost"
            onClick={() => setStep(step - 1)}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="flex-1 h-12 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300"
        >
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : step === totalSteps ? (
            <>
              {mode === 'login' ? 'Sign In' : 'Create Account'}
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
    </div>
  );
}
