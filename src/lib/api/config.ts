// Centralized API configuration
// All API endpoints derive from this base path

// Production API URL (Render backend)
const PROD_API_URL = 'https://api.corpusai.datanestx.tech';

// Development backend URL (FastAPI server)
const DEV_API_URL = 'http://localhost:8000';

// Use environment variable or fallback based on mode
// VITE_API_BASE_URL should be set in production environment (Cloudflare Pages)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === 'production' ? PROD_API_URL : DEV_API_URL);

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
} as const;

// Get the API base path
// Note: Backend routes already include /api/v1 prefix, so we return base URL directly
export const getApiBasePath = (): string => {
  return API_CONFIG.BASE_URL;
};

// Route definitions grouped by feature
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    CURRENT_USER: '/auth/me',
    REFRESH_TOKEN: '/auth/refresh',
    // OAuth routes - these are full URLs for redirects
    GOOGLE: '/auth/google',
    GITHUB: '/auth/github',
    // Email verification & password reset
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  CHAT: {
    SEND: '/chat/send',
    HISTORY: '/chat/history',
    CREATE: '/chat',
    MESSAGES: (chatId: string) => `/chat/${chatId}/messages`,
    DELETE: (chatId: string) => `/chat/${chatId}`,
    RENAME: (chatId: string) => `/chat/${chatId}/rename`,
    STAR: (chatId: string) => `/chat/${chatId}/star`,
    UPLOAD: '/chat/upload',
  },
  RESOURCES: {
    LIST: '/resources',
    UPLOAD: '/resources/upload',
    DELETE: (resourceId: string) => `/resources/${resourceId}`,
    PREVIEW: (resourceId: string) => `/resources/${resourceId}/preview`,
    WEB_SEARCH: '/resources/search',
    WEB_IMPORT: '/resources/import',
    USAGE: '/resources/usage',
  },
  CREATIVE: {
    GENERATE: '/creative/generate',
    HISTORY: '/creative/history',
  },
} as const;

// Build full endpoint URL
export const buildEndpoint = (route: string): string => {
  return `${getApiBasePath()}${route}`;
};
