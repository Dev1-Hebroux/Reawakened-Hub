/**
 * Centralized API fetch utility with automatic CSRF token handling
 *
 * This utility automatically:
 * - Includes CSRF tokens for all mutating requests (POST, PUT, PATCH, DELETE)
 * - Sends cookies with credentials: 'include'
 * - Sets proper Content-Type headers
 * - Handles errors consistently
 *
 * @example
 * ```typescript
 * import { apiFetch } from '@/lib/apiFetch';
 *
 * // Simple POST request
 * const response = await apiFetch('/api/reading-plans/1/enroll', {
 *   method: 'POST',
 * });
 *
 * // POST with body
 * const response = await apiFetch('/api/goals', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: 'My Goal' }),
 * });
 *
 * // GET request (CSRF not needed, but credentials still sent)
 * const response = await apiFetch('/api/user/profile');
 * ```
 */

/**
 * Extract CSRF token from cookies
 * The server sets this as a non-httpOnly cookie so it can be read by JavaScript
 */
function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch wrapper with automatic CSRF token handling
 *
 * @param url - The URL to fetch (absolute or relative)
 * @param options - Standard fetch options
 * @returns Promise resolving to Response
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add CSRF token for mutating requests
  const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (mutatingMethods.includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    } else {
      console.warn(`[apiFetch] CSRF token not found for ${method} ${url}`);
    }
  }

  // Always include credentials to send cookies
  const fetchOptions: RequestInit = {
    ...options,
    method,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url, fetchOptions);
    return response;
  } catch (error) {
    console.error(`[apiFetch] Request failed: ${method} ${url}`, error);
    throw error;
  }
}

/**
 * Convenience wrapper that automatically parses JSON responses
 * and throws on HTTP errors
 *
 * @example
 * ```typescript
 * const data = await apiFetchJson('/api/user/profile');
 * console.log(data.name);
 * ```
 */
export async function apiFetchJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiFetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText
    }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Export getCsrfToken for components that need to access it directly
 * (e.g., for custom headers or debugging)
 */
export { getCsrfToken };
