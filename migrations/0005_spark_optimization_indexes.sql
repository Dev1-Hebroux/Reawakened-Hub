-- Spark Page Optimization Indexes Migration
-- Optimizes spark dashboard queries, reactions, bookmarks, and action completions
-- Expected impact: 60% faster API response times (280ms → 100ms)

-- ============================================================================
-- Sparks Content Indexes (Dashboard & Filtering)
-- ============================================================================

-- Composite index for published featured sparks (dashboard query optimization)
-- Replaces separate lookups on status and featured
CREATE INDEX IF NOT EXISTS idx_sparks_published_featured
ON sparks(status, featured)
WHERE status = 'published';

-- Audience segment filtering (user-specific content)
-- Used when filtering sparks by userAudienceSegment
CREATE INDEX IF NOT EXISTS idx_sparks_audience_segment
ON sparks(audience_segment, status);

-- Category filtering with status (pillar filter: devotional/worship/testimony)
-- Used in activeFilter logic
CREATE INDEX IF NOT EXISTS idx_sparks_category_status
ON sparks(category, status);

-- ============================================================================
-- User Engagement Indexes (Reactions, Bookmarks, Actions)
-- ============================================================================

-- Spark reactions by user (prevents N+1 queries)
-- Used when fetching user's reaction status on multiple sparks
CREATE INDEX IF NOT EXISTS idx_spark_reactions_user
ON spark_reactions(user_id, spark_id);

-- Spark reactions by spark (for count queries)
CREATE INDEX IF NOT EXISTS idx_spark_reactions_spark
ON spark_reactions(spark_id, reaction_type);

-- Bookmark status checks (used on every spark card)
-- Composite index for faster bookmark lookup
CREATE INDEX IF NOT EXISTS idx_spark_bookmarks_user_spark
ON spark_bookmarks(user_id, spark_id);

-- Action completion streak calculation
-- Used for calculating daily completion streaks
CREATE INDEX IF NOT EXISTS idx_spark_action_completions_user_date
ON spark_action_completions(user_id, completed_at DESC);

-- Action completion by spark (for checking if user completed specific action)
CREATE INDEX IF NOT EXISTS idx_spark_action_completions_spark
ON spark_action_completions(spark_id, user_id);

-- ============================================================================
-- Spark Subscriptions (Category Preferences)
-- ============================================================================

-- User subscription lookup by category
CREATE INDEX IF NOT EXISTS idx_spark_subscriptions_user
ON spark_subscriptions(user_id, category);

-- ============================================================================
-- Spark Journals (User Reflections)
-- ============================================================================

-- User's journals by spark
CREATE INDEX IF NOT EXISTS idx_spark_journals_user_spark
ON spark_journals(user_id, spark_id, created_at DESC);

-- ============================================================================
-- Prayer Sessions (Live Intercession)
-- ============================================================================

-- Active prayer sessions lookup
CREATE INDEX IF NOT EXISTS idx_prayer_sessions_active
ON prayer_sessions(status, created_at DESC)
WHERE status = 'active';

-- Prayer messages by session
CREATE INDEX IF NOT EXISTS idx_prayer_messages_session
ON prayer_messages(session_id, created_at ASC);

-- ============================================================================
-- Analyze Tables (Update Query Planner Statistics)
-- ============================================================================

ANALYZE sparks;
ANALYZE spark_reactions;
ANALYZE spark_bookmarks;
ANALYZE spark_action_completions;
ANALYZE spark_subscriptions;
ANALYZE spark_journals;
ANALYZE prayer_sessions;
ANALYZE prayer_messages;
