import React from 'react';
import { Link } from 'react-router-dom';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { EmailAuthFlow } from '@/components/auth/EmailAuthFlow';

export default function Login() {
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
        <div className="absolute inset-0 bg-black/40" /> {/* Overlay for better text contrast */}
      </div>

      <main className="relative z-10 w-full max-w-[380px] px-4 animate-in fade-in zoom-in duration-500">
        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-3xl p-6 text-center">

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="bg-black/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/10">
              <img src="/DataNesTX_Logo_Dark_Frontend.png" alt="DataNesTX Logo" className="w-10 h-10" />
            </div>
          </div>

          {/* Title */}
          <div className="mb-4 space-y-0.5">
            <h1 className="text-xl font-bold text-white tracking-tight">
              CorpusAI
            </h1>
            <p className="text-xs text-gray-200/80 font-medium">
              Chat with your documents, effortlessly.
            </p>
          </div>

          {/* Auth Card Content */}
          <div className="space-y-3">
            {/* Social Buttons Wrapper */}
            <div className="button-glass-wrapper">
              <SocialAuthButtons />
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
                <span className="bg-transparent px-2 text-white/50">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Email Flow */}
            <EmailAuthFlow mode="login" />
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-xs text-gray-300 mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-white font-semibold hover:underline decoration-2 transition-all"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer Links */}
        <p className="text-center text-xs text-white/50 mt-8">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-white transition-colors">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>
        </p>
      </main>
    </div>
  );
}
