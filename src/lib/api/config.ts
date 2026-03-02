// Centralized API configuration
// All API endpoints derive from this base path

// Get API base URL from environment variable
// MUST be set in .env or deployment environment (Cloudflare Pages)
// Example: VITE_API_BASE_URL=https://api.corpusai.datanestx.tech/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Validate that API_BASE_URL is configured
if (!API_BASE_URL) {
  throw new Error(
    'VITE_API_BASE_URL is not configured. Please set it in your environment:\n' +
    '  Development: VITE_API_BASE_URL=http://localhost:8000/api/v1\n' +
    '  Production: VITE_API_BASE_URL=https://api.corpusai.datanestx.tech/api/v1'
  );
}

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
} as const;

// Get the API base path
// Routes are relative paths (e.g., /auth/login) that get appended to this versioned base URL
export const getApiBasePath = (): string => {
  return API_CONFIG.BASE_URL;
};

// Route definitions grouped by feature
// all routes are relative — they get prefixed with BASE_URL at call time
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
    STATUS: (resourceId: string) => `/resources/${resourceId}/status`,
    DELETE: (resourceId: string) => `/resources/${resourceId}`,
    PREVIEW: (resourceId: string) => `/resources/${resourceId}/preview`,
    WEB_SEARCH: '/resources/search',
    WEB_IMPORT: '/resources/import',
    USAGE: '/resources/usage',
  },
  CREATIVE: {
    GENERATE: '/creative/generate',
    HISTORY: '/creative/history',
    DELETE: (outputId: string) => `/creative/${outputId}`,
    FILE: (outputId: string) => `/creative/${outputId}/file`,
  },
} as const;

// Build full endpoint URL
export const buildEndpoint = (route: string): string => {
  return `${getApiBasePath()}${route}`;
};
