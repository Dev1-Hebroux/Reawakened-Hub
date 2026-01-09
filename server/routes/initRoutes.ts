/**
 * Combined Init Endpoint
 * 
 * Returns all data needed for initial page load in a single request:
 * - Auth state (user data)
 * - CSRF token (from res.locals set by setCsrfToken middleware)
 * - Notification count
 * - User preferences
 * - Streak data
 */

import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

interface InitResponse {
  authenticated: boolean;
  user: any | null;
  csrfToken: string | null;
  notifications: { unread: number };
  preferences: any | null;
  streak: { current: number; longest: number } | null;
  serverTime: string;
  loadTime: number;
}

router.get('/init', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const csrfToken = (res.locals.csrfToken as string) || req.cookies?.csrf_token || null;
    const user = (req as any).user;
    
    if (!user) {
      const response: InitResponse = {
        authenticated: false,
        user: null,
        csrfToken,
        notifications: { unread: 0 },
        preferences: null,
        streak: null,
        serverTime: new Date().toISOString(),
        loadTime: Date.now() - startTime,
      };
      return res.json(response);
    }
    
    const userId = user.claims?.sub || user.id;
    
    const [notificationCount, preferences, streak] = await Promise.all([
      getUnreadNotificationCount(userId),
      getUserPreferences(userId),
      getCurrentStreak(userId),
    ]);
    
    const response: InitResponse = {
      authenticated: true,
      user: {
        id: userId,
        email: user.email || user.claims?.email,
        firstName: user.firstName || user.claims?.first_name,
        lastName: user.lastName || user.claims?.last_name,
        role: user.role || 'user',
        emailVerified: !!user.emailVerifiedAt,
        authProvider: user.authProvider || 'replit',
        profileImageUrl: user.profileImageUrl || user.claims?.profile_image,
      },
      csrfToken,
      notifications: { unread: notificationCount },
      preferences,
      streak,
      serverTime: new Date().toISOString(),
      loadTime: Date.now() - startTime,
    };
    
    res.set('Cache-Control', 'private, no-cache');
    res.json(response);
  } catch (error) {
    console.error('Error in /api/init:', error);
    
    res.json({
      authenticated: false,
      user: null,
      csrfToken: (res.locals.csrfToken as string) || req.cookies?.csrf_token || null,
      notifications: { unread: 0 },
      preferences: null,
      streak: null,
      serverTime: new Date().toISOString(),
      loadTime: Date.now() - startTime,
      error: 'Failed to load some data',
    });
  }
});

async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ${userId} 
        AND read_at IS NULL
    `);
    return Number(result.rows[0]?.count) || 0;
  } catch {
    return 0;
  }
}

async function getUserPreferences(userId: string): Promise<any | null> {
  try {
    const prefs = await storage.getNotificationPreferences(userId);
    return prefs || null;
  } catch {
    return null;
  }
}

async function getCurrentStreak(userId: string): Promise<{ current: number; longest: number } | null> {
  try {
    return await storage.getUserStreakData(userId);
  } catch {
    return null;
  }
}

export default router;
