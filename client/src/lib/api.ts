export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Helper to construct full API URLs
 * @param path - The API path (e.g., '/api/users')
 * @returns Full URL (e.g., 'https://api.example.com/api/users')
 */
export function getApiUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    // Ensure path starts with / if not present (unless it's empty)
    const normalizedPath = path.startsWith('/') || path === '' ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Export the centralized CSRF-protected fetch utilities
 * These should be used for all API requests to ensure proper CSRF token handling
 */
export { apiFetch, apiFetchJson, getCsrfToken } from './apiFetch';
