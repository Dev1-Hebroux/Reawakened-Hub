/**
 * Spark Reactions Hook
 *
 * Manages reactions (likes, amens, etc.) for sparks.
 * Implements Optimistic UI for instant feedback.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ReactionCounts {
  flame: number;
  amen: number;
  praying: number;
}

interface MutationVariables {
  sparkId: number;
  reactionType: string;
}

interface MutationContext {
  previousCounts: ReactionCounts | undefined;
  sparkId: number;
}

export function useSparkReactions(isAuthenticated: boolean) {
  const queryClient = useQueryClient();

  const reactionMutation = useMutation({
    mutationFn: async ({ sparkId, reactionType }: { sparkId: number; reactionType: string }) => {
      const res = await apiRequest("POST", `/api/sparks/${sparkId}/reactions`, { reactionType }) as Response;
      return res.json();
    },
    onMutate: async ({ sparkId, reactionType }: MutationVariables) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["/api/sparks", sparkId, "reactions"] });

      // Snapshot previous value for rollback
      const previousCounts = queryClient.getQueryData<ReactionCounts>(["/api/sparks", sparkId, "reactions"]);

      // Optimistically update the cache
      queryClient.setQueryData<ReactionCounts>(["/api/sparks", sparkId, "reactions"], (old) => {
        if (!old) return { flame: 0, amen: 0, praying: 0, [reactionType]: 1 };
        return {
          ...old,
          [reactionType]: (old[reactionType as keyof ReactionCounts] || 0) + 1,
        };
      });

      // Return context with snapshotted value
      return { previousCounts, sparkId };
    },
    onError: (error: Error, _variables: MutationVariables, context: MutationContext | undefined) => {
      // Rollback on error
      if (context?.previousCounts !== undefined) {
        queryClient.setQueryData(["/api/sparks", context.sparkId, "reactions"], context.previousCounts);
      }

      if (isUnauthorizedError(error)) {
        toast.error("Please log in to react");
        setTimeout(() => window.location.href = "/login", 1000);
      } else {
        toast.error("Failed to add reaction");
      }
    },
    onSettled: (_data: unknown, _error: Error | null, variables: MutationVariables) => {
      // Invalidate to ensure we sync with server truth
      queryClient.invalidateQueries({ queryKey: ["/api/sparks", variables.sparkId, "reactions"] });
    },
  });

  const handleSparkReaction = (sparkId: number, reactionType: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to react");
      setTimeout(() => window.location.href = "/login", 1000);
      return;
    }

    // Show success toast immediately (optimistic)
    toast.success("Amen!");
    reactionMutation.mutate({ sparkId, reactionType });
  };

  return {
    reactionMutation,
    handleSparkReaction,
  };
}
