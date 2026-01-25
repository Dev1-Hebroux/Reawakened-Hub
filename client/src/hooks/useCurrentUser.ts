import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useCurrentUser() {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: () => apiRequest<{ id: string; email: string | null; firstName: string | null; lastName: string | null; profileImageUrl: string | null }>('GET', '/api/auth/user'),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
    });
}
