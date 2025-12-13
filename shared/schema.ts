import { sql } from 'drizzle-orm';
import {
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
