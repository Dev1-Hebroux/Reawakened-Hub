import { useMutation, useQueryClient, UseMutationOptions, MutationFunction } from '@tanstack/react-query';
import { toast } from 'sonner';

function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

export async function apiMutationRequest<T>(
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
  
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

interface UseApiMutationOptions<TData, TVariables, TError = Error> 
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  successMessage?: string | null;
  errorMessage?: string | null;
  invalidateKeys?: string[][];
  showErrorDetails?: boolean;
}

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
      if (successMessage !== null) {
        toast.success(successMessage);
      }
      
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      let message = errorMessage;
      if (showErrorDetails && error instanceof Error) {
        const apiError = error as any;
        if (apiError.data?.message) {
          message = apiError.data.message;
        } else if (apiError.message && apiError.message !== 'Failed to fetch') {
          message = apiError.message;
        }
      }
      
      if (message !== null) {
        toast.error(message);
      }
      
      onError?.(error, variables, context);
    },
    retry: (failureCount, error) => {
      const status = (error as any)?.status;
      if (status && status >= 400 && status < 500) {
        return false;
      }
      return failureCount < 1;
    },
    retryDelay: 1000,
    ...restOptions,
  });
}

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
      await queryClient.cancelQueries({ queryKey });
      
      const previousData = queryClient.getQueryData<TQueryData>(queryKey);
      
      if (previousData !== undefined) {
        queryClient.setQueryData<TQueryData>(queryKey, updateFn(previousData, variables));
      }
      
      return { previousData };
    },
    onError: (error, variables, context: any) => {
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      restOptions.onError?.(error, variables, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useDebouncedMutation<TData, TVariables, TError = Error>(
  mutationFn: MutationFunction<TData, TVariables>,
  options: UseApiMutationOptions<TData, TVariables, TError> & { debounceMs?: number } = {}
) {
  const { debounceMs = 300, ...restOptions } = options;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
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
