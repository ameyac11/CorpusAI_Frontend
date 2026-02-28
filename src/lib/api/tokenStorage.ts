// Abstract token storage mechanism
// Easy to replace with different storage strategies

// legacy keys — we moved to HTTP-only cookies but keep these for cleanup
const TOKEN_KEY = 'corpus_access_token';
const REFRESH_TOKEN_KEY = 'corpus_refresh_token';

interface TokenStorageStrategy {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// Default to localStorage, can be swapped for sessionStorage, cookies, etc.
const defaultStrategy: TokenStorageStrategy = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage unavailable
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable
    }
  },
};

// strategy pattern so we can swap to sessionStorage or in-memory for testing
let strategy: TokenStorageStrategy = defaultStrategy;

export const tokenStorage = {
  setStrategy(newStrategy: TokenStorageStrategy): void {
    strategy = newStrategy;
  },
  
  getToken(): string | null {
    return strategy.getItem(TOKEN_KEY);
  },
  
  setToken(token: string): void {
    strategy.setItem(TOKEN_KEY, token);
  },
  
  removeToken(): void {
    strategy.removeItem(TOKEN_KEY);
  },
  
  getRefreshToken(): string | null {
    return strategy.getItem(REFRESH_TOKEN_KEY);
  },
  
  setRefreshToken(token: string): void {
    strategy.setItem(REFRESH_TOKEN_KEY, token);
  },
  
  removeRefreshToken(): void {
    strategy.removeItem(REFRESH_TOKEN_KEY);
  },
  
  clearAll(): void {
    this.removeToken();
    this.removeRefreshToken();
  },
};
