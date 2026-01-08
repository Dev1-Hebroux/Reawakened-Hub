/**
 * React Query Client Configuration
 * 
 * Centralized configuration for TanStack React Query with:
 * - Proper retry policies for different error types
 * - Stale time and cache time configurations
 * - Global error handling
 * 
 * FIX: Addresses missing retry logic on critical API calls.
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Determine if an error should trigger a retry.
 */
function shouldRetry(failureCount: number, error: unknown): boolean {
  // Don't retry beyond 3 attempts
  if (failureCount >= 3) {
    return false;
  }
  
  // Check for HTTP status codes
  const status = (error as any)?.status;
  
  // Don't retry client errors (4xx) except 408 (timeout) and 429 (rate limit)
  if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
    return false;
  }
  
  // Retry server errors (5xx) and network failures
  return true;
}

/**
 * Calculate retry delay with exponential backoff.
 */
function getRetryDelay(attemptIndex: number): number {
  // Base delay of 1 second, doubles with each attempt, max 30 seconds
  return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
}

/**
 * Create the query client with optimized configuration.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Only show toast for queries that have data (not initial loads)
        if (query.state.data !== undefined) {
          const message = error instanceof Error ? error.message : 'An error occurred';
          toast.error(`Error refreshing data: ${message}`);
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        // Global mutation error handling
        console.error('Mutation error:', error);
      },
    }),
    defaultOptions: {
      queries: {
        // Stale time: how long data is considered fresh
        staleTime: 1000 * 60 * 5, // 5 minutes
        
        // Cache time: how long to keep inactive data in cache
        gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
        
        // Retry configuration
        retry: shouldRetry,
        retryDelay: getRetryDelay,
        
        // Refetch behavior
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Network mode
        networkMode: 'online',
      },
      mutations: {
        // Mutations retry once by default for server errors
        retry: (failureCount, error) => {
          const status = (error as any)?.status;
          // Don't retry client errors
          if (status && status >= 400 && status < 500) {
            return false;
          }
          return failureCount < 1;
        },
        retryDelay: 1000,
        
        // Network mode
        networkMode: 'online',
      },
    },
  });
}

/**
 * Default query client instance.
 */
export const queryClient = createQueryClient();

/**
 * Helper to make authenticated API requests.
 * Includes proper error handling and response parsing.
 */
export async function apiRequest<T = unknown>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const headers: Record<string, string> = {};
  
  if (body) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Get CSRF token if available
  const csrfMatch = document.cookie.match(/csrf_token=([^;]+)/);
  if (csrfMatch) {
    headers['X-CSRF-Token'] = csrfMatch[1];
  }
  
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

/**
 * Check if an error is an unauthorized (401) error.
 */
export function isUnauthorizedError(error: unknown): boolean {
  return (error as any)?.status === 401;
}

/**
 * Check if an error is a forbidden (403) error.
 */
export function isForbiddenError(error: unknown): boolean {
  return (error as any)?.status === 403;
}

/**
 * Check if an error is a not found (404) error.
 */
export function isNotFoundError(error: unknown): boolean {
  return (error as any)?.status === 404;
}

/**
 * Check if an error is a validation (400) error.
 */
export function isValidationError(error: unknown): boolean {
  return (error as any)?.status === 400;
}

/**
 * Check if an error is a rate limit (429) error.
 */
export function isRateLimitError(error: unknown): boolean {
  return (error as any)?.status === 429;
}
