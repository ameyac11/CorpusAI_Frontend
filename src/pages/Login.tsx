import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { EmailAuthFlow } from '@/components/auth/EmailAuthFlow';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Login() {
  const [showEmailForm, setShowEmailForm] = useState(false);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Background Image - Matching Onboarding */}
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

      <main className="relative z-10 w-full max-w-[400px] px-4 animate-in fade-in zoom-in duration-500">
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-2xl p-8 relative overflow-hidden">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link to="/" className="relative hover:opacity-80 transition-opacity">
              {/* Removed the intense purple blur background */}
              <img src="/DataNesTX_Logo_Dark_Frontend.png" alt="DataNesTX Logo" className="w-16 h-16 relative z-10 drop-shadow-lg" />
            </Link>
          </div>

          {/* Title */}
          <div className="mb-8 text-center space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              CorpusAI
            </h1>
            <p className="text-sm text-white/60 font-medium">
              Chat with your documents, effortlessly.
            </p>
          </div>

          {/* Auth Content */}
          <div className="space-y-6">

            <SocialAuthButtons />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                <span className="bg-transparent px-2 text-white/40">
                  Or continue with email
                </span>
              </div>
            </div>

            {!showEmailForm ? (
              <div className="animate-fade-in">
                <div className="text-center">
                  <Button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full h-11 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-base"
                  >
                    Continue with Email
                  </Button>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <EmailAuthFlow mode="login" />
              </div>
            )}

          </div>

          {/* Sign Up Link */}
          {!showEmailForm && (
            <p className="text-center text-xs text-white/40 mt-8">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-white font-semibold hover:underline decoration-2 transition-all hover:text-[#8b5cf6]"
              >
                Sign up
              </Link>
            </p>
          )}
        </div>

        {/* Footer Links */}
        <p className="text-center text-xs text-white/30 mt-8">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-white transition-colors">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>
        </p>
      </main>
    </div>
  );
}
