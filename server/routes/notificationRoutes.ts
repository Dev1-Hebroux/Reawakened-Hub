/**
 * Notification API Routes
 * 
 * Handles notification fetching, marking as read, and push subscriptions.
 * Uses the storage layer for all database operations.
 */

import { Router } from 'express';
import { isAuthenticated } from '../replitAuth';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Get all notifications for the current user
router.get('/notifications', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const items = await storage.getNotifications(userId, limit);
    const total = await storage.getNotificationsCount(userId);
    
    res.json({ items, total });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/notifications/unread-count', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const count = await storage.getUnreadNotificationsCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// Mark a notification as read
router.post('/notifications/:id/read', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const notificationId = parseInt(req.params.id);
    
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }
    
    await storage.markNotificationRead(notificationId, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.post('/notifications/read-all', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    await storage.markAllNotificationsRead(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Get notification preferences
router.get('/notifications/preferences', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    const prefs = await storage.getNotificationPreferences(userId);
    res.json(prefs || {});
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ message: 'Failed to fetch notification preferences' });
  }
});

// Update notification preferences
router.patch('/notifications/preferences', isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.claims?.sub || req.user.id;
    
    const prefsSchema = z.object({
      pushEnabled: z.boolean().optional(),
      emailEnabled: z.boolean().optional(),
      dailyDevotionalReminder: z.boolean().optional(),
      prayerSessionAlerts: z.boolean().optional(),
      eventReminders: z.boolean().optional(),
      communityUpdates: z.boolean().optional(),
    });
    
    const updates = prefsSchema.parse(req.body);
    const updated = await storage.upsertNotificationPreferences(userId, updates);
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    res.status(400).json({ message: error.message || 'Failed to update preferences' });
  }
});

export default router;
