/**
 * Unified Auth Hook
 *
 * Re-exports useAuth from AuthContext to provide a single source of truth
 * for authentication state across the entire application.
 *
 * Previously this hook used React Query to fetch /api/auth/user which only
 * worked with Replit OIDC auth. Now it uses the AuthContext which properly
 * handles email/password authentication via the /api/init endpoint.
 */

export { useAuth } from '@/contexts/AuthContext';
