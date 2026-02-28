import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authService } from '@/services/authService';
import { tokenStorage } from '@/lib/api/tokenStorage';
import { API_CONFIG } from '@/lib/api/config';

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  providers?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  emailVerified: boolean;
  messageCount: number;
  maxAnonymousMessages: number;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username?: string) => Promise<void>;
  loginWithGoogle: () => void;
  loginWithGithub: () => void;
  logout: () => void;
  incrementMessageCount: () => boolean;
  showLoginPrompt: boolean;
  setShowLoginPrompt: (show: boolean) => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (userId: string, secret: string, newPassword: string) => Promise<void>;
  verifyEmail: (userId: string, secret: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const maxAnonymousMessages = 5;

  // try to restore session from cookies on app boot
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // Always try to get current user (cookies are sent automatically)
      const response = await authService.getCurrentUser();
      if (response.success && response.data) {
        setUser({
          id: response.data.id,
          email: response.data.email,
          username: response.data.username || response.data.email.split('@')[0],
          providers: response.data.providers,
        });
      } else {
        // no valid session — wipe any leftover localStorage tokens from before cookie migration
        setUser(null);
        tokenStorage.clearAll();
      }
    } catch (error) {
      setUser(null);
      tokenStorage.clearAll(); // Clean up any legacy tokens
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Login failed');
    }

    setUser({
      id: response.data.id,
      email: response.data.email,
      username: response.data.username || email.split('@')[0],
      providers: response.data.providers,
    });
    setEmailVerified(response.data.emailVerified ?? true);
    setMessageCount(0);
  }, []);

  const signup = useCallback(async (email: string, password: string, username?: string) => {
    const response = await authService.signup({ email, password, username });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Signup failed');
    }

    setUser({
      id: response.data.id,
      email: response.data.email,
      username: response.data.username || username || email.split('@')[0],
      providers: response.data.providers,
    });
    setEmailVerified(response.data.emailVerified ?? false);
    setMessageCount(0);
  }, []);

  const loginWithGoogle = useCallback(() => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_CONFIG.BASE_URL}/auth/google`;
  }, []);

  const loginWithGithub = useCallback(() => {
    // Redirect to backend GitHub OAuth endpoint
    window.location.href = `${API_CONFIG.BASE_URL}/auth/github`;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore errors
    }
    setUser(null);
    setMessageCount(0);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const response = await authService.forgotPassword(email);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to send reset email');
    }
  }, []);

  const resetPassword = useCallback(async (userId: string, secret: string, newPassword: string) => {
    const response = await authService.resetPassword(userId, secret, newPassword);
    if (!response.success) {
      throw new Error(response.error?.message || 'Password reset failed');
    }
  }, []);

  const verifyEmail = useCallback(async (userId: string, secret: string) => {
    const response = await authService.verifyEmail(userId, secret);
    if (!response.success) {
      throw new Error(response.error?.message || 'Email verification failed');
    }
    setEmailVerified(true);
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    const response = await authService.resendVerification(email);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to resend verification email');
    }
  }, []);

  // gate anonymous users — returns false when they've hit the cap
  const incrementMessageCount = useCallback(() => {
    if (!user && messageCount >= maxAnonymousMessages) {
      setShowLoginPrompt(true);
      return false;
    }
    setMessageCount(prev => prev + 1);
    return true;
  }, [user, messageCount, maxAnonymousMessages]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAnonymous: !user,
        isLoading,
        emailVerified,
        messageCount,
        maxAnonymousMessages,
        login,
        signup,
        loginWithGoogle,
        loginWithGithub,
        logout,
        incrementMessageCount,
        showLoginPrompt,
        setShowLoginPrompt,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
