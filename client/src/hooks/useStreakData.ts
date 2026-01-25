import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useStreakData() {
    return useQuery({
        queryKey: ['streakData'],
        queryFn: () => apiRequest<{ currentStreak: number; longestStreak: number; lastReadAt: string | null }>('GET', '/api/user/streak'),
        staleTime: 2 * 60 * 1000,
    });
}
