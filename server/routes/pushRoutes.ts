/**
 * Push Notification Server Routes
 * 
 * Server-side handling for:
 * - Push subscription management
 * - Sending push notifications
 * - Scheduled notification jobs
 */

import { Router } from 'express';
import webPush from 'web-push';
import { db } from '../db';
import { sql } from 'drizzle-orm';
import { isAuthenticated } from '../replitAuth';

const router = Router();

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:hello@reawakened.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
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

router.get('/push/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

router.post('/push/subscribe', isAuthenticated, async (req: any, res) => {
  try {
    const { subscription, preferences } = req.body;
    const userId = req.user.claims.sub;

    if (!subscription?.endpoint || !subscription?.keys) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }

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

router.post('/push/unsubscribe', isAuthenticated, async (req: any, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user.claims.sub;

    if (endpoint) {
      await db.execute(sql`
        DELETE FROM push_subscriptions 
        WHERE user_id = ${userId} AND endpoint = ${endpoint}
      `);
    } else {
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

router.get('/push/preferences', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const result = await db.execute(sql`
      SELECT * FROM user_notification_preferences
      WHERE user_id = ${userId}
    `);

    if (result.rows.length === 0) {
      return res.json({
        enabled: true,
        dailyReminder: true,
        dailyReminderTime: '07:00',
        sparkUpdates: true,
        streakReminders: true,
        communityUpdates: false,
        prayerReminders: true,
        journeyUpdates: true,
        milestoneCelebrations: true,
        quietHoursEnabled: false,
        quietHoursStart: '22:00',
        quietHoursEnd: '07:00',
        timezone: 'UTC',
      });
    }

    const row = result.rows[0] as any;
    res.json({
      enabled: row.enabled,
      dailyReminder: row.daily_reminder,
      dailyReminderTime: row.daily_reminder_time,
      sparkUpdates: row.spark_updates,
      streakReminders: row.streak_reminders,
      communityUpdates: row.community_updates,
      prayerReminders: row.prayer_reminders,
      journeyUpdates: row.journey_updates,
      milestoneCelebrations: row.milestone_celebrations,
      quietHoursEnabled: row.quiet_hours_enabled,
      quietHoursStart: row.quiet_hours_start,
      quietHoursEnd: row.quiet_hours_end,
      timezone: row.timezone,
    });
  } catch (error) {
    console.error('Error fetching push preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

router.put('/push/preferences', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    const prefs = req.body;

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
        journey_updates,
        milestone_celebrations,
        quiet_hours_enabled,
        quiet_hours_start,
        quiet_hours_end,
        timezone,
        updated_at
      ) VALUES (
        ${userId},
        ${prefs.enabled ?? true},
        ${prefs.dailyReminder ?? true},
        ${prefs.dailyReminderTime || '07:00'},
        ${prefs.sparkUpdates ?? true},
        ${prefs.streakReminders ?? true},
        ${prefs.communityUpdates ?? false},
        ${prefs.prayerReminders ?? true},
        ${prefs.journeyUpdates ?? true},
        ${prefs.milestoneCelebrations ?? true},
        ${prefs.quietHoursEnabled ?? false},
        ${prefs.quietHoursStart || '22:00'},
        ${prefs.quietHoursEnd || '07:00'},
        ${prefs.timezone || 'UTC'},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        enabled = ${prefs.enabled ?? true},
        daily_reminder = ${prefs.dailyReminder ?? true},
        daily_reminder_time = ${prefs.dailyReminderTime || '07:00'},
        spark_updates = ${prefs.sparkUpdates ?? true},
        streak_reminders = ${prefs.streakReminders ?? true},
        community_updates = ${prefs.communityUpdates ?? false},
        prayer_reminders = ${prefs.prayerReminders ?? true},
        journey_updates = ${prefs.journeyUpdates ?? true},
        milestone_celebrations = ${prefs.milestoneCelebrations ?? true},
        quiet_hours_enabled = ${prefs.quietHoursEnabled ?? false},
        quiet_hours_start = ${prefs.quietHoursStart || '22:00'},
        quiet_hours_end = ${prefs.quietHoursEnd || '07:00'},
        timezone = ${prefs.timezone || 'UTC'},
        updated_at = NOW()
    `);

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating push preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

router.post('/push/test', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims.sub;
    
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

export async function sendNotificationToUser(
  userId: string,
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
          TTL: 24 * 60 * 60,
          urgency: payload.requireInteraction ? 'high' : 'normal',
        }
      );
      sent++;
    } catch (error: any) {
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

export async function sendNotificationToUsers(
  userIds: string[],
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

export async function sendDailySparkNotifications(hour: number): Promise<void> {
  const sparkResult = await db.execute(sql`
    SELECT title FROM sparks
    WHERE is_published = true
    ORDER BY published_at DESC
    LIMIT 1
  `);

  const sparkTitle = (sparkResult.rows[0] as any)?.title || 'Your daily spark';

  const usersResult = await db.execute(sql`
    SELECT DISTINCT ps.user_id
    FROM push_subscriptions ps
    JOIN user_notification_preferences unp ON ps.user_id = unp.user_id
    WHERE unp.enabled = true
      AND unp.daily_reminder = true
      AND EXTRACT(HOUR FROM unp.daily_reminder_time::time) = ${hour}
  `);

  const userIds = (usersResult.rows as Array<{ user_id: string }>).map(r => r.user_id);

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

export async function sendStreakReminders(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

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

  for (const row of usersResult.rows as Array<{ user_id: string; current_streak: number }>) {
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

export async function sendStreakMilestone(userId: string, streak: number): Promise<void> {
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

export default router;
