/**
 * Push Notification Service
 * 
 * Premium notification experience with:
 * - Permission management with smart prompting
 * - Rich notification templates
 * - Scheduled local notifications
 * - Notification preferences sync
 */

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
  dailyReminderTime: string;
  sparkUpdates: boolean;
  streakReminders: boolean;
  communityUpdates: boolean;
  prayerReminders: boolean;
  journeyUpdates: boolean;
  milestoneCelebrations: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
}

type NotificationType = 
  | 'daily-spark'
  | 'streak-reminder'
  | 'streak-milestone'
  | 'prayer-session'
  | 'community-update'
  | 'journey-progress'
  | 'welcome';

class NotificationService {
  private vapidPublicKey: string | null = null;
  private subscription: PushSubscription | null = null;
  private preferences: NotificationPreferences | null = null;

  async initialize(vapidPublicKey: string): Promise<void> {
    this.vapidPublicKey = vapidPublicKey;

    if (!this.isSupported()) {
      console.warn('[Notifications] Push notifications not supported');
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    this.subscription = await registration.pushManager.getSubscription();

    await this.loadPreferences();

    console.log('[Notifications] Service initialized', {
      subscribed: !!this.subscription,
      permission: Notification.permission,
    });
  }

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

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const result = await Notification.requestPermission();
    return result === 'granted';
  }

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
      const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      await this.sendSubscriptionToServer(this.subscription);

      console.log('[Notifications] Subscribed successfully');
      return this.subscription;
    } catch (error) {
      console.error('[Notifications] Subscribe failed:', error);
      return null;
    }
  }

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
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        timestamp: payload.timestamp || Date.now(),
        vibrate: [100, 50, 100],
      } as NotificationOptions);

      return true;
    } catch (error) {
      console.error('[Notifications] Show notification failed:', error);
      return false;
    }
  }

  async sendTemplatedNotification(type: NotificationType, data?: Record<string, any>): Promise<boolean> {
    const template = this.getNotificationTemplate(type, data);
    if (!template) return false;
    return this.showNotification(template);
  }

  private getNotificationTemplate(type: NotificationType, data?: Record<string, any>): NotificationPayload | null {
    const templates: Record<NotificationType, () => NotificationPayload> = {
      'daily-spark': () => ({
        title: "Today's Spark is Ready! ✨",
        body: data?.title || 'Start your day with spiritual growth',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'daily-spark',
        data: { url: '/spark/today', type: 'daily-spark' },
        requireInteraction: true,
      }),

      'streak-reminder': () => ({
        title: "Don't Break Your Streak! 🔥",
        body: `You're on a ${data?.streak || 0} day streak. Complete today's spark to keep it going!`,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'streak-reminder',
        data: { url: '/spark/today', type: 'streak-reminder' },
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

  async loadPreferences(): Promise<NotificationPreferences | null> {
    try {
      const response = await fetch('/api/push/preferences', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        return null;
      }

      this.preferences = await response.json();
      return this.preferences;
    } catch (error) {
      console.error('[Notifications] Failed to load preferences:', error);
      return null;
    }
  }

  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const response = await fetch('/api/push/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...this.preferences, ...prefs }),
      });

      if (!response.ok) {
        return false;
      }

      this.preferences = { ...this.preferences!, ...prefs };
      return true;
    } catch (error) {
      console.error('[Notifications] Failed to update preferences:', error);
      return false;
    }
  }

  getPreferences(): NotificationPreferences | null {
    return this.preferences;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        preferences: this.preferences,
      }),
    });
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        endpoint: this.subscription?.endpoint,
      }),
    });
  }

  async sendTestNotification(): Promise<boolean> {
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('[Notifications] Test notification failed:', error);
      return false;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
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

export const notificationService = new NotificationService();

import { useState, useEffect, useCallback } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.getPermissionStatus()
  );
  const [isSubscribed, setIsSubscribed] = useState(notificationService.isSubscribed());
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(
    notificationService.getPreferences()
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { publicKey } = await fetch('/api/push/vapid-public-key').then(r => r.json());
        if (publicKey) {
          await notificationService.initialize(publicKey);
          setPermission(notificationService.getPermissionStatus());
          setIsSubscribed(notificationService.isSubscribed());
          setPreferences(notificationService.getPreferences());
        }
      } catch (error) {
        console.error('[useNotifications] Init failed:', error);
      }
    };

    init();
  }, []);

  const subscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const sub = await notificationService.subscribe();
      setIsSubscribed(!!sub);
      setPermission(notificationService.getPermissionStatus());
      return !!sub;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await notificationService.unsubscribe();
      if (success) {
        setIsSubscribed(false);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    const success = await notificationService.updatePreferences(prefs);
    if (success) {
      setPreferences(notificationService.getPreferences());
    }
    return success;
  }, []);

  const sendTestNotification = useCallback(async () => {
    return notificationService.sendTestNotification();
  }, []);

  return {
    permission,
    isSubscribed,
    preferences,
    isLoading,
    isSupported: notificationService.isSupported(),
    subscribe,
    unsubscribe,
    updatePreferences,
    sendTestNotification,
  };
}
