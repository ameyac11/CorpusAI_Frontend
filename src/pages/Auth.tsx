import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeLogo } from '@/components/brand/ThemeLogo';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet } from '@/lib/api';

type AuthMode = 'signin' | 'signup';
type AuthStep = 'method' | 'email' | 'password' | 'forgot' | 'signup-details' | 'signup-password';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { login, signup, loginWithGoogle, loginWithGithub, isAuthenticated, forgotPassword, resendVerification } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const initialMode = searchParams.get('mode') === 'signup' || location.pathname === '/signup' ? 'signup' : 'signin';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [step, setStep] = useState<AuthStep>('method');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Check if onboarding is already completed — if so, go straight to chat
      apiGet<{ success: boolean; data: { onboarding_completed: boolean } }>('/onboarding/status')
        .then(res => {
          if (res.success && res.data?.data?.onboarding_completed) {
            navigate('/chat', { replace: true });
          } else {
            navigate('/onboarding', { replace: true });
          }
        })
        .catch(() => navigate('/onboarding', { replace: true }));
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) setError(decodeURIComponent(errorParam));
  }, [searchParams]);

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setStep('method');
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSignupSuccess(false);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    setError('');
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Please enter your password'); return; }
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      try {
        const statusRes = await apiGet<{ success: boolean; data: { onboarding_completed: boolean } }>('/onboarding/status');
        if (statusRes.success && statusRes.data?.data?.onboarding_completed) {
          navigate('/chat');
        } else {
          navigate('/onboarding');
        }
      } catch {
        navigate('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    }
    setIsLoading(false);
  };

  const handleSignupDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    setError('');
    setStep('signup-password');
  };

  const handleSignupPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Please enter a password'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true);
    setError('');
    try {
      await signup(email, password);
      setSignupSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    setIsLoading(true);
    setError('');
    try {
      await forgotPassword(email);
      alert('If an account exists with this email, a password reset link has been sent.');
      setStep('email');
    } catch {
      alert('If an account exists with this email, a password reset link has been sent.');
      setStep('email');
    }
    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await resendVerification(email);
    } catch {
      // silent
    }
    setIsLoading(false);
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    if (provider === 'google') loginWithGoogle();
    else loginWithGithub();
  };

  const goBack = () => {
    setError('');
    if (step === 'password' || step === 'forgot') setStep('email');
    else if (step === 'email' || step === 'signup-details') setStep('method');
    else if (step === 'signup-password') setStep('signup-details');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 }
  };

  const isSignUp = mode === 'signup';

  const inputClass = "h-11 rounded-lg px-4 text-sm bg-muted/50 border border-border focus-visible:ring-1 focus-visible:ring-primary/30 transition-all";
  const primaryBtnClass = "w-full h-11 rounded-xl text-sm font-semibold transition-all bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white shadow-lg shadow-purple-500/15 border-0";
  const backBtnClass = "flex items-center text-xs text-muted-foreground hover:text-foreground transition-colors mb-4";

  // Signup success view - Email verification required
  if (signupSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background transition-colors relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/6 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none transform-gpu" />

        <div className="w-full max-w-sm px-6 relative z-10">
          <div className="p-8 rounded-2xl border border-border/30 bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/10 relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />
            <div className="text-center space-y-4 relative z-10">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Check your email!</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to
              </p>
              <p className="text-sm font-medium">{email}</p>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-left">
                <p className="text-sm font-medium mb-1">Verification Required</p>
                <p className="text-xs text-muted-foreground">
                  You must verify your email before you can log in. Click the verification link in your email to activate your account.
                </p>
              </div>
              <Button variant="outline" onClick={handleResendVerification} disabled={isLoading} className="w-full">
                {isLoading ? 'Sending...' : 'Resend verification email'}
              </Button>
              <Button variant="ghost" onClick={() => { setSignupSuccess(false); setMode('signin'); setStep('method'); }} className="w-full text-sm">
                Back to login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background transition-colors relative overflow-hidden">
      {/* Gradient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl" />
      </div>
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none transform-gpu" />

      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="absolute top-5 right-5 h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground z-20"
      >
        {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </Button>

      <div className="w-full max-w-sm px-6 relative z-10">
        {/* Card */}
        <div className="p-8 rounded-2xl border border-border/30 bg-card/60 backdrop-blur-xl shadow-2xl shadow-black/10 relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 via-transparent to-orange-500/5 pointer-events-none" />
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <Link to="/" className="inline-block group">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-105">
                    <ThemeLogo size="custom" className="w-10 h-10 object-contain" />
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight mb-1 group-hover:text-primary transition-colors">CorpusAI</h1>
                </Link>
                <p className="text-xs text-muted-foreground">
                  {step === 'method' && (isSignUp ? "Create your account" : "Sign in to continue")}
                  {step !== 'method' && (isSignUp ? "Create your account" : "Welcome back")}
                </p>
              </div>

              {step === 'method' && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full h-11 justify-start px-4 rounded-lg text-sm font-medium"
                    onClick={() => handleOAuthLogin('google')}
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full h-11 justify-start px-4 rounded-lg text-sm font-medium"
                    onClick={() => handleOAuthLogin('github')}
                    disabled={isLoading}
                  >
                    <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    Continue with GitHub
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 text-[10px] text-muted-foreground bg-card tracking-widest">OR</span>
                    </div>
                  </div>

                  <Button
                    className={primaryBtnClass}
                    onClick={() => setStep(isSignUp ? 'signup-details' : 'email')}
                  >
                    Continue with email
                  </Button>

                  <div className="text-center pt-4">
                    <span className="text-xs text-muted-foreground">
                      {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    </span>
                    <button type="button" onClick={switchMode} className="text-xs font-medium text-foreground hover:underline">
                      {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <button type="button" onClick={goBack} className={backBtnClass}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                  </button>
                  <Input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoFocus />
                  {error && <p className="text-destructive text-xs">{error}</p>}
                  <Button type="submit" className={primaryBtnClass} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></>}
                  </Button>
                </form>
              )}

              {step === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <button type="button" onClick={goBack} className={backBtnClass}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                  </button>
                  <div className="rounded-lg bg-muted/50 p-3 border border-border/50 mb-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Signing in as</p>
                    <p className="text-sm font-medium truncate">{email}</p>
                  </div>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={cn(inputClass, "pr-10")} autoFocus />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {error && (
                    <div className="space-y-2">
                      <p className="text-destructive text-xs">{error}</p>
                      {error.toLowerCase().includes('verify your email') && (
                        <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={isLoading} className="w-full text-xs">
                          {isLoading ? 'Sending...' : 'Resend verification email'}
                        </Button>
                      )}
                    </div>
                  )}
                  <Button type="submit" className={primaryBtnClass} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign in'}
                  </Button>
                  <button type="button" onClick={() => { setError(''); setStep('forgot'); }} className="w-full text-xs text-muted-foreground hover:text-foreground py-1 transition-colors">
                    Forgot password?
                  </button>
                </form>
              )}

              {step === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <button type="button" onClick={goBack} className={backBtnClass}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                  </button>
                  <Input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoFocus />
                  {error && <p className="text-destructive text-xs">{error}</p>}
                  <Button type="submit" className={primaryBtnClass} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send reset link'}
                  </Button>
                </form>
              )}

              {step === 'signup-details' && (
                <form onSubmit={handleSignupDetailsSubmit} className="space-y-4">
                  <button type="button" onClick={goBack} className={backBtnClass}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                  </button>
                  <Input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoFocus />
                  {error && <p className="text-destructive text-xs">{error}</p>}
                  <Button type="submit" className={primaryBtnClass} disabled={isLoading}>
                    Continue <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </form>
              )}

              {step === 'signup-password' && (
                <form onSubmit={handleSignupPasswordSubmit} className="space-y-4">
                  <button type="button" onClick={goBack} className={backBtnClass}>
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back
                  </button>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className={cn(inputClass, "pr-10")} autoFocus />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Input type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
                  {error && <p className="text-destructive text-xs">{error}</p>}
                  <Button type="submit" className={primaryBtnClass} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create account'}
                  </Button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center mt-6 text-[10px] text-muted-foreground">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">Terms</Link> and{' '}
          <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
