import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Notification } from '@shared/types';

export function useNotifications(limit = 20) {
    return useQuery({
        queryKey: ['notifications', limit],
        queryFn: () => apiRequest<{ items: Notification[]; total: number }>('GET', `/api/notifications?limit=${limit}`),
        refetchInterval: 30 * 1000, // Refetch every 30 seconds
    });
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: ['notifications', 'unreadCount'],
        queryFn: () => apiRequest<{ count: number }>('GET', '/api/notifications/unread-count'),
        refetchInterval: 30 * 1000,
    });
}

export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: number) =>
            apiRequest<void>('POST', `/api/notifications/${notificationId}/read`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () =>
            apiRequest<void>('POST', '/api/notifications/read-all'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}
