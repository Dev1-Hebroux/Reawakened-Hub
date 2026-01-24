/**
 * View Mode Hook
 *
 * Manages the view mode (reflection vs faith overlay) with:
 * - Local storage persistence
 * - User preference syncing
 * - Automatic syncing with user profile
 */

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type ViewMode = 'reflection' | 'faith';

interface UseViewModeProps {
  isAuthenticated: boolean;
  userContentMode?: 'reflection' | 'faith';
  userAudienceSegment?: string;
}

export function useViewMode({ isAuthenticated, userContentMode, userAudienceSegment }: UseViewModeProps) {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (userContentMode) return userContentMode;
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('sparks_view_mode') as ViewMode) || 'reflection';
    }
    return 'reflection';
  });

  // Sync with user's saved preference
  useEffect(() => {
    if (userContentMode && userContentMode !== viewMode) {
      setViewMode(userContentMode);
    }
  }, [userContentMode]);

  const handleViewModeChange = async (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('sparks_view_mode', mode);

    if (isAuthenticated) {
      try {
        await apiRequest("PATCH", "/api/auth/user/preferences", {
          contentMode: mode,
          audienceSegment: userAudienceSegment ?? null,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      } catch (error) {
        console.error("Failed to save preference:", error);
      }
    }
  };

  return {
    viewMode,
    handleViewModeChange,
  };
}
