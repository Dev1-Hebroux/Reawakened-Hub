import {
  users,
  posts,
  reactions,
  sparks,
  sparkSubscriptions,
  events,
  eventRegistrations,
  blogPosts,
  emailSubscriptions,
  prayerRequests,
  testimonies,
  volunteerSignups,
  missionRegistrations,
  journeys,
  journeyDays,
  journeySteps,
  userJourneys,
  userJourneyDays,
  userStreaks,
  badges,
  userBadges,
  alphaCohorts,
  alphaCohortWeeks,
  alphaCohortParticipants,
  alphaCohortWeekProgress,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Reaction,
  type InsertReaction,
  type Spark,
  type InsertSpark,
  type SparkSubscription,
  type InsertSparkSubscription,
  type Event,
  type InsertEvent,
  type EventRegistration,
  type InsertEventRegistration,
  type BlogPost,
  type InsertBlogPost,
  type EmailSubscription,
  type InsertEmailSubscription,
  type PrayerRequest,
  type InsertPrayerRequest,
  type Testimony,
  type InsertTestimony,
  type VolunteerSignup,
  type InsertVolunteerSignup,
  type MissionRegistration,
  type InsertMissionRegistration,
  type Journey,
  type InsertJourney,
  type JourneyDay,
  type InsertJourneyDay,
  type JourneyStep,
  type InsertJourneyStep,
  type UserJourney,
  type InsertUserJourney,
  type UserJourneyDay,
  type InsertUserJourneyDay,
  type UserStreak,
  type InsertUserStreak,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type InsertUserBadge,
  type AlphaCohort,
  type InsertAlphaCohort,
  type AlphaCohortWeek,
  type InsertAlphaCohortWeek,
  type AlphaCohortParticipant,
  type InsertAlphaCohortParticipant,
  type AlphaCohortWeekProgress,
  type InsertAlphaCohortWeekProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Community Hub - Posts
  getPosts(type?: string): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;

  // Community Hub - Reactions
  getReactionsByPost(postId: number): Promise<Reaction[]>;
  createReaction(reaction: InsertReaction): Promise<Reaction>;
  deleteReaction(id: number, userId: string): Promise<void>;

  // Sparks
  getSparks(category?: string): Promise<Spark[]>;
  getSpark(id: number): Promise<Spark | undefined>;
  createSpark(spark: InsertSpark): Promise<Spark>;

  // Spark Subscriptions
  getSubscriptions(userId: string): Promise<SparkSubscription[]>;
  createSubscription(subscription: InsertSparkSubscription): Promise<SparkSubscription>;
  deleteSubscription(userId: string, category: string): Promise<void>;

  // Events
  getEvents(type?: string): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Event Registrations
  getEventRegistrations(eventId: number): Promise<EventRegistration[]>;
  getUserEventRegistration(eventId: number, userId: string): Promise<EventRegistration | undefined>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;

  // Blog
  getBlogPosts(category?: string): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  // Email Subscriptions
  createEmailSubscription(subscription: InsertEmailSubscription): Promise<EmailSubscription>;

  // Prayer Requests
  createPrayerRequest(request: InsertPrayerRequest): Promise<PrayerRequest>;
  getPrayerRequests(): Promise<PrayerRequest[]>;

  // Testimonies
  createTestimony(testimony: InsertTestimony): Promise<Testimony>;
  getTestimonies(approved?: boolean): Promise<Testimony[]>;

  // Volunteer Sign-ups
  createVolunteerSignup(signup: InsertVolunteerSignup): Promise<VolunteerSignup>;

  // Mission Registrations
  createMissionRegistration(registration: InsertMissionRegistration): Promise<MissionRegistration>;

  // Journeys
  getJourneys(category?: string): Promise<Journey[]>;
  getJourneyBySlug(slug: string): Promise<Journey | undefined>;
  getJourneyById(id: number): Promise<Journey | undefined>;
  createJourney(journey: InsertJourney): Promise<Journey>;
  getJourneyDays(journeyId: number): Promise<JourneyDay[]>;
  getJourneyDay(journeyId: number, dayNumber: number): Promise<JourneyDay | undefined>;
  createJourneyDay(day: InsertJourneyDay): Promise<JourneyDay>;
  getJourneySteps(journeyDayId: number): Promise<JourneyStep[]>;
  createJourneyStep(step: InsertJourneyStep): Promise<JourneyStep>;

  // User Journeys
  getUserJourneys(userId: string): Promise<UserJourney[]>;
  getUserJourney(id: number): Promise<UserJourney | undefined>;
  getUserJourneyByJourneyId(userId: string, journeyId: number): Promise<UserJourney | undefined>;
  startJourney(userId: string, journeyId: number): Promise<UserJourney>;
  updateUserJourney(id: number, updates: Partial<UserJourney>): Promise<UserJourney>;

  // User Journey Days
  getUserJourneyDays(userJourneyId: number): Promise<UserJourneyDay[]>;
  getUserJourneyDay(userJourneyId: number, dayNumber: number): Promise<UserJourneyDay | undefined>;
  completeJourneyDay(userJourneyId: number, dayNumber: number, notes?: string, reflectionResponse?: string): Promise<UserJourneyDay>;

  // Streaks
  getUserStreak(userId: string): Promise<UserStreak | undefined>;
  updateUserStreak(userId: string, streak: Partial<InsertUserStreak>): Promise<UserStreak>;

  // Badges
  getBadges(): Promise<Badge[]>;
  getBadgeByCode(code: string): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;
  getUserBadges(userId: string): Promise<UserBadge[]>;
  hasUserBadge(userId: string, badgeId: number): Promise<boolean>;
  awardBadge(userId: string, badgeId: number): Promise<UserBadge>;

  // Alpha Cohorts
  getAlphaCohorts(status?: string): Promise<AlphaCohort[]>;
  getAlphaCohort(id: number): Promise<AlphaCohort | undefined>;
  createAlphaCohort(cohort: InsertAlphaCohort): Promise<AlphaCohort>;
  getAlphaCohortWeeks(cohortId: number): Promise<AlphaCohortWeek[]>;
  createAlphaCohortWeek(week: InsertAlphaCohortWeek): Promise<AlphaCohortWeek>;
  
  // Alpha Cohort Participants
  getAlphaCohortParticipants(cohortId: number): Promise<AlphaCohortParticipant[]>;
  getAlphaCohortParticipant(cohortId: number, userId: string): Promise<AlphaCohortParticipant | undefined>;
  getAlphaCohortParticipantById(participantId: number): Promise<AlphaCohortParticipant | undefined>;
  enrollInAlphaCohort(cohortId: number, userId: string, role?: string): Promise<AlphaCohortParticipant>;
  getUserAlphaCohorts(userId: string): Promise<AlphaCohortParticipant[]>;
  
  // Alpha Cohort Progress
  getAlphaCohortWeekProgress(participantId: number): Promise<AlphaCohortWeekProgress[]>;
  updateAlphaCohortWeekProgress(participantId: number, weekNumber: number, updates: Partial<InsertAlphaCohortWeekProgress>): Promise<AlphaCohortWeekProgress>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Posts
  async getPosts(type?: string): Promise<any[]> {
    const query = db
      .select({
        id: posts.id,
        userId: posts.userId,
        type: posts.type,
        content: posts.content,
        imageUrl: posts.imageUrl,
        createdAt: posts.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.userId, users.id))
      .orderBy(desc(posts.createdAt));

    const results = type 
      ? await query.where(eq(posts.type, type))
      : await query;

    // Get reaction counts for all posts
    const postIds = results.map(p => p.id);
    let reactionCounts: { postId: number; count: number }[] = [];
    
    if (postIds.length > 0) {
      reactionCounts = await db
        .select({
          postId: reactions.postId,
          count: count(reactions.id),
        })
        .from(reactions)
        .where(inArray(reactions.postId, postIds))
        .groupBy(reactions.postId);
    }

    // Map reaction counts to posts
    const postsWithCounts = results.map(post => ({
      ...post,
      reactionCount: reactionCounts.find(r => r.postId === post.id)?.count || 0,
    }));

    return postsWithCounts;
  }

  async getPost(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }

  async createPost(postData: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(postData).returning();
    return post;
  }

  // Reactions
  async getReactionsByPost(postId: number): Promise<Reaction[]> {
    return db.select().from(reactions).where(eq(reactions.postId, postId));
  }

  async createReaction(reactionData: InsertReaction): Promise<Reaction> {
    const [reaction] = await db.insert(reactions).values(reactionData).returning();
    return reaction;
  }

  async deleteReaction(id: number, userId: string): Promise<void> {
    await db.delete(reactions).where(and(eq(reactions.id, id), eq(reactions.userId, userId)));
  }

  // Sparks
  async getSparks(category?: string): Promise<Spark[]> {
    if (category) {
      return db.select().from(sparks).where(eq(sparks.category, category)).orderBy(desc(sparks.createdAt));
    }
    return db.select().from(sparks).orderBy(desc(sparks.createdAt));
  }

  async getSpark(id: number): Promise<Spark | undefined> {
    const [spark] = await db.select().from(sparks).where(eq(sparks.id, id));
    return spark;
  }

  async createSpark(sparkData: InsertSpark): Promise<Spark> {
    const [spark] = await db.insert(sparks).values(sparkData).returning();
    return spark;
  }

  // Spark Subscriptions
  async getSubscriptions(userId: string): Promise<SparkSubscription[]> {
    return db.select().from(sparkSubscriptions).where(eq(sparkSubscriptions.userId, userId));
  }

  async createSubscription(subscriptionData: InsertSparkSubscription): Promise<SparkSubscription> {
    const [subscription] = await db.insert(sparkSubscriptions).values(subscriptionData).returning();
    return subscription;
  }

  async deleteSubscription(userId: string, category: string): Promise<void> {
    await db.delete(sparkSubscriptions).where(
      and(eq(sparkSubscriptions.userId, userId), eq(sparkSubscriptions.category, category))
    );
  }

  // Events
  async getEvents(type?: string): Promise<Event[]> {
    if (type) {
      return db.select().from(events).where(eq(events.type, type)).orderBy(desc(events.startDate));
    }
    return db.select().from(events).orderBy(desc(events.startDate));
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(eventData: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(eventData).returning();
    return event;
  }

  // Event Registrations
  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId));
  }

  async getUserEventRegistration(eventId: number, userId: string): Promise<EventRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)));
    return registration;
  }

  async createEventRegistration(registrationData: InsertEventRegistration): Promise<EventRegistration> {
    const [registration] = await db.insert(eventRegistrations).values(registrationData).returning();
    return registration;
  }

  // Blog
  async getBlogPosts(category?: string): Promise<BlogPost[]> {
    if (category) {
      return db.select().from(blogPosts).where(eq(blogPosts.category, category)).orderBy(desc(blogPosts.publishedAt));
    }
    return db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createBlogPost(postData: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(postData).returning();
    return post;
  }

  // Email Subscriptions
  async createEmailSubscription(subscriptionData: InsertEmailSubscription): Promise<EmailSubscription> {
    const [subscription] = await db.insert(emailSubscriptions).values(subscriptionData).returning();
    return subscription;
  }

  // Prayer Requests
  async createPrayerRequest(requestData: InsertPrayerRequest): Promise<PrayerRequest> {
    const [request] = await db.insert(prayerRequests).values(requestData).returning();
    return request;
  }

  async getPrayerRequests(): Promise<PrayerRequest[]> {
    return db.select().from(prayerRequests).where(eq(prayerRequests.isPrivate, "false")).orderBy(desc(prayerRequests.createdAt));
  }

  // Testimonies
  async createTestimony(testimonyData: InsertTestimony): Promise<Testimony> {
    const [testimony] = await db.insert(testimonies).values(testimonyData).returning();
    return testimony;
  }

  async getTestimonies(approved?: boolean): Promise<Testimony[]> {
    if (approved) {
      return db.select().from(testimonies).where(eq(testimonies.isApproved, "true")).orderBy(desc(testimonies.createdAt));
    }
    return db.select().from(testimonies).orderBy(desc(testimonies.createdAt));
  }

  // Volunteer Sign-ups
  async createVolunteerSignup(signupData: InsertVolunteerSignup): Promise<VolunteerSignup> {
    const [signup] = await db.insert(volunteerSignups).values(signupData).returning();
    return signup;
  }

  // Mission Registrations
  async createMissionRegistration(registrationData: InsertMissionRegistration): Promise<MissionRegistration> {
    const [registration] = await db.insert(missionRegistrations).values(registrationData).returning();
    return registration;
  }

  // ===== JOURNEYS =====
  
  async getJourneys(category?: string): Promise<Journey[]> {
    if (category) {
      return db.select().from(journeys).where(and(eq(journeys.isPublished, "true"), eq(journeys.category, category)));
    }
    return db.select().from(journeys).where(eq(journeys.isPublished, "true"));
  }

  async getJourneyBySlug(slug: string): Promise<Journey | undefined> {
    const [journey] = await db.select().from(journeys).where(eq(journeys.slug, slug));
    return journey;
  }

  async getJourneyById(id: number): Promise<Journey | undefined> {
    const [journey] = await db.select().from(journeys).where(eq(journeys.id, id));
    return journey;
  }

  async createJourney(journeyData: InsertJourney): Promise<Journey> {
    const [journey] = await db.insert(journeys).values(journeyData).returning();
    return journey;
  }

  async getJourneyDays(journeyId: number): Promise<JourneyDay[]> {
    return db.select().from(journeyDays).where(eq(journeyDays.journeyId, journeyId)).orderBy(journeyDays.dayNumber);
  }

  async getJourneyDay(journeyId: number, dayNumber: number): Promise<JourneyDay | undefined> {
    const [day] = await db.select().from(journeyDays).where(
      and(eq(journeyDays.journeyId, journeyId), eq(journeyDays.dayNumber, dayNumber))
    );
    return day;
  }

  async createJourneyDay(dayData: InsertJourneyDay): Promise<JourneyDay> {
    const [day] = await db.insert(journeyDays).values(dayData).returning();
    return day;
  }

  async getJourneySteps(journeyDayId: number): Promise<JourneyStep[]> {
    return db.select().from(journeySteps).where(eq(journeySteps.journeyDayId, journeyDayId)).orderBy(journeySteps.stepOrder);
  }

  async createJourneyStep(stepData: InsertJourneyStep): Promise<JourneyStep> {
    const [step] = await db.insert(journeySteps).values(stepData).returning();
    return step;
  }

  // ===== USER JOURNEYS =====

  async getUserJourneys(userId: string): Promise<UserJourney[]> {
    return db.select().from(userJourneys).where(eq(userJourneys.userId, userId)).orderBy(desc(userJourneys.lastActivityAt));
  }

  async getUserJourney(id: number): Promise<UserJourney | undefined> {
    const [userJourney] = await db.select().from(userJourneys).where(eq(userJourneys.id, id));
    return userJourney;
  }

  async getUserJourneyByJourneyId(userId: string, journeyId: number): Promise<UserJourney | undefined> {
    const [userJourney] = await db.select().from(userJourneys).where(
      and(eq(userJourneys.userId, userId), eq(userJourneys.journeyId, journeyId))
    );
    return userJourney;
  }

  async startJourney(userId: string, journeyId: number): Promise<UserJourney> {
    const [userJourney] = await db.insert(userJourneys).values({
      userId,
      journeyId,
      status: "active",
      currentDay: 1,
    }).returning();
    return userJourney;
  }

  async updateUserJourney(id: number, updates: Partial<UserJourney>): Promise<UserJourney> {
    const [userJourney] = await db.update(userJourneys).set({
      ...updates,
      lastActivityAt: new Date(),
    }).where(eq(userJourneys.id, id)).returning();
    return userJourney;
  }

  // ===== USER JOURNEY DAYS =====

  async getUserJourneyDays(userJourneyId: number): Promise<UserJourneyDay[]> {
    return db.select().from(userJourneyDays).where(eq(userJourneyDays.userJourneyId, userJourneyId)).orderBy(userJourneyDays.dayNumber);
  }

  async getUserJourneyDay(userJourneyId: number, dayNumber: number): Promise<UserJourneyDay | undefined> {
    const [day] = await db.select().from(userJourneyDays).where(
      and(eq(userJourneyDays.userJourneyId, userJourneyId), eq(userJourneyDays.dayNumber, dayNumber))
    );
    return day;
  }

  async completeJourneyDay(userJourneyId: number, dayNumber: number, notes?: string, reflectionResponse?: string): Promise<UserJourneyDay> {
    const existing = await this.getUserJourneyDay(userJourneyId, dayNumber);
    if (existing) {
      const [updated] = await db.update(userJourneyDays).set({
        completedAt: new Date(),
        notes: notes || existing.notes,
        reflectionResponse: reflectionResponse || existing.reflectionResponse,
      }).where(eq(userJourneyDays.id, existing.id)).returning();
      return updated;
    }
    const [day] = await db.insert(userJourneyDays).values({
      userJourneyId,
      dayNumber,
      completedAt: new Date(),
      notes,
      reflectionResponse,
    }).returning();
    return day;
  }

  // ===== STREAKS =====

  async getUserStreak(userId: string): Promise<UserStreak | undefined> {
    const [streak] = await db.select().from(userStreaks).where(eq(userStreaks.userId, userId));
    return streak;
  }

  async updateUserStreak(userId: string, streakData: Partial<InsertUserStreak>): Promise<UserStreak> {
    const existing = await this.getUserStreak(userId);
    if (existing) {
      const [updated] = await db.update(userStreaks).set(streakData).where(eq(userStreaks.userId, userId)).returning();
      return updated;
    }
    const [streak] = await db.insert(userStreaks).values({
      userId,
      currentStreak: streakData.currentStreak || 0,
      longestStreak: streakData.longestStreak || 0,
      lastCompletedDate: streakData.lastCompletedDate,
    }).returning();
    return streak;
  }

  // ===== BADGES =====

  async getBadges(): Promise<Badge[]> {
    return db.select().from(badges);
  }

  async getBadgeByCode(code: string): Promise<Badge | undefined> {
    const [badge] = await db.select().from(badges).where(eq(badges.code, code));
    return badge;
  }

  async createBadge(badgeData: InsertBadge): Promise<Badge> {
    const [badge] = await db.insert(badges).values(badgeData).returning();
    return badge;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return db.select().from(userBadges).where(eq(userBadges.userId, userId));
  }

  async hasUserBadge(userId: string, badgeId: number): Promise<boolean> {
    const [existing] = await db.select().from(userBadges).where(
      and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId))
    );
    return !!existing;
  }

  async awardBadge(userId: string, badgeId: number): Promise<UserBadge> {
    const [userBadge] = await db.insert(userBadges).values({ userId, badgeId }).returning();
    return userBadge;
  }

  // ===== ALPHA COHORTS =====

  async getAlphaCohorts(status?: string): Promise<AlphaCohort[]> {
    if (status) {
      return db.select().from(alphaCohorts).where(eq(alphaCohorts.status, status)).orderBy(desc(alphaCohorts.startDate));
    }
    return db.select().from(alphaCohorts).orderBy(desc(alphaCohorts.startDate));
  }

  async getAlphaCohort(id: number): Promise<AlphaCohort | undefined> {
    const [cohort] = await db.select().from(alphaCohorts).where(eq(alphaCohorts.id, id));
    return cohort;
  }

  async createAlphaCohort(cohortData: InsertAlphaCohort): Promise<AlphaCohort> {
    const [cohort] = await db.insert(alphaCohorts).values(cohortData).returning();
    return cohort;
  }

  async getAlphaCohortWeeks(cohortId: number): Promise<AlphaCohortWeek[]> {
    return db.select().from(alphaCohortWeeks).where(eq(alphaCohortWeeks.cohortId, cohortId)).orderBy(alphaCohortWeeks.weekNumber);
  }

  async createAlphaCohortWeek(weekData: InsertAlphaCohortWeek): Promise<AlphaCohortWeek> {
    const [week] = await db.insert(alphaCohortWeeks).values(weekData).returning();
    return week;
  }

  // ===== ALPHA COHORT PARTICIPANTS =====

  async getAlphaCohortParticipants(cohortId: number): Promise<AlphaCohortParticipant[]> {
    return db.select().from(alphaCohortParticipants).where(eq(alphaCohortParticipants.cohortId, cohortId));
  }

  async getAlphaCohortParticipant(cohortId: number, userId: string): Promise<AlphaCohortParticipant | undefined> {
    const [participant] = await db.select().from(alphaCohortParticipants).where(
      and(eq(alphaCohortParticipants.cohortId, cohortId), eq(alphaCohortParticipants.userId, userId))
    );
    return participant;
  }

  async getAlphaCohortParticipantById(participantId: number): Promise<AlphaCohortParticipant | undefined> {
    const [participant] = await db.select().from(alphaCohortParticipants).where(eq(alphaCohortParticipants.id, participantId));
    return participant;
  }

  async enrollInAlphaCohort(cohortId: number, userId: string, role: string = "participant"): Promise<AlphaCohortParticipant> {
    const [participant] = await db.insert(alphaCohortParticipants).values({
      cohortId,
      userId,
      role,
      status: "approved",
    }).returning();
    return participant;
  }

  async getUserAlphaCohorts(userId: string): Promise<AlphaCohortParticipant[]> {
    return db.select().from(alphaCohortParticipants).where(eq(alphaCohortParticipants.userId, userId));
  }

  // ===== ALPHA COHORT PROGRESS =====

  async getAlphaCohortWeekProgress(participantId: number): Promise<AlphaCohortWeekProgress[]> {
    return db.select().from(alphaCohortWeekProgress).where(eq(alphaCohortWeekProgress.participantId, participantId)).orderBy(alphaCohortWeekProgress.weekNumber);
  }

  async updateAlphaCohortWeekProgress(participantId: number, weekNumber: number, updates: Partial<InsertAlphaCohortWeekProgress>): Promise<AlphaCohortWeekProgress> {
    const [existing] = await db.select().from(alphaCohortWeekProgress).where(
      and(eq(alphaCohortWeekProgress.participantId, participantId), eq(alphaCohortWeekProgress.weekNumber, weekNumber))
    );
    
    if (existing) {
      const [updated] = await db.update(alphaCohortWeekProgress).set(updates).where(eq(alphaCohortWeekProgress.id, existing.id)).returning();
      return updated;
    }
    
    const [progress] = await db.insert(alphaCohortWeekProgress).values({
      participantId,
      weekNumber,
      ...updates,
    }).returning();
    return progress;
  }
}

export const storage = new DatabaseStorage();
