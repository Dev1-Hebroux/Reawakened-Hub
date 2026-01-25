import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useReadingPlans(options?: { featured?: boolean; maturityLevel?: string }) {
    const params = new URLSearchParams();
    if (options?.featured) params.set('featured', 'true');
    if (options?.maturityLevel) params.set('maturityLevel', options.maturityLevel);

    return useQuery({
        queryKey: ['readingPlans', options],
        queryFn: () => apiRequest<{ items: any[]; total: number }>('GET', `/api/reading-plans?${params}`),
        staleTime: 5 * 60 * 1000,
    });
}

export function useReadingPlan(planId: number) {
    return useQuery({
        queryKey: ['readingPlan', planId],
        queryFn: () => apiRequest<any>('GET', `/api/reading-plans/${planId}`),
        enabled: !!planId,
        staleTime: 5 * 60 * 1000,
    });
}

export function useReadingPlanProgress(planId: number) {
    return useQuery({
        queryKey: ['readingPlanProgress', planId],
        queryFn: () => apiRequest<any>('GET', `/api/reading-plans/${planId}/progress`),
        enabled: !!planId,
    });
}

export function useStartReadingPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (planId: number) =>
            apiRequest<any>('POST', '/api/reading-plans/enroll', { planId }),
        onSuccess: (_: any, planId: number) => {
            queryClient.invalidateQueries({ queryKey: ['readingPlanProgress', planId] });
            queryClient.invalidateQueries({ queryKey: ['userEnrollments'] });
        },
    });
}

export function useCompleteReadingDay() {
    const queryClient = useQueryClient();

    return useMutation<any, unknown, { planId: number; dayNumber: number }>({
        mutationFn: ({ planId, dayNumber }: { planId: number; dayNumber: number }) =>
            apiRequest<any>('POST', `/api/reading-plans/${planId}/complete-day`, { dayNumber }), // Note: planId is in URL, dayNumber in body
        onSuccess: (_: any, { planId }: { planId: number; dayNumber: number }) => {
            queryClient.invalidateQueries({ queryKey: ['readingPlanProgress', planId] });
            queryClient.invalidateQueries({ queryKey: ['streakData'] });
        },
    });
}
