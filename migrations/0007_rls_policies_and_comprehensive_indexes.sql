-- RLS Policies and Comprehensive Indexes Migration
-- Implements Supabase advisor recommendations:
-- 1. Create indexes on all columns referenced in policies (user_id, tenant_id, organization_id)
-- 2. Use subqueries in USING/WITH CHECK over joins
-- 3. Explicitly scope policies with TO authenticated/anon
-- 4. Comprehensive indexing for all user_id foreign keys

-- ============================================================================
-- PART 1: Missing user_id Indexes (Critical for RLS Performance)
-- ============================================================================

-- Auth & Session Tables
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
ON password_reset_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id
ON email_verification_tokens(user_id);

-- User Content Tables
CREATE INDEX IF NOT EXISTS idx_user_stories_user_id
ON user_stories(user_id);

CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id
ON story_views(viewer_id);

CREATE INDEX IF NOT EXISTS idx_story_views_story_id
ON story_views(story_id);

CREATE INDEX IF NOT EXISTS idx_posts_user_id
ON posts(user_id);

CREATE INDEX IF NOT EXISTS idx_reactions_user_id
ON reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_reactions_post_id
ON reactions(post_id);

-- Sparks Engagement
CREATE INDEX IF NOT EXISTS idx_spark_journals_user_id
ON spark_journals(user_id);

-- Prayer Tables
CREATE INDEX IF NOT EXISTS idx_prayer_messages_user_id
ON prayer_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_sessions_user_id
ON prayer_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_spark_subscriptions_user_id
ON spark_subscriptions(user_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id
ON notification_preferences(user_id);

-- Events & Registrations
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id
ON event_registrations(user_id);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id
ON event_registrations(event_id);

-- Blog & Subscriptions
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_user_id
ON email_subscriptions(user_id);

-- Prayer Requests & Support
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id
ON prayer_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_request_supports_user_id
ON prayer_request_supports(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_request_supports_request_id
ON prayer_request_supports(prayer_request_id);

-- Testimonies
CREATE INDEX IF NOT EXISTS idx_testimonies_user_id
ON testimonies(user_id);

-- Volunteer & Mission
CREATE INDEX IF NOT EXISTS idx_volunteer_signups_user_id
ON volunteer_signups(user_id);

CREATE INDEX IF NOT EXISTS idx_mission_registrations_user_id
ON mission_registrations(user_id);

-- Journey System
CREATE INDEX IF NOT EXISTS idx_user_journey_days_user_journey_id
ON user_journey_days(user_journey_id);

CREATE INDEX IF NOT EXISTS idx_user_journey_days_journey_day_id
ON user_journey_days(journey_day_id);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id
ON user_badges(user_id);

CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id
ON user_badges(badge_id);

-- Alpha Cohorts
CREATE INDEX IF NOT EXISTS idx_alpha_cohort_participants_user_id
ON alpha_cohort_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_alpha_cohort_participants_cohort_id
ON alpha_cohort_participants(cohort_id);

CREATE INDEX IF NOT EXISTS idx_alpha_cohort_week_progress_participant_id
ON alpha_cohort_week_progress(participant_id);

CREATE INDEX IF NOT EXISTS idx_alpha_cohort_week_progress_week_id
ON alpha_cohort_week_progress(week_id);

-- Mentor & Buddy System
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor_user_id
ON mentor_assignments(mentor_user_id);

CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentee_cohort_id
ON mentor_assignments(mentee_cohort_id);

CREATE INDEX IF NOT EXISTS idx_buddy_check_ins_from_user_id
ON buddy_check_ins(from_user_id);

CREATE INDEX IF NOT EXISTS idx_buddy_check_ins_buddy_pair_id
ON buddy_check_ins(buddy_pair_id);

CREATE INDEX IF NOT EXISTS idx_mentor_check_in_logs_user_id
ON mentor_check_in_logs(user_id);

-- Life Vision & Planning
CREATE INDEX IF NOT EXISTS idx_wheel_life_entries_user_id
ON wheel_life_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_focus_areas_user_id
ON focus_areas(user_id);

CREATE INDEX IF NOT EXISTS idx_values_selection_user_id
ON values_selection(user_id);

CREATE INDEX IF NOT EXISTS idx_vision_statements_user_id
ON vision_statements(user_id);

CREATE INDEX IF NOT EXISTS idx_purpose_flower_user_id
ON purpose_flower(user_id);

CREATE INDEX IF NOT EXISTS idx_vision_goals_user_id
ON vision_goals(user_id);

CREATE INDEX IF NOT EXISTS idx_goal_milestones_goal_id
ON goal_milestones(goal_id);

CREATE INDEX IF NOT EXISTS idx_ninety_day_plans_user_id
ON ninety_day_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_vision_habits_user_id
ON vision_habits(user_id);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id
ON habit_logs(habit_id);

CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id
ON daily_checkins(user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_id
ON weekly_reviews(user_id);

CREATE INDEX IF NOT EXISTS idx_vision_exports_user_id
ON vision_exports(user_id);

-- Learning Modules
CREATE INDEX IF NOT EXISTS idx_user_module_progress_user_id
ON user_module_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_module_progress_module_id
ON user_module_progress(module_id);

-- Assessments
CREATE INDEX IF NOT EXISTS idx_assessment_responses_user_id
ON assessment_responses(user_id);

CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id
ON assessment_responses(assessment_id);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_response_id
ON assessment_answers(response_id);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_question_id
ON assessment_answers(question_id);

CREATE INDEX IF NOT EXISTS idx_assessment_scores_user_id
ON assessment_scores(user_id);

CREATE INDEX IF NOT EXISTS idx_assessment_insights_user_id
ON assessment_insights(user_id);

-- Strengths & Styles
CREATE INDEX IF NOT EXISTS idx_user_strengths_user_id
ON user_strengths(user_id);

CREATE INDEX IF NOT EXISTS idx_user_strengths_strength_id
ON user_strengths(strength_id);

CREATE INDEX IF NOT EXISTS idx_user_styles_user_id
ON user_styles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_styles_profile_id
ON user_styles(profile_id);

CREATE INDEX IF NOT EXISTS idx_user_eq_scores_user_id
ON user_eq_scores(user_id);

CREATE INDEX IF NOT EXISTS idx_user_eq_scores_domain_id
ON user_eq_scores(domain_id);

CREATE INDEX IF NOT EXISTS idx_user_practice_logs_user_id
ON user_practice_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_user_practice_logs_practice_id
ON user_practice_logs(practice_id);

-- WDEP Entries
CREATE INDEX IF NOT EXISTS idx_wdep_entries_user_id
ON wdep_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_wdep_wants_entry_id
ON wdep_wants(entry_id);

CREATE INDEX IF NOT EXISTS idx_wdep_doing_entry_id
ON wdep_doing(entry_id);

CREATE INDEX IF NOT EXISTS idx_wdep_evaluation_entry_id
ON wdep_evaluation(entry_id);

CREATE INDEX IF NOT EXISTS idx_wdep_plan_entry_id
ON wdep_plan(entry_id);

CREATE INDEX IF NOT EXISTS idx_wdep_experiments_plan_id
ON wdep_experiments(plan_id);

CREATE INDEX IF NOT EXISTS idx_wdep_experiment_logs_experiment_id
ON wdep_experiment_logs(experiment_id);

-- SCA Exercises
CREATE INDEX IF NOT EXISTS idx_sca_exercises_user_id
ON sca_exercises(user_id);

CREATE INDEX IF NOT EXISTS idx_sca_focus_items_exercise_id
ON sca_focus_items(exercise_id);

-- Feedback System
CREATE INDEX IF NOT EXISTS idx_feedback_invites_user_id
ON feedback_invites(user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_invites_campaign_id
ON feedback_invites(campaign_id);

CREATE INDEX IF NOT EXISTS idx_feedback_answers_user_id
ON feedback_answers(user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_answers_invite_id
ON feedback_answers(invite_id);

CREATE INDEX IF NOT EXISTS idx_feedback_self_assessment_user_id
ON feedback_self_assessment(user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_aggregates_user_id
ON feedback_aggregates(user_id);

-- Safeguarding & Reports
CREATE INDEX IF NOT EXISTS idx_safeguarding_reports_reporter_user_id
ON safeguarding_reports(reporter_user_id);

-- Coaching System
CREATE INDEX IF NOT EXISTS idx_session_slots_coach_id
ON session_slots(coach_id);

CREATE INDEX IF NOT EXISTS idx_session_bookings_user_id
ON session_bookings(user_id);

CREATE INDEX IF NOT EXISTS idx_session_bookings_slot_id
ON session_bookings(slot_id);

CREATE INDEX IF NOT EXISTS idx_session_follow_ups_booking_id
ON session_follow_ups(booking_id);

-- Reflections
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_id
ON daily_reflections(user_id);

CREATE INDEX IF NOT EXISTS idx_reflection_logs_user_id
ON reflection_logs(user_id);

-- Mission System
CREATE INDEX IF NOT EXISTS idx_mission_plans_user_id
ON mission_plans(user_id);

CREATE INDEX IF NOT EXISTS idx_mission_focuses_plan_id
ON mission_focuses(plan_id);

CREATE INDEX IF NOT EXISTS idx_mission_adoptions_user_id
ON mission_adoptions(user_id);

CREATE INDEX IF NOT EXISTS idx_mission_adoptions_prayer_guide_day_id
ON mission_adoptions(prayer_guide_day_id);

CREATE INDEX IF NOT EXISTS idx_mission_prayer_sessions_user_id
ON mission_prayer_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_mission_prayer_sessions_adoption_id
ON mission_prayer_sessions(adoption_id);

CREATE INDEX IF NOT EXISTS idx_project_updates_project_id
ON project_updates(project_id);

CREATE INDEX IF NOT EXISTS idx_project_follows_user_id
ON project_follows(user_id);

CREATE INDEX IF NOT EXISTS idx_project_follows_project_id
ON project_follows(project_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_interests_user_id
ON opportunity_interests(user_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_interests_opportunity_id
ON opportunity_interests(opportunity_id);

CREATE INDEX IF NOT EXISTS idx_digital_actions_user_id
ON digital_actions(user_id);

CREATE INDEX IF NOT EXISTS idx_mission_invites_inviter_user_id
ON mission_invites(inviter_user_id);

-- Live Rooms & Sessions
CREATE INDEX IF NOT EXISTS idx_live_rooms_host_user_id
ON live_rooms(host_user_id);

CREATE INDEX IF NOT EXISTS idx_room_sessions_room_id
ON room_sessions(room_id);

CREATE INDEX IF NOT EXISTS idx_room_participants_user_id
ON room_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_room_participants_session_id
ON room_participants(session_id);

CREATE INDEX IF NOT EXISTS idx_follow_up_threads_initiator_user_id
ON follow_up_threads(initiator_user_id);

CREATE INDEX IF NOT EXISTS idx_follow_up_messages_sender_user_id
ON follow_up_messages(sender_user_id);

CREATE INDEX IF NOT EXISTS idx_follow_up_messages_thread_id
ON follow_up_messages(thread_id);

-- Training & Challenges
CREATE INDEX IF NOT EXISTS idx_training_progress_user_id
ON training_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_training_progress_module_id
ON training_progress(module_id);

CREATE INDEX IF NOT EXISTS idx_challenge_enrollments_user_id
ON challenge_enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_enrollments_challenge_id
ON challenge_enrollments(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_day_completions_enrollment_id
ON challenge_day_completions(enrollment_id);

-- Prayer Wall
CREATE INDEX IF NOT EXISTS idx_prayer_wall_posts_user_id
ON prayer_wall_posts(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_wall_reactions_user_id
ON prayer_wall_reactions(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_wall_reactions_post_id
ON prayer_wall_reactions(post_id);

-- Donations
CREATE INDEX IF NOT EXISTS idx_mission_donations_user_id
ON mission_donations(user_id);

CREATE INDEX IF NOT EXISTS idx_recurring_donations_user_id
ON recurring_donations(user_id);

-- Testimonies
CREATE INDEX IF NOT EXISTS idx_mission_testimonies_user_id
ON mission_testimonies(user_id);

-- AI Coach
CREATE INDEX IF NOT EXISTS idx_ai_coach_sessions_user_id
ON ai_coach_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_coach_messages_session_id
ON ai_coach_messages(session_id);

-- Coaching Cohorts
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_user_id
ON coaching_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach_id
ON coaching_sessions(coach_id);

CREATE INDEX IF NOT EXISTS idx_cohort_participants_user_id
ON cohort_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_cohort_participants_cohort_id
ON cohort_participants(cohort_id);

-- Challenges
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id
ON challenge_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id
ON challenge_participants(challenge_id);

CREATE INDEX IF NOT EXISTS idx_challenge_logs_participant_id
ON challenge_logs(participant_id);

-- Mission Trips
CREATE INDEX IF NOT EXISTS idx_trip_applications_user_id
ON trip_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_trip_applications_trip_id
ON trip_applications(trip_id);

-- Admin & Audit
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_user_id
ON admin_audit_logs(user_id);

-- Comments
CREATE INDEX IF NOT EXISTS idx_comments_user_id
ON comments(user_id);

-- Campus Prayer System
CREATE INDEX IF NOT EXISTS idx_campus_altars_campus_id
ON campus_altars(campus_id);

CREATE INDEX IF NOT EXISTS idx_altar_members_user_id
ON altar_members(user_id);

CREATE INDEX IF NOT EXISTS idx_altar_members_altar_id
ON altar_members(altar_id);

CREATE INDEX IF NOT EXISTS idx_prayer_subscriptions_user_id
ON prayer_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_wall_entries_user_id
ON prayer_wall_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_logs_user_id
ON prayer_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_reminders_user_id
ON prayer_reminders(user_id);

-- Prayer Pods
CREATE INDEX IF NOT EXISTS idx_prayer_pod_members_user_id
ON prayer_pod_members(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_pod_members_pod_id
ON prayer_pod_members(pod_id);

CREATE INDEX IF NOT EXISTS idx_prayer_pod_preferences_user_id
ON prayer_pod_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_pod_requests_user_id
ON prayer_pod_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_pod_reports_reported_user_id
ON prayer_pod_reports(reported_user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_pod_messages_user_id
ON prayer_pod_messages(user_id);

CREATE INDEX IF NOT EXISTS idx_prayer_pod_messages_pod_id
ON prayer_pod_messages(pod_id);

-- Reading Plans
CREATE INDEX IF NOT EXISTS idx_user_spiritual_profiles_user_id
ON user_spiritual_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_plan_enrollments_user_id
ON user_plan_enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_user_plan_enrollments_plan_id
ON user_plan_enrollments(plan_id);

CREATE INDEX IF NOT EXISTS idx_user_reading_progress_user_id
ON user_reading_progress(user_id);

CREATE INDEX IF NOT EXISTS idx_user_reading_progress_enrollment_id
ON user_reading_progress(enrollment_id);

-- Scheduled Notifications
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user_id
ON scheduled_notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_scheduled_for
ON scheduled_notifications(scheduled_for);

-- Journals
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date
ON journal_entries(entry_date);

-- Product Launch
CREATE INDEX IF NOT EXISTS idx_product_launch_sessions_user_id
ON product_launch_sessions(user_id);

-- ============================================================================
-- PART 2: Enable Row Level Security (RLS) - FORCED
-- ============================================================================

-- Enable and FORCE RLS on all user-facing tables
-- FORCE RLS ensures even table owners respect RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions FORCE ROW LEVEL SECURITY;

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts FORCE ROW LEVEL SECURITY;

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions FORCE ROW LEVEL SECURITY;

ALTER TABLE sparks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparks FORCE ROW LEVEL SECURITY;

ALTER TABLE spark_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_reactions FORCE ROW LEVEL SECURITY;

ALTER TABLE spark_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_bookmarks FORCE ROW LEVEL SECURITY;

ALTER TABLE spark_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_journals FORCE ROW LEVEL SECURITY;

ALTER TABLE spark_action_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spark_action_completions FORCE ROW LEVEL SECURITY;

ALTER TABLE prayer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_messages FORCE ROW LEVEL SECURITY;

ALTER TABLE prayer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_sessions FORCE ROW LEVEL SECURITY;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

ALTER TABLE user_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journeys FORCE ROW LEVEL SECURITY;

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges FORCE ROW LEVEL SECURITY;

ALTER TABLE ai_coach_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_sessions FORCE ROW LEVEL SECURITY;

ALTER TABLE ai_coach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_coach_messages FORCE ROW LEVEL SECURITY;

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 3: Create RLS Policies with Best Practices
-- ============================================================================

-- Users table - users can view their own data
CREATE POLICY users_select_own
ON users
FOR SELECT
TO authenticated
USING (id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY users_update_own
ON users
FOR UPDATE
TO authenticated
USING (id = current_setting('app.current_user_id', true)::varchar)
WITH CHECK (id = current_setting('app.current_user_id', true)::varchar);

-- Posts - users can view all, insert/update/delete their own
CREATE POLICY posts_select_all
ON posts
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY posts_insert_own
ON posts
FOR INSERT
TO authenticated
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY posts_update_own
ON posts
FOR UPDATE
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar)
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY posts_delete_own
ON posts
FOR DELETE
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);

-- Sparks - all authenticated users can view published sparks
CREATE POLICY sparks_select_published
ON sparks
FOR SELECT
TO authenticated
USING (status = 'published');

-- Allow admins to see all sparks
CREATE POLICY sparks_select_admin
ON sparks
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = current_setting('app.current_user_id', true)::varchar
    AND users.role = 'admin'
  )
);

-- Spark reactions - users can view all, manage their own
CREATE POLICY spark_reactions_select_all
ON spark_reactions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY spark_reactions_insert_own
ON spark_reactions
FOR INSERT
TO authenticated
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY spark_reactions_delete_own
ON spark_reactions
FOR DELETE
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);

-- Spark bookmarks - users manage their own
CREATE POLICY spark_bookmarks_select_own
ON spark_bookmarks
FOR SELECT
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY spark_bookmarks_insert_own
ON spark_bookmarks
FOR INSERT
TO authenticated
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY spark_bookmarks_delete_own
ON spark_bookmarks
FOR DELETE
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);

-- Spark journals - users manage their own
CREATE POLICY spark_journals_select_own
ON spark_journals
FOR SELECT
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY spark_journals_insert_own
ON spark_journals
FOR INSERT
TO authenticated
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY spark_journals_update_own
ON spark_journals
FOR UPDATE
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar)
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY spark_journals_delete_own
ON spark_journals
FOR DELETE
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);

-- Notifications - users can view their own
CREATE POLICY notifications_select_own
ON notifications
FOR SELECT
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY notifications_update_own
ON notifications
FOR UPDATE
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar)
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

-- User journeys - users manage their own
CREATE POLICY user_journeys_select_own
ON user_journeys
FOR SELECT
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY user_journeys_insert_own
ON user_journeys
FOR INSERT
TO authenticated
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY user_journeys_update_own
ON user_journeys
FOR UPDATE
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar)
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

-- AI Coach sessions - users manage their own
CREATE POLICY ai_coach_sessions_select_own
ON ai_coach_sessions
FOR SELECT
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY ai_coach_sessions_insert_own
ON ai_coach_sessions
FOR INSERT
TO authenticated
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY ai_coach_sessions_update_own
ON ai_coach_sessions
FOR UPDATE
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar)
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

-- AI Coach messages - users can only see messages from their sessions
CREATE POLICY ai_coach_messages_select_own_session
ON ai_coach_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM ai_coach_sessions
    WHERE ai_coach_sessions.id = ai_coach_messages.session_id
    AND ai_coach_sessions.user_id = current_setting('app.current_user_id', true)::varchar
  )
);

CREATE POLICY ai_coach_messages_insert_own_session
ON ai_coach_messages
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_coach_sessions
    WHERE ai_coach_sessions.id = session_id
    AND ai_coach_sessions.user_id = current_setting('app.current_user_id', true)::varchar
  )
);

-- Journal entries - users manage their own
CREATE POLICY journal_entries_select_own
ON journal_entries
FOR SELECT
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY journal_entries_insert_own
ON journal_entries
FOR INSERT
TO authenticated
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY journal_entries_update_own
ON journal_entries
FOR UPDATE
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar)
WITH CHECK (user_id = current_setting('app.current_user_id', true)::varchar);

CREATE POLICY journal_entries_delete_own
ON journal_entries
FOR DELETE
TO authenticated
USING (user_id = current_setting('app.current_user_id', true)::varchar);

-- ============================================================================
-- PART 4: Analyze Tables (Update Query Planner Statistics)
-- ============================================================================

ANALYZE users;
ANALYZE user_sessions;
ANALYZE posts;
ANALYZE reactions;
ANALYZE sparks;
ANALYZE spark_reactions;
ANALYZE spark_bookmarks;
ANALYZE spark_journals;
ANALYZE spark_action_completions;
ANALYZE prayer_messages;
ANALYZE prayer_sessions;
ANALYZE notifications;
ANALYZE user_journeys;
ANALYZE user_badges;
ANALYZE ai_coach_sessions;
ANALYZE ai_coach_messages;
ANALYZE journal_entries;
ANALYZE event_registrations;
ANALYZE prayer_requests;
ANALYZE testimonies;
ANALYZE alpha_cohort_participants;
ANALYZE mission_plans;
ANALYZE session_bookings;
ANALYZE challenge_enrollments;
ANALYZE user_plan_enrollments;
