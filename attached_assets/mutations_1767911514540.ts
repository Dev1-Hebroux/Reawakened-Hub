/**
 * API Mutation Utilities
 * 
 * Provides standardized patterns for API mutations with:
 * - Consistent error handling and toast notifications
 * - Retry logic for transient failures
 * - Optimistic updates support
 * - CSRF token handling
 * 
 * FIX: Addresses inconsistent API error handling patterns.
 */

import { useMutation, useQueryClient, UseMutationOptions, MutationFunction } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Get CSRF token from cookie.
 */
function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Enhanced fetch with CSRF token and error handling.
 */
export async function apiRequest<T>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  body?: unknown
): Promise<T> {
  const csrfToken = getCsrfToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }
  
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || errorData.error || `Request failed with status ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }
  
  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

/**
 * Options for the useApiMutation hook.
 */
interface UseApiMutationOptions<TData, TVariables, TError = Error> 
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  /** Message to show on success. Set to null to disable. */
  successMessage?: string | null;
  /** Message to show on error. Set to null to disable. */
  errorMessage?: string | null;
  /** Query keys to invalidate on success. */
  invalidateKeys?: string[][];
  /** Whether to show error details in toast. */
  showErrorDetails?: boolean;
}

/**
 * Standardized mutation hook with consistent error handling.
 * 
 * @example
 * ```tsx
 * const createGoal = useApiMutation(
 *   (data: GoalInput) => apiRequest('POST', '/api/goals', data),
 *   {
 *     successMessage: 'Goal created!',
 *     invalidateKeys: [['/api/goals']],
 *     onSuccess: (data) => {
 *       navigate(`/goals/${data.id}`);
 *     },
 *   }
 * );
 * ```
 */
export function useApiMutation<TData, TVariables, TError = Error>(
  mutationFn: MutationFunction<TData, TVariables>,
  options: UseApiMutationOptions<TData, TVariables, TError> = {}
) {
  const queryClient = useQueryClient();
  
  const {
    successMessage = 'Success!',
    errorMessage = 'An error occurred',
    invalidateKeys = [],
    showErrorDetails = true,
    onSuccess,
    onError,
    ...restOptions
  } = options;
  
  return useMutation<TData, TError, TVariables>({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Show success toast
      if (successMessage !== null) {
        toast.success(successMessage);
      }
      
      // Invalidate specified queries
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      
      // Call custom onSuccess
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Build error message
      let message = errorMessage;
      if (showErrorDetails && error instanceof Error) {
        const apiError = error as any;
        if (apiError.data?.message) {
          message = apiError.data.message;
        } else if (apiError.message && apiError.message !== 'Failed to fetch') {
          message = apiError.message;
        }
      }
      
      // Show error toast
      if (message !== null) {
        toast.error(message);
      }
      
      // Call custom onError
      onError?.(error, variables, context);
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      const status = (error as any)?.status;
      if (status && status >= 400 && status < 500) {
        return false;
      }
      // Retry up to 1 time for server errors
      return failureCount < 1;
    },
    retryDelay: 1000,
    ...restOptions,
  });
}

/**
 * Hook for optimistic mutations with automatic rollback.
 * 
 * @example
 * ```tsx
 * const toggleComplete = useOptimisticMutation(
 *   (id: number) => apiRequest('POST', `/api/tasks/${id}/toggle`),
 *   {
 *     queryKey: ['/api/tasks'],
 *     updateFn: (old, variables) => old.map(task => 
 *       task.id === variables ? { ...task, completed: !task.completed } : task
 *     ),
 *   }
 * );
 * ```
 */
interface UseOptimisticMutationOptions<TData, TVariables, TQueryData, TError = Error>
  extends UseApiMutationOptions<TData, TVariables, TError> {
  queryKey: string[];
  updateFn: (oldData: TQueryData, variables: TVariables) => TQueryData;
}

export function useOptimisticMutation<TData, TVariables, TQueryData, TError = Error>(
  mutationFn: MutationFunction<TData, TVariables>,
  options: UseOptimisticMutationOptions<TData, TVariables, TQueryData, TError>
) {
  const queryClient = useQueryClient();
  const { queryKey, updateFn, ...restOptions } = options;
  
  return useApiMutation(mutationFn, {
    ...restOptions,
    onMutate: async (variables) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData<TQueryData>(queryKey);
      
      // Optimistically update
      if (previousData !== undefined) {
        queryClient.setQueryData<TQueryData>(queryKey, updateFn(previousData, variables));
      }
      
      return { previousData };
    },
    onError: (error, variables, context: any) => {
      // Rollback on error
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      restOptions.onError?.(error, variables, context);
    },
    onSettled: () => {
      // Refetch after mutation settles
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Debounced mutation hook to prevent rapid-fire submissions.
 */
export function useDebouncedMutation<TData, TVariables, TError = Error>(
  mutationFn: MutationFunction<TData, TVariables>,
  options: UseApiMutationOptions<TData, TVariables, TError> & { debounceMs?: number } = {}
) {
  const { debounceMs = 300, ...restOptions } = options;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastVariables: TVariables | null = null;
  
  const mutation = useApiMutation(mutationFn, restOptions);
  
  const debouncedMutate = (variables: TVariables) => {
    lastVariables = variables;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      if (lastVariables !== null) {
        mutation.mutate(lastVariables);
        lastVariables = null;
      }
    }, debounceMs);
  };
  
  return {
    ...mutation,
    mutate: debouncedMutate,
    mutateImmediate: mutation.mutate,
  };
}
