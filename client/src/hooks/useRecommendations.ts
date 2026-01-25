import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ScoredItem, ContentItem } from '@shared/types';

export function useRecommendations(limit = 5) {
    return useQuery({
        queryKey: ['recommendations', limit],
        queryFn: () => apiRequest<{ items: ScoredItem<ContentItem>[]; strategy: string }>('GET', `/api/recommendations?limit=${limit}`),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

export function useContinueReading() {
    return useQuery({
        queryKey: ['continueReading'],
        queryFn: () => apiRequest<{ planId: number; currentDay: number; title: string } | null>('GET', '/api/recommendations/continue'),
        staleTime: 2 * 60 * 1000,
    });
}
