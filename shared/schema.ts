import { sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  contentMode: varchar("content_mode").default("reflection"),
  audienceSegment: varchar("audience_segment"),
  role: varchar("role").default("member"), // 'member', 'leader', 'admin'
  region: varchar("region"), // for regional leaders
  community: varchar("community"), // community/group affiliation
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Community Hub Posts
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'mission' or 'prayer'
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
});
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Reactions to posts
export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  emoji: varchar("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true,
});
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactions.$inferSelect;

// Sparks - video, audio, or image devotionals
export const sparks = pgTable("sparks", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  mediaType: varchar("media_type").notNull().default("video"), // 'video', 'audio', 'quick-read', 'download'
  videoUrl: varchar("video_url"),
  audioUrl: varchar("audio_url"),
  downloadUrl: varchar("download_url"),
  imageUrl: varchar("image_url"),
  thumbnailUrl: varchar("thumbnail_url"),
  category: varchar("category").notNull(), // 'daily-devotional', 'worship', 'testimony', etc.
  duration: integer("duration"), // in seconds
  scriptureRef: varchar("scripture_ref"), // e.g. "Matthew 6:6"
  status: varchar("status").notNull().default("draft"), // 'draft', 'scheduled', 'published', 'archived'
  publishAt: timestamp("publish_at"),
  dailyDate: date("daily_date"), // for Today's Devotional rotation
  featured: boolean("featured").default(false),
  prayerLine: text("prayer_line"), // prayer prompt for Faith Overlay
  ctaPrimary: varchar("cta_primary"), // 'Pray', 'Give', 'Go'
  thumbnailText: varchar("thumbnail_text"), // text overlay for thumbnail
  thumbnailPrompt: text("thumbnail_prompt"), // AI generation prompt
  weekTheme: varchar("week_theme"), // e.g. "Week 1: Identity & Belonging"
  audienceSegment: varchar("audience_segment"), // 'schools', 'universities', 'early-career', 'builders', 'couples'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSparkSchema = createInsertSchema(sparks).omit({
  id: true,
  createdAt: true,
});
export type InsertSpark = z.infer<typeof insertSparkSchema>;
export type Spark = typeof sparks.$inferSelect;

// Spark Reactions - flame/amen/share tracking
export const sparkReactions = pgTable("spark_reactions", {
  id: serial("id").primaryKey(),
  sparkId: integer("spark_id").notNull().references(() => sparks.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  reactionType: varchar("reaction_type").notNull(), // 'flame', 'amen', 'praying'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSparkReactionSchema = createInsertSchema(sparkReactions).omit({
  id: true,
  createdAt: true,
});
export type InsertSparkReaction = z.infer<typeof insertSparkReactionSchema>;
export type SparkReaction = typeof sparkReactions.$inferSelect;

// Prayer Messages for Live Intercession
export const prayerMessages = pgTable("prayer_messages", {
  id: serial("id").primaryKey(),
  sparkId: integer("spark_id").references(() => sparks.id, { onDelete: 'cascade' }),
  sessionId: integer("session_id").references(() => prayerSessions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  userName: varchar("user_name"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrayerMessageSchema = createInsertSchema(prayerMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertPrayerMessage = z.infer<typeof insertPrayerMessageSchema>;
export type PrayerMessage = typeof prayerMessages.$inferSelect;

// Prayer Sessions - leader-initiated intercession sessions
export const prayerSessions = pgTable("prayer_sessions", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  region: varchar("region"), // regional scope
  community: varchar("community"), // community/group scope
  leaderId: varchar("leader_id").notNull().references(() => users.id),
  leaderName: varchar("leader_name"),
  meetingLink: varchar("meeting_link"), // Zoom, Google Meet, YouTube Live link
  status: varchar("status").notNull().default("active"), // 'active', 'ended'
  participantCount: integer("participant_count").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

export const insertPrayerSessionSchema = createInsertSchema(prayerSessions).omit({
  id: true,
  startedAt: true,
  endedAt: true,
  participantCount: true,
});
export type InsertPrayerSession = z.infer<typeof insertPrayerSessionSchema>;
export type PrayerSession = typeof prayerSessions.$inferSelect;

// Spark subscriptions (for notifications)
export const sparkSubscriptions = pgTable("spark_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: varchar("category").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSparkSubscriptionSchema = createInsertSchema(sparkSubscriptions).omit({
  id: true,
  createdAt: true,
});
export type InsertSparkSubscription = z.infer<typeof insertSparkSubscriptionSchema>;
export type SparkSubscription = typeof sparkSubscriptions.$inferSelect;

// Notification Preferences - user notification settings across the platform
export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  pushEnabled: boolean("push_enabled").default(true),
  emailEnabled: boolean("email_enabled").default(true),
  prayerSessionAlerts: boolean("prayer_session_alerts").default(true),
  newSparkAlerts: boolean("new_spark_alerts").default(true),
  eventReminders: boolean("event_reminders").default(true),
  weeklyDigest: boolean("weekly_digest").default(true),
  pushSubscription: text("push_subscription"), // JSON web push subscription
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNotificationPreferencesSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNotificationPreferences = z.infer<typeof insertNotificationPreferencesSchema>;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;

// Notifications - platform notifications queue
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'prayer_session', 'new_spark', 'event_reminder', 'weekly_digest'
  title: varchar("title").notNull(),
  body: text("body").notNull(),
  data: text("data"), // JSON payload for action data
  read: boolean("read").default(false),
  sentPush: boolean("sent_push").default(false),
  sentEmail: boolean("sent_email").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  read: true,
  sentPush: true,
  sentEmail: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Reflection Cards - daily reflection prompts
export const reflectionCards = pgTable("reflection_cards", {
  id: serial("id").primaryKey(),
  baseQuote: text("base_quote").notNull(), // seeker-sensitive quote/insight
  question: text("question").notNull(), // reflection question
  action: text("action").notNull(), // small action step
  faithOverlayScripture: varchar("faith_overlay_scripture"), // optional scripture ref for Faith mode
  publishAt: timestamp("publish_at"),
  dailyDate: date("daily_date"), // for daily rotation
  status: varchar("status").notNull().default("draft"), // 'draft', 'scheduled', 'published'
  weekTheme: varchar("week_theme"), // e.g. "Week 1: Identity & Belonging"
  audienceSegment: varchar("audience_segment"), // 'schools', 'universities', 'early-career', 'builders', 'couples'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReflectionCardSchema = createInsertSchema(reflectionCards).omit({
  id: true,
  createdAt: true,
});
export type InsertReflectionCard = z.infer<typeof insertReflectionCardSchema>;
export type ReflectionCard = typeof reflectionCards.$inferSelect;

// Mission Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(), // 'outreach', 'prayer-night', 'tech-hub', 'discipleship'
  location: varchar("location"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  imageUrl: varchar("image_url"),
  registrationUrl: varchar("registration_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Event registrations
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  createdAt: true,
});
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type EventRegistration = typeof eventRegistrations.$inferSelect;

// Blog Posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImageUrl: varchar("cover_image_url"),
  authorId: varchar("author_id").notNull().references(() => users.id),
  category: varchar("category").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  publishedAt: true,
});
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// Newsletter/Email Subscriptions
export const emailSubscriptions = pgTable("email_subscriptions", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  name: varchar("name"),
  categories: text("categories").array(), // 'prayer', 'missions', 'devotional', 'events'
  whatsappOptIn: varchar("whatsapp_opt_in"), // phone number if opted in
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEmailSubscriptionSchema = createInsertSchema(emailSubscriptions).omit({
  id: true,
  createdAt: true,
});
export type InsertEmailSubscription = z.infer<typeof insertEmailSubscriptionSchema>;
export type EmailSubscription = typeof emailSubscriptions.$inferSelect;

// Prayer Requests
export const prayerRequests = pgTable("prayer_requests", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email"),
  request: text("request").notNull(),
  isPrivate: varchar("is_private").default("false"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrayerRequestSchema = createInsertSchema(prayerRequests).omit({
  id: true,
  createdAt: true,
});
export type InsertPrayerRequest = z.infer<typeof insertPrayerRequestSchema>;
export type PrayerRequest = typeof prayerRequests.$inferSelect;

// Testimonies
export const testimonies = pgTable("testimonies", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email"),
  title: varchar("title").notNull(),
  story: text("story").notNull(),
  category: varchar("category"), // 'healing', 'salvation', 'provision', 'deliverance'
  isApproved: varchar("is_approved").default("false"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonySchema = createInsertSchema(testimonies).omit({
  id: true,
  createdAt: true,
  isApproved: true,
});
export type InsertTestimony = z.infer<typeof insertTestimonySchema>;
export type Testimony = typeof testimonies.$inferSelect;

// Volunteer Sign-ups
export const volunteerSignups = pgTable("volunteer_signups", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  areas: text("areas").array(), // 'worship', 'tech', 'outreach', 'prayer', 'hospitality'
  message: text("message"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVolunteerSignupSchema = createInsertSchema(volunteerSignups).omit({
  id: true,
  createdAt: true,
});
export type InsertVolunteerSignup = z.infer<typeof insertVolunteerSignupSchema>;
export type VolunteerSignup = typeof volunteerSignups.$inferSelect;

// Mission Trip Registrations
export const missionRegistrations = pgTable("mission_registrations", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  tripInterest: varchar("trip_interest"), // specific trip or 'any'
  experience: text("experience"),
  message: text("message"),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMissionRegistrationSchema = createInsertSchema(missionRegistrations).omit({
  id: true,
  createdAt: true,
});
export type InsertMissionRegistration = z.infer<typeof insertMissionRegistrationSchema>;
export type MissionRegistration = typeof missionRegistrations.$inferSelect;

// ===== DISCIPLESHIP JOURNEYS =====

// Journeys - the main journey/path container
export const journeys = pgTable("journeys", {
  id: serial("id").primaryKey(),
  slug: varchar("slug").notNull().unique(),
  title: varchar("title").notNull(),
  subtitle: varchar("subtitle"),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // 'faith-basics', 'purpose', 'anxiety', 'relationships'
  durationDays: integer("duration_days").notNull(),
  level: varchar("level").notNull().default("beginner"), // 'beginner', 'intermediate', 'advanced'
  heroImageUrl: varchar("hero_image_url"),
  isPublished: varchar("is_published").default("true"),
});

export const insertJourneySchema = createInsertSchema(journeys).omit({
  id: true,
});
export type InsertJourney = z.infer<typeof insertJourneySchema>;
export type Journey = typeof journeys.$inferSelect;

// Journey Days - each day of the journey
export const journeyDays = pgTable("journey_days", {
  id: serial("id").primaryKey(),
  journeyId: integer("journey_id").notNull().references(() => journeys.id, { onDelete: 'cascade' }),
  dayNumber: integer("day_number").notNull(),
  title: varchar("title").notNull(),
  summary: text("summary"),
  estimatedMinutes: integer("estimated_minutes").default(10),
});

export const insertJourneyDaySchema = createInsertSchema(journeyDays).omit({
  id: true,
});
export type InsertJourneyDay = z.infer<typeof insertJourneyDaySchema>;
export type JourneyDay = typeof journeyDays.$inferSelect;

// Journey Steps - individual content blocks within a day
export const journeySteps = pgTable("journey_steps", {
  id: serial("id").primaryKey(),
  journeyDayId: integer("journey_day_id").notNull().references(() => journeyDays.id, { onDelete: 'cascade' }),
  stepOrder: integer("step_order").notNull(),
  stepType: varchar("step_type").notNull(), // 'scripture', 'teaching', 'reflection', 'action', 'prayer', 'video', 'audio', 'share'
  contentJson: jsonb("content_json").notNull(), // flexible content based on type
  mediaUrl: varchar("media_url"),
});

export const insertJourneyStepSchema = createInsertSchema(journeySteps).omit({
  id: true,
});
export type InsertJourneyStep = z.infer<typeof insertJourneyStepSchema>;
export type JourneyStep = typeof journeySteps.$inferSelect;

// User Journeys - tracking user enrollment and progress
export const userJourneys = pgTable("user_journeys", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  journeyId: integer("journey_id").notNull().references(() => journeys.id),
  status: varchar("status").notNull().default("active"), // 'active', 'completed', 'paused', 'abandoned'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  currentDay: integer("current_day").default(1),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
});

export const insertUserJourneySchema = createInsertSchema(userJourneys).omit({
  id: true,
  startedAt: true,
  lastActivityAt: true,
});
export type InsertUserJourney = z.infer<typeof insertUserJourneySchema>;
export type UserJourney = typeof userJourneys.$inferSelect;

// User Journey Days - tracking completion of each day
export const userJourneyDays = pgTable("user_journey_days", {
  id: serial("id").primaryKey(),
  userJourneyId: integer("user_journey_id").notNull().references(() => userJourneys.id, { onDelete: 'cascade' }),
  dayNumber: integer("day_number").notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  reflectionResponse: text("reflection_response"),
});

export const insertUserJourneyDaySchema = createInsertSchema(userJourneyDays).omit({
  id: true,
});
export type InsertUserJourneyDay = z.infer<typeof insertUserJourneyDaySchema>;
export type UserJourneyDay = typeof userJourneyDays.$inferSelect;

// User Streaks - tracking daily engagement
export const userStreaks = pgTable("user_streaks", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastCompletedDate: varchar("last_completed_date"), // YYYY-MM-DD format
});

export const insertUserStreakSchema = createInsertSchema(userStreaks);
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;
export type UserStreak = typeof userStreaks.$inferSelect;

// Badges - achievement definitions
export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  code: varchar("code").notNull().unique(), // 'STARTED_STRONG', 'CONSISTENT', 'MOMENTUM', 'FINISHER'
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  iconUrl: varchar("icon_url"),
  criteriaJson: jsonb("criteria_json"), // e.g. { type: 'streak', value: 3 }
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
});
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

// User Badges - earned badges
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: integer("badge_id").notNull().references(() => badges.id),
  awardedAt: timestamp("awarded_at").defaultNow(),
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  awardedAt: true,
});
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

// ===== ALPHA COHORT TABLES =====

// Alpha Cohorts - scheduled group-based journeys
export const alphaCohorts = pgTable("alpha_cohorts", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status").notNull().default("upcoming"), // 'upcoming', 'active', 'completed'
  capacity: integer("capacity").default(50),
  registrationClosesAt: timestamp("registration_closes_at"),
  heroImageUrl: varchar("hero_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAlphaCohortSchema = createInsertSchema(alphaCohorts).omit({
  id: true,
  createdAt: true,
});
export type InsertAlphaCohort = z.infer<typeof insertAlphaCohortSchema>;
export type AlphaCohort = typeof alphaCohorts.$inferSelect;

// Alpha Cohort Weeks - weekly schedule with content links
export const alphaCohortWeeks = pgTable("alpha_cohort_weeks", {
  id: serial("id").primaryKey(),
  cohortId: integer("cohort_id").notNull().references(() => alphaCohorts.id, { onDelete: 'cascade' }),
  weekNumber: integer("week_number").notNull(),
  theme: varchar("theme").notNull(), // e.g. "Who Is Jesus?"
  description: text("description"),
  videoUrl: varchar("video_url"), // Alpha Film Series episode URL
  watchPartyDate: timestamp("watch_party_date"),
  discussionPrompts: jsonb("discussion_prompts"), // array of prompts for small group
  prayerAction: text("prayer_action"), // weekly challenge
});

export const insertAlphaCohortWeekSchema = createInsertSchema(alphaCohortWeeks).omit({
  id: true,
});
export type InsertAlphaCohortWeek = z.infer<typeof insertAlphaCohortWeekSchema>;
export type AlphaCohortWeek = typeof alphaCohortWeeks.$inferSelect;

// Alpha Cohort Participants - enrollment and roles
export const alphaCohortParticipants = pgTable("alpha_cohort_participants", {
  id: serial("id").primaryKey(),
  cohortId: integer("cohort_id").notNull().references(() => alphaCohorts.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").notNull().default("participant"), // 'participant', 'facilitator', 'host'
  status: varchar("status").notNull().default("applied"), // 'applied', 'approved', 'waitlisted', 'removed'
  joinedAt: timestamp("joined_at").defaultNow(),
  groupNumber: integer("group_number"), // for small group assignment
});

export const insertAlphaCohortParticipantSchema = createInsertSchema(alphaCohortParticipants).omit({
  id: true,
  joinedAt: true,
});
export type InsertAlphaCohortParticipant = z.infer<typeof insertAlphaCohortParticipantSchema>;
export type AlphaCohortParticipant = typeof alphaCohortParticipants.$inferSelect;

// Alpha Cohort Week Progress - tracking individual progress per week
export const alphaCohortWeekProgress = pgTable("alpha_cohort_week_progress", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull().references(() => alphaCohortParticipants.id, { onDelete: 'cascade' }),
  weekNumber: integer("week_number").notNull(),
  watchedAt: timestamp("watched_at"),
  discussionNotes: text("discussion_notes"),
  prayerActionCompletedAt: timestamp("prayer_action_completed_at"),
  reflection: text("reflection"),
});

export const insertAlphaCohortWeekProgressSchema = createInsertSchema(alphaCohortWeekProgress).omit({
  id: true,
});
export type InsertAlphaCohortWeekProgress = z.infer<typeof insertAlphaCohortWeekProgressSchema>;
export type AlphaCohortWeekProgress = typeof alphaCohortWeekProgress.$inferSelect;

// ===== DISCIPLESHIP JOURNEY WEEKS (8-Week Programs) =====

// Journey Weeks - weekly structure for 8-week programs like "Finding Your Way Back"
export const journeyWeeks = pgTable("journey_weeks", {
  id: serial("id").primaryKey(),
  journeyId: integer("journey_id").notNull().references(() => journeys.id, { onDelete: 'cascade' }),
  weekNumber: integer("week_number").notNull(),
  title: varchar("title").notNull(),
  theme: varchar("theme"), // e.g. "Returning to God", "Jesus and His Way"
  scriptureRef: varchar("scripture_ref"), // e.g. "Zechariah 1:3", "John 13:34"
  scriptureText: text("scripture_text"), // The actual verse text
  estimatedMinutes: integer("estimated_minutes").default(50), // 45-60 min sessions
  weekType: varchar("week_type").default("session"), // 'session' (weeks 1-3), 'dbs' (weeks 4-8 Discovery Bible Study)
});

export const insertJourneyWeekSchema = createInsertSchema(journeyWeeks).omit({
  id: true,
});
export type InsertJourneyWeek = z.infer<typeof insertJourneyWeekSchema>;
export type JourneyWeek = typeof journeyWeeks.$inferSelect;

// Session Sections - the 45-60 min session flow components
// Flow: Welcome(5) → Scripture(5) → Micro-teach(10) → Discussion(15-20) → Practice(7-10) → I Will + Prayer(8)
export const sessionSections = pgTable("session_sections", {
  id: serial("id").primaryKey(),
  journeyWeekId: integer("journey_week_id").notNull().references(() => journeyWeeks.id, { onDelete: 'cascade' }),
  sectionOrder: integer("section_order").notNull(),
  sectionType: varchar("section_type").notNull(), // 'welcome', 'scripture', 'micro-teach', 'discussion', 'practice', 'i-will', 'prayer'
  title: varchar("title").notNull(),
  durationMinutes: integer("duration_minutes").default(5),
  contentJson: jsonb("content_json").notNull(), // Flexible content: prompts, questions, instructions
  facilitatorNotes: text("facilitator_notes"), // Tips for leading this section
});

export const insertSessionSectionSchema = createInsertSchema(sessionSections).omit({
  id: true,
});
export type InsertSessionSection = z.infer<typeof insertSessionSectionSchema>;
export type SessionSection = typeof sessionSections.$inferSelect;

// Mentor Prompts - D-1/D0/D2/D4/D6 rhythm with WhatsApp scripts
export const mentorPrompts = pgTable("mentor_prompts", {
  id: serial("id").primaryKey(),
  journeyWeekId: integer("journey_week_id").notNull().references(() => journeyWeeks.id, { onDelete: 'cascade' }),
  promptDay: varchar("prompt_day").notNull(), // 'D-1', 'D0', 'D2', 'D4', 'D6'
  promptType: varchar("prompt_type").notNull(), // 'reminder', 'recap', 'buddy-check', 'mentor-check', 'celebrate'
  title: varchar("title").notNull(),
  whatsappScript: text("whatsapp_script").notNull(), // Copy-paste ready message
  tips: text("tips"), // Additional guidance for mentors
});

export const insertMentorPromptSchema = createInsertSchema(mentorPrompts).omit({
  id: true,
});
export type InsertMentorPrompt = z.infer<typeof insertMentorPromptSchema>;
export type MentorPrompt = typeof mentorPrompts.$inferSelect;

// ===== PARTICIPANT RELATIONSHIPS =====

// Mentor Assignments - linking mentors to participants in a journey
export const mentorAssignments = pgTable("mentor_assignments", {
  id: serial("id").primaryKey(),
  userJourneyId: integer("user_journey_id").notNull().references(() => userJourneys.id, { onDelete: 'cascade' }),
  mentorUserId: varchar("mentor_user_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("active"), // 'active', 'paused', 'completed'
  assignedAt: timestamp("assigned_at").defaultNow(),
  notes: text("notes"),
});

export const insertMentorAssignmentSchema = createInsertSchema(mentorAssignments).omit({
  id: true,
  assignedAt: true,
});
export type InsertMentorAssignment = z.infer<typeof insertMentorAssignmentSchema>;
export type MentorAssignment = typeof mentorAssignments.$inferSelect;

// Buddy Pairs - accountability partners within a journey
export const buddyPairs = pgTable("buddy_pairs", {
  id: serial("id").primaryKey(),
  journeyId: integer("journey_id").notNull().references(() => journeys.id, { onDelete: 'cascade' }),
  userJourneyId1: integer("user_journey_id_1").notNull().references(() => userJourneys.id, { onDelete: 'cascade' }),
  userJourneyId2: integer("user_journey_id_2").notNull().references(() => userJourneys.id, { onDelete: 'cascade' }),
  status: varchar("status").notNull().default("active"), // 'active', 'dissolved'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBuddyPairSchema = createInsertSchema(buddyPairs).omit({
  id: true,
  createdAt: true,
});
export type InsertBuddyPair = z.infer<typeof insertBuddyPairSchema>;
export type BuddyPair = typeof buddyPairs.$inferSelect;

// ===== I WILL COMMITMENTS =====

// I Will Commitments - weekly specific commitments participants make
export const iWillCommitments = pgTable("i_will_commitments", {
  id: serial("id").primaryKey(),
  userJourneyId: integer("user_journey_id").notNull().references(() => userJourneys.id, { onDelete: 'cascade' }),
  weekNumber: integer("week_number").notNull(),
  commitment: text("commitment").notNull(), // "I will pray for 5 minutes each morning this week"
  whoToEncourage: varchar("who_to_encourage"), // "I will encourage [name]"
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  reflectionNotes: text("reflection_notes"), // How did it go?
});

export const insertIWillCommitmentSchema = createInsertSchema(iWillCommitments).omit({
  id: true,
  createdAt: true,
});
export type InsertIWillCommitment = z.infer<typeof insertIWillCommitmentSchema>;
export type IWillCommitment = typeof iWillCommitments.$inferSelect;

// Buddy Check-Ins - Win / Struggle / Prayer format
export const buddyCheckIns = pgTable("buddy_check_ins", {
  id: serial("id").primaryKey(),
  buddyPairId: integer("buddy_pair_id").notNull().references(() => buddyPairs.id, { onDelete: 'cascade' }),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  weekNumber: integer("week_number").notNull(),
  win: text("win"), // What went well this week
  struggle: text("struggle"), // What was challenging
  prayerRequest: text("prayer_request"), // How can I pray for you
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBuddyCheckInSchema = createInsertSchema(buddyCheckIns).omit({
  id: true,
  createdAt: true,
});
export type InsertBuddyCheckIn = z.infer<typeof insertBuddyCheckInSchema>;
export type BuddyCheckIn = typeof buddyCheckIns.$inferSelect;

// Mentor Check-In Logs - tracking when mentors follow the D-1/D2/D4/D6 rhythm
export const mentorCheckInLogs = pgTable("mentor_check_in_logs", {
  id: serial("id").primaryKey(),
  mentorAssignmentId: integer("mentor_assignment_id").notNull().references(() => mentorAssignments.id, { onDelete: 'cascade' }),
  weekNumber: integer("week_number").notNull(),
  promptDay: varchar("prompt_day").notNull(), // 'D-1', 'D0', 'D2', 'D4', 'D6'
  completedAt: timestamp("completed_at").defaultNow(),
  notes: text("notes"), // Any concerns or observations
  escalated: varchar("escalated").default("false"), // Flag if participant needs extra support
});

export const insertMentorCheckInLogSchema = createInsertSchema(mentorCheckInLogs).omit({
  id: true,
  completedAt: true,
});
export type InsertMentorCheckInLog = z.infer<typeof insertMentorCheckInLogSchema>;
export type MentorCheckInLog = typeof mentorCheckInLogs.$inferSelect;

// ===== VISION & GOAL PATHWAY =====

// Pathway Sessions - the main container for a user's vision journey
export const pathwaySessions = pgTable("pathway_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  seasonType: varchar("season_type").notNull(), // 'new_year' | 'new_season'
  seasonLabel: varchar("season_label"), // e.g. "2026 Reset", "Spring Reset"
  themeWord: varchar("theme_word"), // one word theme
  mode: varchar("mode").notNull().default("classic"), // 'classic' | 'faith'
  status: varchar("status").notNull().default("active"), // 'active' | 'completed' | 'archived'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertPathwaySessionSchema = createInsertSchema(pathwaySessions).omit({
  id: true,
  startedAt: true,
});
export type InsertPathwaySession = z.infer<typeof insertPathwaySessionSchema>;
export type PathwaySession = typeof pathwaySessions.$inferSelect;

// Wheel of Life Entries - scoring for each life category
export const wheelLifeEntries = pgTable("wheel_life_entries", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  categoryKey: varchar("category_key").notNull(), // 'health_energy', 'relationships', 'career_study', etc.
  score: integer("score").notNull(), // 1-10
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWheelLifeEntrySchema = createInsertSchema(wheelLifeEntries).omit({
  id: true,
  createdAt: true,
});
export type InsertWheelLifeEntry = z.infer<typeof insertWheelLifeEntrySchema>;
export type WheelLifeEntry = typeof wheelLifeEntries.$inferSelect;

// Focus Areas - user's selected priority areas from wheel
export const focusAreas = pgTable("focus_areas", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  categoryKey: varchar("category_key").notNull(),
  priority: integer("priority").default(1), // 1 = top priority, 2 = secondary
});

export const insertFocusAreaSchema = createInsertSchema(focusAreas).omit({
  id: true,
});
export type InsertFocusArea = z.infer<typeof insertFocusAreaSchema>;
export type FocusArea = typeof focusAreas.$inferSelect;

// Values Selection - user's chosen values and meanings
export const valuesSelection = pgTable("values_selection", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  values: jsonb("values").notNull(), // array of value strings
  topValueMeaning: text("top_value_meaning"), // what the top value means in daily life
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertValuesSelectionSchema = createInsertSchema(valuesSelection).omit({
  id: true,
  createdAt: true,
});
export type InsertValuesSelection = z.infer<typeof insertValuesSelectionSchema>;
export type ValuesSelection = typeof valuesSelection.$inferSelect;

// Vision Statement - user's life vision and outcomes
export const visionStatements = pgTable("vision_statements", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  feelings: text("feelings"), // "More focused and calm"
  identityStatement: text("identity_statement"), // "I'm becoming someone who..."
  topOutcomes: jsonb("top_outcomes"), // array of 3 outcomes
  seasonStatement: text("season_statement"), // full season statement
  faithIntention: text("faith_intention"), // optional for faith mode
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVisionStatementSchema = createInsertSchema(visionStatements).omit({
  id: true,
  createdAt: true,
});
export type InsertVisionStatement = z.infer<typeof insertVisionStatementSchema>;
export type VisionStatement = typeof visionStatements.$inferSelect;

// Purpose Flower - Ikigai-style purpose alignment
export const purposeFlower = pgTable("purpose_flower", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  passion: text("passion"), // What I love
  strengths: text("strengths"), // What I'm good at
  needs: text("needs"), // What the world needs
  rewards: text("rewards"), // What I can be rewarded for
  purposeStatement: text("purpose_statement"), // Center circle statement
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPurposeFlowerSchema = createInsertSchema(purposeFlower).omit({
  id: true,
  createdAt: true,
});
export type InsertPurposeFlower = z.infer<typeof insertPurposeFlowerSchema>;
export type PurposeFlower = typeof purposeFlower.$inferSelect;

// Vision Goals - SMART goals
export const visionGoals = pgTable("vision_goals", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  why: text("why"), // deeper reason
  specific: text("specific"),
  measurable: text("measurable"),
  metricName: varchar("metric_name"),
  metricTarget: varchar("metric_target"),
  achievable: text("achievable"),
  relevant: text("relevant"),
  deadline: timestamp("deadline"),
  firstStep: text("first_step"), // 48-hour first step
  obstaclesPlan: text("obstacles_plan"), // if I run into X, I will...
  status: varchar("status").notNull().default("active"), // 'active' | 'paused' | 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVisionGoalSchema = createInsertSchema(visionGoals).omit({
  id: true,
  createdAt: true,
});
export type InsertVisionGoal = z.infer<typeof insertVisionGoalSchema>;
export type VisionGoal = typeof visionGoals.$inferSelect;

// Goal Milestones - tracking milestones for goals
export const goalMilestones = pgTable("goal_milestones", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull().references(() => visionGoals.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  dueDate: timestamp("due_date"),
  successCriteria: text("success_criteria"),
  completedAt: timestamp("completed_at"),
});

export const insertGoalMilestoneSchema = createInsertSchema(goalMilestones).omit({
  id: true,
});
export type InsertGoalMilestone = z.infer<typeof insertGoalMilestoneSchema>;
export type GoalMilestone = typeof goalMilestones.$inferSelect;

// 90-Day Plan
export const ninetyDayPlans = pgTable("ninety_day_plans", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  focusOutcome: text("focus_outcome"), // #1 focus outcome
  keyResults: jsonb("key_results"), // array of 3 key results
  weeklyAnchors: jsonb("weekly_anchors"), // repeatable weekly actions
  scheduleAnchors: jsonb("schedule_anchors"), // planning day, deep work, etc.
  accountabilityPlan: text("accountability_plan"),
  stuckPlan: text("stuck_plan"), // "If I get stuck, I will..."
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNinetyDayPlanSchema = createInsertSchema(ninetyDayPlans).omit({
  id: true,
  createdAt: true,
});
export type InsertNinetyDayPlan = z.infer<typeof insertNinetyDayPlanSchema>;
export type NinetyDayPlan = typeof ninetyDayPlans.$inferSelect;

// Vision Habits - trackable habits
export const visionHabits = pgTable("vision_habits", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  frequency: varchar("frequency").notNull().default("daily"), // 'daily' | 'weekly'
  targetPerWeek: integer("target_per_week").default(7),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVisionHabitSchema = createInsertSchema(visionHabits).omit({
  id: true,
  createdAt: true,
});
export type InsertVisionHabit = z.infer<typeof insertVisionHabitSchema>;
export type VisionHabit = typeof visionHabits.$inferSelect;

// Habit Logs - daily habit completion
export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull().references(() => visionHabits.id, { onDelete: 'cascade' }),
  date: varchar("date").notNull(), // YYYY-MM-DD
  completed: boolean("completed").notNull().default(false),
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({
  id: true,
});
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;

// Daily Check-ins
export const dailyCheckins = pgTable("daily_checkins", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  date: varchar("date").notNull(), // YYYY-MM-DD
  energy: integer("energy"), // 1-5 slider
  todayFocus: text("today_focus"),
  note: text("note"),
  prayerNote: text("prayer_note"), // faith mode only
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDailyCheckinSchema = createInsertSchema(dailyCheckins).omit({
  id: true,
  createdAt: true,
});
export type InsertDailyCheckin = z.infer<typeof insertDailyCheckinSchema>;
export type DailyCheckin = typeof dailyCheckins.$inferSelect;

// Weekly Reviews
export const weeklyReviews = pgTable("weekly_reviews", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  weekStartDate: varchar("week_start_date").notNull(), // YYYY-MM-DD
  win: text("win"),
  lesson: text("lesson"),
  obstacle: text("obstacle"),
  adjustment: text("adjustment"),
  nextWeekTop3: jsonb("next_week_top3"), // array of 3 priorities
  gratitude: text("gratitude"), // faith mode
  prayerFocus: text("prayer_focus"), // faith mode
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWeeklyReviewSchema = createInsertSchema(weeklyReviews).omit({
  id: true,
  createdAt: true,
});
export type InsertWeeklyReview = z.infer<typeof insertWeeklyReviewSchema>;
export type WeeklyReview = typeof weeklyReviews.$inferSelect;

// Vision Exports - PDF export records
export const visionExports = pgTable("vision_exports", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  exportType: varchar("export_type").notNull(), // 'booklet' | 'plan' | 'habits' | 'visionboard'
  url: varchar("url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertVisionExportSchema = createInsertSchema(visionExports).omit({
  id: true,
  createdAt: true,
});
export type InsertVisionExport = z.infer<typeof insertVisionExportSchema>;
export type VisionExport = typeof visionExports.$inferSelect;

// ===== GROWTH TOOLS: TRACKS & MODULES =====

// Tracks - Personal Mastery, Communication & Influence, Leadership Impact
export const tracks = pgTable("tracks", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(), // 'personal_mastery', 'communication_influence', 'leadership_impact'
  title: varchar("title").notNull(),
  description: text("description"),
  iconKey: varchar("icon_key"), // lucide icon name
  orderIndex: integer("order_index").notNull().default(0),
  isEnabled: boolean("is_enabled").default(true),
});

export const insertTrackSchema = createInsertSchema(tracks).omit({ id: true });
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracks.$inferSelect;

// Modules within tracks
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull().references(() => tracks.id, { onDelete: 'cascade' }),
  key: varchar("key").notNull().unique(), // 'strengths_assessment', 'styles_quiz', 'eq_check', 'wdep', 'sca', 'mini360'
  title: varchar("title").notNull(),
  description: text("description"),
  moduleType: varchar("module_type").notNull(), // 'lesson', 'assessment', 'practice', 'lab', 'export'
  iconKey: varchar("icon_key"),
  orderIndex: integer("order_index").notNull().default(0),
  prerequisites: jsonb("prerequisites"), // array of module keys
  estimatedMinutes: integer("estimated_minutes").default(10),
  isLockedByDefault: boolean("is_locked_by_default").default(false),
  isEnabled: boolean("is_enabled").default(true),
});

export const insertModuleSchema = createInsertSchema(modules).omit({ id: true });
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Module = typeof modules.$inferSelect;

// User module progress
export const userModuleProgress = pgTable("user_module_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  moduleId: integer("module_id").notNull().references(() => modules.id, { onDelete: 'cascade' }),
  status: varchar("status").notNull().default("not_started"), // 'not_started', 'in_progress', 'completed'
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastViewedAt: timestamp("last_viewed_at"),
});

export const insertUserModuleProgressSchema = createInsertSchema(userModuleProgress).omit({ id: true });
export type InsertUserModuleProgress = z.infer<typeof insertUserModuleProgressSchema>;
export type UserModuleProgress = typeof userModuleProgress.$inferSelect;

// ===== ASSESSMENT ENGINE (config-driven) =====

// Assessments - reusable across tools
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(), // 'strengths_cards_v1', 'styles_v1', 'eq_micro_v1'
  title: varchar("title").notNull(),
  description: text("description"),
  version: integer("version").notNull().default(1),
  scoringModel: jsonb("scoring_model"), // how to calculate scores
  isEnabled: boolean("is_enabled").default(true),
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({ id: true });
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;

// Assessment questions
export const assessmentQuestions = pgTable("assessment_questions", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull().references(() => assessments.id, { onDelete: 'cascade' }),
  key: varchar("key").notNull(),
  promptClassic: text("prompt_classic").notNull(),
  promptFaith: text("prompt_faith"), // optional faith-mode prompt
  inputType: varchar("input_type").notNull(), // 'likert', 'single_choice', 'multi_choice', 'text', 'scenario'
  options: jsonb("options"), // for choice questions
  dimensionKey: varchar("dimension_key"), // for scoring by dimension
  reverseScored: boolean("reverse_scored").default(false),
  orderIndex: integer("order_index").notNull().default(0),
});

export const insertAssessmentQuestionSchema = createInsertSchema(assessmentQuestions).omit({ id: true });
export type InsertAssessmentQuestion = z.infer<typeof insertAssessmentQuestionSchema>;
export type AssessmentQuestion = typeof assessmentQuestions.$inferSelect;

// Assessment responses (user's attempt at an assessment)
export const assessmentResponses = pgTable("assessment_responses", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull().references(() => assessments.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  status: varchar("status").notNull().default("in_progress"), // 'in_progress', 'completed'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertAssessmentResponseSchema = createInsertSchema(assessmentResponses).omit({ id: true, startedAt: true });
export type InsertAssessmentResponse = z.infer<typeof insertAssessmentResponseSchema>;
export type AssessmentResponse = typeof assessmentResponses.$inferSelect;

// Assessment answers
export const assessmentAnswers = pgTable("assessment_answers", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => assessmentResponses.id, { onDelete: 'cascade' }),
  questionId: integer("question_id").notNull().references(() => assessmentQuestions.id, { onDelete: 'cascade' }),
  valueNumber: integer("value_number"), // for likert/rating
  valueText: text("value_text"), // for text answers
  valueJson: jsonb("value_json"), // for multi-choice or complex
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssessmentAnswerSchema = createInsertSchema(assessmentAnswers).omit({ id: true, createdAt: true });
export type InsertAssessmentAnswer = z.infer<typeof insertAssessmentAnswerSchema>;
export type AssessmentAnswer = typeof assessmentAnswers.$inferSelect;

// Assessment scores (calculated per dimension)
export const assessmentScores = pgTable("assessment_scores", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => assessmentResponses.id, { onDelete: 'cascade' }),
  dimensionKey: varchar("dimension_key").notNull(),
  scoreRaw: integer("score_raw"),
  scoreNormalized: integer("score_normalized"), // 0-100
  band: varchar("band"), // 'low', 'mid', 'high'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssessmentScoreSchema = createInsertSchema(assessmentScores).omit({ id: true, createdAt: true });
export type InsertAssessmentScore = z.infer<typeof insertAssessmentScoreSchema>;
export type AssessmentScore = typeof assessmentScores.$inferSelect;

// Assessment insights (AI or rule-based)
export const assessmentInsights = pgTable("assessment_insights", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => assessmentResponses.id, { onDelete: 'cascade' }),
  headline: varchar("headline"),
  insightText: text("insight_text"),
  risksText: text("risks_text"),
  recommendedPracticeKeys: jsonb("recommended_practice_keys"), // array
  recommendedNextSteps: jsonb("recommended_next_steps"), // array
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssessmentInsightSchema = createInsertSchema(assessmentInsights).omit({ id: true, createdAt: true });
export type InsertAssessmentInsight = z.infer<typeof insertAssessmentInsightSchema>;
export type AssessmentInsight = typeof assessmentInsights.$inferSelect;

// ===== STRENGTHS TOOL =====

// Strengths catalog (24 VIA-style character strengths)
export const strengthsCatalog = pgTable("strengths_catalog", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(), // 'curiosity', 'discipline', 'empathy', etc.
  name: varchar("name").notNull(),
  category: varchar("category"), // 'wisdom', 'courage', 'humanity', 'justice', 'temperance', 'transcendence'
  definition: text("definition").notNull(),
  healthyUse: text("healthy_use"),
  overuseRisk: text("overuse_risk"),
  underuseRisk: text("underuse_risk"),
  suggestedHabits: jsonb("suggested_habits"), // array
  suggestedRoles: jsonb("suggested_roles"), // array
  suggestedBoundaries: jsonb("suggested_boundaries"), // array
  iconKey: varchar("icon_key"),
  orderIndex: integer("order_index").default(0),
});

export const insertStrengthsCatalogSchema = createInsertSchema(strengthsCatalog).omit({ id: true });
export type InsertStrengthsCatalog = z.infer<typeof insertStrengthsCatalogSchema>;
export type StrengthsCatalog = typeof strengthsCatalog.$inferSelect;

// User strengths (top 5-10 selected)
export const userStrengths = pgTable("user_strengths", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  strengthKey: varchar("strength_key").notNull(),
  rank: integer("rank").notNull(), // 1-10
  selfRating: integer("self_rating"), // 1-5 how strongly they identify
  evidenceNote: text("evidence_note"), // example of when they used it
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserStrengthSchema = createInsertSchema(userStrengths).omit({ id: true, createdAt: true });
export type InsertUserStrength = z.infer<typeof insertUserStrengthSchema>;
export type UserStrength = typeof userStrengths.$inferSelect;

// ===== 4 STYLES (DISC-inspired) =====

// Style profiles (Driver, Connector, Stabilizer, Analyst)
export const stylesProfiles = pgTable("styles_profiles", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(), // 'driver', 'connector', 'stabilizer', 'analyst'
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  whenStrong: text("when_strong"),
  whenStressed: text("when_stressed"),
  whatTheyNeed: text("what_they_need"),
  howToWorkWith: jsonb("how_to_work_with"), // object keyed by other style keys
  communicationTips: jsonb("communication_tips"), // array
  colorHex: varchar("color_hex"),
  iconKey: varchar("icon_key"),
});

export const insertStylesProfileSchema = createInsertSchema(stylesProfiles).omit({ id: true });
export type InsertStylesProfile = z.infer<typeof insertStylesProfileSchema>;
export type StylesProfile = typeof stylesProfiles.$inferSelect;

// User styles
export const userStyles = pgTable("user_styles", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  primaryStyleKey: varchar("primary_style_key").notNull(),
  secondaryStyleKey: varchar("secondary_style_key"),
  stressStyleKey: varchar("stress_style_key"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserStyleSchema = createInsertSchema(userStyles).omit({ id: true, createdAt: true });
export type InsertUserStyle = z.infer<typeof insertUserStyleSchema>;
export type UserStyle = typeof userStyles.$inferSelect;

// ===== EQ MICRO-SKILLS =====

// EQ domains
export const eqDomains = pgTable("eq_domains", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(), // 'self_awareness', 'self_management', 'social_awareness', 'relationship_management'
  name: varchar("name").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").default(0),
});

export const insertEqDomainSchema = createInsertSchema(eqDomains).omit({ id: true });
export type InsertEqDomain = z.infer<typeof insertEqDomainSchema>;
export type EqDomain = typeof eqDomains.$inferSelect;

// User EQ scores
export const userEqScores = pgTable("user_eq_scores", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").notNull().references(() => assessmentResponses.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  domainKey: varchar("domain_key").notNull(),
  scoreNormalized: integer("score_normalized"), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserEqScoreSchema = createInsertSchema(userEqScores).omit({ id: true, createdAt: true });
export type InsertUserEqScore = z.infer<typeof insertUserEqScoreSchema>;
export type UserEqScore = typeof userEqScores.$inferSelect;

// Practice library (micro-exercises for all tools)
export const practiceLibrary = pgTable("practice_library", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  title: varchar("title").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").default(5),
  domainKeys: jsonb("domain_keys"), // array of EQ domains or strength categories
  instructionsClassic: text("instructions_classic").notNull(),
  instructionsFaith: text("instructions_faith"),
  contraindications: text("contraindications"),
  tags: jsonb("tags"), // array
  orderIndex: integer("order_index").default(0),
});

export const insertPracticeLibrarySchema = createInsertSchema(practiceLibrary).omit({ id: true });
export type InsertPracticeLibrary = z.infer<typeof insertPracticeLibrarySchema>;
export type PracticeLibraryItem = typeof practiceLibrary.$inferSelect;

// User practice logs
export const userPracticeLogs = pgTable("user_practice_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  practiceKey: varchar("practice_key").notNull(),
  date: varchar("date").notNull(), // YYYY-MM-DD
  completed: boolean("completed").default(false),
  reflectionNote: text("reflection_note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserPracticeLogSchema = createInsertSchema(userPracticeLogs).omit({ id: true, createdAt: true });
export type InsertUserPracticeLog = z.infer<typeof insertUserPracticeLogSchema>;
export type UserPracticeLog = typeof userPracticeLogs.$inferSelect;

// ===== WDEP (Goal Realization) =====

// WDEP entries - main container
export const wdepEntries = pgTable("wdep_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  linkedGoalId: integer("linked_goal_id").references(() => visionGoals.id, { onDelete: 'set null' }),
  title: varchar("title"),
  status: varchar("status").notNull().default("in_progress"), // 'in_progress', 'active_plan', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWdepEntrySchema = createInsertSchema(wdepEntries).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWdepEntry = z.infer<typeof insertWdepEntrySchema>;
export type WdepEntry = typeof wdepEntries.$inferSelect;

// WDEP Wants
export const wdepWants = pgTable("wdep_wants", {
  id: serial("id").primaryKey(),
  wdepEntryId: integer("wdep_entry_id").notNull().references(() => wdepEntries.id, { onDelete: 'cascade' }),
  wantPrimary: text("want_primary"),
  wantInsteadOfProblem: text("want_instead_of_problem"),
  qualityLifePicture: text("quality_life_picture"),
  othersWantForYou: text("others_want_for_you"),
  sessionHope: text("session_hope"),
  faithReflection: text("faith_reflection"),
});

export const insertWdepWantsSchema = createInsertSchema(wdepWants).omit({ id: true });
export type InsertWdepWants = z.infer<typeof insertWdepWantsSchema>;
export type WdepWants = typeof wdepWants.$inferSelect;

// WDEP Doing
export const wdepDoing = pgTable("wdep_doing", {
  id: serial("id").primaryKey(),
  wdepEntryId: integer("wdep_entry_id").notNull().references(() => wdepEntries.id, { onDelete: 'cascade' }),
  acting: text("acting"),
  thinking: text("thinking"),
  feeling: text("feeling"),
  healthImpact: text("health_impact"),
  faithReflection: text("faith_reflection"),
});

export const insertWdepDoingSchema = createInsertSchema(wdepDoing).omit({ id: true });
export type InsertWdepDoing = z.infer<typeof insertWdepDoingSchema>;
export type WdepDoing = typeof wdepDoing.$inferSelect;

// WDEP Evaluation
export const wdepEvaluation = pgTable("wdep_evaluation", {
  id: serial("id").primaryKey(),
  wdepEntryId: integer("wdep_entry_id").notNull().references(() => wdepEntries.id, { onDelete: 'cascade' }),
  helping: boolean("helping"),
  directionScore: integer("direction_score"), // -2 to +2 (away to toward)
  commitmentScore: integer("commitment_score"), // 1-5
  costOfStayingSame: text("cost_of_staying_same"),
  faithReflection: text("faith_reflection"),
});

export const insertWdepEvaluationSchema = createInsertSchema(wdepEvaluation).omit({ id: true });
export type InsertWdepEvaluation = z.infer<typeof insertWdepEvaluationSchema>;
export type WdepEvaluation = typeof wdepEvaluation.$inferSelect;

// WDEP Plan
export const wdepPlan = pgTable("wdep_plan", {
  id: serial("id").primaryKey(),
  wdepEntryId: integer("wdep_entry_id").notNull().references(() => wdepEntries.id, { onDelete: 'cascade' }),
  doDifferently: text("do_differently"),
  effortLevel: integer("effort_level"), // 1-5
  achievableThisWeek: boolean("achievable_this_week"),
  proofOfDone: text("proof_of_done"),
  startNowAction: text("start_now_action"),
  startNowCompletedAt: timestamp("start_now_completed_at"),
});

export const insertWdepPlanSchema = createInsertSchema(wdepPlan).omit({ id: true });
export type InsertWdepPlan = z.infer<typeof insertWdepPlanSchema>;
export type WdepPlan = typeof wdepPlan.$inferSelect;

// WDEP Experiments (7-day challenges)
export const wdepExperiments = pgTable("wdep_experiments", {
  id: serial("id").primaryKey(),
  wdepEntryId: integer("wdep_entry_id").notNull().references(() => wdepEntries.id, { onDelete: 'cascade' }),
  dailyAction: text("daily_action"),
  daysTarget: integer("days_target").default(7),
  startDate: varchar("start_date"), // YYYY-MM-DD
  endDate: varchar("end_date"), // YYYY-MM-DD
  completedDays: integer("completed_days").default(0),
  reflectionDay7: text("reflection_day7"),
  status: varchar("status").default("active"), // 'active', 'completed', 'abandoned'
});

export const insertWdepExperimentSchema = createInsertSchema(wdepExperiments).omit({ id: true });
export type InsertWdepExperiment = z.infer<typeof insertWdepExperimentSchema>;
export type WdepExperiment = typeof wdepExperiments.$inferSelect;

// WDEP Experiment logs
export const wdepExperimentLogs = pgTable("wdep_experiment_logs", {
  id: serial("id").primaryKey(),
  experimentId: integer("experiment_id").notNull().references(() => wdepExperiments.id, { onDelete: 'cascade' }),
  date: varchar("date").notNull(), // YYYY-MM-DD
  completed: boolean("completed").default(false),
  note: text("note"),
});

export const insertWdepExperimentLogSchema = createInsertSchema(wdepExperimentLogs).omit({ id: true });
export type InsertWdepExperimentLog = z.infer<typeof insertWdepExperimentLogSchema>;
export type WdepExperimentLog = typeof wdepExperimentLogs.$inferSelect;

// ===== SELF-CONCORDANT ACTION (Motivation Booster) =====

// SCA exercises
export const scaExercises = pgTable("sca_exercises", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: integer("session_id").references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  linkedGoalId: integer("linked_goal_id").references(() => visionGoals.id, { onDelete: 'set null' }),
  activity: text("activity").notNull(), // the important but unenjoyable activity
  importanceReason: text("importance_reason"),
  motivationStart: integer("motivation_start"), // 0-10
  motivationEnd: integer("motivation_end"), // 0-10 after completing focus list
  status: varchar("status").default("in_progress"), // 'in_progress', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertScaExerciseSchema = createInsertSchema(scaExercises).omit({ id: true, createdAt: true });
export type InsertScaExercise = z.infer<typeof insertScaExerciseSchema>;
export type ScaExercise = typeof scaExercises.$inferSelect;

// SCA focus items (the 1-10 reasons)
export const scaFocusItems = pgTable("sca_focus_items", {
  id: serial("id").primaryKey(),
  scaExerciseId: integer("sca_exercise_id").notNull().references(() => scaExercises.id, { onDelete: 'cascade' }),
  itemIndex: integer("item_index").notNull(), // 1-10
  focusText: text("focus_text").notNull(), // "Carrying out this activity will allow me to..."
  motivationAfter: integer("motivation_after"), // 0-10 after adding this focus
});

export const insertScaFocusItemSchema = createInsertSchema(scaFocusItems).omit({ id: true });
export type InsertScaFocusItem = z.infer<typeof insertScaFocusItemSchema>;
export type ScaFocusItem = typeof scaFocusItems.$inferSelect;

// ===== MINI-360 FEEDBACK (Phase 4) =====

// Feedback campaigns
export const feedbackCampaigns = pgTable("feedback_campaigns", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => pathwaySessions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title"),
  status: varchar("status").notNull().default("draft"), // 'draft', 'sent', 'collecting', 'ready', 'debriefed', 'archived'
  anonymityLevel: varchar("anonymity_level").default("anonymous_default"), // 'anonymous_default', 'named_allowed', 'named_required'
  raterLimit: integer("rater_limit").default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFeedbackCampaignSchema = createInsertSchema(feedbackCampaigns).omit({ id: true, createdAt: true });
export type InsertFeedbackCampaign = z.infer<typeof insertFeedbackCampaignSchema>;
export type FeedbackCampaign = typeof feedbackCampaigns.$inferSelect;

// Feedback invites
export const feedbackInvites = pgTable("feedback_invites", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => feedbackCampaigns.id, { onDelete: 'cascade' }),
  token: varchar("token").notNull().unique(), // secure random token
  inviteeName: varchar("invitee_name"),
  inviteeEmail: varchar("invitee_email").notNull(),
  relationshipType: varchar("relationship_type"), // 'peer', 'mentor', 'friend', 'family', 'manager', 'other'
  status: varchar("status").notNull().default("created"), // 'created', 'sent', 'opened', 'submitted', 'expired', 'revoked'
  sentAt: timestamp("sent_at"),
  openedAt: timestamp("opened_at"),
  submittedAt: timestamp("submitted_at"),
  expiresAt: timestamp("expires_at"),
});

export const insertFeedbackInviteSchema = createInsertSchema(feedbackInvites).omit({ id: true });
export type InsertFeedbackInvite = z.infer<typeof insertFeedbackInviteSchema>;
export type FeedbackInvite = typeof feedbackInvites.$inferSelect;

// Feedback answers
export const feedbackAnswers = pgTable("feedback_answers", {
  id: serial("id").primaryKey(),
  inviteId: integer("invite_id").notNull().references(() => feedbackInvites.id, { onDelete: 'cascade' }),
  campaignId: integer("campaign_id").notNull().references(() => feedbackCampaigns.id, { onDelete: 'cascade' }),
  questionKey: varchar("question_key").notNull(),
  rating: integer("rating"), // 1-5
  comment: text("comment"),
});

export const insertFeedbackAnswerSchema = createInsertSchema(feedbackAnswers).omit({ id: true });
export type InsertFeedbackAnswer = z.infer<typeof insertFeedbackAnswerSchema>;
export type FeedbackAnswer = typeof feedbackAnswers.$inferSelect;

// Self-assessment for 360
export const feedbackSelfAssessment = pgTable("feedback_self_assessment", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => feedbackCampaigns.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  questionKey: varchar("question_key").notNull(),
  rating: integer("rating"),
  comment: text("comment"),
});

export const insertFeedbackSelfAssessmentSchema = createInsertSchema(feedbackSelfAssessment).omit({ id: true });
export type InsertFeedbackSelfAssessment = z.infer<typeof insertFeedbackSelfAssessmentSchema>;
export type FeedbackSelfAssessment = typeof feedbackSelfAssessment.$inferSelect;

// Feedback aggregates
export const feedbackAggregates = pgTable("feedback_aggregates", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => feedbackCampaigns.id, { onDelete: 'cascade' }),
  dimensionKey: varchar("dimension_key").notNull(),
  avgRating: integer("avg_rating"), // stored as integer * 10 for precision
  distributionJson: jsonb("distribution_json"),
  themesJson: jsonb("themes_json"), // qualitative themes
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFeedbackAggregateSchema = createInsertSchema(feedbackAggregates).omit({ id: true, createdAt: true });
export type InsertFeedbackAggregate = z.infer<typeof insertFeedbackAggregateSchema>;
export type FeedbackAggregate = typeof feedbackAggregates.$inferSelect;

// Safeguarding reports
export const safeguardingReports = pgTable("safeguarding_reports", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => feedbackCampaigns.id, { onDelete: 'set null' }),
  inviteId: integer("invite_id").references(() => feedbackInvites.id, { onDelete: 'set null' }),
  reporterUserId: varchar("reporter_user_id").references(() => users.id),
  reason: varchar("reason").notNull(),
  detail: text("detail"),
  status: varchar("status").notNull().default("open"), // 'open', 'reviewed', 'actioned'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSafeguardingReportSchema = createInsertSchema(safeguardingReports).omit({ id: true, createdAt: true });
export type InsertSafeguardingReport = z.infer<typeof insertSafeguardingReportSchema>;
export type SafeguardingReport = typeof safeguardingReports.$inferSelect;

// ===== SESSION BOOKING (Coaching/Mentoring Sessions) =====

// Coach/mentor profiles
export const coachProfiles = pgTable("coach_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  displayName: varchar("display_name").notNull(),
  bio: text("bio"),
  specialties: text("specialties").array(), // areas of expertise
  sessionTypes: text("session_types").array(), // 'one-on-one', 'group', 'workshop'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCoachProfileSchema = createInsertSchema(coachProfiles).omit({ id: true, createdAt: true });
export type InsertCoachProfile = z.infer<typeof insertCoachProfileSchema>;
export type CoachProfile = typeof coachProfiles.$inferSelect;

// Available time slots
export const sessionSlots = pgTable("session_slots", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => coachProfiles.id, { onDelete: 'cascade' }),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isBooked: boolean("is_booked").default(false),
  sessionType: varchar("session_type").default("one-on-one"), // 'one-on-one', 'group'
  maxParticipants: integer("max_participants").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSessionSlotSchema = createInsertSchema(sessionSlots).omit({ id: true, createdAt: true });
export type InsertSessionSlot = z.infer<typeof insertSessionSlotSchema>;
export type SessionSlot = typeof sessionSlots.$inferSelect;

// Session booking requests
export const sessionBookings = pgTable("session_bookings", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => pathwaySessions.id, { onDelete: 'set null' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  slotId: integer("slot_id").references(() => sessionSlots.id, { onDelete: 'set null' }),
  coachId: integer("coach_id").references(() => coachProfiles.id, { onDelete: 'set null' }),
  status: varchar("status").notNull().default("requested"), // 'requested', 'confirmed', 'completed', 'cancelled', 'no-show'
  topic: varchar("topic"), // what they want to discuss
  goals: text("goals"), // what they hope to achieve
  preferredTimes: text("preferred_times").array(), // if no specific slot selected
  notes: text("notes"), // user notes
  coachNotes: text("coach_notes"), // private coach notes
  meetingLink: varchar("meeting_link"), // zoom/meet link
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSessionBookingSchema = createInsertSchema(sessionBookings).omit({ id: true, createdAt: true });
export type InsertSessionBooking = z.infer<typeof insertSessionBookingSchema>;
export type SessionBooking = typeof sessionBookings.$inferSelect;

// Session follow-up notes
export const sessionFollowUps = pgTable("session_follow_ups", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => sessionBookings.id, { onDelete: 'cascade' }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  isPrivate: boolean("is_private").default(false), // coach-only notes
  actionItems: text("action_items").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSessionFollowUpSchema = createInsertSchema(sessionFollowUps).omit({ id: true, createdAt: true });
export type InsertSessionFollowUp = z.infer<typeof insertSessionFollowUpSchema>;
export type SessionFollowUp = typeof sessionFollowUps.$inferSelect;

// ===== DAILY REFLECTIONS =====

// Daily reflection prompts (admin-created content pool)
export const dailyReflections = pgTable("daily_reflections", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content").notNull(), // the thought/reflection text
  scripture: varchar("scripture"), // e.g. "Psalm 23:1"
  scriptureText: text("scripture_text"), // the actual verse text
  category: varchar("category").default("general"), // 'faith', 'growth', 'relationships', 'purpose'
  scheduledDate: timestamp("scheduled_date"), // specific date to show (null = random pool)
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDailyReflectionSchema = createInsertSchema(dailyReflections).omit({ id: true, createdAt: true });
export type InsertDailyReflection = z.infer<typeof insertDailyReflectionSchema>;
export type DailyReflection = typeof dailyReflections.$inferSelect;

// User reflection engagement logs
export const reflectionLogs = pgTable("reflection_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  reflectionId: integer("reflection_id").notNull().references(() => dailyReflections.id, { onDelete: 'cascade' }),
  viewedAt: timestamp("viewed_at").defaultNow(),
  engagedAt: timestamp("engaged_at"), // when they interacted (journal, share, etc)
  journalEntry: text("journal_entry"), // optional personal reflection
  reaction: varchar("reaction"), // 'amen', 'thankful', 'inspired', 'challenged'
});

export const insertReflectionLogSchema = createInsertSchema(reflectionLogs).omit({ id: true, viewedAt: true });
export type InsertReflectionLog = z.infer<typeof insertReflectionLogSchema>;
export type ReflectionLog = typeof reflectionLogs.$inferSelect;

// ===== DIGITAL MISSION HUB - ONLINE-FIRST OUTREACH =====

// Pillars - consistent tagging and filtering (Biblical Truth, Outpouring, Harvest, Without Walls)
export const missionPillars = pgTable("mission_pillars", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(), // 'biblical_truth', 'outpouring', 'harvest', 'without_walls'
  name: varchar("name").notNull(),
  subtitle: varchar("subtitle"), // e.g. "Joel 2" for Outpouring
  scriptureRef: varchar("scripture_ref"), // e.g. "Joel 2:28-29"
  description: text("description"),
  colorHex: varchar("color_hex"), // brand color
  iconKey: varchar("icon_key"),
  orderIndex: integer("order_index").default(0),
});

export const insertMissionPillarSchema = createInsertSchema(missionPillars).omit({ id: true });
export type InsertMissionPillar = z.infer<typeof insertMissionPillarSchema>;
export type MissionPillar = typeof missionPillars.$inferSelect;

// Mission Profiles - "Start Your Mission" personalization + commitment
export const missionProfiles = pgTable("mission_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  primaryBurden: varchar("primary_burden"), // 'nations', 'youth', 'evangelism', 'discipleship', 'mercy', 'prayer'
  actionsPreference: text("actions_preference").array(), // ['pray', 'give', 'go']
  availabilityMinutes: integer("availability_minutes").default(10), // 5, 10, 15, 30
  givingCapacity: varchar("giving_capacity"), // 'low', 'medium', 'high'
  travelReadiness: varchar("travel_readiness").default("exploring"), // 'not_ready', 'exploring', 'ready'
  skills: text("skills").array(), // ['teaching', 'music', 'admin', 'evangelism', 'media', 'tech']
  commitmentLevel: varchar("commitment_level").default("explorer"), // 'explorer', 'builder', 'sent'
  pillarAffinities: jsonb("pillar_affinities"), // { biblical_truth: 0.8, harvest: 0.9 }
  prayerReminderTime: varchar("prayer_reminder_time"), // HH:MM format
  weeklyPrayerGoal: integer("weekly_prayer_goal").default(5), // days per week
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMissionProfileSchema = createInsertSchema(missionProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMissionProfile = z.infer<typeof insertMissionProfileSchema>;
export type MissionProfile = typeof missionProfiles.$inferSelect;

// Mission Plans - weekly direction + commitment tracking
export const missionPlans = pgTable("mission_plans", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  weekStartDate: varchar("week_start_date").notNull(), // YYYY-MM-DD
  prayerGoalDays: integer("prayer_goal_days").default(5),
  giveGoalAmount: integer("give_goal_amount"), // optional
  goGoalStep: varchar("go_goal_step"), // 'training', 'interest', 'outreach'
  prayerDaysCompleted: integer("prayer_days_completed").default(0),
  reflectionNotes: text("reflection_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMissionPlanSchema = createInsertSchema(missionPlans).omit({ id: true, createdAt: true });
export type InsertMissionPlan = z.infer<typeof insertMissionPlanSchema>;
export type MissionPlan = typeof missionPlans.$inferSelect;

// Focuses - People Groups / Nations / Cities for prayer adoption
export const missionFocuses = pgTable("mission_focuses", {
  id: serial("id").primaryKey(),
  type: varchar("type").notNull().default("people_group"), // 'people_group', 'nation', 'city', 'region'
  name: varchar("name").notNull(),
  region: varchar("region"), // geographic region
  country: varchar("country"),
  languageGroup: varchar("language_group"),
  population: integer("population"),
  summary: text("summary"),
  prayerNeeds: jsonb("prayer_needs"), // array of needs
  imageUrl: varchar("image_url"),
  pillarTags: text("pillar_tags").array(), // ['harvest', 'without_walls']
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMissionFocusSchema = createInsertSchema(missionFocuses).omit({ id: true, createdAt: true });
export type InsertMissionFocus = z.infer<typeof insertMissionFocusSchema>;
export type MissionFocus = typeof missionFocuses.$inferSelect;

// Prayer Guide Days - daily prayer content for a focus
export const prayerGuideDays = pgTable("prayer_guide_days", {
  id: serial("id").primaryKey(),
  focusId: integer("focus_id").references(() => missionFocuses.id, { onDelete: 'cascade' }),
  projectId: integer("project_id"), // nullable, for project-specific guides
  challengeId: integer("challenge_id"), // nullable, for challenge-specific guides
  dayNumber: integer("day_number").notNull(),
  title: varchar("title"),
  scripture: varchar("scripture"), // e.g. "Matthew 9:37-38"
  scriptureText: text("scripture_text"),
  prayerPoints: jsonb("prayer_points"), // array of strings
  declarations: jsonb("declarations"), // array of scripture declarations
  actionStep: text("action_step"),
  revivalPrompt: text("revival_prompt"), // Spirit-led prompt
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrayerGuideDaySchema = createInsertSchema(prayerGuideDays).omit({ id: true, createdAt: true });
export type InsertPrayerGuideDay = z.infer<typeof insertPrayerGuideDaySchema>;
export type PrayerGuideDay = typeof prayerGuideDays.$inferSelect;

// Adoptions - user adopts a Focus for a period
export const missionAdoptions = pgTable("mission_adoptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  focusId: integer("focus_id").notNull().references(() => missionFocuses.id, { onDelete: 'cascade' }),
  startDate: varchar("start_date").notNull(), // YYYY-MM-DD
  endDate: varchar("end_date"), // nullable = ongoing
  commitmentDays: integer("commitment_days").default(21), // 7, 21, 90
  status: varchar("status").notNull().default("active"), // 'active', 'completed', 'paused'
  currentDay: integer("current_day").default(1),
  reminderEnabled: boolean("reminder_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMissionAdoptionSchema = createInsertSchema(missionAdoptions).omit({ id: true, createdAt: true });
export type InsertMissionAdoption = z.infer<typeof insertMissionAdoptionSchema>;
export type MissionAdoption = typeof missionAdoptions.$inferSelect;

// Prayer Sessions - timer-driven prayer engagement
export const missionPrayerSessions = pgTable("mission_prayer_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  focusId: integer("focus_id").references(() => missionFocuses.id),
  projectId: integer("project_id"), // nullable
  adoptionId: integer("adoption_id").references(() => missionAdoptions.id),
  durationSeconds: integer("duration_seconds").notNull(),
  completed: boolean("completed").default(false),
  prayerNote: text("prayer_note"), // optional reflection
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMissionPrayerSessionSchema = createInsertSchema(missionPrayerSessions).omit({ id: true, createdAt: true });
export type InsertMissionPrayerSession = z.infer<typeof insertMissionPrayerSessionSchema>;
export type MissionPrayerSession = typeof missionPrayerSessions.$inferSelect;

// Mission Projects - the engine of Pray/Give/Go alignment
export const missionProjects = pgTable("mission_projects", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(),
  summary: text("summary").notNull(),
  story: text("story"), // full description
  location: varchar("location"), // country/city/region
  region: varchar("region"),
  pillarTags: text("pillar_tags").array(), // ['biblical_truth', 'harvest']
  actionsAvailable: text("actions_available").array(), // ['pray', 'give', 'go']
  verificationStatus: varchar("verification_status").default("verified"), // 'verified', 'unverified', 'partner'
  fundingGoal: integer("funding_goal"), // in cents
  fundsRaised: integer("funds_raised").default(0),
  currency: varchar("currency").default("USD"),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  partnerId: varchar("partner_id"), // optional external partner
  status: varchar("status").default("active"), // 'active', 'paused', 'completed', 'archived'
  urgencyLevel: varchar("urgency_level").default("normal"), // 'low', 'normal', 'high', 'critical'
  hasDigitalActions: boolean("has_digital_actions").default(true), // online-first flag
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMissionProjectSchema = createInsertSchema(missionProjects).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMissionProject = z.infer<typeof insertMissionProjectSchema>;
export type MissionProject = typeof missionProjects.$inferSelect;

// Project Updates - keep supporters engaged
export const projectUpdates = pgTable("project_updates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => missionProjects.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  updateType: varchar("update_type").default("general"), // 'general', 'prayer_answered', 'milestone', 'urgent'
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectUpdateSchema = createInsertSchema(projectUpdates).omit({ id: true, createdAt: true });
export type InsertProjectUpdate = z.infer<typeof insertProjectUpdateSchema>;
export type ProjectUpdate = typeof projectUpdates.$inferSelect;

// Project Follows - keep people connected
export const projectFollows = pgTable("project_follows", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").notNull().references(() => missionProjects.id, { onDelete: 'cascade' }),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectFollowSchema = createInsertSchema(projectFollows).omit({ id: true, createdAt: true });
export type InsertProjectFollow = z.infer<typeof insertProjectFollowSchema>;
export type ProjectFollow = typeof projectFollows.$inferSelect;

// Opportunities - Go actions with delivery_mode (online first!)
export const missionOpportunities = pgTable("mission_opportunities", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => missionProjects.id, { onDelete: 'set null' }),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(), // 'digital_outreach', 'mentoring', 'content_creation', 'local_outreach', 'trip'
  deliveryMode: varchar("delivery_mode").notNull().default("online"), // 'online', 'hybrid', 'local', 'trip'
  location: varchar("location"), // null for online
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  cost: integer("cost"), // in cents, optional
  capacity: integer("capacity"),
  spotsRemaining: integer("spots_remaining"),
  requirements: jsonb("requirements"), // skills, training modules, age, etc
  pillarTags: text("pillar_tags").array(),
  status: varchar("status").default("open"), // 'open', 'closing_soon', 'full', 'closed'
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMissionOpportunitySchema = createInsertSchema(missionOpportunities).omit({ id: true, createdAt: true });
export type InsertMissionOpportunity = z.infer<typeof insertMissionOpportunitySchema>;
export type MissionOpportunity = typeof missionOpportunities.$inferSelect;

// Opportunity Interests - quick "I'm interested" capture
export const opportunityInterests = pgTable("opportunity_interests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  opportunityId: integer("opportunity_id").notNull().references(() => missionOpportunities.id, { onDelete: 'cascade' }),
  status: varchar("status").default("interested"), // 'interested', 'applied', 'accepted', 'declined', 'completed'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOpportunityInterestSchema = createInsertSchema(opportunityInterests).omit({ id: true, createdAt: true });
export type InsertOpportunityInterest = z.infer<typeof insertOpportunityInterestSchema>;
export type OpportunityInterest = typeof opportunityInterests.$inferSelect;

// Digital Actions - track real outreach steps online
export const digitalActions = pgTable("digital_actions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => missionProjects.id),
  focusId: integer("focus_id").references(() => missionFocuses.id),
  actionType: varchar("action_type").notNull(), // 'share_card', 'invite_friend', 'send_encouragement', 'join_room', 'complete_training', 'post_testimony'
  channel: varchar("channel"), // 'in_app', 'whatsapp', 'sms', 'email', 'social'
  shareCardId: integer("share_card_id"),
  status: varchar("status").default("completed"), // 'initiated', 'completed'
  metadata: jsonb("metadata"), // extra context
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDigitalActionSchema = createInsertSchema(digitalActions).omit({ id: true, createdAt: true });
export type InsertDigitalAction = z.infer<typeof insertDigitalActionSchema>;
export type DigitalAction = typeof digitalActions.$inferSelect;

// Share Cards - what users share (prayer prompt, testimony, invite, campaign)
export const shareCards = pgTable("share_cards", {
  id: serial("id").primaryKey(),
  type: varchar("type").notNull(), // 'prayer', 'testimony', 'invite', 'campaign', 'project'
  title: varchar("title").notNull(),
  contentPreview: text("content_preview"),
  imageUrl: varchar("image_url"),
  ctaLink: varchar("cta_link"), // deep link
  relatedProjectId: integer("related_project_id").references(() => missionProjects.id),
  relatedChallengeId: integer("related_challenge_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertShareCardSchema = createInsertSchema(shareCards).omit({ id: true, createdAt: true });
export type InsertShareCard = z.infer<typeof insertShareCardSchema>;
export type ShareCard = typeof shareCards.$inferSelect;

// Invites - growth loop for outreach + movement
export const missionInvites = pgTable("mission_invites", {
  id: serial("id").primaryKey(),
  inviterUserId: varchar("inviter_user_id").notNull().references(() => users.id),
  shareCardId: integer("share_card_id").references(() => shareCards.id),
  inviteChannel: varchar("invite_channel"), // 'whatsapp', 'sms', 'email', 'link'
  inviteCode: varchar("invite_code").unique(),
  deepLinkToken: varchar("deep_link_token"),
  clickCount: integer("click_count").default(0),
  joinCount: integer("join_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMissionInviteSchema = createInsertSchema(missionInvites).omit({ id: true, createdAt: true });
export type InsertMissionInvite = z.infer<typeof insertMissionInviteSchema>;
export type MissionInvite = typeof missionInvites.$inferSelect;

// Live Rooms - prayer/training/revival gatherings
export const liveRooms = pgTable("live_rooms", {
  id: serial("id").primaryKey(),
  type: varchar("type").notNull(), // 'prayer', 'revival', 'training', 'worship'
  title: varchar("title").notNull(),
  description: text("description"),
  scheduleType: varchar("schedule_type").default("scheduled"), // 'always_on', 'scheduled', 'recurring'
  scheduledAt: timestamp("scheduled_at"),
  recurringPattern: varchar("recurring_pattern"), // 'daily', 'weekly', 'biweekly'
  durationMinutes: integer("duration_minutes").default(30),
  hostUserId: varchar("host_user_id").references(() => users.id),
  meetingLink: varchar("meeting_link"),
  moderationLevel: varchar("moderation_level").default("standard"), // 'open', 'standard', 'strict'
  maxParticipants: integer("max_participants"),
  pillarTags: text("pillar_tags").array(),
  status: varchar("status").default("upcoming"), // 'upcoming', 'live', 'ended', 'cancelled'
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLiveRoomSchema = createInsertSchema(liveRooms).omit({ id: true, createdAt: true });
export type InsertLiveRoom = z.infer<typeof insertLiveRoomSchema>;
export type LiveRoom = typeof liveRooms.$inferSelect;

// Room Sessions - actual instances of live rooms
export const roomSessions = pgTable("room_sessions", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => liveRooms.id, { onDelete: 'cascade' }),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  attendanceCount: integer("attendance_count").default(0),
  highlightNotes: text("highlight_notes"),
});

export const insertRoomSessionSchema = createInsertSchema(roomSessions).omit({ id: true, startedAt: true });
export type InsertRoomSession = z.infer<typeof insertRoomSessionSchema>;
export type RoomSession = typeof roomSessions.$inferSelect;

// Room Participants - who joined a session
export const roomParticipants = pgTable("room_participants", {
  id: serial("id").primaryKey(),
  roomSessionId: integer("room_session_id").notNull().references(() => roomSessions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  leftAt: timestamp("left_at"),
});

export const insertRoomParticipantSchema = createInsertSchema(roomParticipants).omit({ id: true, joinedAt: true });
export type InsertRoomParticipant = z.infer<typeof insertRoomParticipantSchema>;
export type RoomParticipant = typeof roomParticipants.$inferSelect;

// Follow-up Threads - digital discipleship / connection
export const followUpThreads = pgTable("follow_up_threads", {
  id: serial("id").primaryKey(),
  initiatorUserId: varchar("initiator_user_id").notNull().references(() => users.id),
  participantUserId: varchar("participant_user_id").references(() => users.id), // can be null for external contacts
  participantName: varchar("participant_name"), // for external contacts
  participantContact: varchar("participant_contact"), // email or phone
  projectId: integer("project_id").references(() => missionProjects.id),
  threadType: varchar("thread_type").default("discipleship"), // 'discipleship', 'prayer_partner', 'mentoring'
  status: varchar("status").default("active"), // 'active', 'paused', 'archived', 'completed'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActivityAt: timestamp("last_activity_at").defaultNow(),
});

export const insertFollowUpThreadSchema = createInsertSchema(followUpThreads).omit({ id: true, createdAt: true, lastActivityAt: true });
export type InsertFollowUpThread = z.infer<typeof insertFollowUpThreadSchema>;
export type FollowUpThread = typeof followUpThreads.$inferSelect;

// Follow-up Messages - within a thread
export const followUpMessages = pgTable("follow_up_messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").notNull().references(() => followUpThreads.id, { onDelete: 'cascade' }),
  senderUserId: varchar("sender_user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // 'text', 'prompt', 'resource', 'prayer'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFollowUpMessageSchema = createInsertSchema(followUpMessages).omit({ id: true, createdAt: true });
export type InsertFollowUpMessage = z.infer<typeof insertFollowUpMessageSchema>;
export type FollowUpMessage = typeof followUpMessages.$inferSelect;

// Training Modules - "Go Digital" readiness
export const trainingModules = pgTable("training_modules", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  title: varchar("title").notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").default(10),
  category: varchar("category"), // 'evangelism', 'discipleship', 'prayer', 'leadership', 'skills'
  pillarTags: text("pillar_tags").array(),
  contentJson: jsonb("content_json"), // flexible content structure
  videoUrl: varchar("video_url"),
  imageUrl: varchar("image_url"),
  prerequisiteModuleKey: varchar("prerequisite_module_key"),
  orderIndex: integer("order_index").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTrainingModuleSchema = createInsertSchema(trainingModules).omit({ id: true, createdAt: true });
export type InsertTrainingModule = z.infer<typeof insertTrainingModuleSchema>;
export type TrainingModule = typeof trainingModules.$inferSelect;

// Training Progress - user's module completions
export const trainingProgress = pgTable("training_progress", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  moduleId: integer("module_id").notNull().references(() => trainingModules.id, { onDelete: 'cascade' }),
  status: varchar("status").default("not_started"), // 'not_started', 'in_progress', 'completed'
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  quizScore: integer("quiz_score"), // if applicable
  notes: text("notes"),
});

export const insertTrainingProgressSchema = createInsertSchema(trainingProgress).omit({ id: true });
export type InsertTrainingProgress = z.infer<typeof insertTrainingProgressSchema>;
export type TrainingProgress = typeof trainingProgress.$inferSelect;

// Challenges - revival momentum (21-day Nations Awakening, etc)
export const missionChallenges = pgTable("mission_challenges", {
  id: serial("id").primaryKey(),
  key: varchar("key").notNull().unique(),
  title: varchar("title").notNull(),
  description: text("description"),
  theme: varchar("theme"), // 'revival', 'harvest', 'nations', 'prayer'
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  durationDays: integer("duration_days").default(21),
  pillarTags: text("pillar_tags").array(),
  imageUrl: varchar("image_url"),
  badgeKey: varchar("badge_key"), // badge earned on completion
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMissionChallengeSchema = createInsertSchema(missionChallenges).omit({ id: true, createdAt: true });
export type InsertMissionChallenge = z.infer<typeof insertMissionChallengeSchema>;
export type MissionChallenge = typeof missionChallenges.$inferSelect;

// Challenge Enrollments - user participation
export const challengeEnrollments = pgTable("challenge_enrollments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: integer("challenge_id").notNull().references(() => missionChallenges.id, { onDelete: 'cascade' }),
  progressDay: integer("progress_day").default(0),
  status: varchar("status").default("active"), // 'active', 'completed', 'dropped'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
});

export const insertChallengeEnrollmentSchema = createInsertSchema(challengeEnrollments).omit({ id: true, startedAt: true });
export type InsertChallengeEnrollment = z.infer<typeof insertChallengeEnrollmentSchema>;
export type ChallengeEnrollment = typeof challengeEnrollments.$inferSelect;

// Challenge Day Completions - track daily progress
export const challengeDayCompletions = pgTable("challenge_day_completions", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull().references(() => challengeEnrollments.id, { onDelete: 'cascade' }),
  dayNumber: integer("day_number").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
  prayerNote: text("prayer_note"),
  actionTaken: varchar("action_taken"),
});

export const insertChallengeDayCompletionSchema = createInsertSchema(challengeDayCompletions).omit({ id: true, completedAt: true });
export type InsertChallengeDayCompletion = z.infer<typeof insertChallengeDayCompletionSchema>;
export type ChallengeDayCompletion = typeof challengeDayCompletions.$inferSelect;

// Prayer Wall Posts - community prayer sharing
export const prayerWallPosts = pgTable("prayer_wall_posts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  focusId: integer("focus_id").references(() => missionFocuses.id),
  projectId: integer("project_id").references(() => missionProjects.id),
  visibility: varchar("visibility").default("community"), // 'private', 'community', 'public'
  moderationStatus: varchar("moderation_status").default("approved"), // 'pending', 'approved', 'rejected'
  prayerCount: integer("prayer_count").default(0), // others praying
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrayerWallPostSchema = createInsertSchema(prayerWallPosts).omit({ id: true, createdAt: true });
export type InsertPrayerWallPost = z.infer<typeof insertPrayerWallPostSchema>;
export type PrayerWallPost = typeof prayerWallPosts.$inferSelect;

// Prayer Wall Reactions - "I'm praying" reactions
export const prayerWallReactions = pgTable("prayer_wall_reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => prayerWallPosts.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  reactionType: varchar("reaction_type").default("praying"), // 'praying', 'amen'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrayerWallReactionSchema = createInsertSchema(prayerWallReactions).omit({ id: true, createdAt: true });
export type InsertPrayerWallReaction = z.infer<typeof insertPrayerWallReactionSchema>;
export type PrayerWallReaction = typeof prayerWallReactions.$inferSelect;

// Mission Donations - giving with accountability
export const missionDonations = pgTable("mission_donations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => missionProjects.id),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency").default("USD"),
  paymentStatus: varchar("payment_status").default("pending"), // 'pending', 'completed', 'failed', 'refunded'
  paymentProvider: varchar("payment_provider"), // 'stripe', 'paypal'
  paymentId: varchar("payment_id"), // external payment ID
  isRecurring: boolean("is_recurring").default(false),
  recurringId: integer("recurring_id"),
  receiptUrl: varchar("receipt_url"),
  note: text("note"), // donor message
  isAnonymous: boolean("is_anonymous").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMissionDonationSchema = createInsertSchema(missionDonations).omit({ id: true, createdAt: true });
export type InsertMissionDonation = z.infer<typeof insertMissionDonationSchema>;
export type MissionDonation = typeof missionDonations.$inferSelect;

// Recurring Donations - monthly giving
export const recurringDonations = pgTable("recurring_donations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => missionProjects.id),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency").default("USD"),
  frequency: varchar("frequency").default("monthly"), // 'weekly', 'monthly', 'quarterly'
  paymentProvider: varchar("payment_provider"),
  subscriptionId: varchar("subscription_id"), // external subscription ID
  status: varchar("status").default("active"), // 'active', 'paused', 'cancelled'
  nextPaymentDate: timestamp("next_payment_date"),
  createdAt: timestamp("created_at").defaultNow(),
  cancelledAt: timestamp("cancelled_at"),
});

export const insertRecurringDonationSchema = createInsertSchema(recurringDonations).omit({ id: true, createdAt: true });
export type InsertRecurringDonation = z.infer<typeof insertRecurringDonationSchema>;
export type RecurringDonation = typeof recurringDonations.$inferSelect;

// Mission Testimonies - revival culture + encouragement
export const missionTestimonies = pgTable("mission_testimonies", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'answered_prayer', 'giving_impact', 'outreach_story', 'salvation', 'transformation'
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  projectId: integer("project_id").references(() => missionProjects.id),
  focusId: integer("focus_id").references(() => missionFocuses.id),
  visibility: varchar("visibility").default("community"), // 'private', 'community', 'public'
  moderationStatus: varchar("moderation_status").default("approved"), // 'pending', 'approved', 'rejected'
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  isFeatured: boolean("is_featured").default(false),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMissionTestimonySchema = createInsertSchema(missionTestimonies).omit({ id: true, createdAt: true });
export type InsertMissionTestimony = z.infer<typeof insertMissionTestimonySchema>;
export type MissionTestimony = typeof missionTestimonies.$inferSelect;


// AI Coaching Sessions
export const aiCoachSessions = pgTable("ai_coach_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  entryPoint: varchar("entry_point").notNull(), // 'goals', 'vision', 'growth', 'general'
  title: varchar("title"), // auto-generated or user-provided
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAiCoachSessionSchema = createInsertSchema(aiCoachSessions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAiCoachSession = z.infer<typeof insertAiCoachSessionSchema>;
export type AiCoachSession = typeof aiCoachSessions.$inferSelect;

// AI Coaching Messages
export const aiCoachMessages = pgTable("ai_coach_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => aiCoachSessions.id, { onDelete: 'cascade' }),
  sender: varchar("sender").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // for storing context, tokens used, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAiCoachMessageSchema = createInsertSchema(aiCoachMessages).omit({ id: true, createdAt: true });
export type InsertAiCoachMessage = z.infer<typeof insertAiCoachMessageSchema>;
export type AiCoachMessage = typeof aiCoachMessages.$inferSelect;

// ===== ADMIN PORTAL TABLES =====

// Coaches - Human coaches for 1-on-1 and group sessions
export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  specialties: text("specialties").array(), // 'career', 'faith', 'relationships', 'leadership'
  bio: text("bio"),
  photoUrl: varchar("photo_url"),
  hourlyRate: integer("hourly_rate"), // in cents, null = free
  availability: jsonb("availability"), // { monday: ['09:00-12:00', '14:00-17:00'], ... }
  maxSessionsPerWeek: integer("max_sessions_per_week").default(10),
  isActive: boolean("is_active").default(true),
  rating: integer("rating").default(0), // 0-500 (5.00 stars)
  totalSessions: integer("total_sessions").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCoachSchema = createInsertSchema(coaches).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCoach = z.infer<typeof insertCoachSchema>;
export type Coach = typeof coaches.$inferSelect;

// Coaching Sessions - 1-on-1 bookings
export const coachingSessions = pgTable("coaching_sessions", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => coaches.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(60), // minutes
  status: varchar("status").default("scheduled"), // 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  meetingLink: varchar("meeting_link"),
  topic: varchar("topic"),
  notes: text("notes"), // coach's private notes
  userNotes: text("user_notes"), // user's prep notes
  actionItems: text("action_items").array(),
  rating: integer("rating"), // 1-5 stars
  feedback: text("feedback"),
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCoachingSessionSchema = createInsertSchema(coachingSessions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;
export type CoachingSession = typeof coachingSessions.$inferSelect;

// Coaching Cohorts - Group coaching programs
export const coachingCohorts = pgTable("coaching_cohorts", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => coaches.id),
  title: varchar("title").notNull(),
  description: text("description"),
  topic: varchar("topic").notNull(), // 'leadership', 'vision', 'faith', 'career', 'relationships'
  imageUrl: varchar("image_url"),
  maxParticipants: integer("max_participants").default(12),
  currentParticipants: integer("current_participants").default(0),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  sessionCount: integer("session_count").default(8), // number of group sessions
  schedule: jsonb("schedule"), // { dayOfWeek: 'Tuesday', time: '19:00', timezone: 'UTC' }
  meetingLink: varchar("meeting_link"),
  price: integer("price"), // in cents, null = free
  status: varchar("status").default("draft"), // 'draft', 'open', 'in_progress', 'completed', 'cancelled'
  resources: jsonb("resources"), // array of { title, url, sessionNumber }
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCoachingCohortSchema = createInsertSchema(coachingCohorts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCoachingCohort = z.infer<typeof insertCoachingCohortSchema>;
export type CoachingCohort = typeof coachingCohorts.$inferSelect;

// Cohort Participants
export const cohortParticipants = pgTable("cohort_participants", {
  id: serial("id").primaryKey(),
  cohortId: integer("cohort_id").notNull().references(() => coachingCohorts.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").default("enrolled"), // 'enrolled', 'active', 'completed', 'dropped'
  progress: integer("progress").default(0), // sessions attended
  accountabilityPartnerId: varchar("accountability_partner_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertCohortParticipantSchema = createInsertSchema(cohortParticipants).omit({ id: true, joinedAt: true });
export type InsertCohortParticipant = z.infer<typeof insertCohortParticipantSchema>;
export type CohortParticipant = typeof cohortParticipants.$inferSelect;

// Challenges - Competitions and growth challenges
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // 'individual', 'team', 'community'
  category: varchar("category").notNull(), // 'prayer', 'reading', 'outreach', 'habits', 'giving', 'fitness'
  imageUrl: varchar("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goal: integer("goal").notNull(), // target number (days, actions, etc.)
  goalUnit: varchar("goal_unit").notNull(), // 'days', 'prayers', 'chapters', 'actions', 'hours'
  pointsPerAction: integer("points_per_action").default(10),
  maxParticipants: integer("max_participants"), // null = unlimited
  currentParticipants: integer("current_participants").default(0),
  rewards: jsonb("rewards"), // { first: 'Badge', completion: 'Certificate' }
  rules: text("rules").array(),
  status: varchar("status").default("draft"), // 'draft', 'upcoming', 'active', 'completed', 'cancelled'
  isFeatured: boolean("is_featured").default(false),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

// Challenge Participants
export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => challenges.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  teamId: integer("team_id"), // for team challenges
  progress: integer("progress").default(0),
  points: integer("points").default(0),
  streak: integer("streak").default(0),
  bestStreak: integer("best_streak").default(0),
  lastActionAt: timestamp("last_action_at"),
  status: varchar("status").default("active"), // 'active', 'completed', 'dropped'
  rank: integer("rank"),
  completedAt: timestamp("completed_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertChallengeParticipantSchema = createInsertSchema(challengeParticipants).omit({ id: true, joinedAt: true });
export type InsertChallengeParticipant = z.infer<typeof insertChallengeParticipantSchema>;
export type ChallengeParticipant = typeof challengeParticipants.$inferSelect;

// Challenge Progress Logs
export const challengeLogs = pgTable("challenge_logs", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").notNull().references(() => challengeParticipants.id, { onDelete: 'cascade' }),
  action: varchar("action").notNull(), // 'check_in', 'prayer', 'read', 'workout', etc.
  points: integer("points").default(0),
  note: text("note"),
  proofUrl: varchar("proof_url"), // optional photo/screenshot
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChallengeLogSchema = createInsertSchema(challengeLogs).omit({ id: true, createdAt: true });
export type InsertChallengeLog = z.infer<typeof insertChallengeLogSchema>;
export type ChallengeLog = typeof challengeLogs.$inferSelect;

// Mission Trips - Outreach planning
export const missionTrips = pgTable("mission_trips", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  destination: varchar("destination").notNull(), // 'Kenya', 'Brazil', 'Local - Downtown'
  country: varchar("country"),
  type: varchar("type").notNull(), // 'international', 'domestic', 'local'
  imageUrl: varchar("image_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  applicationDeadline: timestamp("application_deadline"),
  minParticipants: integer("min_participants").default(5),
  maxParticipants: integer("max_participants").default(20),
  currentParticipants: integer("current_participants").default(0),
  cost: integer("cost"), // total trip cost in cents
  depositAmount: integer("deposit_amount"), // required deposit
  fundraisingGoal: integer("fundraising_goal"),
  currentFundraising: integer("current_fundraising").default(0),
  requirements: text("requirements").array(), // ['passport', 'vaccinations', 'background_check']
  activities: text("activities").array(), // ['construction', 'teaching', 'medical', 'evangelism']
  itinerary: jsonb("itinerary"), // array of { day, title, description, activities }
  leaderId: varchar("leader_id").references(() => users.id),
  status: varchar("status").default("draft"), // 'draft', 'open', 'closed', 'in_progress', 'completed', 'cancelled'
  meetingLink: varchar("meeting_link"), // for info sessions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMissionTripSchema = createInsertSchema(missionTrips).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMissionTrip = z.infer<typeof insertMissionTripSchema>;
export type MissionTrip = typeof missionTrips.$inferSelect;

// Trip Applications
export const tripApplications = pgTable("trip_applications", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => missionTrips.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").default("pending"), // 'pending', 'approved', 'rejected', 'waitlisted', 'withdrawn'
  role: varchar("role"), // 'participant', 'team_leader', 'medical', 'logistics'
  emergencyContact: jsonb("emergency_contact"), // { name, phone, relationship }
  medicalInfo: text("medical_info"),
  dietaryRestrictions: text("dietary_restrictions"),
  specialSkills: text("special_skills").array(),
  whyApply: text("why_apply"),
  documents: jsonb("documents"), // array of { type, url, verified }
  amountPaid: integer("amount_paid").default(0),
  fundraisingAmount: integer("fundraising_amount").default(0),
  fundraisingPageUrl: varchar("fundraising_page_url"),
  notes: text("notes"), // admin notes
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  appliedAt: timestamp("applied_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTripApplicationSchema = createInsertSchema(tripApplications).omit({ id: true, appliedAt: true, updatedAt: true });
export type InsertTripApplication = z.infer<typeof insertTripApplicationSchema>;
export type TripApplication = typeof tripApplications.$inferSelect;

// Admin Audit Logs - Track all admin actions
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // 'role_change', 'content_publish', 'user_ban', etc.
  targetType: varchar("target_type"), // 'user', 'spark', 'challenge', 'trip', etc.
  targetId: varchar("target_id"),
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdminAuditLogSchema = createInsertSchema(adminAuditLogs).omit({ id: true, createdAt: true });
export type InsertAdminAuditLog = z.infer<typeof insertAdminAuditLogSchema>;
export type AdminAuditLog = typeof adminAuditLogs.$inferSelect;

// Goal Templates - Pre-built goals for users
export const goalTemplates = pgTable("goal_templates", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // 'faith', 'career', 'health', 'relationships', 'finance', 'personal'
  iconName: varchar("icon_name"),
  suggestedMilestones: jsonb("suggested_milestones"), // array of milestone templates
  suggestedHabits: jsonb("suggested_habits"), // array of habit templates
  timeframe: varchar("timeframe"), // '30_days', '90_days', '6_months', '1_year'
  difficulty: varchar("difficulty"), // 'beginner', 'intermediate', 'advanced'
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGoalTemplateSchema = createInsertSchema(goalTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGoalTemplate = z.infer<typeof insertGoalTemplateSchema>;
export type GoalTemplate = typeof goalTemplates.$inferSelect;

// User Settings/Preferences (extends notification preferences)
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  // Privacy settings
  profileVisibility: varchar("profile_visibility").default("public"), // 'public', 'community', 'private'
  showEmail: boolean("show_email").default(false),
  showLocation: boolean("show_location").default(true),
  allowMessaging: boolean("allow_messaging").default(true),
  // App preferences
  theme: varchar("theme").default("system"), // 'light', 'dark', 'system'
  language: varchar("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// Comments on posts
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentId: integer("parent_id"), // for nested replies
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// ==========================================
// PRAYER MOVEMENT TABLES
// ==========================================

// Prayer Focus Groups - Nations and people groups to pray for
export const prayerFocusGroups = pgTable("prayer_focus_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  region: varchar("region").notNull(), // 'United Kingdom', 'Nigeria', 'EU - France', etc.
  country: varchar("country"),
  population: varchar("population"), // '45M+', '2.5M+', etc.
  description: text("description"),
  imageUrl: varchar("image_url"),
  prayerPoints: text("prayer_points").array(), // Key things to pray for
  scriptures: text("scriptures").array(), // Relevant Bible verses
  category: varchar("category").default("nation"), // 'nation', 'unreached', 'campus', 'city'
  isActive: boolean("is_active").default(true),
  intercessorCount: integer("intercessor_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPrayerFocusGroupSchema = createInsertSchema(prayerFocusGroups).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPrayerFocusGroup = z.infer<typeof insertPrayerFocusGroupSchema>;
export type PrayerFocusGroup = typeof prayerFocusGroups.$inferSelect;

// UK Campus Directory - Universities and Sixth Forms
export const ukCampuses = pgTable("uk_campuses", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'university', 'sixth_form'
  city: varchar("city").notNull(),
  region: varchar("region"), // 'London', 'South East', 'Scotland', etc.
  postcode: varchar("postcode"),
  latitude: varchar("latitude"),
  longitude: varchar("longitude"),
  studentPopulation: integer("student_population"),
  website: varchar("website"),
  imageUrl: varchar("image_url"),
  hasAltar: boolean("has_altar").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUkCampusSchema = createInsertSchema(ukCampuses).omit({ id: true, createdAt: true });
export type InsertUkCampus = z.infer<typeof insertUkCampusSchema>;
export type UkCampus = typeof ukCampuses.$inferSelect;

// Campus Prayer Altars - Prayer groups at specific campuses
export const campusAltars = pgTable("campus_altars", {
  id: serial("id").primaryKey(),
  campusId: integer("campus_id").notNull().references(() => ukCampuses.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(), // Custom name or campus name + " Prayer Altar"
  description: text("description"),
  leaderId: varchar("leader_id").references(() => users.id),
  meetingSchedule: text("meeting_schedule"), // 'Every Tuesday 7pm', etc.
  meetingLink: varchar("meeting_link"), // Online meeting link
  whatsappGroup: varchar("whatsapp_group"),
  prayerPoints: text("prayer_points").array(),
  scriptures: text("scriptures").array(),
  memberCount: integer("member_count").default(0),
  prayerHours: integer("prayer_hours").default(0), // Total logged prayer hours
  status: varchar("status").default("active"), // 'active', 'inactive', 'pending'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCampusAltarSchema = createInsertSchema(campusAltars).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCampusAltar = z.infer<typeof insertCampusAltarSchema>;
export type CampusAltar = typeof campusAltars.$inferSelect;

// Altar Members - Users who joined a campus altar
export const altarMembers = pgTable("altar_members", {
  id: serial("id").primaryKey(),
  altarId: integer("altar_id").notNull().references(() => campusAltars.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: varchar("role").default("intercessor"), // 'intercessor', 'leader', 'coordinator'
  affiliation: varchar("affiliation").notNull(), // 'student', 'staff', 'alumni', 'local_supporter'
  prayerHours: integer("prayer_hours").default(0),
  streak: integer("streak").default(0),
  bestStreak: integer("best_streak").default(0),
  lastPrayedAt: timestamp("last_prayed_at"),
  receiveReminders: boolean("receive_reminders").default(true),
  reminderFrequency: varchar("reminder_frequency").default("daily"), // 'daily', 'weekly', 'custom'
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertAltarMemberSchema = createInsertSchema(altarMembers).omit({ id: true, joinedAt: true });
export type InsertAltarMember = z.infer<typeof insertAltarMemberSchema>;
export type AltarMember = typeof altarMembers.$inferSelect;

// Prayer Subscriptions - Users who adopted a focus group/nation
export const prayerSubscriptions = pgTable("prayer_subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  focusGroupId: integer("focus_group_id").references(() => prayerFocusGroups.id, { onDelete: 'cascade' }),
  altarId: integer("altar_id").references(() => campusAltars.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // 'nation', 'campus'
  prayerHours: integer("prayer_hours").default(0),
  streak: integer("streak").default(0),
  bestStreak: integer("best_streak").default(0),
  lastPrayedAt: timestamp("last_prayed_at"),
  receiveReminders: boolean("receive_reminders").default(true),
  reminderFrequency: varchar("reminder_frequency").default("daily"), // 'daily', 'weekly', 'custom'
  reminderTime: varchar("reminder_time").default("09:00"), // Preferred reminder time
  emailConfirmed: boolean("email_confirmed").default(false),
  status: varchar("status").default("active"), // 'active', 'paused', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPrayerSubscriptionSchema = createInsertSchema(prayerSubscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPrayerSubscription = z.infer<typeof insertPrayerSubscriptionSchema>;
export type PrayerSubscription = typeof prayerSubscriptions.$inferSelect;

// Prayer Wall Entries - Prayer requests and answered prayers
export const prayerWallEntries = pgTable("prayer_wall_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  focusGroupId: integer("focus_group_id").references(() => prayerFocusGroups.id, { onDelete: 'cascade' }),
  altarId: integer("altar_id").references(() => campusAltars.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // 'request', 'praise', 'testimony', 'answered'
  content: text("content").notNull(),
  isAnonymous: boolean("is_anonymous").default(false),
  prayerCount: integer("prayer_count").default(0), // How many people prayed for this
  isAnswered: boolean("is_answered").default(false),
  answeredAt: timestamp("answered_at"),
  answeredTestimony: text("answered_testimony"),
  status: varchar("status").default("active"), // 'active', 'hidden', 'flagged'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPrayerWallEntrySchema = createInsertSchema(prayerWallEntries).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPrayerWallEntry = z.infer<typeof insertPrayerWallEntrySchema>;
export type PrayerWallEntry = typeof prayerWallEntries.$inferSelect;

// Prayer Logs - Track individual prayer sessions
export const prayerLogs = pgTable("prayer_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: integer("subscription_id").references(() => prayerSubscriptions.id, { onDelete: 'set null' }),
  altarMemberId: integer("altar_member_id").references(() => altarMembers.id, { onDelete: 'set null' }),
  focusGroupId: integer("focus_group_id").references(() => prayerFocusGroups.id, { onDelete: 'set null' }),
  altarId: integer("altar_id").references(() => campusAltars.id, { onDelete: 'set null' }),
  durationMinutes: integer("duration_minutes").notNull(),
  notes: text("notes"),
  prayerPoints: text("prayer_points").array(), // Which points they prayed for
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrayerLogSchema = createInsertSchema(prayerLogs).omit({ id: true, createdAt: true });
export type InsertPrayerLog = z.infer<typeof insertPrayerLogSchema>;
export type PrayerLog = typeof prayerLogs.$inferSelect;

// Prayer Reminders Queue - Scheduled email reminders
export const prayerReminders = pgTable("prayer_reminders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: integer("subscription_id").references(() => prayerSubscriptions.id, { onDelete: 'cascade' }),
  altarMemberId: integer("altar_member_id").references(() => altarMembers.id, { onDelete: 'cascade' }),
  scheduledFor: timestamp("scheduled_for").notNull(),
  prayerPoints: text("prayer_points").array(),
  scriptures: text("scriptures").array(),
  status: varchar("status").default("pending"), // 'pending', 'sent', 'failed'
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrayerReminderSchema = createInsertSchema(prayerReminders).omit({ id: true, createdAt: true });
export type InsertPrayerReminder = z.infer<typeof insertPrayerReminderSchema>;
export type PrayerReminder = typeof prayerReminders.$inferSelect;
