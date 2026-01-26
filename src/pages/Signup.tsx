import React from 'react';
import { Link } from 'react-router-dom';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { EmailAuthFlow } from '@/components/auth/EmailAuthFlow';

export default function Signup() {
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
              Create Account
            </h1>
            <p className="text-xs text-gray-200/80 font-medium">
              Start chatting with your documents today.
            </p>
          </div>

          <div className="space-y-3">
            {/* Social Buttons */}
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
                  Or sign up with email
                </span>
              </div>
            </div>

            {/* Email Flow */}
            <EmailAuthFlow mode="signup" />
          </div>

          {/* Login Link */}
          <p className="text-center text-xs text-gray-300 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-white font-semibold hover:underline decoration-2 transition-all"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/50 mt-8">
          By signing up, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-white transition-colors">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline hover:text-white transition-colors">Privacy Policy</Link>
        </p>
      </main>
    </div>
  );
}
