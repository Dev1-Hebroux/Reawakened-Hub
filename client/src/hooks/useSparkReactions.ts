/**
 * Spark Reactions Hook
 *
 * Manages reactions (likes, amens, etc.) for sparks
 */

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

export function useSparkReactions(isAuthenticated: boolean) {
  const reactionMutation = useMutation({
    mutationFn: async ({ sparkId, reactionType }: { sparkId: number; reactionType: string }) => {
      const res = await apiRequest("POST", `/api/sparks/${sparkId}/reactions`, { reactionType }) as Response;
      return res.json();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast.error("Please log in to react");
        setTimeout(() => window.location.href = "/api/login", 1000);
      } else {
        toast.error("Failed to add reaction");
      }
    },
  });

  const handleSparkReaction = (sparkId: number, reactionType: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to react");
      setTimeout(() => window.location.href = "/api/login", 1000);
      return;
    }

    reactionMutation.mutate({ sparkId, reactionType }, {
      onSuccess: () => {
        toast.success("Amen!");
      }
    });
  };

  return {
    reactionMutation,
    handleSparkReaction,
  };
}
