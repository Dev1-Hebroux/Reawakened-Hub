/**
 * Optimized Dashboard Hook
 * 
 * Features:
 * - Stale-while-revalidate pattern
 * - Persistent cache across sessions (localStorage)
 * - Graceful offline handling
 * - Instant data on repeat visits
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
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
    offline?: boolean;
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
  isOffline: boolean;
  error: Error | null;
  refetch: () => void;
}

const STORAGE_KEY = 'dashboard-cache';
const GC_TIME = 24 * 60 * 60 * 1000; // 24 hours

function isStorageAvailable(): boolean {
  return typeof window !== 'undefined' && 'localStorage' in window;
}

function persistToStorage(audience: string | null, data: DashboardData): void {
  if (!isStorageAvailable()) return;

  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    cached[audience || 'default'] = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch {
    // Storage full or unavailable, ignore
  }
}

function getFromStorage(audience: string | null): DashboardData | undefined {
  if (!isStorageAvailable()) return undefined;

  try {
    const cached = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const entry = cached[audience || 'default'];

    if (entry && Date.now() - entry.timestamp < GC_TIME) {
      return entry.data;
    }
  } catch {
    // Corrupted storage, ignore
  }
  return undefined;
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

  // Get persisted data for instant render on repeat visits
  const persistedData = getFromStorage(effectiveAudience);

  const query = useQuery<DashboardData>({
    queryKey: ['/api/sparks/dashboard', effectiveAudience],
    queryFn: async () => {
      return apiRequest<DashboardData>('GET', `/api/sparks/dashboard${audienceParam}`);
    },
    enabled,
    staleTime,
    refetchInterval,

    // Use persisted data as placeholder for instant render
    placeholderData: persistedData,

    // Keep previous data while refetching
    gcTime: GC_TIME,

    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),

    // Refetch on reconnect/focus for fresh data
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,

    // Network mode for offline support
    networkMode: 'offlineFirst',
  });

  // Persist successful fetches to localStorage
  useEffect(() => {
    if (query.data && !query.data.meta?.offline) {
      persistToStorage(effectiveAudience, query.data);
    }
  }, [query.data, effectiveAudience]);

  const data = query.data;
  const sparks = data?.sparks ?? [];
  const todaySpark = data?.todaySpark ?? null;
  const featured = data?.featured ?? [];
  const reflection = data?.reflection ?? null;
  const sessions = data?.sessions ?? [];
  const isOffline = data?.meta?.offline === true;

  return {
    data,
    sparks,
    todaySpark,
    featured,
    reflection,
    sessions,
    isLoading: query.isLoading && !persistedData,
    isError: query.isError,
    isOffline,
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
        return apiRequest('GET', `/api/sparks/dashboard${audienceParam}`);
      },
      staleTime: API_CACHE.DASHBOARD_STALE_TIME,
    });
  }, [queryClient]);
}
