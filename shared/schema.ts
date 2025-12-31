import { sql } from 'drizzle-orm';
import {
  boolean,
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
