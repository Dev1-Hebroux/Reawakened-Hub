/**
 * Spark Subscriptions Hook
 *
 * Manages spark category subscriptions including:
 * - Fetching user subscriptions
 * - Subscribe/unsubscribe mutations
 * - Subscription status checks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { SparkSubscription } from "@shared/schema";

export function useSparkSubscriptions(isAuthenticated: boolean) {
  const queryClient = useQueryClient();

  // Fetch subscriptions
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery<SparkSubscription[]>({
    queryKey: ["/api/subscriptions"],
    enabled: isAuthenticated,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (category: string) => {
      const res = await apiRequest("POST", "/api/subscriptions", { category }) as Response;
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast.success("Subscribed successfully!");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to subscribe");
        setTimeout(() => window.location.href = "/login", 1000);
      } else {
        toast.error("Failed to subscribe");
      }
    },
  });

  // Unsubscribe mutation
  const unsubscribeMutation = useMutation({
    mutationFn: async (category: string) => {
      await apiRequest("DELETE", `/api/subscriptions/${category}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscriptions"] });
      toast.success("Unsubscribed successfully!");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in");
        setTimeout(() => window.location.href = "/login", 1000);
      } else {
        toast.error("Failed to unsubscribe");
      }
    },
  });

  // Check if subscribed to a category
  const isSubscribed = (category: string) => {
    return subscriptions.some(sub => sub.category === category);
  };

  // Toggle subscription for a category
  const handleSubscriptionToggle = (category: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to subscribe");
      setTimeout(() => window.location.href = "/login", 1000);
      return;
    }

    if (isSubscribed(category)) {
      unsubscribeMutation.mutate(category);
    } else {
      subscribeMutation.mutate(category);
    }
  };

  return {
    subscriptions,
    subscriptionsLoading,
    subscribeMutation,
    unsubscribeMutation,
    isSubscribed,
    handleSubscriptionToggle,
  };
}
