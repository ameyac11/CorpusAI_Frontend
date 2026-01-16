import React from 'react';
import { Link } from 'react-router-dom';
import { LandingHeader } from '@/components/layout/LandingHeader';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { EmailAuthFlow } from '@/components/auth/EmailAuthFlow';
import { useTheme } from '@/contexts/ThemeContext';

export default function Login() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <LandingHeader />

      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-8 relative z-10">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-4 sm:mb-6 animate-fade-in">
            <img src={resolvedTheme === 'dark' ? "/DataNesTX_Logo_Dark_Frontend.png" : "/DataNesTX_Logo_Light_Frontend.png"} alt="DataNesTX Logo" className="w-16 h-16 sm:w-20 sm:h-20 animate-float" />
          </div>

          {/* Title */}
          <div className="text-center mb-4 sm:mb-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Sign in to continue to CorpusAI
            </p>
          </div>

          {/* Auth Card */}
          <div
            className="bg-card rounded-2xl p-4 sm:p-5 space-y-4 sm:space-y-5 border-2 border-border/60 shadow-lg animate-scale-in"
            style={{ animationDelay: '200ms' }}
          >
            {/* Social Buttons */}
            <SocialAuthButtons />

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/80" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Flow */}
            <EmailAuthFlow mode="login" />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground mt-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary hover:underline font-medium transition-colors hover:text-primary/80"
            >
              Sign up
            </Link>
          </p>

          {/* Terms & Privacy */}
          <p className="text-center text-xs text-muted-foreground mt-3 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <Link to="/terms" className="underline hover:text-foreground transition-colors">Terms of Service</Link>
            {' '}•{' '}
            <Link to="/privacy" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
