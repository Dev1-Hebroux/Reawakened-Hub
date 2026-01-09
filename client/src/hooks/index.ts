/**
 * React Hooks
 * 
 * Comprehensive collection of custom React hooks for the platform.
 * Provides data fetching, mutations, offline support, and utilities.
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { offlineService, type OfflineSyncStatus } from '../services/offlineService';
import type { 
  PaginatedResponse,
  UserPreferences,
  Notification,
  ScoredItem,
  ContentItem,
} from '@shared/types';

// ============================================================================
// API Helpers
// ============================================================================

async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Request failed: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// User Hooks
// ============================================================================

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiRequest<{ id: string; email: string | null; firstName: string | null; lastName: string | null; profileImageUrl: string | null }>('/api/auth/user'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

export function useUserPreferences() {
  return useQuery({
    queryKey: ['userPreferences'],
    queryFn: () => apiRequest<UserPreferences>('/api/user/preferences'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<UserPreferences>) =>
      apiRequest<UserPreferences>('/api/user/preferences', {
        method: 'PATCH',
        body: JSON.stringify(preferences),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['userPreferences'], data);
    },
  });
}

// ============================================================================
// Notification Hooks
// ============================================================================

export function useNotifications(limit = 20) {
  return useQuery({
    queryKey: ['notifications', limit],
    queryFn: () => apiRequest<{ items: Notification[]; total: number }>(`/api/notifications?limit=${limit}`),
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => apiRequest<{ count: number }>('/api/notifications/unread-count'),
    refetchInterval: 30 * 1000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: number) =>
      apiRequest<void>(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiRequest<void>('/api/notifications/read-all', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ============================================================================
// Reading Plan Hooks
// ============================================================================

export function useReadingPlans(options?: { featured?: boolean; maturityLevel?: string }) {
  const params = new URLSearchParams();
  if (options?.featured) params.set('featured', 'true');
  if (options?.maturityLevel) params.set('maturityLevel', options.maturityLevel);
  
  return useQuery({
    queryKey: ['readingPlans', options],
    queryFn: () => apiRequest<{ items: any[]; total: number }>(`/api/reading-plans?${params}`),
    staleTime: 5 * 60 * 1000,
  });
}

export function useReadingPlan(planId: number) {
  return useQuery({
    queryKey: ['readingPlan', planId],
    queryFn: () => apiRequest<any>(`/api/reading-plans/${planId}`),
    enabled: !!planId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReadingPlanProgress(planId: number) {
  return useQuery({
    queryKey: ['readingPlanProgress', planId],
    queryFn: () => apiRequest<any>(`/api/reading-plans/${planId}/progress`),
    enabled: !!planId,
  });
}

export function useStartReadingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: number) =>
      apiRequest<any>('/api/reading-plans/enroll', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      }),
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: ['readingPlanProgress', planId] });
      queryClient.invalidateQueries({ queryKey: ['userEnrollments'] });
    },
  });
}

export function useCompleteReadingDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, dayNumber }: { planId: number; dayNumber: number }) =>
      apiRequest<any>(`/api/reading-plans/${planId}/complete-day`, {
        method: 'POST',
        body: JSON.stringify({ dayNumber }),
      }),
    onSuccess: (_, { planId }) => {
      queryClient.invalidateQueries({ queryKey: ['readingPlanProgress', planId] });
      queryClient.invalidateQueries({ queryKey: ['streakData'] });
    },
  });
}

// ============================================================================
// Recommendation Hooks
// ============================================================================

export function useRecommendations(limit = 5) {
  return useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => apiRequest<{ items: ScoredItem<ContentItem>[]; strategy: string }>(`/api/recommendations?limit=${limit}`),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useContinueReading() {
  return useQuery({
    queryKey: ['continueReading'],
    queryFn: () => apiRequest<{ planId: number; currentDay: number; title: string } | null>('/api/recommendations/continue'),
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// Streak Hooks
// ============================================================================

export function useStreakData() {
  return useQuery({
    queryKey: ['streakData'],
    queryFn: () => apiRequest<{ currentStreak: number; longestStreak: number; lastReadAt: string | null }>('/api/user/streak'),
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// Offline Sync Hooks
// ============================================================================

export function useOfflineStatus(): OfflineSyncStatus {
  const [status, setStatus] = useState<OfflineSyncStatus>(() => offlineService.getStatus());

  useEffect(() => {
    return offlineService.subscribe(setStatus);
  }, []);

  return status;
}

export function useIsOnline(): boolean {
  const status = useOfflineStatus();
  return status.isOnline;
}

export function useOfflineQueue() {
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    const updateQueue = async () => {
      const queue = await offlineService.getSyncQueue();
      setQueueLength(queue.length);
    };

    updateQueue();
    
    return offlineService.subscribe(() => {
      updateQueue();
    });
  }, []);

  const triggerSync = useCallback(async () => {
    await offlineService.sync();
  }, []);

  return { queueLength, triggerSync };
}

// ============================================================================
// Debounce Hook
// ============================================================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================================================
// Local Storage Hook
// ============================================================================

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// ============================================================================
// Media Query Hook
// ============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// ============================================================================
// Keyboard Shortcuts Hook
// ============================================================================

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options?: { ctrl?: boolean; alt?: boolean; shift?: boolean }
) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        (!options?.ctrl || event.ctrlKey || event.metaKey) &&
        (!options?.alt || event.altKey) &&
        (!options?.shift || event.shiftKey)
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, options]);
}

// ============================================================================
// Intersection Observer Hook
// ============================================================================

export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefCallback<Element>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, options]);

  const ref = useCallback((el: Element | null) => {
    setElement(el);
  }, []);

  return [ref, isIntersecting];
}

// ============================================================================
// Timer/Countdown Hook
// ============================================================================

export function useCountdown(targetDate: Date): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
} {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(targetDate: Date) {
  const difference = targetDate.getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isComplete: false,
  };
}

// ============================================================================
// Form Validation Hook
// ============================================================================

export function useFormValidation<T extends Record<string, unknown>>(
  initialValues: T,
  validate: (values: T) => Partial<Record<keyof T, string>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = useCallback((field: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const newErrors = validate(values);
    setErrors(newErrors);
  }, [values, validate]);

  const handleSubmit = useCallback((onSubmit: (values: T) => void) => {
    const newErrors = validate(values);
    setErrors(newErrors);
    
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    setTouched(allTouched);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(values);
    }
  }, [values, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}

// Re-export types
export type { OfflineSyncStatus };
