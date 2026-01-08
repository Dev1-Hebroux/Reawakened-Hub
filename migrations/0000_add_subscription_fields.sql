CREATE TABLE "admin_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"target_type" varchar,
	"target_id" varchar,
	"previous_value" jsonb,
	"new_value" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_coach_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"sender" varchar NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_coach_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"entry_point" varchar NOT NULL,
	"title" varchar,
	"last_message_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "alpha_cohort_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"cohort_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'participant' NOT NULL,
	"status" varchar DEFAULT 'applied' NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"group_number" integer
);
--> statement-breakpoint
CREATE TABLE "alpha_cohort_week_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_id" integer NOT NULL,
	"week_number" integer NOT NULL,
	"watched_at" timestamp,
	"discussion_notes" text,
	"prayer_action_completed_at" timestamp,
	"reflection" text
);
--> statement-breakpoint
CREATE TABLE "alpha_cohort_weeks" (
	"id" serial PRIMARY KEY NOT NULL,
	"cohort_id" integer NOT NULL,
	"week_number" integer NOT NULL,
	"theme" varchar NOT NULL,
	"description" text,
	"video_url" varchar,
	"watch_party_date" timestamp,
	"discussion_prompts" jsonb,
	"prayer_action" text
);
--> statement-breakpoint
CREATE TABLE "alpha_cohorts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"status" varchar DEFAULT 'upcoming' NOT NULL,
	"capacity" integer DEFAULT 50,
	"registration_closes_at" timestamp,
	"hero_image_url" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "altar_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"altar_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'intercessor',
	"affiliation" varchar NOT NULL,
	"prayer_hours" integer DEFAULT 0,
	"streak" integer DEFAULT 0,
	"best_streak" integer DEFAULT 0,
	"last_prayed_at" timestamp,
	"receive_reminders" boolean DEFAULT true,
	"reminder_frequency" varchar DEFAULT 'daily',
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessment_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"response_id" integer NOT NULL,
	"question_id" integer NOT NULL,
	"value_number" integer,
	"value_text" text,
	"value_json" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessment_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"response_id" integer NOT NULL,
	"headline" varchar,
	"insight_text" text,
	"risks_text" text,
	"recommended_practice_keys" jsonb,
	"recommended_next_steps" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessment_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" integer NOT NULL,
	"key" varchar NOT NULL,
	"prompt_classic" text NOT NULL,
	"prompt_faith" text,
	"input_type" varchar NOT NULL,
	"options" jsonb,
	"dimension_key" varchar,
	"reverse_scored" boolean DEFAULT false,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assessment_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"assessment_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" integer,
	"status" varchar DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "assessment_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"response_id" integer NOT NULL,
	"dimension_key" varchar NOT NULL,
	"score_raw" integer,
	"score_normalized" integer,
	"band" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"version" integer DEFAULT 1 NOT NULL,
	"scoring_model" jsonb,
	"is_enabled" boolean DEFAULT true,
	CONSTRAINT "assessments_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"icon_url" varchar,
	"criteria_json" jsonb,
	CONSTRAINT "badges_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"cover_image_url" varchar,
	"author_id" varchar NOT NULL,
	"category" varchar NOT NULL,
	"published_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "buddy_check_ins" (
	"id" serial PRIMARY KEY NOT NULL,
	"buddy_pair_id" integer NOT NULL,
	"from_user_id" varchar NOT NULL,
	"week_number" integer NOT NULL,
	"win" text,
	"struggle" text,
	"prayer_request" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "buddy_pairs" (
	"id" serial PRIMARY KEY NOT NULL,
	"journey_id" integer NOT NULL,
	"user_journey_id_1" integer NOT NULL,
	"user_journey_id_2" integer NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campus_altars" (
	"id" serial PRIMARY KEY NOT NULL,
	"campus_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"leader_id" varchar,
	"meeting_schedule" text,
	"meeting_link" varchar,
	"whatsapp_group" varchar,
	"prayer_points" text[],
	"scriptures" text[],
	"member_count" integer DEFAULT 0,
	"prayer_hours" integer DEFAULT 0,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "challenge_day_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"enrollment_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	"prayer_note" text,
	"action_taken" varchar
);
--> statement-breakpoint
CREATE TABLE "challenge_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"challenge_id" integer NOT NULL,
	"progress_day" integer DEFAULT 0,
	"status" varchar DEFAULT 'active',
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"notifications_enabled" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "challenge_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"participant_id" integer NOT NULL,
	"action" varchar NOT NULL,
	"points" integer DEFAULT 0,
	"note" text,
	"proof_url" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "challenge_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenge_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"team_id" integer,
	"progress" integer DEFAULT 0,
	"points" integer DEFAULT 0,
	"streak" integer DEFAULT 0,
	"best_streak" integer DEFAULT 0,
	"last_action_at" timestamp,
	"status" varchar DEFAULT 'active',
	"rank" integer,
	"completed_at" timestamp,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"type" varchar NOT NULL,
	"category" varchar NOT NULL,
	"image_url" varchar,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"goal" integer NOT NULL,
	"goal_unit" varchar NOT NULL,
	"points_per_action" integer DEFAULT 10,
	"max_participants" integer,
	"current_participants" integer DEFAULT 0,
	"rewards" jsonb,
	"rules" text[],
	"status" varchar DEFAULT 'draft',
	"is_featured" boolean DEFAULT false,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coach_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"display_name" varchar NOT NULL,
	"bio" text,
	"specialties" text[],
	"session_types" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "coach_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "coaches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"specialties" text[],
	"bio" text,
	"photo_url" varchar,
	"hourly_rate" integer,
	"availability" jsonb,
	"max_sessions_per_week" integer DEFAULT 10,
	"is_active" boolean DEFAULT true,
	"rating" integer DEFAULT 0,
	"total_sessions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_cohorts" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"topic" varchar NOT NULL,
	"image_url" varchar,
	"max_participants" integer DEFAULT 12,
	"current_participants" integer DEFAULT 0,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"session_count" integer DEFAULT 8,
	"schedule" jsonb,
	"meeting_link" varchar,
	"price" integer,
	"status" varchar DEFAULT 'draft',
	"resources" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"duration" integer DEFAULT 60,
	"status" varchar DEFAULT 'scheduled',
	"meeting_link" varchar,
	"topic" varchar,
	"notes" text,
	"user_notes" text,
	"action_items" text[],
	"rating" integer,
	"feedback" text,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cohort_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"cohort_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"status" varchar DEFAULT 'enrolled',
	"progress" integer DEFAULT 0,
	"accountability_partner_id" varchar,
	"joined_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"parent_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_checkins" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"date" varchar NOT NULL,
	"energy" integer,
	"today_focus" text,
	"note" text,
	"prayer_note" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_reflections" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"scripture" varchar,
	"scripture_text" text,
	"category" varchar DEFAULT 'general',
	"scheduled_date" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "digital_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" integer,
	"focus_id" integer,
	"action_type" varchar NOT NULL,
	"channel" varchar,
	"share_card_id" integer,
	"status" varchar DEFAULT 'completed',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar,
	"categories" text[],
	"whatsapp_opt_in" varchar,
	"unsubscribe_token" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_email_sent" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "eq_domains" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0,
	CONSTRAINT "eq_domains_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"type" varchar NOT NULL,
	"location" varchar,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"image_url" varchar,
	"registration_url" varchar,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback_aggregates" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"dimension_key" varchar NOT NULL,
	"avg_rating" integer,
	"distribution_json" jsonb,
	"themes_json" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback_answers" (
	"id" serial PRIMARY KEY NOT NULL,
	"invite_id" integer NOT NULL,
	"campaign_id" integer NOT NULL,
	"question_key" varchar NOT NULL,
	"rating" integer,
	"comment" text
);
--> statement-breakpoint
CREATE TABLE "feedback_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"user_id" varchar NOT NULL,
	"title" varchar,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"anonymity_level" varchar DEFAULT 'anonymous_default',
	"rater_limit" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"token" varchar NOT NULL,
	"invitee_name" varchar,
	"invitee_email" varchar NOT NULL,
	"relationship_type" varchar,
	"status" varchar DEFAULT 'created' NOT NULL,
	"sent_at" timestamp,
	"opened_at" timestamp,
	"submitted_at" timestamp,
	"expires_at" timestamp,
	CONSTRAINT "feedback_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "feedback_self_assessment" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"question_key" varchar NOT NULL,
	"rating" integer,
	"comment" text
);
--> statement-breakpoint
CREATE TABLE "focus_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"category_key" varchar NOT NULL,
	"priority" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "follow_up_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" integer NOT NULL,
	"sender_user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"message_type" varchar DEFAULT 'text',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "follow_up_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"initiator_user_id" varchar NOT NULL,
	"participant_user_id" varchar,
	"participant_name" varchar,
	"participant_contact" varchar,
	"project_id" integer,
	"thread_type" varchar DEFAULT 'discipleship',
	"status" varchar DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"last_activity_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goal_milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"goal_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"due_date" timestamp,
	"success_criteria" text,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "goal_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"icon_name" varchar,
	"suggested_milestones" jsonb,
	"suggested_habits" jsonb,
	"timeframe" varchar,
	"difficulty" varchar,
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "habit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"habit_id" integer NOT NULL,
	"date" varchar NOT NULL,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "i_will_commitments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_journey_id" integer NOT NULL,
	"week_number" integer NOT NULL,
	"commitment" text NOT NULL,
	"who_to_encourage" varchar,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"reflection_notes" text
);
--> statement-breakpoint
CREATE TABLE "journey_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"journey_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"title" varchar NOT NULL,
	"summary" text,
	"estimated_minutes" integer DEFAULT 10
);
--> statement-breakpoint
CREATE TABLE "journey_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"journey_day_id" integer NOT NULL,
	"step_order" integer NOT NULL,
	"step_type" varchar NOT NULL,
	"content_json" jsonb NOT NULL,
	"media_url" varchar
);
--> statement-breakpoint
CREATE TABLE "journey_weeks" (
	"id" serial PRIMARY KEY NOT NULL,
	"journey_id" integer NOT NULL,
	"week_number" integer NOT NULL,
	"title" varchar NOT NULL,
	"theme" varchar,
	"scripture_ref" varchar,
	"scripture_text" text,
	"estimated_minutes" integer DEFAULT 50,
	"week_type" varchar DEFAULT 'session'
);
--> statement-breakpoint
CREATE TABLE "journeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar NOT NULL,
	"title" varchar NOT NULL,
	"subtitle" varchar,
	"description" text NOT NULL,
	"category" varchar NOT NULL,
	"duration_days" integer NOT NULL,
	"level" varchar DEFAULT 'beginner' NOT NULL,
	"hero_image_url" varchar,
	"is_published" varchar DEFAULT 'true',
	CONSTRAINT "journeys_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "live_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"schedule_type" varchar DEFAULT 'scheduled',
	"scheduled_at" timestamp,
	"recurring_pattern" varchar,
	"duration_minutes" integer DEFAULT 30,
	"host_user_id" varchar,
	"meeting_link" varchar,
	"moderation_level" varchar DEFAULT 'standard',
	"max_participants" integer,
	"pillar_tags" text[],
	"status" varchar DEFAULT 'upcoming',
	"image_url" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mentor_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_journey_id" integer NOT NULL,
	"mentor_user_id" varchar NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "mentor_check_in_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentor_assignment_id" integer NOT NULL,
	"week_number" integer NOT NULL,
	"prompt_day" varchar NOT NULL,
	"completed_at" timestamp DEFAULT now(),
	"notes" text,
	"escalated" varchar DEFAULT 'false'
);
--> statement-breakpoint
CREATE TABLE "mentor_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"journey_week_id" integer NOT NULL,
	"prompt_day" varchar NOT NULL,
	"prompt_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"whatsapp_script" text NOT NULL,
	"tips" text
);
--> statement-breakpoint
CREATE TABLE "mission_adoptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"focus_id" integer NOT NULL,
	"start_date" varchar NOT NULL,
	"end_date" varchar,
	"commitment_days" integer DEFAULT 21,
	"status" varchar DEFAULT 'active' NOT NULL,
	"current_day" integer DEFAULT 1,
	"reminder_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mission_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"theme" varchar,
	"start_date" timestamp,
	"end_date" timestamp,
	"duration_days" integer DEFAULT 21,
	"pillar_tags" text[],
	"image_url" varchar,
	"badge_key" varchar,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "mission_challenges_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "mission_donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" integer,
	"amount" integer NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"payment_status" varchar DEFAULT 'pending',
	"payment_provider" varchar,
	"payment_id" varchar,
	"is_recurring" boolean DEFAULT false,
	"recurring_id" integer,
	"receipt_url" varchar,
	"note" text,
	"is_anonymous" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mission_focuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar DEFAULT 'people_group' NOT NULL,
	"name" varchar NOT NULL,
	"region" varchar,
	"country" varchar,
	"language_group" varchar,
	"population" integer,
	"summary" text,
	"prayer_needs" jsonb,
	"image_url" varchar,
	"pillar_tags" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mission_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"inviter_user_id" varchar NOT NULL,
	"share_card_id" integer,
	"invite_channel" varchar,
	"invite_code" varchar,
	"deep_link_token" varchar,
	"click_count" integer DEFAULT 0,
	"join_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "mission_invites_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "mission_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"type" varchar NOT NULL,
	"delivery_mode" varchar DEFAULT 'online' NOT NULL,
	"location" varchar,
	"start_date" timestamp,
	"end_date" timestamp,
	"cost" integer,
	"capacity" integer,
	"spots_remaining" integer,
	"requirements" jsonb,
	"pillar_tags" text[],
	"status" varchar DEFAULT 'open',
	"image_url" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mission_pillars" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"name" varchar NOT NULL,
	"subtitle" varchar,
	"scripture_ref" varchar,
	"description" text,
	"color_hex" varchar,
	"icon_key" varchar,
	"order_index" integer DEFAULT 0,
	CONSTRAINT "mission_pillars_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "mission_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"week_start_date" varchar NOT NULL,
	"prayer_goal_days" integer DEFAULT 5,
	"give_goal_amount" integer,
	"go_goal_step" varchar,
	"prayer_days_completed" integer DEFAULT 0,
	"reflection_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mission_prayer_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"focus_id" integer,
	"project_id" integer,
	"adoption_id" integer,
	"duration_seconds" integer NOT NULL,
	"completed" boolean DEFAULT false,
	"prayer_note" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mission_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"primary_burden" varchar,
	"actions_preference" text[],
	"availability_minutes" integer DEFAULT 10,
	"giving_capacity" varchar,
	"travel_readiness" varchar DEFAULT 'exploring',
	"skills" text[],
	"commitment_level" varchar DEFAULT 'explorer',
	"pillar_affinities" jsonb,
	"prayer_reminder_time" varchar,
	"weekly_prayer_goal" integer DEFAULT 5,
	"onboarding_completed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "mission_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "mission_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"summary" text NOT NULL,
	"story" text,
	"location" varchar,
	"region" varchar,
	"pillar_tags" text[],
	"actions_available" text[],
	"verification_status" varchar DEFAULT 'verified',
	"funding_goal" integer,
	"funds_raised" integer DEFAULT 0,
	"currency" varchar DEFAULT 'USD',
	"image_url" varchar,
	"video_url" varchar,
	"partner_id" varchar,
	"status" varchar DEFAULT 'active',
	"urgency_level" varchar DEFAULT 'normal',
	"has_digital_actions" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "mission_projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "mission_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"trip_interest" varchar,
	"experience" text,
	"message" text,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mission_testimonies" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"project_id" integer,
	"focus_id" integer,
	"visibility" varchar DEFAULT 'community',
	"moderation_status" varchar DEFAULT 'approved',
	"image_url" varchar,
	"video_url" varchar,
	"is_featured" boolean DEFAULT false,
	"like_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mission_trips" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"destination" varchar NOT NULL,
	"country" varchar,
	"type" varchar NOT NULL,
	"image_url" varchar,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"application_deadline" timestamp,
	"min_participants" integer DEFAULT 5,
	"max_participants" integer DEFAULT 20,
	"current_participants" integer DEFAULT 0,
	"cost" integer,
	"deposit_amount" integer,
	"fundraising_goal" integer,
	"current_fundraising" integer DEFAULT 0,
	"requirements" text[],
	"activities" text[],
	"itinerary" jsonb,
	"leader_id" varchar,
	"status" varchar DEFAULT 'draft',
	"meeting_link" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"track_id" integer NOT NULL,
	"key" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"module_type" varchar NOT NULL,
	"icon_key" varchar,
	"order_index" integer DEFAULT 0 NOT NULL,
	"prerequisites" jsonb,
	"estimated_minutes" integer DEFAULT 10,
	"is_locked_by_default" boolean DEFAULT false,
	"is_enabled" boolean DEFAULT true,
	CONSTRAINT "modules_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "ninety_day_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"focus_outcome" text,
	"key_results" jsonb,
	"weekly_anchors" jsonb,
	"schedule_anchors" jsonb,
	"accountability_plan" text,
	"stuck_plan" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"push_enabled" boolean DEFAULT true,
	"email_enabled" boolean DEFAULT true,
	"prayer_session_alerts" boolean DEFAULT true,
	"new_spark_alerts" boolean DEFAULT true,
	"event_reminders" boolean DEFAULT true,
	"weekly_digest" boolean DEFAULT true,
	"push_subscription" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"body" text NOT NULL,
	"data" text,
	"read" boolean DEFAULT false,
	"sent_push" boolean DEFAULT false,
	"sent_email" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opportunity_interests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"opportunity_id" integer NOT NULL,
	"status" varchar DEFAULT 'interested',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pathway_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"season_type" varchar NOT NULL,
	"season_label" varchar,
	"theme_word" varchar,
	"mode" varchar DEFAULT 'classic' NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"content" text NOT NULL,
	"image_url" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "practice_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"duration_minutes" integer DEFAULT 5,
	"domain_keys" jsonb,
	"instructions_classic" text NOT NULL,
	"instructions_faith" text,
	"contraindications" text,
	"tags" jsonb,
	"order_index" integer DEFAULT 0,
	CONSTRAINT "practice_library_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "prayer_focus_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"region" varchar NOT NULL,
	"country" varchar,
	"population" varchar,
	"description" text,
	"image_url" varchar,
	"prayer_points" text[],
	"scriptures" text[],
	"category" varchar DEFAULT 'nation',
	"is_active" boolean DEFAULT true,
	"intercessor_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_guide_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"focus_id" integer,
	"project_id" integer,
	"challenge_id" integer,
	"day_number" integer NOT NULL,
	"title" varchar,
	"scripture" varchar,
	"scripture_text" text,
	"prayer_points" jsonb,
	"declarations" jsonb,
	"action_step" text,
	"revival_prompt" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" integer,
	"altar_member_id" integer,
	"focus_group_id" integer,
	"altar_id" integer,
	"duration_minutes" integer NOT NULL,
	"notes" text,
	"prayer_points" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"spark_id" integer,
	"session_id" integer,
	"user_id" varchar NOT NULL,
	"user_name" varchar,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_pod_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"pod_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'member',
	"display_name" varchar,
	"status" varchar DEFAULT 'active',
	"is_muted" boolean DEFAULT false,
	"notifications_enabled" boolean DEFAULT true,
	"joined_at" timestamp DEFAULT now(),
	"last_active_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_pod_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"pod_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar DEFAULT 'message',
	"content" text NOT NULL,
	"is_anonymous" boolean DEFAULT false,
	"is_pinned" boolean DEFAULT false,
	"parent_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_pod_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"preferred_topics" text[],
	"availability_slots" text[],
	"preferred_gender_mix" varchar DEFAULT 'mixed',
	"max_pod_size" integer DEFAULT 6,
	"preferred_meeting_format" varchar DEFAULT 'text',
	"region" varchar,
	"age_group" varchar,
	"is_minor" boolean DEFAULT false,
	"guardian_consent" boolean DEFAULT false,
	"guardian_email" varchar,
	"visibility_opt_in" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_pod_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" varchar NOT NULL,
	"pod_id" integer,
	"reported_user_id" varchar,
	"category" varchar NOT NULL,
	"description" text NOT NULL,
	"evidence" text[],
	"status" varchar DEFAULT 'pending',
	"resolution" text,
	"resolved_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "prayer_pod_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"pod_id" integer,
	"status" varchar DEFAULT 'pending',
	"guardian_consent" boolean DEFAULT false,
	"risk_flags" text[],
	"reviewed_by" varchar,
	"review_notes" text,
	"created_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "prayer_pod_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"pod_id" integer NOT NULL,
	"title" varchar,
	"scheduled_for" timestamp NOT NULL,
	"duration" integer DEFAULT 30,
	"status" varchar DEFAULT 'scheduled',
	"attendee_count" integer DEFAULT 0,
	"notes" text,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_pods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"region" varchar,
	"age_bracket_min" integer DEFAULT 15,
	"age_bracket_max" integer DEFAULT 99,
	"meeting_format" varchar DEFAULT 'text',
	"status" varchar DEFAULT 'active',
	"visibility" varchar DEFAULT 'public',
	"capacity" integer DEFAULT 6,
	"prayer_topics" text[],
	"meeting_days" text[],
	"meeting_time" varchar,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"subscription_id" integer,
	"altar_member_id" integer,
	"scheduled_for" timestamp NOT NULL,
	"prayer_points" text[],
	"scriptures" text[],
	"status" varchar DEFAULT 'pending',
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_request_supports" (
	"id" serial PRIMARY KEY NOT NULL,
	"prayer_request_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar,
	"request" text NOT NULL,
	"is_private" varchar DEFAULT 'false',
	"status" varchar DEFAULT 'pending',
	"urgency_level" varchar DEFAULT 'normal',
	"category" varchar,
	"campus_or_city" varchar,
	"prayer_note" text,
	"answered_at" timestamp,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"region" varchar,
	"community" varchar,
	"leader_id" varchar NOT NULL,
	"leader_name" varchar,
	"meeting_link" varchar,
	"status" varchar DEFAULT 'active' NOT NULL,
	"participant_count" integer DEFAULT 0,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "prayer_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"focus_group_id" integer,
	"altar_id" integer,
	"type" varchar NOT NULL,
	"prayer_hours" integer DEFAULT 0,
	"streak" integer DEFAULT 0,
	"best_streak" integer DEFAULT 0,
	"last_prayed_at" timestamp,
	"receive_reminders" boolean DEFAULT true,
	"reminder_frequency" varchar DEFAULT 'daily',
	"reminder_time" varchar DEFAULT '09:00',
	"email_confirmed" boolean DEFAULT false,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_wall_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"focus_group_id" integer,
	"altar_id" integer,
	"type" varchar NOT NULL,
	"content" text NOT NULL,
	"is_anonymous" boolean DEFAULT false,
	"prayer_count" integer DEFAULT 0,
	"is_answered" boolean DEFAULT false,
	"answered_at" timestamp,
	"answered_testimony" text,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_wall_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"focus_id" integer,
	"project_id" integer,
	"visibility" varchar DEFAULT 'community',
	"moderation_status" varchar DEFAULT 'approved',
	"prayer_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prayer_wall_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"reaction_type" varchar DEFAULT 'praying',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" integer NOT NULL,
	"notifications_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "project_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"content" text NOT NULL,
	"update_type" varchar DEFAULT 'general',
	"image_url" varchar,
	"video_url" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purpose_flower" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"passion" text,
	"strengths" text,
	"needs" text,
	"rewards" text,
	"purpose_statement" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"emoji" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reading_plan_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"title" varchar NOT NULL,
	"scripture_ref" varchar NOT NULL,
	"scripture_text" text NOT NULL,
	"devotional_content" text NOT NULL,
	"reflection_question" text,
	"prayer_prompt" text,
	"action_step" text
);
--> statement-breakpoint
CREATE TABLE "reading_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"cover_image_url" varchar,
	"duration_days" integer NOT NULL,
	"maturity_level" varchar NOT NULL,
	"topics" text[],
	"featured" boolean DEFAULT false,
	"enrollment_count" integer DEFAULT 0,
	"average_rating" integer,
	"status" varchar DEFAULT 'draft',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recurring_donations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"project_id" integer,
	"amount" integer NOT NULL,
	"currency" varchar DEFAULT 'USD',
	"frequency" varchar DEFAULT 'monthly',
	"payment_provider" varchar,
	"subscription_id" varchar,
	"status" varchar DEFAULT 'active',
	"next_payment_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"cancelled_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reflection_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"base_quote" text NOT NULL,
	"question" text NOT NULL,
	"action" text NOT NULL,
	"faith_overlay_scripture" varchar,
	"publish_at" timestamp,
	"daily_date" date,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"week_theme" varchar,
	"audience_segment" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reflection_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"reflection_id" integer NOT NULL,
	"viewed_at" timestamp DEFAULT now(),
	"engaged_at" timestamp,
	"journal_entry" text,
	"reaction" varchar
);
--> statement-breakpoint
CREATE TABLE "room_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_session_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "room_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_id" integer NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"attendance_count" integer DEFAULT 0,
	"highlight_notes" text
);
--> statement-breakpoint
CREATE TABLE "safeguarding_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"campaign_id" integer,
	"invite_id" integer,
	"reporter_user_id" varchar,
	"reason" varchar NOT NULL,
	"detail" text,
	"status" varchar DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sca_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" integer,
	"linked_goal_id" integer,
	"activity" text NOT NULL,
	"importance_reason" text,
	"motivation_start" integer,
	"motivation_end" integer,
	"status" varchar DEFAULT 'in_progress',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sca_focus_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sca_exercise_id" integer NOT NULL,
	"item_index" integer NOT NULL,
	"focus_text" text NOT NULL,
	"motivation_after" integer
);
--> statement-breakpoint
CREATE TABLE "session_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"user_id" varchar NOT NULL,
	"slot_id" integer,
	"coach_id" integer,
	"status" varchar DEFAULT 'requested' NOT NULL,
	"topic" varchar,
	"goals" text,
	"preferred_times" text[],
	"notes" text,
	"coach_notes" text,
	"meeting_link" varchar,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_follow_ups" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"author_id" varchar NOT NULL,
	"content" text NOT NULL,
	"is_private" boolean DEFAULT false,
	"action_items" text[],
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session_sections" (
	"id" serial PRIMARY KEY NOT NULL,
	"journey_week_id" integer NOT NULL,
	"section_order" integer NOT NULL,
	"section_type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"duration_minutes" integer DEFAULT 5,
	"content_json" jsonb NOT NULL,
	"facilitator_notes" text
);
--> statement-breakpoint
CREATE TABLE "session_slots" (
	"id" serial PRIMARY KEY NOT NULL,
	"coach_id" integer NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"is_booked" boolean DEFAULT false,
	"session_type" varchar DEFAULT 'one-on-one',
	"max_participants" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "share_cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"content_preview" text,
	"image_url" varchar,
	"cta_link" varchar,
	"related_project_id" integer,
	"related_challenge_id" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spark_action_completions" (
	"id" serial PRIMARY KEY NOT NULL,
	"spark_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spark_bookmarks" (
	"id" serial PRIMARY KEY NOT NULL,
	"spark_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spark_journals" (
	"id" serial PRIMARY KEY NOT NULL,
	"spark_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"text_content" text,
	"audio_url" varchar,
	"audio_duration" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spark_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"spark_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"reaction_type" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spark_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"category" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sparks" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"media_type" varchar DEFAULT 'video' NOT NULL,
	"video_url" varchar,
	"audio_url" varchar,
	"download_url" varchar,
	"image_url" varchar,
	"thumbnail_url" varchar,
	"category" varchar NOT NULL,
	"duration" integer,
	"scripture_ref" varchar,
	"status" varchar DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp,
	"daily_date" date,
	"featured" boolean DEFAULT false,
	"prayer_line" text,
	"cta_primary" varchar,
	"thumbnail_text" varchar,
	"thumbnail_prompt" text,
	"week_theme" varchar,
	"audience_segment" varchar,
	"full_passage" text,
	"full_teaching" text,
	"context_background" text,
	"application_points" text[],
	"today_action" text,
	"reflection_question" text,
	"scenario_vignette" text,
	"shareable_version" text,
	"narration_audio_url" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "strengths_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"name" varchar NOT NULL,
	"category" varchar,
	"definition" text NOT NULL,
	"healthy_use" text,
	"overuse_risk" text,
	"underuse_risk" text,
	"suggested_habits" jsonb,
	"suggested_roles" jsonb,
	"suggested_boundaries" jsonb,
	"icon_key" varchar,
	"order_index" integer DEFAULT 0,
	CONSTRAINT "strengths_catalog_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "styles_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"when_strong" text,
	"when_stressed" text,
	"what_they_need" text,
	"how_to_work_with" jsonb,
	"communication_tips" jsonb,
	"color_hex" varchar,
	"icon_key" varchar,
	CONSTRAINT "styles_profiles_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "testimonies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar,
	"title" varchar NOT NULL,
	"story" text NOT NULL,
	"category" varchar,
	"sharing_permission" varchar DEFAULT 'private',
	"display_name_preference" varchar DEFAULT 'first_name',
	"is_approved" varchar DEFAULT 'false',
	"user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"icon_key" varchar,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_enabled" boolean DEFAULT true,
	CONSTRAINT "tracks_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "training_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"duration_minutes" integer DEFAULT 10,
	"category" varchar,
	"pillar_tags" text[],
	"content_json" jsonb,
	"video_url" varchar,
	"image_url" varchar,
	"prerequisite_module_key" varchar,
	"order_index" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "training_modules_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "training_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"module_id" integer NOT NULL,
	"status" varchar DEFAULT 'not_started',
	"started_at" timestamp,
	"completed_at" timestamp,
	"quiz_score" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "trip_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"trip_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"role" varchar,
	"emergency_contact" jsonb,
	"medical_info" text,
	"dietary_restrictions" text,
	"special_skills" text[],
	"why_apply" text,
	"documents" jsonb,
	"amount_paid" integer DEFAULT 0,
	"fundraising_amount" integer DEFAULT 0,
	"fundraising_page_url" varchar,
	"notes" text,
	"reviewed_by" varchar,
	"reviewed_at" timestamp,
	"applied_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "uk_campuses" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"type" varchar NOT NULL,
	"city" varchar NOT NULL,
	"region" varchar,
	"postcode" varchar,
	"latitude" varchar,
	"longitude" varchar,
	"student_population" integer,
	"website" varchar,
	"image_url" varchar,
	"has_altar" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"badge_id" integer NOT NULL,
	"awarded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_eq_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"response_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" integer,
	"domain_key" varchar NOT NULL,
	"score_normalized" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_journey_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_journey_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"completed_at" timestamp,
	"notes" text,
	"reflection_response" text
);
--> statement-breakpoint
CREATE TABLE "user_journeys" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"journey_id" integer NOT NULL,
	"status" varchar DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"current_day" integer DEFAULT 1,
	"last_activity_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_module_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" integer,
	"module_id" integer NOT NULL,
	"status" varchar DEFAULT 'not_started' NOT NULL,
	"started_at" timestamp,
	"completed_at" timestamp,
	"last_viewed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_plan_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"plan_id" integer NOT NULL,
	"status" varchar DEFAULT 'active',
	"current_day" integer DEFAULT 1,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"current_streak" integer DEFAULT 0,
	"last_read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_practice_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" integer,
	"practice_key" varchar NOT NULL,
	"date" varchar NOT NULL,
	"completed" boolean DEFAULT false,
	"reflection_note" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_reading_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"enrollment_id" integer NOT NULL,
	"plan_day_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"completed" boolean DEFAULT false,
	"journal_entry" text,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"profile_visibility" varchar DEFAULT 'public',
	"show_email" boolean DEFAULT false,
	"show_location" boolean DEFAULT true,
	"allow_messaging" boolean DEFAULT true,
	"theme" varchar DEFAULT 'system',
	"language" varchar DEFAULT 'en',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_spiritual_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"maturity_level" varchar DEFAULT 'growing',
	"interests" text[],
	"completed_plans_count" integer DEFAULT 0,
	"total_reading_days" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"user_id" varchar PRIMARY KEY NOT NULL,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_completed_date" varchar
);
--> statement-breakpoint
CREATE TABLE "user_strengths" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"strength_key" varchar NOT NULL,
	"rank" integer NOT NULL,
	"self_rating" integer,
	"evidence_note" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_styles" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"primary_style_key" varchar NOT NULL,
	"secondary_style_key" varchar,
	"stress_style_key" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"content_mode" varchar DEFAULT 'reflection',
	"content_tone" varchar DEFAULT 'faith',
	"audience_segment" varchar,
	"role" varchar DEFAULT 'member',
	"region" varchar,
	"community" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "values_selection" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"values" jsonb NOT NULL,
	"top_value_meaning" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vision_exports" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"export_type" varchar NOT NULL,
	"url" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vision_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"why" text,
	"specific" text,
	"measurable" text,
	"metric_name" varchar,
	"metric_target" varchar,
	"achievable" text,
	"relevant" text,
	"deadline" timestamp,
	"first_step" text,
	"obstacles_plan" text,
	"status" varchar DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vision_habits" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"frequency" varchar DEFAULT 'daily' NOT NULL,
	"target_per_week" integer DEFAULT 7,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vision_statements" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"feelings" text,
	"identity_statement" text,
	"top_outcomes" jsonb,
	"season_statement" text,
	"faith_intention" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "volunteer_signups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"segment" varchar,
	"areas" text[],
	"message" text,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wdep_doing" (
	"id" serial PRIMARY KEY NOT NULL,
	"wdep_entry_id" integer NOT NULL,
	"acting" text,
	"thinking" text,
	"feeling" text,
	"health_impact" text,
	"faith_reflection" text
);
--> statement-breakpoint
CREATE TABLE "wdep_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"session_id" integer,
	"linked_goal_id" integer,
	"title" varchar,
	"status" varchar DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wdep_evaluation" (
	"id" serial PRIMARY KEY NOT NULL,
	"wdep_entry_id" integer NOT NULL,
	"helping" boolean,
	"direction_score" integer,
	"commitment_score" integer,
	"cost_of_staying_same" text,
	"faith_reflection" text
);
--> statement-breakpoint
CREATE TABLE "wdep_experiment_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"experiment_id" integer NOT NULL,
	"date" varchar NOT NULL,
	"completed" boolean DEFAULT false,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "wdep_experiments" (
	"id" serial PRIMARY KEY NOT NULL,
	"wdep_entry_id" integer NOT NULL,
	"daily_action" text,
	"days_target" integer DEFAULT 7,
	"start_date" varchar,
	"end_date" varchar,
	"completed_days" integer DEFAULT 0,
	"reflection_day7" text,
	"status" varchar DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "wdep_plan" (
	"id" serial PRIMARY KEY NOT NULL,
	"wdep_entry_id" integer NOT NULL,
	"do_differently" text,
	"effort_level" integer,
	"achievable_this_week" boolean,
	"proof_of_done" text,
	"start_now_action" text,
	"start_now_completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "wdep_wants" (
	"id" serial PRIMARY KEY NOT NULL,
	"wdep_entry_id" integer NOT NULL,
	"want_primary" text,
	"want_instead_of_problem" text,
	"quality_life_picture" text,
	"others_want_for_you" text,
	"session_hope" text,
	"faith_reflection" text
);
--> statement-breakpoint
CREATE TABLE "weekly_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"week_start_date" varchar NOT NULL,
	"win" text,
	"lesson" text,
	"obstacle" text,
	"adjustment" text,
	"next_week_top3" jsonb,
	"gratitude" text,
	"prayer_focus" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wheel_life_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"category_key" varchar NOT NULL,
	"score" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_coach_messages" ADD CONSTRAINT "ai_coach_messages_session_id_ai_coach_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_coach_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_coach_sessions" ADD CONSTRAINT "ai_coach_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_cohort_participants" ADD CONSTRAINT "alpha_cohort_participants_cohort_id_alpha_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."alpha_cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_cohort_participants" ADD CONSTRAINT "alpha_cohort_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_cohort_week_progress" ADD CONSTRAINT "alpha_cohort_week_progress_participant_id_alpha_cohort_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."alpha_cohort_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_cohort_weeks" ADD CONSTRAINT "alpha_cohort_weeks_cohort_id_alpha_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."alpha_cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altar_members" ADD CONSTRAINT "altar_members_altar_id_campus_altars_id_fk" FOREIGN KEY ("altar_id") REFERENCES "public"."campus_altars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "altar_members" ADD CONSTRAINT "altar_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_response_id_assessment_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."assessment_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_answers" ADD CONSTRAINT "assessment_answers_question_id_assessment_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."assessment_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_insights" ADD CONSTRAINT "assessment_insights_response_id_assessment_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."assessment_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_questions" ADD CONSTRAINT "assessment_questions_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_responses" ADD CONSTRAINT "assessment_responses_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assessment_scores" ADD CONSTRAINT "assessment_scores_response_id_assessment_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."assessment_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_check_ins" ADD CONSTRAINT "buddy_check_ins_buddy_pair_id_buddy_pairs_id_fk" FOREIGN KEY ("buddy_pair_id") REFERENCES "public"."buddy_pairs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_check_ins" ADD CONSTRAINT "buddy_check_ins_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_pairs" ADD CONSTRAINT "buddy_pairs_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_pairs" ADD CONSTRAINT "buddy_pairs_user_journey_id_1_user_journeys_id_fk" FOREIGN KEY ("user_journey_id_1") REFERENCES "public"."user_journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buddy_pairs" ADD CONSTRAINT "buddy_pairs_user_journey_id_2_user_journeys_id_fk" FOREIGN KEY ("user_journey_id_2") REFERENCES "public"."user_journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campus_altars" ADD CONSTRAINT "campus_altars_campus_id_uk_campuses_id_fk" FOREIGN KEY ("campus_id") REFERENCES "public"."uk_campuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campus_altars" ADD CONSTRAINT "campus_altars_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_day_completions" ADD CONSTRAINT "challenge_day_completions_enrollment_id_challenge_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."challenge_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_enrollments" ADD CONSTRAINT "challenge_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_enrollments" ADD CONSTRAINT "challenge_enrollments_challenge_id_mission_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."mission_challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_logs" ADD CONSTRAINT "challenge_logs_participant_id_challenge_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."challenge_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_cohorts" ADD CONSTRAINT "coaching_cohorts_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaching_sessions" ADD CONSTRAINT "coaching_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_participants" ADD CONSTRAINT "cohort_participants_cohort_id_coaching_cohorts_id_fk" FOREIGN KEY ("cohort_id") REFERENCES "public"."coaching_cohorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_participants" ADD CONSTRAINT "cohort_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cohort_participants" ADD CONSTRAINT "cohort_participants_accountability_partner_id_users_id_fk" FOREIGN KEY ("accountability_partner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_checkins" ADD CONSTRAINT "daily_checkins_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_actions" ADD CONSTRAINT "digital_actions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_actions" ADD CONSTRAINT "digital_actions_project_id_mission_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mission_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "digital_actions" ADD CONSTRAINT "digital_actions_focus_id_mission_focuses_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."mission_focuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_aggregates" ADD CONSTRAINT "feedback_aggregates_campaign_id_feedback_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."feedback_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_answers" ADD CONSTRAINT "feedback_answers_invite_id_feedback_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."feedback_invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_answers" ADD CONSTRAINT "feedback_answers_campaign_id_feedback_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."feedback_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_campaigns" ADD CONSTRAINT "feedback_campaigns_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_campaigns" ADD CONSTRAINT "feedback_campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_invites" ADD CONSTRAINT "feedback_invites_campaign_id_feedback_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."feedback_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_self_assessment" ADD CONSTRAINT "feedback_self_assessment_campaign_id_feedback_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."feedback_campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_self_assessment" ADD CONSTRAINT "feedback_self_assessment_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "focus_areas" ADD CONSTRAINT "focus_areas_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_messages" ADD CONSTRAINT "follow_up_messages_thread_id_follow_up_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."follow_up_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_messages" ADD CONSTRAINT "follow_up_messages_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_threads" ADD CONSTRAINT "follow_up_threads_initiator_user_id_users_id_fk" FOREIGN KEY ("initiator_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_threads" ADD CONSTRAINT "follow_up_threads_participant_user_id_users_id_fk" FOREIGN KEY ("participant_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follow_up_threads" ADD CONSTRAINT "follow_up_threads_project_id_mission_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mission_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goal_milestones" ADD CONSTRAINT "goal_milestones_goal_id_vision_goals_id_fk" FOREIGN KEY ("goal_id") REFERENCES "public"."vision_goals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_vision_habits_id_fk" FOREIGN KEY ("habit_id") REFERENCES "public"."vision_habits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "i_will_commitments" ADD CONSTRAINT "i_will_commitments_user_journey_id_user_journeys_id_fk" FOREIGN KEY ("user_journey_id") REFERENCES "public"."user_journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_days" ADD CONSTRAINT "journey_days_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_steps" ADD CONSTRAINT "journey_steps_journey_day_id_journey_days_id_fk" FOREIGN KEY ("journey_day_id") REFERENCES "public"."journey_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "journey_weeks" ADD CONSTRAINT "journey_weeks_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_rooms" ADD CONSTRAINT "live_rooms_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_assignments" ADD CONSTRAINT "mentor_assignments_user_journey_id_user_journeys_id_fk" FOREIGN KEY ("user_journey_id") REFERENCES "public"."user_journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_assignments" ADD CONSTRAINT "mentor_assignments_mentor_user_id_users_id_fk" FOREIGN KEY ("mentor_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_check_in_logs" ADD CONSTRAINT "mentor_check_in_logs_mentor_assignment_id_mentor_assignments_id_fk" FOREIGN KEY ("mentor_assignment_id") REFERENCES "public"."mentor_assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_prompts" ADD CONSTRAINT "mentor_prompts_journey_week_id_journey_weeks_id_fk" FOREIGN KEY ("journey_week_id") REFERENCES "public"."journey_weeks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_adoptions" ADD CONSTRAINT "mission_adoptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_adoptions" ADD CONSTRAINT "mission_adoptions_focus_id_mission_focuses_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."mission_focuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_donations" ADD CONSTRAINT "mission_donations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_donations" ADD CONSTRAINT "mission_donations_project_id_mission_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mission_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_invites" ADD CONSTRAINT "mission_invites_inviter_user_id_users_id_fk" FOREIGN KEY ("inviter_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_invites" ADD CONSTRAINT "mission_invites_share_card_id_share_cards_id_fk" FOREIGN KEY ("share_card_id") REFERENCES "public"."share_cards"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_opportunities" ADD CONSTRAINT "mission_opportunities_project_id_mission_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mission_projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_plans" ADD CONSTRAINT "mission_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_prayer_sessions" ADD CONSTRAINT "mission_prayer_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_prayer_sessions" ADD CONSTRAINT "mission_prayer_sessions_focus_id_mission_focuses_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."mission_focuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_prayer_sessions" ADD CONSTRAINT "mission_prayer_sessions_adoption_id_mission_adoptions_id_fk" FOREIGN KEY ("adoption_id") REFERENCES "public"."mission_adoptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_profiles" ADD CONSTRAINT "mission_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_registrations" ADD CONSTRAINT "mission_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_testimonies" ADD CONSTRAINT "mission_testimonies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_testimonies" ADD CONSTRAINT "mission_testimonies_project_id_mission_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mission_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_testimonies" ADD CONSTRAINT "mission_testimonies_focus_id_mission_focuses_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."mission_focuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mission_trips" ADD CONSTRAINT "mission_trips_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ninety_day_plans" ADD CONSTRAINT "ninety_day_plans_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_interests" ADD CONSTRAINT "opportunity_interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_interests" ADD CONSTRAINT "opportunity_interests_opportunity_id_mission_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."mission_opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pathway_sessions" ADD CONSTRAINT "pathway_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_guide_days" ADD CONSTRAINT "prayer_guide_days_focus_id_mission_focuses_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."mission_focuses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_logs" ADD CONSTRAINT "prayer_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_logs" ADD CONSTRAINT "prayer_logs_subscription_id_prayer_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."prayer_subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_logs" ADD CONSTRAINT "prayer_logs_altar_member_id_altar_members_id_fk" FOREIGN KEY ("altar_member_id") REFERENCES "public"."altar_members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_logs" ADD CONSTRAINT "prayer_logs_focus_group_id_prayer_focus_groups_id_fk" FOREIGN KEY ("focus_group_id") REFERENCES "public"."prayer_focus_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_logs" ADD CONSTRAINT "prayer_logs_altar_id_campus_altars_id_fk" FOREIGN KEY ("altar_id") REFERENCES "public"."campus_altars"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_messages" ADD CONSTRAINT "prayer_messages_spark_id_sparks_id_fk" FOREIGN KEY ("spark_id") REFERENCES "public"."sparks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_messages" ADD CONSTRAINT "prayer_messages_session_id_prayer_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."prayer_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_messages" ADD CONSTRAINT "prayer_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_members" ADD CONSTRAINT "prayer_pod_members_pod_id_prayer_pods_id_fk" FOREIGN KEY ("pod_id") REFERENCES "public"."prayer_pods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_members" ADD CONSTRAINT "prayer_pod_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_messages" ADD CONSTRAINT "prayer_pod_messages_pod_id_prayer_pods_id_fk" FOREIGN KEY ("pod_id") REFERENCES "public"."prayer_pods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_messages" ADD CONSTRAINT "prayer_pod_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_preferences" ADD CONSTRAINT "prayer_pod_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_reports" ADD CONSTRAINT "prayer_pod_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_reports" ADD CONSTRAINT "prayer_pod_reports_pod_id_prayer_pods_id_fk" FOREIGN KEY ("pod_id") REFERENCES "public"."prayer_pods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_reports" ADD CONSTRAINT "prayer_pod_reports_reported_user_id_users_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_reports" ADD CONSTRAINT "prayer_pod_reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_requests" ADD CONSTRAINT "prayer_pod_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_requests" ADD CONSTRAINT "prayer_pod_requests_pod_id_prayer_pods_id_fk" FOREIGN KEY ("pod_id") REFERENCES "public"."prayer_pods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_requests" ADD CONSTRAINT "prayer_pod_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_sessions" ADD CONSTRAINT "prayer_pod_sessions_pod_id_prayer_pods_id_fk" FOREIGN KEY ("pod_id") REFERENCES "public"."prayer_pods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pod_sessions" ADD CONSTRAINT "prayer_pod_sessions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_pods" ADD CONSTRAINT "prayer_pods_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_reminders" ADD CONSTRAINT "prayer_reminders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_reminders" ADD CONSTRAINT "prayer_reminders_subscription_id_prayer_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."prayer_subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_reminders" ADD CONSTRAINT "prayer_reminders_altar_member_id_altar_members_id_fk" FOREIGN KEY ("altar_member_id") REFERENCES "public"."altar_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_request_supports" ADD CONSTRAINT "prayer_request_supports_prayer_request_id_prayer_requests_id_fk" FOREIGN KEY ("prayer_request_id") REFERENCES "public"."prayer_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_request_supports" ADD CONSTRAINT "prayer_request_supports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_requests" ADD CONSTRAINT "prayer_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_sessions" ADD CONSTRAINT "prayer_sessions_leader_id_users_id_fk" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_subscriptions" ADD CONSTRAINT "prayer_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_subscriptions" ADD CONSTRAINT "prayer_subscriptions_focus_group_id_prayer_focus_groups_id_fk" FOREIGN KEY ("focus_group_id") REFERENCES "public"."prayer_focus_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_subscriptions" ADD CONSTRAINT "prayer_subscriptions_altar_id_campus_altars_id_fk" FOREIGN KEY ("altar_id") REFERENCES "public"."campus_altars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_wall_entries" ADD CONSTRAINT "prayer_wall_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_wall_entries" ADD CONSTRAINT "prayer_wall_entries_focus_group_id_prayer_focus_groups_id_fk" FOREIGN KEY ("focus_group_id") REFERENCES "public"."prayer_focus_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_wall_entries" ADD CONSTRAINT "prayer_wall_entries_altar_id_campus_altars_id_fk" FOREIGN KEY ("altar_id") REFERENCES "public"."campus_altars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_wall_posts" ADD CONSTRAINT "prayer_wall_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_wall_posts" ADD CONSTRAINT "prayer_wall_posts_focus_id_mission_focuses_id_fk" FOREIGN KEY ("focus_id") REFERENCES "public"."mission_focuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_wall_posts" ADD CONSTRAINT "prayer_wall_posts_project_id_mission_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mission_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_wall_reactions" ADD CONSTRAINT "prayer_wall_reactions_post_id_prayer_wall_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."prayer_wall_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_wall_reactions" ADD CONSTRAINT "prayer_wall_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_follows" ADD CONSTRAINT "project_follows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_follows" ADD CONSTRAINT "project_follows_project_id_mission_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mission_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_project_id_mission_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mission_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purpose_flower" ADD CONSTRAINT "purpose_flower_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_plan_days" ADD CONSTRAINT "reading_plan_days_plan_id_reading_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."reading_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_donations" ADD CONSTRAINT "recurring_donations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_donations" ADD CONSTRAINT "recurring_donations_project_id_mission_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."mission_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reflection_logs" ADD CONSTRAINT "reflection_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reflection_logs" ADD CONSTRAINT "reflection_logs_reflection_id_daily_reflections_id_fk" FOREIGN KEY ("reflection_id") REFERENCES "public"."daily_reflections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_participants" ADD CONSTRAINT "room_participants_room_session_id_room_sessions_id_fk" FOREIGN KEY ("room_session_id") REFERENCES "public"."room_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_participants" ADD CONSTRAINT "room_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_sessions" ADD CONSTRAINT "room_sessions_room_id_live_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."live_rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safeguarding_reports" ADD CONSTRAINT "safeguarding_reports_campaign_id_feedback_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."feedback_campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safeguarding_reports" ADD CONSTRAINT "safeguarding_reports_invite_id_feedback_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."feedback_invites"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "safeguarding_reports" ADD CONSTRAINT "safeguarding_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sca_exercises" ADD CONSTRAINT "sca_exercises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sca_exercises" ADD CONSTRAINT "sca_exercises_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sca_exercises" ADD CONSTRAINT "sca_exercises_linked_goal_id_vision_goals_id_fk" FOREIGN KEY ("linked_goal_id") REFERENCES "public"."vision_goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sca_focus_items" ADD CONSTRAINT "sca_focus_items_sca_exercise_id_sca_exercises_id_fk" FOREIGN KEY ("sca_exercise_id") REFERENCES "public"."sca_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_bookings" ADD CONSTRAINT "session_bookings_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_bookings" ADD CONSTRAINT "session_bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_bookings" ADD CONSTRAINT "session_bookings_slot_id_session_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."session_slots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_bookings" ADD CONSTRAINT "session_bookings_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_follow_ups" ADD CONSTRAINT "session_follow_ups_booking_id_session_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."session_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_follow_ups" ADD CONSTRAINT "session_follow_ups_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_sections" ADD CONSTRAINT "session_sections_journey_week_id_journey_weeks_id_fk" FOREIGN KEY ("journey_week_id") REFERENCES "public"."journey_weeks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_slots" ADD CONSTRAINT "session_slots_coach_id_coach_profiles_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coach_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "share_cards" ADD CONSTRAINT "share_cards_related_project_id_mission_projects_id_fk" FOREIGN KEY ("related_project_id") REFERENCES "public"."mission_projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spark_action_completions" ADD CONSTRAINT "spark_action_completions_spark_id_sparks_id_fk" FOREIGN KEY ("spark_id") REFERENCES "public"."sparks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spark_action_completions" ADD CONSTRAINT "spark_action_completions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spark_bookmarks" ADD CONSTRAINT "spark_bookmarks_spark_id_sparks_id_fk" FOREIGN KEY ("spark_id") REFERENCES "public"."sparks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spark_bookmarks" ADD CONSTRAINT "spark_bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spark_journals" ADD CONSTRAINT "spark_journals_spark_id_sparks_id_fk" FOREIGN KEY ("spark_id") REFERENCES "public"."sparks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spark_journals" ADD CONSTRAINT "spark_journals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spark_reactions" ADD CONSTRAINT "spark_reactions_spark_id_sparks_id_fk" FOREIGN KEY ("spark_id") REFERENCES "public"."sparks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spark_reactions" ADD CONSTRAINT "spark_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spark_subscriptions" ADD CONSTRAINT "spark_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonies" ADD CONSTRAINT "testimonies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_progress" ADD CONSTRAINT "training_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_progress" ADD CONSTRAINT "training_progress_module_id_training_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."training_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_applications" ADD CONSTRAINT "trip_applications_trip_id_mission_trips_id_fk" FOREIGN KEY ("trip_id") REFERENCES "public"."mission_trips"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_applications" ADD CONSTRAINT "trip_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trip_applications" ADD CONSTRAINT "trip_applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_eq_scores" ADD CONSTRAINT "user_eq_scores_response_id_assessment_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."assessment_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_eq_scores" ADD CONSTRAINT "user_eq_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_eq_scores" ADD CONSTRAINT "user_eq_scores_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_journey_days" ADD CONSTRAINT "user_journey_days_user_journey_id_user_journeys_id_fk" FOREIGN KEY ("user_journey_id") REFERENCES "public"."user_journeys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_journeys" ADD CONSTRAINT "user_journeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_journeys" ADD CONSTRAINT "user_journeys_journey_id_journeys_id_fk" FOREIGN KEY ("journey_id") REFERENCES "public"."journeys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_module_progress" ADD CONSTRAINT "user_module_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_module_progress" ADD CONSTRAINT "user_module_progress_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_module_progress" ADD CONSTRAINT "user_module_progress_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plan_enrollments" ADD CONSTRAINT "user_plan_enrollments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plan_enrollments" ADD CONSTRAINT "user_plan_enrollments_plan_id_reading_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."reading_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_practice_logs" ADD CONSTRAINT "user_practice_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_practice_logs" ADD CONSTRAINT "user_practice_logs_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reading_progress" ADD CONSTRAINT "user_reading_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reading_progress" ADD CONSTRAINT "user_reading_progress_enrollment_id_user_plan_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."user_plan_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reading_progress" ADD CONSTRAINT "user_reading_progress_plan_day_id_reading_plan_days_id_fk" FOREIGN KEY ("plan_day_id") REFERENCES "public"."reading_plan_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_spiritual_profiles" ADD CONSTRAINT "user_spiritual_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_strengths" ADD CONSTRAINT "user_strengths_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_strengths" ADD CONSTRAINT "user_strengths_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_styles" ADD CONSTRAINT "user_styles_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_styles" ADD CONSTRAINT "user_styles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "values_selection" ADD CONSTRAINT "values_selection_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_exports" ADD CONSTRAINT "vision_exports_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_goals" ADD CONSTRAINT "vision_goals_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_habits" ADD CONSTRAINT "vision_habits_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vision_statements" ADD CONSTRAINT "vision_statements_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteer_signups" ADD CONSTRAINT "volunteer_signups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wdep_doing" ADD CONSTRAINT "wdep_doing_wdep_entry_id_wdep_entries_id_fk" FOREIGN KEY ("wdep_entry_id") REFERENCES "public"."wdep_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wdep_entries" ADD CONSTRAINT "wdep_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wdep_entries" ADD CONSTRAINT "wdep_entries_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wdep_entries" ADD CONSTRAINT "wdep_entries_linked_goal_id_vision_goals_id_fk" FOREIGN KEY ("linked_goal_id") REFERENCES "public"."vision_goals"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wdep_evaluation" ADD CONSTRAINT "wdep_evaluation_wdep_entry_id_wdep_entries_id_fk" FOREIGN KEY ("wdep_entry_id") REFERENCES "public"."wdep_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wdep_experiment_logs" ADD CONSTRAINT "wdep_experiment_logs_experiment_id_wdep_experiments_id_fk" FOREIGN KEY ("experiment_id") REFERENCES "public"."wdep_experiments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wdep_experiments" ADD CONSTRAINT "wdep_experiments_wdep_entry_id_wdep_entries_id_fk" FOREIGN KEY ("wdep_entry_id") REFERENCES "public"."wdep_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wdep_plan" ADD CONSTRAINT "wdep_plan_wdep_entry_id_wdep_entries_id_fk" FOREIGN KEY ("wdep_entry_id") REFERENCES "public"."wdep_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wdep_wants" ADD CONSTRAINT "wdep_wants_wdep_entry_id_wdep_entries_id_fk" FOREIGN KEY ("wdep_entry_id") REFERENCES "public"."wdep_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_reviews" ADD CONSTRAINT "weekly_reviews_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wheel_life_entries" ADD CONSTRAINT "wheel_life_entries_session_id_pathway_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."pathway_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");