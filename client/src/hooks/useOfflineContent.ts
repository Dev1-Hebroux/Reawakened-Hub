import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { offlineService } from '../services/offlineService';
import { useIsOnline } from './useOfflineStatus';

interface UseOfflineContentOptions<T> {
    key: string;
    fetchFn: () => Promise<T>;
    ttlMs?: number;
    enabled?: boolean;
}

export function useOfflineContent<T>({
    key,
    fetchFn,
    ttlMs = 24 * 60 * 60 * 1000, // Default 24h
    enabled = true
}: UseOfflineContentOptions<T>) {
    const isOnline = useIsOnline();
    const queryClient = useQueryClient();
    const [offlineData, setOfflineData] = useState<T | null>(null);

    // Load from cache when offline or explicitly requested
    const loadFromCache = useCallback(async () => {
        try {
            const cached = await offlineService.getCache<T>(key);
            if (cached) {
                setOfflineData(cached);
                return cached;
            }
        } catch (error) {
            console.error('Failed to load from offline cache:', error);
        }
        return null;
    }, [key]);

    // Use React Query for online fetching, but wrap query function to cache successful results
    const query = useQuery({
        queryKey: [key],
        queryFn: async () => {
            // If we're offline, try to throw so we can fallback (though RQ handles some of this)
            // But actually, we want to try fetching. if it fails and we are offline, we use cache.

            try {
                const data = await fetchFn();
                // Cache successful result
                await offlineService.setCache(key, data, ttlMs);
                return data;
            } catch (error) {
                // If fetch fails, try loading from cache as fallback
                const cached = await loadFromCache();
                if (cached) return cached;
                throw error;
            }
        },
        enabled: enabled && isOnline,
        staleTime: 5 * 60 * 1000, // Consider online data fresh for 5 mins
        retry: false, // Don't retry immediately if we have cache logic
    });

    // Effect to load cache when offline
    useEffect(() => {
        if (!isOnline && enabled) {
            loadFromCache();
        }
    }, [isOnline, key, enabled, loadFromCache]);

    const data = isOnline ? query.data : (offlineData || query.data);
    const isLoading = isOnline ? query.isLoading : !offlineData;
    const error = query.error;

    return {
        data,
        isLoading,
        error,
        isOffline: !isOnline,
        refetch: query.refetch,
        // Helper to manually save data to cache (e.g. for optimistic updates)
        saveToCache: async (newData: T) => {
            await offlineService.setCache(key, newData, ttlMs);
            setOfflineData(newData);
            queryClient.setQueryData([key], newData);
        }
    };
}
