/**
 * RLS Context Middleware
 *
 * Sets PostgreSQL session variable for Row Level Security (RLS) policies.
 * This middleware must run after authentication to set the current user context.
 */

import type { RequestHandler } from 'express';
import { storage } from '../storage';
import { sql } from 'drizzle-orm';

/**
 * Middleware to set current user ID in PostgreSQL session for RLS policies
 * Must be used after authentication middleware
 */
export const setRLSContext: RequestHandler = async (req: any, res, next) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id || req.user?.claims?.sub;

    if (userId) {
      // Set PostgreSQL session variable for RLS policies
      await storage.db.execute(
        sql`SELECT set_config('app.current_user_id', ${userId}, false)`
      );

      // Optional: Also set role for role-based policies
      const userRole = req.user?.role;
      if (userRole) {
        await storage.db.execute(
          sql`SELECT set_config('app.current_user_role', ${userRole}, false)`
        );
      }
    } else {
      // Clear context for unauthenticated requests
      await storage.db.execute(
        sql`SELECT set_config('app.current_user_id', '', false)`
      );
    }

    next();
  } catch (error) {
    console.error('[RLS Context] Error setting user context:', error);
    // Don't block the request if context setting fails
    // This ensures the app continues to function even if RLS has issues
    next();
  }
};

/**
 * Helper function to manually set RLS context in database operations
 * Use this when you need to set context outside of middleware
 */
export async function setUserContextManual(userId: string, role?: string): Promise<void> {
  try {
    await storage.db.execute(
      sql`SELECT set_config('app.current_user_id', ${userId}, false)`
    );

    if (role) {
      await storage.db.execute(
        sql`SELECT set_config('app.current_user_role', ${role}, false)`
      );
    }
  } catch (error) {
    console.error('[RLS Context] Error setting manual context:', error);
    throw error;
  }
}

/**
 * Helper function to clear RLS context
 */
export async function clearUserContext(): Promise<void> {
  try {
    await storage.db.execute(
      sql`SELECT set_config('app.current_user_id', '', false)`
    );
    await storage.db.execute(
      sql`SELECT set_config('app.current_user_role', '', false)`
    );
  } catch (error) {
    console.error('[RLS Context] Error clearing context:', error);
    throw error;
  }
}
