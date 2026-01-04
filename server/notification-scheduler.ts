import { storage } from "./storage";
import { 
  sendDailyDevotionalEmail, 
  sendEventReminderEmail 
} from "./email";

function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

const LONDON_TIMEZONE = 'Europe/London';

function getNextRunTime(targetHour: number, targetMinute: number = 0): Date {
  const now = new Date();
  const londonNow = new Date(now.toLocaleString('en-US', { timeZone: LONDON_TIMEZONE }));
  
  const target = new Date(londonNow);
  target.setHours(targetHour, targetMinute, 0, 0);
  
  if (londonNow >= target) {
    target.setDate(target.getDate() + 1);
  }
  
  const utcTarget = new Date(target.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offset = target.getTime() - londonNow.getTime();
  
  return new Date(now.getTime() + offset);
}

function getMillisUntil(targetDate: Date): number {
  return Math.max(0, targetDate.getTime() - Date.now());
}

async function sendDailyDevotionalNotifications(): Promise<void> {
  console.log('[Notification Scheduler] Starting daily devotional email job...');
  
  if (!isEmailConfigured()) {
    console.log('[Notification Scheduler] Email not configured (RESEND_API_KEY missing), skipping devotional emails');
    return;
  }
  
  try {
    const todaySpark = await storage.getTodaySpark(undefined);
    
    if (!todaySpark) {
      console.log('[Notification Scheduler] No spark found for today, skipping devotional emails');
      return;
    }
    
    const subscriptions = await storage.getSubscriptions();
    const userIds: string[] = [...new Set(subscriptions.map((s: any) => s.userId).filter(Boolean))];
    
    let sent = 0;
    let skipped = 0;
    let failed = 0;
    
    for (const userId of userIds) {
      try {
        const user = await storage.getUser(userId);
        if (!user?.email) {
          skipped++;
          continue;
        }
        
        const prefs = await storage.getNotificationPreferences(userId);
        if (prefs && !prefs.emailEnabled) {
          skipped++;
          continue;
        }
        if (prefs && !prefs.newSparkAlerts) {
          skipped++;
          continue;
        }
        
        const result = await sendDailyDevotionalEmail(user.email, user.firstName || 'Friend', {
          sparkTitle: todaySpark.title,
          sparkDescription: todaySpark.description || '',
          scriptureRef: todaySpark.scriptureRef || '',
          prayerLine: todaySpark.prayerLine || undefined,
        });
        
        if (result.success) {
          sent++;
        } else {
          failed++;
          console.warn(`[Notification Scheduler] Failed to send devotional to ${user.email}:`, result.error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        failed++;
        console.error(`[Notification Scheduler] Failed to send to user ${userId}:`, error);
      }
    }
    
    console.log(`[Notification Scheduler] Daily devotional emails complete: ${sent} sent, ${skipped} skipped, ${failed} failed`);
  } catch (error) {
    console.error('[Notification Scheduler] Error in daily devotional job:', error);
  }
}

async function sendEventReminders(): Promise<void> {
  console.log('[Notification Scheduler] Starting event reminder job...');
  
  if (!isEmailConfigured()) {
    console.log('[Notification Scheduler] Email not configured (RESEND_API_KEY missing), skipping event reminders');
    return;
  }
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    const events = await storage.getEvents();
    const upcomingEvents = events.filter(e => {
      const eventDate = new Date(e.startDate);
      return eventDate >= tomorrow && eventDate < dayAfter;
    });
    
    let sent = 0;
    let failed = 0;
    
    for (const event of upcomingEvents) {
      try {
        const registrations = await storage.getEventRegistrations(event.id);
        
        for (const reg of registrations) {
          const user = await storage.getUser(reg.userId);
          if (!user?.email) continue;
          
          const prefs = await storage.getNotificationPreferences(reg.userId);
          if (prefs && !prefs.emailEnabled) continue;
          if (prefs && !prefs.eventReminders) continue;
          
          const result = await sendEventReminderEmail(user.email, user.firstName || 'Friend', {
            eventTitle: event.title,
            eventDate: new Date(event.startDate),
            eventLocation: event.location || undefined,
          });
          
          if (result.success) {
            sent++;
          } else {
            failed++;
            console.warn(`[Notification Scheduler] Failed to send reminder to ${user.email}:`, result.error);
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`[Notification Scheduler] Failed to send reminders for event ${event.id}:`, error);
      }
    }
    
    console.log(`[Notification Scheduler] Event reminders complete: ${sent} sent, ${failed} failed for ${upcomingEvents.length} events`);
  } catch (error) {
    console.error('[Notification Scheduler] Error in event reminder job:', error);
  }
}

function scheduleDailyDevotionalJob(): void {
  const nextRun = getNextRunTime(0, 1);
  const msUntil = getMillisUntil(nextRun);
  const hoursUntil = Math.floor(msUntil / (1000 * 60 * 60));
  const minutesUntil = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60));
  
  console.log(`[Notification Scheduler] Daily devotional job scheduled for 00:01 London time (in ${hoursUntil}h ${minutesUntil}m)`);
  
  setTimeout(async () => {
    await sendDailyDevotionalNotifications();
    scheduleDailyDevotionalJob();
  }, msUntil);
}

function scheduleEventReminderJob(): void {
  const nextRun = getNextRunTime(18, 0);
  const msUntil = getMillisUntil(nextRun);
  const hoursUntil = Math.floor(msUntil / (1000 * 60 * 60));
  const minutesUntil = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60));
  
  console.log(`[Notification Scheduler] Event reminder job scheduled for 18:00 London time (in ${hoursUntil}h ${minutesUntil}m)`);
  
  setTimeout(async () => {
    await sendEventReminders();
    scheduleEventReminderJob();
  }, msUntil);
}

export function initializeNotificationScheduler(): void {
  console.log('[Notification Scheduler] Initializing scheduled notification jobs...');
  
  scheduleDailyDevotionalJob();
  scheduleEventReminderJob();
  
  console.log('[Notification Scheduler] All scheduled jobs initialized');
}
