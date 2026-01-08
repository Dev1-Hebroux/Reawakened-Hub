import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getEffectiveAudience, buildAudienceParam } from '@/lib/sparksUtils';
import type { Spark, ReflectionCard, PrayerSession } from '@shared/schema';
import { API_CACHE } from '@shared/constants';

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

export function useDashboard(options: UseDashboardOptions = {}): UseDashboardReturn {
  const {
    userAudienceSegment,
    enabled = true,
    staleTime = API_CACHE.DASHBOARD_STALE_TIME,
    refetchInterval = false,
  } = options;

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
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

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
      staleTime: API_CACHE.DASHBOARD_STALE_TIME,
    });
  }, [queryClient]);
}
