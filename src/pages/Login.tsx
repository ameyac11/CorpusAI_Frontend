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
        <div className="backdrop-blur-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/20 shadow-2xl rounded-[32px] p-8 relative overflow-hidden">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full"></div>
              <img src="/DataNesTX_Logo_Dark_Frontend.png" alt="DataNesTX Logo" className="w-16 h-16 relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
            </div>
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
                    className="w-full h-12 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300 font-medium text-lg"
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
