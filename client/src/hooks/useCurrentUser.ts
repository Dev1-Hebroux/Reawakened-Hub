/**
 * Current User Hook
 *
 * Returns the current user data from the unified AuthContext.
 * This replaces the previous implementation that used React Query
 * to fetch /api/auth/user which only worked with Replit OIDC.
 */

import { useAuth } from '@/contexts/AuthContext';

export function useCurrentUser() {
  const { user, isLoading, isAuthenticated } = useAuth();

  return {
    data: user,
    isLoading,
    isAuthenticated,
    // Compatibility with React Query interface
    isError: false,
    error: null,
  };
}
