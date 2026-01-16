/**
 * Notification Service
 * 
 * Handles in-app notifications, scheduled notifications,
 * and push notification delivery.
 * Uses storage layer for core operations.
 */

import { db } from '../db';
import { storage } from '../storage';
import { 
  scheduledNotifications, 
  pushSubscriptions,
  userPreferences,
} from '@shared/schema';
import { eq, and, lte, desc, sql } from 'drizzle-orm';
import { logger } from '../lib/logger';

// ============================================================================
// Types
// ============================================================================

interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface ScheduleNotificationInput extends CreateNotificationInput {
  scheduledFor: Date;
}

interface NotificationResult {
  id: number;
  success: boolean;
  error?: string;
}

// ============================================================================
// Core Operations (using storage layer)
// ============================================================================

export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationResult> {
  try {
    // Serialize data to string for text column storage
    const dataString = input.data ? JSON.stringify(input.data) : null;
    
    const notification = await storage.createNotification({
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: dataString,
    });

    logger.info({
      notificationId: notification.id,
      userId: input.userId,
      type: input.type,
    }, 'Notification created');

    return { id: notification.id, success: true };
  } catch (error) {
    logger.error({ userId: input.userId, err: error }, 'Failed to create notification');
    return { id: 0, success: false, error: (error as Error).message };
  }
}

export async function scheduleNotification(
  input: ScheduleNotificationInput
): Promise<NotificationResult> {
  try {
    const [scheduled] = await db
      .insert(scheduledNotifications)
      .values({
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data || {},
        scheduledFor: input.scheduledFor,
        status: 'pending',
      })
      .returning({ id: scheduledNotifications.id });

    logger.info({
      scheduledId: scheduled.id,
      userId: input.userId,
      scheduledFor: input.scheduledFor,
    }, 'Notification scheduled');

    return { id: scheduled.id, success: true };
  } catch (error) {
    logger.error({ userId: input.userId, err: error }, 'Failed to schedule notification');
    return { id: 0, success: false, error: (error as Error).message };
  }
}

export async function getUnreadNotifications(
  userId: string,
  limit = 20
): Promise<Awaited<ReturnType<typeof storage.getNotifications>>> {
  const notifications = await storage.getNotifications(userId, limit);
  return notifications.filter(n => !n.read);
}

export async function getAllNotifications(
  userId: string,
  limit = 50,
  offset = 0
): Promise<{ items: Awaited<ReturnType<typeof storage.getNotifications>>; total: number }> {
  const [items, total] = await Promise.all([
    storage.getNotifications(userId, limit),
    storage.getNotificationsCount(userId),
  ]);

  return { items, total };
}

export async function markAsRead(
  userId: string,
  notificationId: number
): Promise<boolean> {
  await storage.markNotificationRead(notificationId, userId);
  return true;
}

export async function markAllAsRead(userId: string): Promise<number> {
  await storage.markAllNotificationsRead(userId);
  return 0;
}

export async function getUnreadCount(userId: string): Promise<number> {
  return storage.getUnreadNotificationsCount(userId);
}

// ============================================================================
// Push Subscriptions
// ============================================================================

export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
): Promise<boolean> {
  try {
    await db
      .insert(pushSubscriptions)
      .values({
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          keys: subscription.keys,
        },
      });

    logger.info({ userId }, 'Push subscription saved');
    return true;
  } catch (error) {
    logger.error({ userId, err: error }, 'Failed to save push subscription');
    return false;
  }
}

export async function removePushSubscription(
  userId: string,
  endpoint: string
): Promise<void> {
  await db
    .delete(pushSubscriptions)
    .where(
      and(
        eq(pushSubscriptions.userId, userId),
        eq(pushSubscriptions.endpoint, endpoint)
      )
    );

  logger.info({ userId }, 'Push subscription removed');
}

// ============================================================================
// Scheduled Notification Processing
// ============================================================================

export async function processPendingNotifications(): Promise<{ processed: number; failed: number }> {
  const now = new Date();
  let processed = 0;
  let failed = 0;

  try {
    // Get pending scheduled notifications that are due
    const pending = await db
      .select()
      .from(scheduledNotifications)
      .where(
        and(
          eq(scheduledNotifications.status, 'pending'),
          lte(scheduledNotifications.scheduledFor, now)
        )
      )
      .limit(100);

    for (const scheduled of pending) {
      try {
        // Create the actual notification using storage
        // scheduled.data is already an object from jsonb column, so stringify once for text storage
        const dataString = scheduled.data ? JSON.stringify(scheduled.data) : null;
        await storage.createNotification({
          userId: scheduled.userId,
          type: scheduled.type,
          title: scheduled.title,
          body: scheduled.body,
          data: dataString,
        });

        // Mark as sent
        await db
          .update(scheduledNotifications)
          .set({ status: 'sent', sentAt: new Date() })
          .where(eq(scheduledNotifications.id, scheduled.id));

        processed++;
      } catch (error) {
        // Mark as failed
        await db
          .update(scheduledNotifications)
          .set({ 
            status: 'failed', 
            error: (error as Error).message 
          })
          .where(eq(scheduledNotifications.id, scheduled.id));

        failed++;
        logger.error({ scheduledId: scheduled.id, err: error }, 'Failed to process scheduled notification');
      }
    }

    if (processed > 0 || failed > 0) {
      logger.info({ processed, failed }, 'Processed scheduled notifications');
    }
  } catch (error) {
    logger.error({ err: error }, 'Failed to process pending notifications');
  }

  return { processed, failed };
}

// ============================================================================
// Notification Helpers
// ============================================================================

export async function sendStreakReminder(userId: string, currentStreak: number): Promise<void> {
  await createNotification({
    userId,
    type: 'streak_reminder',
    title: 'Keep your streak going!',
    body: `You're on a ${currentStreak}-day streak. Don't forget to read today!`,
    data: { streak: currentStreak },
  });
}

export async function sendStreakAtRisk(userId: string, currentStreak: number): Promise<void> {
  await createNotification({
    userId,
    type: 'streak_at_risk',
    title: 'Your streak is at risk!',
    body: `You haven't read today. Your ${currentStreak}-day streak will reset at midnight.`,
    data: { streak: currentStreak },
  });
}

export async function sendStreakMilestone(userId: string, milestone: number): Promise<void> {
  await createNotification({
    userId,
    type: 'streak_milestone',
    title: `${milestone}-Day Streak! 🎉`,
    body: `Congratulations! You've maintained a ${milestone}-day reading streak.`,
    data: { milestone },
  });
}

export async function sendDailyReadingReminder(userId: string, planTitle: string): Promise<void> {
  await createNotification({
    userId,
    type: 'daily_reading',
    title: 'Your daily reading is ready',
    body: `Continue your journey with "${planTitle}"`,
    data: { planTitle },
  });
}

export async function shouldSendNotification(
  userId: string,
  notificationType: string
): Promise<boolean> {
  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (!prefs) return true; // Default to sending if no preferences set

  const settings = prefs.notificationSettings as {
    dailyReminders?: boolean;
    streakAlerts?: boolean;
    groupNotifications?: boolean;
    pushEnabled?: boolean;
  };

  switch (notificationType) {
    case 'streak_reminder':
    case 'streak_at_risk':
    case 'streak_milestone':
      return settings.streakAlerts !== false;
    case 'daily_reading':
      return settings.dailyReminders !== false;
    case 'group_discussion':
    case 'group_lab_reminder':
      return settings.groupNotifications !== false;
    default:
      return true;
  }
}

// ============================================================================
// Export
// ============================================================================

export const notificationService = {
  create: createNotification,
  schedule: scheduleNotification,
  getUnread: getUnreadNotifications,
  getAll: getAllNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  savePushSubscription,
  removePushSubscription,
  processPending: processPendingNotifications,
  sendStreakReminder,
  sendStreakAtRisk,
  sendStreakMilestone,
  sendDailyReadingReminder,
  shouldSendNotification,
};

export default notificationService;
