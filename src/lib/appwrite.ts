/**
 * Appwrite Client SDK Configuration
 * Used for email verification and password reset
 */
import { Client, Account } from 'appwrite';

// Get config from environment or use defaults
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '695f3de400045032e4fc';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Create account service instance
export const account = new Account(client);

// Helper to get frontend URL for redirect URLs
export const getFrontendUrl = () => {
  return import.meta.env.VITE_FRONTEND_URL || window.location.origin;
};

console.log('[Appwrite] Initialized with project:', APPWRITE_PROJECT_ID);
