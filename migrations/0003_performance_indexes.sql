-- Performance Indexes Migration
-- Optimizes frequently-used queries for faster response times

-- ============================================================================
-- Session & Auth Indexes (Critical for every authenticated request)
-- ============================================================================

-- Session lookup by token (used on EVERY authenticated request)
CREATE INDEX IF NOT EXISTS idx_user_sessions_token 
ON user_sessions(token);

-- Session lookup by user (for logout-all, session management)
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id 
ON user_sessions(user_id);

-- Session cleanup (for expired session pruning)
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at 
ON user_sessions(expires_at);

-- User lookup by email (login, registration check)
CREATE INDEX IF NOT EXISTS idx_users_email 
ON users(email);

-- ============================================================================
-- Sparks Indexes (Dashboard & Content)
-- ============================================================================

-- Today's spark lookup by daily_date (most frequent query)
CREATE INDEX IF NOT EXISTS idx_sparks_daily_date 
ON sparks(daily_date);

-- Featured sparks listing
CREATE INDEX IF NOT EXISTS idx_sparks_featured 
ON sparks(featured) 
WHERE featured = true;

-- Sparks by status for published content
CREATE INDEX IF NOT EXISTS idx_sparks_status 
ON sparks(status);

-- ============================================================================
-- User Progress & Streaks Indexes
-- ============================================================================

-- Streak lookup by user
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id 
ON user_streaks(user_id);

-- ============================================================================
-- Notifications Indexes
-- ============================================================================

-- Unread notifications count (header badge)
CREATE INDEX IF NOT EXISTS idx_notifications_user_read 
ON notifications(user_id, read_at);

-- User notifications listing by created date
CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);

-- ============================================================================
-- Journeys & Progress Indexes
-- ============================================================================

-- User journey progress lookup
CREATE INDEX IF NOT EXISTS idx_user_journey_progress_user 
ON user_journey_progress(user_id);

-- ============================================================================
-- Security Indexes
-- ============================================================================

-- Password reset tokens lookup
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token 
ON password_reset_tokens(token);

-- Email verification tokens lookup
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token 
ON email_verification_tokens(token);

-- Auth audit log by user
CREATE INDEX IF NOT EXISTS idx_auth_audit_log_user 
ON auth_audit_log(user_id, created_at DESC);

-- ============================================================================
-- Analyze Tables (Update Query Planner Statistics)
-- ============================================================================

ANALYZE user_sessions;
ANALYZE users;
ANALYZE sparks;
ANALYZE user_streaks;
ANALYZE notifications;
ANALYZE user_journey_progress;
ANALYZE password_reset_tokens;
ANALYZE email_verification_tokens;
ANALYZE auth_audit_log;
