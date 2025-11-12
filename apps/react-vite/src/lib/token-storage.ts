/**
 * Token Storage Utilities
 * Manages access token, refresh token, and expiration time in localStorage
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const EXPIRES_AT_KEY = 'expiresAt';

export const tokenStorage = {
    // Get access token
    getAccessToken: (): string | null => {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    // Get refresh token
    getRefreshToken: (): string | null => {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    // Get expiration time
    getExpiresAt: (): string | null => {
        return localStorage.getItem(EXPIRES_AT_KEY);
    },

    // Set all tokens
    setTokens: (accessToken: string, refreshToken: string, expiresAt: string): void => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        localStorage.setItem(EXPIRES_AT_KEY, expiresAt);
    },

    // Clear all tokens
    clearTokens: (): void => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(EXPIRES_AT_KEY);
    },

    // Check if access token exists
    hasToken: (): boolean => {
        return !!localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    // Check if token is expired or about to expire (within 5 minutes)
    isTokenExpired: (): boolean => {
        const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
        if (!expiresAt) return true;

        const expirationTime = new Date(expiresAt).getTime();
        const currentTime = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

        return expirationTime - currentTime < bufferTime;
    },
};
