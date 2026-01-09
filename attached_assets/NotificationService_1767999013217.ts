/**
 * Push Notification Service
 * 
 * Premium notification experience with:
 * - Permission management with smart prompting
 * - Rich notification templates
 * - Scheduled local notifications
 * - Notification preferences sync
 * - Analytics tracking
 */

// ============================================================================
// Types
// ============================================================================

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  renotify?: boolean;
  timestamp?: number;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface NotificationPreferences {
  enabled: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string; // HH:mm format
  sparkUpdates: boolean;
  streakReminders: boolean;
  communityUpdates: boolean;
  prayerReminders: boolean;
}

type NotificationType = 
  | 'daily-spark'
  | 'streak-reminder'
  | 'streak-milestone'
  | 'prayer-session'
  | 'community-update'
  | 'journey-progress'
  | 'welcome';

// ============================================================================
// Notification Service Class
// ============================================================================

class NotificationService {
  private vapidPublicKey: string | null = null;
  private subscription: PushSubscription | null = null;
  private preferences: NotificationPreferences | null = null;

  // -------------------------------------------------------------------------
  // Initialization
  // -------------------------------------------------------------------------

  async initialize(vapidPublicKey: string): Promise<void> {
    this.vapidPublicKey = vapidPublicKey;

    if (!this.isSupported()) {
      console.warn('[Notifications] Push notifications not supported');
      return;
    }

    // Check existing subscription
    const registration = await navigator.serviceWorker.ready;
    this.subscription = await registration.pushManager.getSubscription();

    // Load preferences
    await this.loadPreferences();

    console.log('[Notifications] Service initialized', {
      subscribed: !!this.subscription,
      permission: Notification.permission,
    });
  }

  // -------------------------------------------------------------------------
  // Support & Permission Checks
  // -------------------------------------------------------------------------

  isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  isSubscribed(): boolean {
    return !!this.subscription;
  }

  // -------------------------------------------------------------------------
  // Permission & Subscription
  // -------------------------------------------------------------------------

  /**
   * Request notification permission with smart timing.
   * Returns true if permission granted.
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;

    // Already granted
    if (Notification.permission === 'granted') {
      return true;
    }

    // Already denied - can't ask again
    if (Notification.permission === 'denied') {
      return false;
    }

    // Request permission
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  /**
   * Subscribe to push notifications.
   * Must be called after permission is granted.
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported() || !this.vapidPublicKey) {
      return null;
    }

    if (Notification.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Convert VAPID key
      const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

      // Subscribe
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);

      console.log('[Notifications] Subscribed successfully');
      return this.subscription;
    } catch (error) {
      console.error('[Notifications] Subscribe failed:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications.
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) return true;

    try {
      await this.subscription.unsubscribe();
      await this.removeSubscriptionFromServer();
      this.subscription = null;
      console.log('[Notifications] Unsubscribed successfully');
      return true;
    } catch (error) {
      console.error('[Notifications] Unsubscribe failed:', error);
      return false;
    }
  }

  // -------------------------------------------------------------------------
  // Send Notifications
  // -------------------------------------------------------------------------

  /**
   * Show a local notification immediately.
   */
  async showNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      await registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icons/icon-192x192.png',
        badge: payload.badge || '/icons/badge-72x72.png',
        image: payload.image,
        tag: payload.tag || 'default',
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        renotify: payload.renotify || false,
        timestamp: payload.timestamp || Date.now(),
        vibrate: [100, 50, 100],
      } as NotificationOptions);

      return true;
    } catch (error) {
      console.error('[Notifications] Show notification failed:', error);
      return false;
    }
  }

  /**
   * Send a notification using predefined templates.
   */
  async sendTemplatedNotification(type: NotificationType, data?: Record<string, any>): Promise<boolean> {
    const template = this.getNotificationTemplate(type, data);
    if (!template) return false;
    return this.showNotification(template);
  }

  // -------------------------------------------------------------------------
  // Notification Templates
  // -------------------------------------------------------------------------

  private getNotificationTemplate(type: NotificationType, data?: Record<string, any>): NotificationPayload | null {
    const templates: Record<NotificationType, () => NotificationPayload> = {
      'daily-spark': () => ({
        title: "Today's Spark is Ready! ✨",
        body: data?.title || 'Start your day with spiritual growth',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'daily-spark',
        data: { url: '/spark/today', type: 'daily-spark' },
        actions: [
          { action: 'read', title: 'Read Now' },
          { action: 'later', title: 'Later' },
        ],
        requireInteraction: true,
      }),

      'streak-reminder': () => ({
        title: "Don't Break Your Streak! 🔥",
        body: `You're on a ${data?.streak || 0} day streak. Complete today's spark to keep it going!`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'streak-reminder',
        data: { url: '/spark/today', type: 'streak-reminder' },
        actions: [
          { action: 'complete', title: 'Complete Spark' },
        ],
      }),

      'streak-milestone': () => ({
        title: `${data?.streak} Day Streak! 🎉`,
        body: this.getStreakMilestoneMessage(data?.streak || 0),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'streak-milestone',
        data: { url: '/profile', type: 'streak-milestone' },
        requireInteraction: true,
      }),

      'prayer-session': () => ({
        title: 'Live Prayer Session Starting Soon 🙏',
        body: `${data?.leader || 'A leader'} is hosting a prayer session in ${data?.minutes || 15} minutes`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'prayer-session',
        data: { url: data?.url || '/prayer', type: 'prayer-session' },
        actions: [
          { action: 'join', title: 'Join' },
          { action: 'remind', title: 'Remind Me' },
        ],
        requireInteraction: true,
      }),

      'community-update': () => ({
        title: 'New in Your Community 💬',
        body: data?.message || 'See what others are sharing',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'community-update',
        data: { url: '/community', type: 'community-update' },
      }),

      'journey-progress': () => ({
        title: 'Journey Progress Update 📖',
        body: `You've completed ${data?.completed || 0} of ${data?.total || 0} days in "${data?.journey || 'your journey'}"`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'journey-progress',
        data: { url: data?.url || '/journeys', type: 'journey-progress' },
      }),

      'welcome': () => ({
        title: 'Welcome to Reawakened! 🌅',
        body: 'Your spiritual growth journey begins today. Tap to get started.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'welcome',
        data: { url: '/spark/today', type: 'welcome' },
        requireInteraction: true,
      }),
    };

    const templateFn = templates[type];
    return templateFn ? templateFn() : null;
  }

  private getStreakMilestoneMessage(streak: number): string {
    if (streak >= 365) return "A full year of faithfulness! You're an inspiration!";
    if (streak >= 100) return "Triple digits! Your dedication is remarkable!";
    if (streak >= 30) return "A full month of consistency! Keep it up!";
    if (streak >= 7) return "A whole week! You're building a great habit!";
    if (streak >= 3) return "Three days strong! Momentum is building!";
    return "Great start! Keep coming back!";
  }

  // -------------------------------------------------------------------------
  // Scheduled Notifications (Local)
  // -------------------------------------------------------------------------

  /**
   * Schedule a local notification for a specific time.
   * Uses the Notification Triggers API if available, otherwise falls back to setTimeout.
   */
  async scheduleNotification(
    payload: NotificationPayload,
    scheduledTime: Date
  ): Promise<string | null> {
    const delay = scheduledTime.getTime() - Date.now();
    
    if (delay <= 0) {
      console.warn('[Notifications] Scheduled time is in the past');
      return null;
    }

    const id = `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store in localStorage for persistence
    const scheduled = this.getScheduledNotifications();
    scheduled.push({
      id,
      payload,
      scheduledTime: scheduledTime.toISOString(),
    });
    localStorage.setItem('scheduled_notifications', JSON.stringify(scheduled));

    // Set timeout (will be lost on page refresh - server-side scheduling recommended)
    setTimeout(() => {
      this.showNotification(payload);
      this.removeScheduledNotification(id);
    }, delay);

    return id;
  }

  /**
   * Cancel a scheduled notification.
   */
  cancelScheduledNotification(id: string): void {
    const scheduled = this.getScheduledNotifications();
    const filtered = scheduled.filter(n => n.id !== id);
    localStorage.setItem('scheduled_notifications', JSON.stringify(filtered));
  }

  private getScheduledNotifications(): Array<{ id: string; payload: NotificationPayload; scheduledTime: string }> {
    try {
      return JSON.parse(localStorage.getItem('scheduled_notifications') || '[]');
    } catch {
      return [];
    }
  }

  private removeScheduledNotification(id: string): void {
    this.cancelScheduledNotification(id);
  }

  // -------------------------------------------------------------------------
  // Preferences
  // -------------------------------------------------------------------------

  async loadPreferences(): Promise<NotificationPreferences> {
    try {
      const stored = localStorage.getItem('notification_preferences');
      if (stored) {
        this.preferences = JSON.parse(stored);
      } else {
        this.preferences = this.getDefaultPreferences();
      }
    } catch {
      this.preferences = this.getDefaultPreferences();
    }
    return this.preferences;
  }

  async savePreferences(preferences: NotificationPreferences): Promise<void> {
    this.preferences = preferences;
    localStorage.setItem('notification_preferences', JSON.stringify(preferences));

    // Sync to server
    try {
      await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
        credentials: 'include',
      });
    } catch (error) {
      console.warn('[Notifications] Failed to sync preferences to server:', error);
    }
  }

  getPreferences(): NotificationPreferences {
    return this.preferences || this.getDefaultPreferences();
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      dailyReminder: true,
      dailyReminderTime: '07:00',
      sparkUpdates: true,
      streakReminders: true,
      communityUpdates: false,
      prayerReminders: true,
    };
  }

  // -------------------------------------------------------------------------
  // Server Communication
  // -------------------------------------------------------------------------

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        preferences: this.preferences,
      }),
      credentials: 'include',
    });
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      credentials: 'include',
    });
  }

  // -------------------------------------------------------------------------
  // Utilities
  // -------------------------------------------------------------------------

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const notificationService = new NotificationService();

// ============================================================================
// React Hook
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setPermission(notificationService.getPermissionStatus());
      setIsSubscribed(notificationService.isSubscribed());
      setPreferences(await notificationService.loadPreferences());
      setIsLoading(false);
    };
    init();
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.getPermissionStatus());
    return granted;
  }, []);

  const subscribe = useCallback(async () => {
    const subscription = await notificationService.subscribe();
    setIsSubscribed(!!subscription);
    return !!subscription;
  }, []);

  const unsubscribe = useCallback(async () => {
    const success = await notificationService.unsubscribe();
    if (success) setIsSubscribed(false);
    return success;
  }, []);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences!, ...newPreferences };
    await notificationService.savePreferences(updated);
    setPreferences(updated);
  }, [preferences]);

  const sendTestNotification = useCallback(async () => {
    return notificationService.showNotification({
      title: 'Test Notification',
      body: 'Notifications are working! 🎉',
      tag: 'test',
    });
  }, []);

  return {
    permission,
    isSubscribed,
    preferences,
    isLoading,
    isSupported: notificationService.isSupported(),
    requestPermission,
    subscribe,
    unsubscribe,
    updatePreferences,
    sendTestNotification,
    sendNotification: notificationService.showNotification.bind(notificationService),
    sendTemplated: notificationService.sendTemplatedNotification.bind(notificationService),
  };
}
