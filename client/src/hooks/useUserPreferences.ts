import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { UserPreferences } from '@shared/types';

export function useUserPreferences() {
    return useQuery({
        queryKey: ['userPreferences'],
        queryFn: () => apiRequest<UserPreferences>('GET', '/api/user/preferences'),
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateUserPreferences() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (preferences: Partial<UserPreferences>) =>
            apiRequest<UserPreferences>('PATCH', '/api/user/preferences', preferences),
        onSuccess: (data: UserPreferences) => {
            queryClient.setQueryData(['userPreferences'], data);
        },
    });
}
