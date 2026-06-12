// Auth service for UI components

import { apiGet, apiPost, API_ROUTES, tokenStorage, type ApiResponse, type ApiError } from '@/lib/api';
import { account, getFrontendUrl } from '@/lib/appwrite';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  providers?: string[];
  emailVerified?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  username?: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  tokens: AuthTokens;
  providers?: string[];
  emailVerified?: boolean;
  message?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<User & { providers?: string[]; emailVerified?: boolean }>> {
    try {
      // Two-step: Appwrite verifies, backend issues cookies
      try {
        await account.deleteSession('current');
        console.log('[Auth] Cleared existing Appwrite session');
      } catch (e) {
        // No session to delete
        console.log('[Auth] No existing session to clear');
      }

      // Verify password via Appwrite
      let appwriteSession;
      try {
        appwriteSession = await account.createEmailPasswordSession(credentials.email, credentials.password);
        console.log('[Auth] Appwrite session created');
      } catch (appwriteError: any) {
        console.error('[Auth] Appwrite authentication failed:', appwriteError);
        return {
          data: null,
          error: {
            code: 'AUTH_FAILED',
            message: appwriteError.message || 'Invalid email or password',
            status: 401
          },
          success: false
        };
      }

      // Get backend JWT cookies
      const response = await apiPost<{ success: boolean; data: AuthResponse; error?: string }>(
        API_ROUTES.AUTH.LOGIN,
        credentials
      );

      if (response.success && response.data?.data) {
        const authData = response.data.data;
        // Tokens live in cookies now
        return {
          data: {
            id: authData.user.id,
            email: authData.user.email,
            username: authData.user.username,
            providers: authData.providers,
            emailVerified: authData.emailVerified,
          },
          error: null,
          success: true
        };
      }

      // Backend failed, clean up Appwrite session
      try {
        await account.deleteSession('current');
      } catch (e) {
        console.error('[Auth] Failed to cleanup Appwrite session:', e);
      }

      const error: ApiError = {
        code: 'AUTH_FAILED',
        message: response.data?.error || response.error?.message || 'Login failed',
        status: response.error?.status || 401,
      };
      return { data: null, error, success: false };
    } catch (error: any) {
      return {
        data: null,
        error: {
          code: 'AUTH_FAILED',
          message: error.message || 'Login failed',
          status: 500
        },
        success: false
      };
    }
  },

  async signup(credentials: SignupCredentials): Promise<ApiResponse<User & { providers?: string[]; emailVerified?: boolean }>> {
    // Signup creates user backend-side, then Appwrite sends verification
    const response = await apiPost<{ success: boolean; data: AuthResponse; error?: string }>(
      API_ROUTES.AUTH.SIGNUP,
      credentials
    );

    if (response.success && response.data?.data) {
      const authData = response.data.data;
      // Tokens are in cookies

      // Create Appwrite session to send verification email
      try {
        // Login to Appwrite
        await account.createEmailPasswordSession(credentials.email, credentials.password);
        console.log('[Auth] Appwrite session created after signup');

        // Send verification email
        try {
          const frontendUrl = getFrontendUrl();
          await account.createVerification(`${frontendUrl}/auth/verify-email`);
          console.log('[Auth] Email verification sent via Appwrite');
        } catch (verifyError: any) {
          console.error('[Auth] Failed to send verification email:', verifyError);
          // Don't fail signup if email fails
        }
      } catch (sessionError: any) {
        console.error('[Auth] Failed to create Appwrite session:', sessionError);
        // Continue — user can verify later
      }

      return {
        data: {
          id: authData.user.id,
          email: authData.user.email,
          username: authData.user.username,
          providers: authData.providers,
          emailVerified: authData.emailVerified,
        },
        error: null,
        success: true
      };
    }

    const error: ApiError = {
      code: 'SIGNUP_FAILED',
      message: response.data?.error || response.error?.message || 'Signup failed',
      status: response.error?.status || 400,
    };
    return { data: null, error, success: false };
  },

  async logout(): Promise<ApiResponse<void>> {
    // Clear Appwrite session on logout
    try {
      await account.deleteSession('current');
      console.log('[Auth] Appwrite session deleted');
    } catch (e) {
      // Session might not exist
      console.log('[Auth] No Appwrite session to delete');
    }

    const response = await apiPost<void>(API_ROUTES.AUTH.LOGOUT);

    // Clear legacy tokens (cookies cleared by backend)
    tokenStorage.clearAll();

    return response;
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await apiGet<{ success: boolean; data: User; error?: string }>(
      API_ROUTES.AUTH.CURRENT_USER
    );

    if (response.success && response.data?.data) {
      return { data: response.data.data, error: null, success: true };
    }

    return { data: null, error: response.error, success: false };
  },

  async refreshToken(): Promise<ApiResponse<AuthTokens>> {
    // Refresh token is in HTTP-only cookie
    const response = await apiPost<{ success: boolean; data: { message: string }; error?: string }>(
      API_ROUTES.AUTH.REFRESH_TOKEN
    );

    if (response.success) {
      // Tokens refreshed in cookies
      return { data: { accessToken: '', refreshToken: '' }, error: null, success: true };
    }

    return { data: null, error: response.error, success: false };
  },

  async verifyEmail(userId: string, secret: string): Promise<ApiResponse<void>> {
    try {
      // Use Appwrite SDK for email verification
      await account.updateVerification(userId, secret);
      console.log('[Auth] Email verified successfully via Appwrite');
      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error: any) {
      console.error('[Auth] Email verification failed:', error);
      return {
        data: null,
        error: {
          code: 'VERIFY_FAILED',
          message: error.message || 'Verification failed',
          status: error.code || 400
        },
        success: false
      };
    }
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      // Use Appwrite SDK for password recovery
      const frontendUrl = getFrontendUrl();
      await account.createRecovery(email, `${frontendUrl}/auth/reset-password`);
      console.log('[Auth] Password reset email sent via Appwrite');
      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error: any) {
      console.error('[Auth] Password reset failed:', error);
      // Don't reveal if email exists
      return {
        data: null,
        error: null,
        success: true
      };
    }
  },

  async resetPassword(userId: string, secret: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      // Use Appwrite SDK for password reset
      await account.updateRecovery(userId, secret, newPassword);
      console.log('[Auth] Password reset successfully via Appwrite');
      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error: any) {
      console.error('[Auth] Password reset failed:', error);
      return {
        data: null,
        error: {
          code: 'RESET_FAILED',
          message: error.message || 'Password reset failed',
          status: error.code || 400
        },
        success: false
      };
    }
  },

  async resendVerification(email: string): Promise<ApiResponse<void>> {
    try {
      // Use Appwrite SDK to resend verification
      const frontendUrl = getFrontendUrl();
      await account.createVerification(`${frontendUrl}/auth/verify-email`);
      console.log('[Auth] Verification email resent via Appwrite');
      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error: any) {
      console.error('[Auth] Failed to resend verification:', error);
      return {
        data: null,
        error: {
          code: 'RESEND_FAILED',
          message: error.message || 'Failed to resend verification email',
          status: error.code || 400
        },
        success: false
      };
    }
  },

  // Check auth via /me endpoint
  async isAuthenticated(): Promise<boolean> {
    const response = await this.getCurrentUser();
    return response.success;
  },

  // Clear auth state
  clearAuth(): void {
    tokenStorage.clearAll();
  },
};
