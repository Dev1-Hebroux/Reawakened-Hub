import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getEffectiveAudience, buildAudienceParam } from '@/lib/sparksUtils';
import type { Spark, ReflectionCard, PrayerSession } from '@shared/schema';

interface DashboardData {
  sparks: Spark[];
  todaySpark: Spark | null;
  featured: Spark[];
  reflection: ReflectionCard | null;
  sessions: PrayerSession[];
  meta: {
    timestamp: string;
    audienceSegment: string | null;
    totalSparks: number;
  };
}

interface UseDashboardOptions {
  userAudienceSegment?: string | null;
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
}

interface UseDashboardReturn {
  data: DashboardData | undefined;
  sparks: Spark[];
  todaySpark: Spark | null;
  featured: Spark[];
  reflection: ReflectionCard | null;
  sessions: PrayerSession[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch all Sparks page data in a single request.
 * 
 * This consolidates what was previously 5 separate API calls into one,
 * significantly reducing initial page load time.
 * 
 * @param options Configuration options
 * @returns Dashboard data and query state
 * 
 * @example
 * ```tsx
 * const { sparks, todaySpark, isLoading } = useDashboard({
 *   userAudienceSegment: user?.audienceSegment,
 * });
 * ```
 */
export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const {
    userAudienceSegment,
    enabled = true,
    staleTime = 1000 * 60 * 2, // 2 minutes
    refetchInterval = false,
  } = options;

  // Determine effective audience segment
  const effectiveAudience = getEffectiveAudience(userAudienceSegment);
  const audienceParam = buildAudienceParam(effectiveAudience);

  const query = useQuery<DashboardData>({
    queryKey: ['/api/sparks/dashboard', effectiveAudience],
    queryFn: async () => {
      const response = await fetch(`/api/sparks/dashboard${audienceParam}`);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to load dashboard');
      }
      
      return response.json();
    },
    enabled,
    staleTime,
    refetchInterval,
    // Retry with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Extract individual pieces for convenience
  const data = query.data;
  const sparks = data?.sparks ?? [];
  const todaySpark = data?.todaySpark ?? null;
  const featured = data?.featured ?? [];
  const reflection = data?.reflection ?? null;
  const sessions = data?.sessions ?? [];

  return {
    data,
    sparks,
    todaySpark,
    featured,
    reflection,
    sessions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook for prefetching dashboard data.
 * Call this on hover/focus events to warm the cache.
 */
export function usePrefetchDashboard() {
  const queryClient = useQueryClient();

  return useCallback((audienceSegment?: string | null) => {
    const effectiveAudience = getEffectiveAudience(audienceSegment);
    const audienceParam = buildAudienceParam(effectiveAudience);

    queryClient.prefetchQuery({
      queryKey: ['/api/sparks/dashboard', effectiveAudience],
      queryFn: async () => {
        const response = await fetch(`/api/sparks/dashboard${audienceParam}`);
        if (!response.ok) throw new Error('Prefetch failed');
        return response.json();
      },
      staleTime: 1000 * 60 * 2,
    });
  }, [queryClient]);
}
