import { QueryClient, QueryFunction, QueryCache, MutationCache } from "@tanstack/react-query";
import { toast } from 'sonner';
import { getApiUrl } from "@/lib/api";

function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 3) return false;
  const status = (error as any)?.status;
  if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
    return false;
  }
  return true;
}

function getRetryDelay(attemptIndex: number): number {
  return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    const error = new Error(`${res.status}: ${text}`);
    (error as any).status = res.status;
    throw error;
  }
}

export async function apiRequest<T = unknown>(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<T> {
  const headers: Record<string, string> = {};

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  const csrfToken = getCsrfToken();
  if (csrfToken && method !== 'GET') {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const res = await fetch(getApiUrl(url), {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const res = await fetch(getApiUrl(queryKey.join("/") as string), {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export function isUnauthorizedError(error: unknown): boolean {
  return (error as any)?.status === 401;
}

export function isForbiddenError(error: unknown): boolean {
  return (error as any)?.status === 403;
}

export function isNotFoundError(error: unknown): boolean {
  return (error as any)?.status === 404;
}

export function isValidationError(error: unknown): boolean {
  return (error as any)?.status === 400;
}

export function isRateLimitError(error: unknown): boolean {
  return (error as any)?.status === 429;
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        const message = error instanceof Error ? error.message : 'An error occurred';
        toast.error(`Error refreshing data: ${message}`);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('Mutation error:', error);
    },
  }),
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: shouldRetry,
      retryDelay: getRetryDelay,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        const status = (error as any)?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 1;
      },
      retryDelay: 1000,
    },
  },
});
