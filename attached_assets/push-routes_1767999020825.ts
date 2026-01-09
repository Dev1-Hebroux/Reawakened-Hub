/**
 * Push Notification Server Routes
 * 
 * Server-side handling for:
 * - Push subscription management
 * - Sending push notifications
 * - Scheduled notification jobs
 * 
 * Requires: npm install web-push
 */

import { Router } from 'express';
import webPush from 'web-push';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { requireAuth, loadUser } from '../middleware/auth';

const router = Router();

// ============================================================================
// Configuration
// ============================================================================

// Generate VAPID keys once: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@reawakened.app';

// Initialize web-push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// ============================================================================
// Types
// ============================================================================

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  requireInteraction?: boolean;
  silent?: boolean;
  renotify?: boolean;
}

// ============================================================================
// Routes
// ============================================================================

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key for client subscription
 */
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

/**
 * POST /api/push/subscribe
 * Store a push subscription for the current user
 */
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { subscription, preferences } = req.body;
    const userId = req.user!.id;

    if (!subscription?.endpoint || !subscription?.keys) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }

    // Store subscription
    await db.execute(sql`
      INSERT INTO push_subscriptions (
        user_id, 
        endpoint, 
        p256dh_key, 
        auth_key,
        user_agent,
        created_at
      ) VALUES (
        ${userId},
        ${subscription.endpoint},
        ${subscription.keys.p256dh},
        ${subscription.keys.auth},
        ${req.headers['user-agent'] || 'unknown'},
        NOW()
      )
      ON CONFLICT (endpoint) DO UPDATE SET
        user_id = ${userId},
        p256dh_key = ${subscription.keys.p256dh},
        auth_key = ${subscription.keys.auth},
        updated_at = NOW()
    `);

    // Update notification preferences if provided
    if (preferences) {
      await db.execute(sql`
        INSERT INTO user_notification_preferences (
          user_id,
          enabled,
          daily_reminder,
          daily_reminder_time,
          spark_updates,
          streak_reminders,
          community_updates,
          prayer_reminders,
          updated_at
        ) VALUES (
          ${userId},
          ${preferences.enabled ?? true},
          ${preferences.dailyReminder ?? true},
          ${preferences.dailyReminderTime || '07:00'},
          ${preferences.sparkUpdates ?? true},
          ${preferences.streakReminders ?? true},
          ${preferences.communityUpdates ?? false},
          ${preferences.prayerReminders ?? true},
          NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
          enabled = ${preferences.enabled ?? true},
          daily_reminder = ${preferences.dailyReminder ?? true},
          daily_reminder_time = ${preferences.dailyReminderTime || '07:00'},
          spark_updates = ${preferences.sparkUpdates ?? true},
          streak_reminders = ${preferences.streakReminders ?? true},
          community_updates = ${preferences.communityUpdates ?? false},
          prayer_reminders = ${preferences.prayerReminders ?? true},
          updated_at = NOW()
      `);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

/**
 * POST /api/push/unsubscribe
 * Remove push subscription for the current user's device
 */
router.post('/unsubscribe', requireAuth, async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user!.id;

    if (endpoint) {
      // Remove specific subscription
      await db.execute(sql`
        DELETE FROM push_subscriptions 
        WHERE user_id = ${userId} AND endpoint = ${endpoint}
      `);
    } else {
      // Remove all subscriptions for user
      await db.execute(sql`
        DELETE FROM push_subscriptions 
        WHERE user_id = ${userId}
      `);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing push subscription:', error);
    res.status(500).json({ error: 'Failed to remove subscription' });
  }
});

/**
 * POST /api/push/test
 * Send a test notification to the current user
 */
router.post('/test', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const sent = await sendNotificationToUser(userId, {
      title: 'Test Notification',
      body: 'Push notifications are working! 🎉',
      tag: 'test',
      data: { type: 'test' },
    });

    res.json({ success: sent > 0, sent });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// ============================================================================
// Notification Sending Functions
// ============================================================================

/**
 * Send notification to a specific user (all their devices)
 */
export async function sendNotificationToUser(
  userId: number,
  payload: NotificationPayload
): Promise<number> {
  const result = await db.execute(sql`
    SELECT endpoint, p256dh_key, auth_key
    FROM push_subscriptions
    WHERE user_id = ${userId}
  `);

  const subscriptions = result.rows as Array<{
    endpoint: string;
    p256dh_key: string;
    auth_key: string;
  }>;

  let sent = 0;

  for (const sub of subscriptions) {
    try {
      await webPush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key,
          },
        },
        JSON.stringify(payload),
        {
          TTL: 24 * 60 * 60, // 24 hours
          urgency: payload.requireInteraction ? 'high' : 'normal',
        }
      );
      sent++;
    } catch (error: any) {
      // Handle expired/invalid subscriptions
      if (error.statusCode === 404 || error.statusCode === 410) {
        await db.execute(sql`
          DELETE FROM push_subscriptions WHERE endpoint = ${sub.endpoint}
        `);
      } else {
        console.error('Push send error:', error);
      }
    }
  }

  return sent;
}

/**
 * Send notification to multiple users
 */
export async function sendNotificationToUsers(
  userIds: number[],
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const userId of userIds) {
    const count = await sendNotificationToUser(userId, payload);
    if (count > 0) {
      sent++;
    } else {
      failed++;
    }
  }

  return { sent, failed };
}

/**
 * Send notification to all users with a specific preference enabled
 */
export async function sendNotificationByPreference(
  preferenceField: string,
  payload: NotificationPayload
): Promise<{ sent: number; failed: number }> {
  const result = await db.execute(sql`
    SELECT DISTINCT ps.user_id
    FROM push_subscriptions ps
    JOIN user_notification_preferences unp ON ps.user_id = unp.user_id
    WHERE unp.enabled = true
      AND unp.${sql.raw(preferenceField)} = true
  `);

  const userIds = (result.rows as Array<{ user_id: number }>).map(r => r.user_id);
  return sendNotificationToUsers(userIds, payload);
}

// ============================================================================
// Scheduled Notification Jobs
// ============================================================================

/**
 * Send daily spark notifications
 * Call this from a cron job at appropriate times based on user preferences
 */
export async function sendDailySparkNotifications(hour: number): Promise<void> {
  // Get today's spark title
  const sparkResult = await db.execute(sql`
    SELECT title FROM sparks
    WHERE is_published = true
    ORDER BY published_at DESC
    LIMIT 1
  `);

  const sparkTitle = (sparkResult.rows[0] as any)?.title || 'Your daily spark';

  // Get users who want notifications at this hour
  const usersResult = await db.execute(sql`
    SELECT DISTINCT ps.user_id
    FROM push_subscriptions ps
    JOIN user_notification_preferences unp ON ps.user_id = unp.user_id
    WHERE unp.enabled = true
      AND unp.daily_reminder = true
      AND EXTRACT(HOUR FROM unp.daily_reminder_time::time) = ${hour}
  `);

  const userIds = (usersResult.rows as Array<{ user_id: number }>).map(r => r.user_id);

  if (userIds.length === 0) return;

  await sendNotificationToUsers(userIds, {
    title: "Today's Spark is Ready! ✨",
    body: sparkTitle,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'daily-spark',
    data: { url: '/spark/today', type: 'daily-spark' },
    actions: [
      { action: 'read', title: 'Read Now' },
    ],
    requireInteraction: true,
  });

  console.log(`[Notifications] Sent daily spark to ${userIds.length} users at ${hour}:00`);
}

/**
 * Send streak reminder notifications
 * Call this in the evening for users who haven't completed today's spark
 */
export async function sendStreakReminders(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Get users with active streaks who haven't completed today
  const usersResult = await db.execute(sql`
    SELECT DISTINCT ps.user_id, us.current_streak
    FROM push_subscriptions ps
    JOIN user_notification_preferences unp ON ps.user_id = unp.user_id
    JOIN user_streaks us ON ps.user_id = us.user_id
    WHERE unp.enabled = true
      AND unp.streak_reminders = true
      AND us.current_streak > 0
      AND NOT EXISTS (
        SELECT 1 FROM user_spark_completions usc
        WHERE usc.user_id = ps.user_id
          AND DATE(usc.completed_at) = ${today}
      )
  `);

  for (const row of usersResult.rows as Array<{ user_id: number; current_streak: number }>) {
    await sendNotificationToUser(row.user_id, {
      title: "Don't Break Your Streak! 🔥",
      body: `You're on a ${row.current_streak} day streak. Complete today's spark to keep it going!`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'streak-reminder',
      data: { url: '/spark/today', type: 'streak-reminder' },
      actions: [
        { action: 'complete', title: 'Complete Spark' },
      ],
    });
  }

  console.log(`[Notifications] Sent streak reminders to ${usersResult.rows.length} users`);
}

/**
 * Send streak milestone notifications
 */
export async function sendStreakMilestone(userId: number, streak: number): Promise<void> {
  const milestones = [3, 7, 14, 30, 50, 100, 200, 365];
  
  if (!milestones.includes(streak)) return;

  let message = '';
  if (streak >= 365) message = "A full year of faithfulness! You're an inspiration!";
  else if (streak >= 100) message = "Triple digits! Your dedication is remarkable!";
  else if (streak >= 30) message = "A full month of consistency! Keep it up!";
  else if (streak >= 7) message = "A whole week! You're building a great habit!";
  else message = "Great milestone! Keep coming back!";

  await sendNotificationToUser(userId, {
    title: `${streak} Day Streak! 🎉`,
    body: message,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'streak-milestone',
    data: { url: '/profile', type: 'streak-milestone' },
    requireInteraction: true,
  });
}

/**
 * Send prayer session reminder
 */
export async function sendPrayerSessionReminder(
  sessionId: number,
  minutesBefore: number = 15
): Promise<void> {
  // Get session details
  const sessionResult = await db.execute(sql`
    SELECT 
      lps.title,
      lps.scheduled_at,
      u.first_name as leader_name
    FROM leader_prayer_sessions lps
    JOIN users u ON lps.leader_id = u.id
    WHERE lps.id = ${sessionId}
  `);

  const session = sessionResult.rows[0] as any;
  if (!session) return;

  // Get users who want prayer reminders
  const result = await sendNotificationByPreference('prayer_reminders', {
    title: 'Live Prayer Session Starting Soon 🙏',
    body: `${session.leader_name} is hosting "${session.title}" in ${minutesBefore} minutes`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `prayer-session-${sessionId}`,
    data: { 
      url: `/prayer/${sessionId}`, 
      type: 'prayer-session',
      sessionId,
    },
    actions: [
      { action: 'join', title: 'Join' },
    ],
    requireInteraction: true,
  });

  console.log(`[Notifications] Sent prayer session reminder: ${result.sent} users`);
}

export const pushRoutes = router;

// ============================================================================
// Database Migration for Push Notifications
// ============================================================================

/*
Run this migration to add push notification tables:

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  daily_reminder BOOLEAN DEFAULT true,
  daily_reminder_time TIME DEFAULT '07:00',
  spark_updates BOOLEAN DEFAULT true,
  streak_reminders BOOLEAN DEFAULT true,
  community_updates BOOLEAN DEFAULT false,
  prayer_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
*/
