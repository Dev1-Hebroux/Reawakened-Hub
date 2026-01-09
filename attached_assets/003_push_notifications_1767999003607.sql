-- Push Notifications Database Migration
-- Run: psql $DATABASE_URL -f migrations/003_push_notifications.sql

-- ============================================================================
-- Push Subscriptions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
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
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  
  -- Notification details
  type TEXT NOT NULL, -- 'daily-spark', 'streak-reminder', 'prayer-session', etc.
  title TEXT NOT NULL,
  body TEXT,
  
  -- Delivery status
  status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'clicked', 'failed'
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
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Schedule
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Notification content
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'cancelled'
  sent_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for finding pending notifications
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_pending 
  ON scheduled_notifications(scheduled_for) 
  WHERE status = 'pending';

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get users who should receive daily notifications at a specific hour
CREATE OR REPLACE FUNCTION get_users_for_daily_notification(target_hour INTEGER)
RETURNS TABLE(user_id INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ps.user_id
  FROM push_subscriptions ps
  JOIN user_notification_preferences unp ON ps.user_id = unp.user_id
  WHERE unp.enabled = true
    AND unp.daily_reminder = true
    AND EXTRACT(HOUR FROM unp.daily_reminder_time) = target_hour
    AND (
      unp.quiet_hours_enabled = false
      OR NOT (
        CURRENT_TIME >= unp.quiet_hours_start 
        AND CURRENT_TIME < unp.quiet_hours_end
      )
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get users who need streak reminders
CREATE OR REPLACE FUNCTION get_users_for_streak_reminder(check_date DATE)
RETURNS TABLE(user_id INTEGER, current_streak INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ps.user_id, us.current_streak::INTEGER
  FROM push_subscriptions ps
  JOIN user_notification_preferences unp ON ps.user_id = unp.user_id
  JOIN user_streaks us ON ps.user_id = us.user_id
  WHERE unp.enabled = true
    AND unp.streak_reminders = true
    AND us.current_streak > 0
    AND NOT EXISTS (
      SELECT 1 FROM user_spark_completions usc
      WHERE usc.user_id = ps.user_id
        AND DATE(usc.completed_at) = check_date
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'Push notification tables created successfully';
  RAISE NOTICE 'Tables: push_subscriptions, user_notification_preferences, notification_history, scheduled_notifications';
END $$;
