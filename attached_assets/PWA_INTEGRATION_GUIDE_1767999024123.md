# Premium PWA Integration Guide

Transform your app into a top-tier PWA with native-like notifications and offline support.

## Quick Start

### 1. Generate VAPID Keys (One Time)

```bash
npx web-push generate-vapid-keys
```

Add to your `.env`:
```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

### 2. Install Dependencies

```bash
npm install web-push
```

### 3. Run Database Migration

```bash
psql $DATABASE_URL -f migrations/003_push_notifications.sql
```

### 4. Server Setup

```typescript
// In server/index.ts or server/routes.ts

import { pushRoutes } from './routes/push';

// Mount push notification routes
app.use('/api/push', pushRoutes);
```

### 5. Client Setup

```tsx
// In App.tsx or main.tsx

import { PWAProvider, InstallBanner, UpdateBanner, OfflineIndicator, IOSInstallInstructions } from './components/PWAComponents';
import { notificationService } from './services/NotificationService';

// Initialize notifications (after user logs in)
useEffect(() => {
  const initNotifications = async () => {
    const { publicKey } = await fetch('/api/push/vapid-public-key').then(r => r.json());
    await notificationService.initialize(publicKey);
  };
  
  if (isAuthenticated) {
    initNotifications();
  }
}, [isAuthenticated]);

// Wrap your app
function App() {
  return (
    <PWAProvider>
      <UpdateBanner />
      <Routes />
      <InstallBanner delay={30000} requireEngagement />
      <IOSInstallInstructions />
      <OfflineIndicator />
    </PWAProvider>
  );
}
```

### 6. Register Service Worker

```typescript
// In main.tsx or index.tsx

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered:', registration.scope);
      })
      .catch(error => {
        console.error('SW registration failed:', error);
      });
  });
}
```

### 7. Update manifest.json

Replace your existing `manifest.json` with the provided `manifest.json`.

### 8. Add Offline Page

Copy `offline.html` to your `public/` directory.

---

## Files Overview

| File | Purpose |
|------|---------|
| `service-worker.js` | Advanced caching, background sync, push handling |
| `NotificationService.ts` | Client-side notification management + React hook |
| `PWAComponents.tsx` | Install banner, update prompt, offline indicator |
| `push-routes.ts` | Server routes for push subscriptions |
| `manifest.json` | PWA manifest with shortcuts, icons, screenshots |
| `offline.html` | Beautiful offline fallback page |
| `003_push_notifications.sql` | Database tables for push subscriptions |

---

## Feature Highlights

### 🔔 Rich Notifications

```typescript
// Send templated notifications
notificationService.sendTemplatedNotification('daily-spark', {
  title: "Today's Amazing Spark"
});

// Custom notifications
notificationService.showNotification({
  title: 'Prayer Request',
  body: 'Someone is praying for you right now',
  icon: '/icons/icon-192x192.png',
  actions: [
    { action: 'view', title: 'View' },
    { action: 'dismiss', title: 'Later' }
  ],
  requireInteraction: true
});
```

### 📴 Offline Support

- **Stale-While-Revalidate** for API calls - instant loading with background refresh
- **Cache-First** for images and audio - no re-downloading
- **Network-First** for auth - always fresh authentication
- **Background Sync** for offline actions - complete sparks even when offline

### 📲 Smart Install Prompts

- Waits for user engagement before showing
- Remembers dismissal for 7 days
- Special iOS instructions modal
- Tracks install conversions

### 🔄 Seamless Updates

- Automatic update detection
- Non-intrusive update banner
- One-click update with reload

---

## Notification Types

| Type | Trigger | User Setting |
|------|---------|--------------|
| `daily-spark` | Cron job at user's preferred time | `daily_reminder` |
| `streak-reminder` | Evening cron for incomplete users | `streak_reminders` |
| `streak-milestone` | After spark completion | `milestone_celebrations` |
| `prayer-session` | Before scheduled prayer | `prayer_reminders` |
| `community-update` | New community activity | `community_updates` |
| `journey-progress` | Journey milestone reached | `journey_updates` |

---

## Cron Jobs Setup

Add these cron jobs for scheduled notifications:

```typescript
// Daily spark notifications - run every hour
// 0 * * * * node scripts/send-daily-notifications.js

import { sendDailySparkNotifications } from './routes/push';

const currentHour = new Date().getHours();
await sendDailySparkNotifications(currentHour);
```

```typescript
// Streak reminders - run at 8 PM
// 0 20 * * * node scripts/send-streak-reminders.js

import { sendStreakReminders } from './routes/push';
await sendStreakReminders();
```

```typescript
// Prayer session reminders - run every 5 minutes
// */5 * * * * node scripts/check-prayer-sessions.js

import { sendPrayerSessionReminder } from './routes/push';

// Find sessions starting in 15 minutes
const sessions = await db.query(`
  SELECT id FROM leader_prayer_sessions
  WHERE scheduled_at BETWEEN NOW() + INTERVAL '14 minutes' 
    AND NOW() + INTERVAL '16 minutes'
    AND is_cancelled = false
    AND reminder_sent = false
`);

for (const session of sessions) {
  await sendPrayerSessionReminder(session.id, 15);
  await db.query(`UPDATE leader_prayer_sessions SET reminder_sent = true WHERE id = $1`, [session.id]);
}
```

---

## Notification Preferences UI

```tsx
import { useNotifications } from './services/NotificationService';

function NotificationSettings() {
  const { 
    permission, 
    isSubscribed, 
    preferences, 
    subscribe, 
    unsubscribe, 
    updatePreferences,
    sendTestNotification 
  } = useNotifications();

  return (
    <div className="settings-section">
      <h2>Notifications</h2>
      
      {permission === 'denied' && (
        <p className="warning">
          Notifications are blocked. Please enable them in your browser settings.
        </p>
      )}
      
      <div className="setting-row">
        <label>Push Notifications</label>
        <button onClick={isSubscribed ? unsubscribe : subscribe}>
          {isSubscribed ? 'Disable' : 'Enable'}
        </button>
      </div>
      
      {isSubscribed && (
        <>
          <div className="setting-row">
            <label>Daily Spark Reminder</label>
            <input 
              type="checkbox" 
              checked={preferences?.dailyReminder}
              onChange={(e) => updatePreferences({ dailyReminder: e.target.checked })}
            />
          </div>
          
          <div className="setting-row">
            <label>Reminder Time</label>
            <input 
              type="time" 
              value={preferences?.dailyReminderTime}
              onChange={(e) => updatePreferences({ dailyReminderTime: e.target.value })}
            />
          </div>
          
          <div className="setting-row">
            <label>Streak Reminders</label>
            <input 
              type="checkbox" 
              checked={preferences?.streakReminders}
              onChange={(e) => updatePreferences({ streakReminders: e.target.checked })}
            />
          </div>
          
          <button onClick={sendTestNotification}>
            Send Test Notification
          </button>
        </>
      )}
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Install from Chrome (desktop & mobile)
- [ ] Install from Safari (iOS)
- [ ] Receive push notification
- [ ] Click notification opens correct page
- [ ] Notification actions work
- [ ] App works offline
- [ ] Offline actions sync when back online
- [ ] Update banner appears when new version deployed
- [ ] Install banner shows after 30s of engagement

---

## Lighthouse PWA Score Targets

| Metric | Target |
|--------|--------|
| Installable | ✅ Yes |
| PWA Optimized | > 90 |
| Service Worker | ✅ Registered |
| Offline | ✅ Works |
| HTTPS | ✅ Required |
| Manifest | ✅ Valid |

Run audit: Chrome DevTools → Lighthouse → Progressive Web App

---

## Troubleshooting

### Notifications not appearing

1. Check browser permissions: `Notification.permission`
2. Verify VAPID keys are set correctly
3. Check service worker is registered: `navigator.serviceWorker.controller`
4. Check console for push errors

### Install prompt not showing

1. Must be served over HTTPS
2. Must have valid manifest.json
3. Must have registered service worker
4. User must have engaged with page first

### Offline not working

1. Check service worker is active: DevTools → Application → Service Workers
2. Check cache contents: DevTools → Application → Cache Storage
3. Verify `offline.html` is in cache

### iOS specific issues

1. iOS doesn't support push notifications for PWAs (Safari limitation)
2. Use `IOSInstallInstructions` component to guide install
3. Test on actual device (simulators behave differently)
