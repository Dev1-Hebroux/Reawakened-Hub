-- Push Notifications Database Migration
-- Run: psql $DATABASE_URL -f migrations/0004_push_notifications.sql

-- ============================================================================
-- Push Subscriptions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for push subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
  ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
  ON push_subscriptions(endpoint);

-- ============================================================================
-- User Notification Preferences Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_notification_preferences (
  user_id VARCHAR PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Master toggle
  enabled BOOLEAN DEFAULT true,
  
  -- Daily reminder settings
  daily_reminder BOOLEAN DEFAULT true,
  daily_reminder_time TIME DEFAULT '07:00',
  
  -- Notification categories
  spark_updates BOOLEAN DEFAULT true,
  streak_reminders BOOLEAN DEFAULT true,
  community_updates BOOLEAN DEFAULT false,
  prayer_reminders BOOLEAN DEFAULT true,
  journey_updates BOOLEAN DEFAULT true,
  milestone_celebrations BOOLEAN DEFAULT true,
  
  -- Quiet hours (optional)
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  
  -- Timezone for scheduling
  timezone TEXT DEFAULT 'UTC',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- Notification History Table (for analytics and debugging)
-- ============================================================================

CREATE TABLE IF NOT EXISTS notification_history (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
  
  -- Notification details
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  
  -- Delivery status
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  
  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Indexes for notification history
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id 
  ON notification_history(user_id);

CREATE INDEX IF NOT EXISTS idx_notification_history_type 
  ON notification_history(type);

CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at 
  ON notification_history(sent_at DESC);

-- ============================================================================
-- Scheduled Notifications Table (for future notifications)
-- ============================================================================

CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
  
  -- Schedule
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Notification content
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for finding pending notifications
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_pending 
  ON scheduled_notifications(scheduled_for) 
  WHERE status = 'pending';

-- ============================================================================
-- Verification
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Push notification tables created successfully';
  RAISE NOTICE 'Tables: push_subscriptions, user_notification_preferences, notification_history, scheduled_notifications';
END $$;
