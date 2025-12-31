import {
  users,
  posts,
  reactions,
  sparks,
  sparkReactions,
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
  journeyWeeks,
  sessionSections,
  mentorPrompts,
  mentorAssignments,
  buddyPairs,
  iWillCommitments,
  buddyCheckIns,
  mentorCheckInLogs,
  dailyReflections,
  reflectionLogs,
  type User,
  type UpsertUser,
  type Post,
  type InsertPost,
  type Reaction,
  type InsertReaction,
  type Spark,
  type InsertSpark,
  type SparkReaction,
  type InsertSparkReaction,
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
  type JourneyWeek,
  type InsertJourneyWeek,
  type SessionSection,
  type InsertSessionSection,
  type MentorPrompt,
  type InsertMentorPrompt,
  type MentorAssignment,
  type InsertMentorAssignment,
  type BuddyPair,
  type InsertBuddyPair,
  type IWillCommitment,
  type InsertIWillCommitment,
  type BuddyCheckIn,
  type InsertBuddyCheckIn,
  type MentorCheckInLog,
  type InsertMentorCheckInLog,
  pathwaySessions,
  wheelLifeEntries,
  focusAreas,
  valuesSelection,
  visionStatements,
  purposeFlower,
  visionGoals,
  goalMilestones,
  ninetyDayPlans,
  visionHabits,
  habitLogs,
  dailyCheckins,
  weeklyReviews,
  visionExports,
  type PathwaySession,
  type InsertPathwaySession,
  type WheelLifeEntry,
  type InsertWheelLifeEntry,
  type FocusArea,
  type InsertFocusArea,
  type ValuesSelection,
  type InsertValuesSelection,
  type VisionStatement,
  type InsertVisionStatement,
  type PurposeFlower,
  type InsertPurposeFlower,
  type VisionGoal,
  type InsertVisionGoal,
  type GoalMilestone,
  type InsertGoalMilestone,
  type NinetyDayPlan,
  type InsertNinetyDayPlan,
  type VisionHabit,
  type InsertVisionHabit,
  type HabitLog,
  type InsertHabitLog,
  type DailyCheckin,
  type InsertDailyCheckin,
  type WeeklyReview,
  type InsertWeeklyReview,
  type VisionExport,
  type InsertVisionExport,
  tracks,
  modules,
  userModuleProgress,
  assessments,
  assessmentQuestions,
  assessmentResponses,
  assessmentAnswers,
  assessmentScores,
  assessmentInsights,
  strengthsCatalog,
  userStrengths,
  stylesProfiles,
  userStyles,
  eqDomains,
  userEqScores,
  practiceLibrary,
  userPracticeLogs,
  wdepEntries,
  wdepWants,
  wdepDoing,
  wdepEvaluation,
  wdepPlan,
  wdepExperiments,
  wdepExperimentLogs,
  scaExercises,
  scaFocusItems,
  type Track,
  type InsertTrack,
  type Module,
  type InsertModule,
  type UserModuleProgress,
  type InsertUserModuleProgress,
  type Assessment,
  type InsertAssessment,
  type AssessmentQuestion,
  type InsertAssessmentQuestion,
  type AssessmentResponse,
  type InsertAssessmentResponse,
  type AssessmentAnswer,
  type InsertAssessmentAnswer,
  type AssessmentScore,
  type InsertAssessmentScore,
  type AssessmentInsight,
  type InsertAssessmentInsight,
  type StrengthsCatalog,
  type InsertStrengthsCatalog,
  type UserStrength,
  type InsertUserStrength,
  type StylesProfile,
  type InsertStylesProfile,
  type UserStyle,
  type InsertUserStyle,
  type EqDomain,
  type InsertEqDomain,
  type UserEqScore,
  type InsertUserEqScore,
  type PracticeLibraryItem,
  type InsertPracticeLibrary,
  type UserPracticeLog,
  type InsertUserPracticeLog,
  type WdepEntry,
  type InsertWdepEntry,
  type WdepWants,
  type InsertWdepWants,
  type WdepDoing,
  type InsertWdepDoing,
  type WdepEvaluation,
  type InsertWdepEvaluation,
  type WdepPlan,
  type InsertWdepPlan,
  type WdepExperiment,
  type InsertWdepExperiment,
  type WdepExperimentLog,
  type InsertWdepExperimentLog,
  type ScaExercise,
  type InsertScaExercise,
  type ScaFocusItem,
  type InsertScaFocusItem,
  type DailyReflection,
  type InsertDailyReflection,
  type ReflectionLog,
  type InsertReflectionLog,
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

  // Spark Reactions
  getSparkReactions(sparkId: number): Promise<SparkReaction[]>;
  getSparkReactionCounts(sparkId: number): Promise<{ reactionType: string; count: number }[]>;
  getUserSparkReaction(sparkId: number, userId: string): Promise<SparkReaction | undefined>;
  createSparkReaction(reaction: InsertSparkReaction): Promise<SparkReaction>;
  deleteSparkReaction(sparkId: number, userId: string, reactionType: string): Promise<void>;

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

  // Journey Weeks (8-week programs)
  getJourneyWeeks(journeyId: number): Promise<JourneyWeek[]>;
  getJourneyWeek(journeyId: number, weekNumber: number): Promise<JourneyWeek | undefined>;
  createJourneyWeek(week: InsertJourneyWeek): Promise<JourneyWeek>;

  // Session Sections
  getSessionSections(journeyWeekId: number): Promise<SessionSection[]>;
  createSessionSection(section: InsertSessionSection): Promise<SessionSection>;

  // Mentor Prompts
  getMentorPrompts(journeyWeekId: number): Promise<MentorPrompt[]>;
  createMentorPrompt(prompt: InsertMentorPrompt): Promise<MentorPrompt>;

  // I Will Commitments
  getIWillCommitments(userJourneyId: number): Promise<IWillCommitment[]>;
  createIWillCommitment(commitment: InsertIWillCommitment): Promise<IWillCommitment>;
  completeIWillCommitment(id: number, reflectionNotes?: string): Promise<IWillCommitment>;

  // Buddy Pairs
  getBuddyPairs(journeyId: number): Promise<BuddyPair[]>;
  createBuddyPair(pair: InsertBuddyPair): Promise<BuddyPair>;

  // Mentor Assignments
  getMentorAssignments(userJourneyId: number): Promise<MentorAssignment[]>;
  createMentorAssignment(assignment: InsertMentorAssignment): Promise<MentorAssignment>;

  // Vision Pathway - Sessions
  getPathwaySessions(userId: string): Promise<PathwaySession[]>;
  getCurrentPathwaySession(userId: string): Promise<PathwaySession | undefined>;
  getPathwaySession(id: number): Promise<PathwaySession | undefined>;
  createPathwaySession(session: InsertPathwaySession): Promise<PathwaySession>;
  updatePathwaySession(id: number, data: Partial<InsertPathwaySession>): Promise<PathwaySession>;

  // Vision Pathway - Wheel of Life
  getWheelEntries(sessionId: number): Promise<WheelLifeEntry[]>;
  upsertWheelEntries(sessionId: number, entries: InsertWheelLifeEntry[]): Promise<WheelLifeEntry[]>;
  getFocusAreas(sessionId: number): Promise<FocusArea[]>;
  upsertFocusAreas(sessionId: number, areas: InsertFocusArea[]): Promise<FocusArea[]>;

  // Vision Pathway - Values
  getValuesSelection(sessionId: number): Promise<ValuesSelection | undefined>;
  upsertValuesSelection(sessionId: number, data: Omit<InsertValuesSelection, 'sessionId'>): Promise<ValuesSelection>;

  // Vision Pathway - Vision Statement
  getVisionStatement(sessionId: number): Promise<VisionStatement | undefined>;
  upsertVisionStatement(sessionId: number, data: Omit<InsertVisionStatement, 'sessionId'>): Promise<VisionStatement>;

  // Vision Pathway - Purpose Flower
  getPurposeFlower(sessionId: number): Promise<PurposeFlower | undefined>;
  upsertPurposeFlower(sessionId: number, data: Omit<InsertPurposeFlower, 'sessionId'>): Promise<PurposeFlower>;

  // Vision Pathway - Goals
  getVisionGoals(sessionId: number): Promise<VisionGoal[]>;
  getVisionGoal(id: number): Promise<VisionGoal | undefined>;
  createVisionGoal(goal: InsertVisionGoal): Promise<VisionGoal>;
  updateVisionGoal(id: number, data: Partial<InsertVisionGoal>): Promise<VisionGoal>;

  // Vision Pathway - Milestones
  getGoalMilestones(goalId: number): Promise<GoalMilestone[]>;
  createGoalMilestone(milestone: InsertGoalMilestone): Promise<GoalMilestone>;
  updateGoalMilestone(id: number, data: Partial<InsertGoalMilestone>): Promise<GoalMilestone>;
  deleteGoalMilestone(id: number): Promise<void>;

  // Vision Pathway - 90-Day Plan
  getNinetyDayPlan(sessionId: number): Promise<NinetyDayPlan | undefined>;
  upsertNinetyDayPlan(sessionId: number, data: Omit<InsertNinetyDayPlan, 'sessionId'>): Promise<NinetyDayPlan>;

  // Vision Pathway - Habits
  getVisionHabits(sessionId: number): Promise<VisionHabit[]>;
  createVisionHabit(habit: InsertVisionHabit): Promise<VisionHabit>;
  updateVisionHabit(id: number, data: Partial<InsertVisionHabit>): Promise<VisionHabit>;
  deleteVisionHabit(id: number): Promise<void>;
  getHabitLogs(habitId: number): Promise<HabitLog[]>;
  upsertHabitLog(habitId: number, date: string, completed: boolean): Promise<HabitLog>;

  // Vision Pathway - Check-ins
  getDailyCheckin(sessionId: number, date: string): Promise<DailyCheckin | undefined>;
  upsertDailyCheckin(sessionId: number, date: string, data: Omit<InsertDailyCheckin, 'sessionId' | 'date'>): Promise<DailyCheckin>;
  getWeeklyReview(sessionId: number, weekStartDate: string): Promise<WeeklyReview | undefined>;
  upsertWeeklyReview(sessionId: number, weekStartDate: string, data: Omit<InsertWeeklyReview, 'sessionId' | 'weekStartDate'>): Promise<WeeklyReview>;

  // Vision Pathway - Exports
  getVisionExports(sessionId: number): Promise<VisionExport[]>;
  createVisionExport(exportData: InsertVisionExport): Promise<VisionExport>;

  // ===== GROWTH TOOLS: TRACKS & MODULES =====
  getTracks(): Promise<Track[]>;
  getTrack(key: string): Promise<Track | undefined>;
  getModules(trackId: number): Promise<Module[]>;
  getModule(key: string): Promise<Module | undefined>;
  getUserModuleProgress(userId: string, sessionId?: number): Promise<UserModuleProgress[]>;
  upsertUserModuleProgress(data: InsertUserModuleProgress): Promise<UserModuleProgress>;

  // ===== ASSESSMENT ENGINE =====
  getAssessment(key: string): Promise<Assessment | undefined>;
  getAssessmentQuestions(assessmentId: number): Promise<AssessmentQuestion[]>;
  createAssessmentResponse(data: InsertAssessmentResponse): Promise<AssessmentResponse>;
  getAssessmentResponse(id: number): Promise<AssessmentResponse | undefined>;
  getUserAssessmentResponses(userId: string, assessmentKey?: string): Promise<AssessmentResponse[]>;
  updateAssessmentResponse(id: number, data: Partial<AssessmentResponse>): Promise<AssessmentResponse>;
  upsertAssessmentAnswer(responseId: number, questionId: number, data: Partial<InsertAssessmentAnswer>): Promise<AssessmentAnswer>;
  getAssessmentAnswers(responseId: number): Promise<AssessmentAnswer[]>;
  createAssessmentScore(data: InsertAssessmentScore): Promise<AssessmentScore>;
  getAssessmentScores(responseId: number): Promise<AssessmentScore[]>;
  createAssessmentInsight(data: InsertAssessmentInsight): Promise<AssessmentInsight>;
  getAssessmentInsight(responseId: number): Promise<AssessmentInsight | undefined>;

  // ===== STRENGTHS =====
  getStrengthsCatalog(): Promise<StrengthsCatalog[]>;
  getStrength(key: string): Promise<StrengthsCatalog | undefined>;
  getUserStrengths(sessionId: number): Promise<UserStrength[]>;
  upsertUserStrengths(sessionId: number, userId: string, strengths: Omit<InsertUserStrength, 'sessionId' | 'userId'>[]): Promise<UserStrength[]>;

  // ===== 4 STYLES =====
  getStylesProfiles(): Promise<StylesProfile[]>;
  getStyleProfile(key: string): Promise<StylesProfile | undefined>;
  getUserStyle(sessionId: number): Promise<UserStyle | undefined>;
  upsertUserStyle(data: InsertUserStyle): Promise<UserStyle>;

  // ===== EQ =====
  getEqDomains(): Promise<EqDomain[]>;
  getUserEqScores(sessionId: number): Promise<UserEqScore[]>;
  createUserEqScore(data: InsertUserEqScore): Promise<UserEqScore>;

  // ===== PRACTICE LIBRARY =====
  getPractices(domainKey?: string): Promise<PracticeLibraryItem[]>;
  getPractice(key: string): Promise<PracticeLibraryItem | undefined>;
  getUserPracticeLogs(userId: string, sessionId?: number): Promise<UserPracticeLog[]>;
  createUserPracticeLog(data: InsertUserPracticeLog): Promise<UserPracticeLog>;

  // ===== WDEP =====
  createWdepEntry(data: InsertWdepEntry): Promise<WdepEntry>;
  getWdepEntry(id: number): Promise<WdepEntry | undefined>;
  getWdepEntries(userId: string, sessionId?: number): Promise<WdepEntry[]>;
  updateWdepEntry(id: number, data: Partial<WdepEntry>): Promise<WdepEntry>;
  upsertWdepWants(wdepEntryId: number, data: Omit<InsertWdepWants, 'wdepEntryId'>): Promise<WdepWants>;
  getWdepWants(wdepEntryId: number): Promise<WdepWants | undefined>;
  upsertWdepDoing(wdepEntryId: number, data: Omit<InsertWdepDoing, 'wdepEntryId'>): Promise<WdepDoing>;
  getWdepDoing(wdepEntryId: number): Promise<WdepDoing | undefined>;
  upsertWdepEvaluation(wdepEntryId: number, data: Omit<InsertWdepEvaluation, 'wdepEntryId'>): Promise<WdepEvaluation>;
  getWdepEvaluation(wdepEntryId: number): Promise<WdepEvaluation | undefined>;
  upsertWdepPlan(wdepEntryId: number, data: Omit<InsertWdepPlan, 'wdepEntryId'>): Promise<WdepPlan>;
  getWdepPlan(wdepEntryId: number): Promise<WdepPlan | undefined>;
  createWdepExperiment(data: InsertWdepExperiment): Promise<WdepExperiment>;
  getWdepExperiment(wdepEntryId: number): Promise<WdepExperiment | undefined>;
  getWdepExperimentById(id: number): Promise<WdepExperiment | undefined>;
  updateWdepExperiment(id: number, data: Partial<WdepExperiment>): Promise<WdepExperiment>;
  createWdepExperimentLog(data: InsertWdepExperimentLog): Promise<WdepExperimentLog>;
  getWdepExperimentLogs(experimentId: number): Promise<WdepExperimentLog[]>;

  // ===== SELF-CONCORDANT ACTION =====
  createScaExercise(data: InsertScaExercise): Promise<ScaExercise>;
  getScaExercise(id: number): Promise<ScaExercise | undefined>;
  getScaExercises(userId: string, sessionId?: number): Promise<ScaExercise[]>;
  updateScaExercise(id: number, data: Partial<ScaExercise>): Promise<ScaExercise>;
  createScaFocusItem(data: InsertScaFocusItem): Promise<ScaFocusItem>;
  getScaFocusItems(scaExerciseId: number): Promise<ScaFocusItem[]>;

  // ===== DAILY REFLECTIONS =====
  getTodayReflection(): Promise<DailyReflection | undefined>;
  getReflection(id: number): Promise<DailyReflection | undefined>;
  getAllReflections(): Promise<DailyReflection[]>;
  createReflection(data: InsertDailyReflection): Promise<DailyReflection>;
  getUserReflectionLog(userId: string, reflectionId: number): Promise<ReflectionLog | undefined>;
  getUserReflectionStreak(userId: string): Promise<number>;
  logReflectionView(userId: string, reflectionId: number): Promise<ReflectionLog>;
  logReflectionEngagement(userId: string, reflectionId: number, data: { journalEntry?: string; reaction?: string }): Promise<ReflectionLog>;
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

  // Spark Reactions
  async getSparkReactions(sparkId: number): Promise<SparkReaction[]> {
    return db.select().from(sparkReactions).where(eq(sparkReactions.sparkId, sparkId));
  }

  async getSparkReactionCounts(sparkId: number): Promise<{ reactionType: string; count: number }[]> {
    const results = await db
      .select({
        reactionType: sparkReactions.reactionType,
        count: count(sparkReactions.id),
      })
      .from(sparkReactions)
      .where(eq(sparkReactions.sparkId, sparkId))
      .groupBy(sparkReactions.reactionType);
    return results;
  }

  async getUserSparkReaction(sparkId: number, userId: string): Promise<SparkReaction | undefined> {
    const [reaction] = await db.select().from(sparkReactions).where(
      and(eq(sparkReactions.sparkId, sparkId), eq(sparkReactions.userId, userId))
    );
    return reaction;
  }

  async createSparkReaction(reactionData: InsertSparkReaction): Promise<SparkReaction> {
    const [reaction] = await db.insert(sparkReactions).values(reactionData).returning();
    return reaction;
  }

  async deleteSparkReaction(sparkId: number, userId: string, reactionType: string): Promise<void> {
    await db.delete(sparkReactions).where(
      and(eq(sparkReactions.sparkId, sparkId), eq(sparkReactions.userId, userId), eq(sparkReactions.reactionType, reactionType))
    );
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

  // ===== JOURNEY WEEKS (8-Week Programs) =====

  async getJourneyWeeks(journeyId: number): Promise<JourneyWeek[]> {
    return db.select().from(journeyWeeks).where(eq(journeyWeeks.journeyId, journeyId)).orderBy(journeyWeeks.weekNumber);
  }

  async getJourneyWeek(journeyId: number, weekNumber: number): Promise<JourneyWeek | undefined> {
    const [week] = await db.select().from(journeyWeeks).where(
      and(eq(journeyWeeks.journeyId, journeyId), eq(journeyWeeks.weekNumber, weekNumber))
    );
    return week;
  }

  async createJourneyWeek(weekData: InsertJourneyWeek): Promise<JourneyWeek> {
    const [week] = await db.insert(journeyWeeks).values(weekData).returning();
    return week;
  }

  // ===== SESSION SECTIONS =====

  async getSessionSections(journeyWeekId: number): Promise<SessionSection[]> {
    return db.select().from(sessionSections).where(eq(sessionSections.journeyWeekId, journeyWeekId)).orderBy(sessionSections.sectionOrder);
  }

  async createSessionSection(sectionData: InsertSessionSection): Promise<SessionSection> {
    const [section] = await db.insert(sessionSections).values(sectionData).returning();
    return section;
  }

  // ===== MENTOR PROMPTS =====

  async getMentorPrompts(journeyWeekId: number): Promise<MentorPrompt[]> {
    return db.select().from(mentorPrompts).where(eq(mentorPrompts.journeyWeekId, journeyWeekId));
  }

  async createMentorPrompt(promptData: InsertMentorPrompt): Promise<MentorPrompt> {
    const [prompt] = await db.insert(mentorPrompts).values(promptData).returning();
    return prompt;
  }

  // ===== I WILL COMMITMENTS =====

  async getIWillCommitments(userJourneyId: number): Promise<IWillCommitment[]> {
    return db.select().from(iWillCommitments).where(eq(iWillCommitments.userJourneyId, userJourneyId)).orderBy(iWillCommitments.weekNumber);
  }

  async createIWillCommitment(commitmentData: InsertIWillCommitment): Promise<IWillCommitment> {
    const [commitment] = await db.insert(iWillCommitments).values(commitmentData).returning();
    return commitment;
  }

  async completeIWillCommitment(id: number, reflectionNotes?: string): Promise<IWillCommitment> {
    const [commitment] = await db.update(iWillCommitments)
      .set({ completedAt: new Date(), reflectionNotes })
      .where(eq(iWillCommitments.id, id))
      .returning();
    return commitment;
  }

  // ===== BUDDY PAIRS =====

  async getBuddyPairs(journeyId: number): Promise<BuddyPair[]> {
    return db.select().from(buddyPairs).where(eq(buddyPairs.journeyId, journeyId));
  }

  async createBuddyPair(pairData: InsertBuddyPair): Promise<BuddyPair> {
    const [pair] = await db.insert(buddyPairs).values(pairData).returning();
    return pair;
  }

  // ===== MENTOR ASSIGNMENTS =====

  async getMentorAssignments(userJourneyId: number): Promise<MentorAssignment[]> {
    return db.select().from(mentorAssignments).where(eq(mentorAssignments.userJourneyId, userJourneyId));
  }

  async createMentorAssignment(assignmentData: InsertMentorAssignment): Promise<MentorAssignment> {
    const [assignment] = await db.insert(mentorAssignments).values(assignmentData).returning();
    return assignment;
  }

  // ===== VISION PATHWAY - SESSIONS =====

  async getPathwaySessions(userId: string): Promise<PathwaySession[]> {
    return db.select().from(pathwaySessions).where(eq(pathwaySessions.userId, userId)).orderBy(desc(pathwaySessions.startedAt));
  }

  async getCurrentPathwaySession(userId: string): Promise<PathwaySession | undefined> {
    const [session] = await db.select().from(pathwaySessions)
      .where(and(eq(pathwaySessions.userId, userId), eq(pathwaySessions.status, "active")))
      .orderBy(desc(pathwaySessions.startedAt))
      .limit(1);
    return session;
  }

  async getPathwaySession(id: number): Promise<PathwaySession | undefined> {
    const [session] = await db.select().from(pathwaySessions).where(eq(pathwaySessions.id, id));
    return session;
  }

  async createPathwaySession(sessionData: InsertPathwaySession): Promise<PathwaySession> {
    const [session] = await db.insert(pathwaySessions).values(sessionData).returning();
    return session;
  }

  async updatePathwaySession(id: number, data: Partial<InsertPathwaySession>): Promise<PathwaySession> {
    const [session] = await db.update(pathwaySessions).set(data).where(eq(pathwaySessions.id, id)).returning();
    return session;
  }

  // ===== VISION PATHWAY - WHEEL OF LIFE =====

  async getWheelEntries(sessionId: number): Promise<WheelLifeEntry[]> {
    return db.select().from(wheelLifeEntries).where(eq(wheelLifeEntries.sessionId, sessionId));
  }

  async upsertWheelEntries(sessionId: number, entries: InsertWheelLifeEntry[]): Promise<WheelLifeEntry[]> {
    await db.delete(wheelLifeEntries).where(eq(wheelLifeEntries.sessionId, sessionId));
    if (entries.length === 0) return [];
    return db.insert(wheelLifeEntries).values(entries).returning();
  }

  async getFocusAreas(sessionId: number): Promise<FocusArea[]> {
    return db.select().from(focusAreas).where(eq(focusAreas.sessionId, sessionId)).orderBy(focusAreas.priority);
  }

  async upsertFocusAreas(sessionId: number, areas: InsertFocusArea[]): Promise<FocusArea[]> {
    await db.delete(focusAreas).where(eq(focusAreas.sessionId, sessionId));
    if (areas.length === 0) return [];
    return db.insert(focusAreas).values(areas).returning();
  }

  // ===== VISION PATHWAY - VALUES =====

  async getValuesSelection(sessionId: number): Promise<ValuesSelection | undefined> {
    const [values] = await db.select().from(valuesSelection).where(eq(valuesSelection.sessionId, sessionId));
    return values;
  }

  async upsertValuesSelection(sessionId: number, data: Omit<InsertValuesSelection, 'sessionId'>): Promise<ValuesSelection> {
    const existing = await this.getValuesSelection(sessionId);
    if (existing) {
      const [updated] = await db.update(valuesSelection).set(data).where(eq(valuesSelection.sessionId, sessionId)).returning();
      return updated;
    }
    const [created] = await db.insert(valuesSelection).values({ ...data, sessionId }).returning();
    return created;
  }

  // ===== VISION PATHWAY - VISION STATEMENT =====

  async getVisionStatement(sessionId: number): Promise<VisionStatement | undefined> {
    const [vision] = await db.select().from(visionStatements).where(eq(visionStatements.sessionId, sessionId));
    return vision;
  }

  async upsertVisionStatement(sessionId: number, data: Omit<InsertVisionStatement, 'sessionId'>): Promise<VisionStatement> {
    const existing = await this.getVisionStatement(sessionId);
    if (existing) {
      const [updated] = await db.update(visionStatements).set(data).where(eq(visionStatements.sessionId, sessionId)).returning();
      return updated;
    }
    const [created] = await db.insert(visionStatements).values({ ...data, sessionId }).returning();
    return created;
  }

  // ===== VISION PATHWAY - PURPOSE FLOWER =====

  async getPurposeFlower(sessionId: number): Promise<PurposeFlower | undefined> {
    const [flower] = await db.select().from(purposeFlower).where(eq(purposeFlower.sessionId, sessionId));
    return flower;
  }

  async upsertPurposeFlower(sessionId: number, data: Omit<InsertPurposeFlower, 'sessionId'>): Promise<PurposeFlower> {
    const existing = await this.getPurposeFlower(sessionId);
    if (existing) {
      const [updated] = await db.update(purposeFlower).set(data).where(eq(purposeFlower.sessionId, sessionId)).returning();
      return updated;
    }
    const [created] = await db.insert(purposeFlower).values({ ...data, sessionId }).returning();
    return created;
  }

  // ===== VISION PATHWAY - GOALS =====

  async getVisionGoals(sessionId: number): Promise<VisionGoal[]> {
    return db.select().from(visionGoals).where(eq(visionGoals.sessionId, sessionId)).orderBy(desc(visionGoals.createdAt));
  }

  async getVisionGoal(id: number): Promise<VisionGoal | undefined> {
    const [goal] = await db.select().from(visionGoals).where(eq(visionGoals.id, id));
    return goal;
  }

  async createVisionGoal(goalData: InsertVisionGoal): Promise<VisionGoal> {
    const [goal] = await db.insert(visionGoals).values(goalData).returning();
    return goal;
  }

  async updateVisionGoal(id: number, data: Partial<InsertVisionGoal>): Promise<VisionGoal> {
    const [goal] = await db.update(visionGoals).set(data).where(eq(visionGoals.id, id)).returning();
    return goal;
  }

  async getGoalMilestones(goalId: number): Promise<GoalMilestone[]> {
    return db.select().from(goalMilestones).where(eq(goalMilestones.goalId, goalId)).orderBy(goalMilestones.dueDate);
  }

  async createGoalMilestone(milestoneData: InsertGoalMilestone): Promise<GoalMilestone> {
    const [milestone] = await db.insert(goalMilestones).values(milestoneData).returning();
    return milestone;
  }

  async updateGoalMilestone(id: number, data: Partial<InsertGoalMilestone>): Promise<GoalMilestone> {
    const [milestone] = await db.update(goalMilestones).set(data).where(eq(goalMilestones.id, id)).returning();
    return milestone;
  }

  async deleteGoalMilestone(id: number): Promise<void> {
    await db.delete(goalMilestones).where(eq(goalMilestones.id, id));
  }

  // ===== VISION PATHWAY - 90-DAY PLAN =====

  async getNinetyDayPlan(sessionId: number): Promise<NinetyDayPlan | undefined> {
    const [plan] = await db.select().from(ninetyDayPlans).where(eq(ninetyDayPlans.sessionId, sessionId));
    return plan;
  }

  async upsertNinetyDayPlan(sessionId: number, data: Omit<InsertNinetyDayPlan, 'sessionId'>): Promise<NinetyDayPlan> {
    const existing = await this.getNinetyDayPlan(sessionId);
    if (existing) {
      const [updated] = await db.update(ninetyDayPlans).set(data).where(eq(ninetyDayPlans.sessionId, sessionId)).returning();
      return updated;
    }
    const [created] = await db.insert(ninetyDayPlans).values({ ...data, sessionId }).returning();
    return created;
  }

  // ===== VISION PATHWAY - HABITS =====

  async getVisionHabits(sessionId: number): Promise<VisionHabit[]> {
    return db.select().from(visionHabits).where(eq(visionHabits.sessionId, sessionId));
  }

  async createVisionHabit(habitData: InsertVisionHabit): Promise<VisionHabit> {
    const [habit] = await db.insert(visionHabits).values(habitData).returning();
    return habit;
  }

  async updateVisionHabit(id: number, data: Partial<InsertVisionHabit>): Promise<VisionHabit> {
    const [habit] = await db.update(visionHabits).set(data).where(eq(visionHabits.id, id)).returning();
    return habit;
  }

  async deleteVisionHabit(id: number): Promise<void> {
    await db.delete(visionHabits).where(eq(visionHabits.id, id));
  }

  async getHabitLogs(habitId: number): Promise<HabitLog[]> {
    return db.select().from(habitLogs).where(eq(habitLogs.habitId, habitId)).orderBy(desc(habitLogs.date));
  }

  async upsertHabitLog(habitId: number, date: string, completed: boolean): Promise<HabitLog> {
    const [existing] = await db.select().from(habitLogs).where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.date, date)));
    if (existing) {
      const [updated] = await db.update(habitLogs).set({ completed }).where(eq(habitLogs.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(habitLogs).values({ habitId, date, completed }).returning();
    return created;
  }

  // ===== VISION PATHWAY - CHECK-INS =====

  async getDailyCheckin(sessionId: number, date: string): Promise<DailyCheckin | undefined> {
    const [checkin] = await db.select().from(dailyCheckins).where(and(eq(dailyCheckins.sessionId, sessionId), eq(dailyCheckins.date, date)));
    return checkin;
  }

  async upsertDailyCheckin(sessionId: number, date: string, data: Omit<InsertDailyCheckin, 'sessionId' | 'date'>): Promise<DailyCheckin> {
    const existing = await this.getDailyCheckin(sessionId, date);
    if (existing) {
      const [updated] = await db.update(dailyCheckins).set(data).where(eq(dailyCheckins.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(dailyCheckins).values({ ...data, sessionId, date }).returning();
    return created;
  }

  async getWeeklyReview(sessionId: number, weekStartDate: string): Promise<WeeklyReview | undefined> {
    const [review] = await db.select().from(weeklyReviews).where(and(eq(weeklyReviews.sessionId, sessionId), eq(weeklyReviews.weekStartDate, weekStartDate)));
    return review;
  }

  async upsertWeeklyReview(sessionId: number, weekStartDate: string, data: Omit<InsertWeeklyReview, 'sessionId' | 'weekStartDate'>): Promise<WeeklyReview> {
    const existing = await this.getWeeklyReview(sessionId, weekStartDate);
    if (existing) {
      const [updated] = await db.update(weeklyReviews).set(data).where(eq(weeklyReviews.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(weeklyReviews).values({ ...data, sessionId, weekStartDate }).returning();
    return created;
  }

  // ===== VISION PATHWAY - EXPORTS =====

  async getVisionExports(sessionId: number): Promise<VisionExport[]> {
    return db.select().from(visionExports).where(eq(visionExports.sessionId, sessionId)).orderBy(desc(visionExports.createdAt));
  }

  async createVisionExport(exportData: InsertVisionExport): Promise<VisionExport> {
    const [exp] = await db.insert(visionExports).values(exportData).returning();
    return exp;
  }

  // ===== GROWTH TOOLS: TRACKS & MODULES =====

  async getTracks(): Promise<Track[]> {
    return db.select().from(tracks).where(eq(tracks.isEnabled, true)).orderBy(tracks.orderIndex);
  }

  async getTrack(key: string): Promise<Track | undefined> {
    const [track] = await db.select().from(tracks).where(eq(tracks.key, key));
    return track;
  }

  async getModules(trackId: number): Promise<Module[]> {
    return db.select().from(modules).where(and(eq(modules.trackId, trackId), eq(modules.isEnabled, true))).orderBy(modules.orderIndex);
  }

  async getModule(key: string): Promise<Module | undefined> {
    const [mod] = await db.select().from(modules).where(eq(modules.key, key));
    return mod;
  }

  async getUserModuleProgress(userId: string, sessionId?: number): Promise<UserModuleProgress[]> {
    if (sessionId) {
      return db.select().from(userModuleProgress).where(and(eq(userModuleProgress.userId, userId), eq(userModuleProgress.sessionId, sessionId)));
    }
    return db.select().from(userModuleProgress).where(eq(userModuleProgress.userId, userId));
  }

  async upsertUserModuleProgress(data: InsertUserModuleProgress): Promise<UserModuleProgress> {
    const [existing] = await db.select().from(userModuleProgress).where(and(eq(userModuleProgress.userId, data.userId), eq(userModuleProgress.moduleId, data.moduleId)));
    if (existing) {
      const [updated] = await db.update(userModuleProgress).set({ ...data, lastViewedAt: new Date() }).where(eq(userModuleProgress.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(userModuleProgress).values({ ...data, startedAt: new Date() }).returning();
    return created;
  }

  // ===== ASSESSMENT ENGINE =====

  async getAssessment(key: string): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.key, key));
    return assessment;
  }

  async getAssessmentQuestions(assessmentId: number): Promise<AssessmentQuestion[]> {
    return db.select().from(assessmentQuestions).where(eq(assessmentQuestions.assessmentId, assessmentId)).orderBy(assessmentQuestions.orderIndex);
  }

  async createAssessmentResponse(data: InsertAssessmentResponse): Promise<AssessmentResponse> {
    const [response] = await db.insert(assessmentResponses).values(data).returning();
    return response;
  }

  async getAssessmentResponse(id: number): Promise<AssessmentResponse | undefined> {
    const [response] = await db.select().from(assessmentResponses).where(eq(assessmentResponses.id, id));
    return response;
  }

  async getUserAssessmentResponses(userId: string, assessmentKey?: string): Promise<AssessmentResponse[]> {
    if (assessmentKey) {
      const assessment = await this.getAssessment(assessmentKey);
      if (!assessment) return [];
      return db.select().from(assessmentResponses).where(and(eq(assessmentResponses.userId, userId), eq(assessmentResponses.assessmentId, assessment.id))).orderBy(desc(assessmentResponses.startedAt));
    }
    return db.select().from(assessmentResponses).where(eq(assessmentResponses.userId, userId)).orderBy(desc(assessmentResponses.startedAt));
  }

  async updateAssessmentResponse(id: number, data: Partial<AssessmentResponse>): Promise<AssessmentResponse> {
    const [response] = await db.update(assessmentResponses).set(data).where(eq(assessmentResponses.id, id)).returning();
    return response;
  }

  async upsertAssessmentAnswer(responseId: number, questionId: number, data: Partial<InsertAssessmentAnswer>): Promise<AssessmentAnswer> {
    const [existing] = await db.select().from(assessmentAnswers).where(and(eq(assessmentAnswers.responseId, responseId), eq(assessmentAnswers.questionId, questionId)));
    if (existing) {
      const [updated] = await db.update(assessmentAnswers).set(data).where(eq(assessmentAnswers.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(assessmentAnswers).values({ responseId, questionId, ...data }).returning();
    return created;
  }

  async getAssessmentAnswers(responseId: number): Promise<AssessmentAnswer[]> {
    return db.select().from(assessmentAnswers).where(eq(assessmentAnswers.responseId, responseId));
  }

  async createAssessmentScore(data: InsertAssessmentScore): Promise<AssessmentScore> {
    const [score] = await db.insert(assessmentScores).values(data).returning();
    return score;
  }

  async getAssessmentScores(responseId: number): Promise<AssessmentScore[]> {
    return db.select().from(assessmentScores).where(eq(assessmentScores.responseId, responseId));
  }

  async createAssessmentInsight(data: InsertAssessmentInsight): Promise<AssessmentInsight> {
    const [insight] = await db.insert(assessmentInsights).values(data).returning();
    return insight;
  }

  async getAssessmentInsight(responseId: number): Promise<AssessmentInsight | undefined> {
    const [insight] = await db.select().from(assessmentInsights).where(eq(assessmentInsights.responseId, responseId));
    return insight;
  }

  // ===== STRENGTHS =====

  async getStrengthsCatalog(): Promise<StrengthsCatalog[]> {
    return db.select().from(strengthsCatalog).orderBy(strengthsCatalog.orderIndex);
  }

  async getStrength(key: string): Promise<StrengthsCatalog | undefined> {
    const [strength] = await db.select().from(strengthsCatalog).where(eq(strengthsCatalog.key, key));
    return strength;
  }

  async getUserStrengths(sessionId: number): Promise<UserStrength[]> {
    return db.select().from(userStrengths).where(eq(userStrengths.sessionId, sessionId)).orderBy(userStrengths.rank);
  }

  async upsertUserStrengths(sessionId: number, userId: string, strengths: Omit<InsertUserStrength, 'sessionId' | 'userId'>[]): Promise<UserStrength[]> {
    await db.delete(userStrengths).where(eq(userStrengths.sessionId, sessionId));
    if (strengths.length === 0) return [];
    const toInsert = strengths.map(s => ({ ...s, sessionId, userId }));
    return db.insert(userStrengths).values(toInsert).returning();
  }

  // ===== 4 STYLES =====

  async getStylesProfiles(): Promise<StylesProfile[]> {
    return db.select().from(stylesProfiles);
  }

  async getStyleProfile(key: string): Promise<StylesProfile | undefined> {
    const [profile] = await db.select().from(stylesProfiles).where(eq(stylesProfiles.key, key));
    return profile;
  }

  async getUserStyle(sessionId: number): Promise<UserStyle | undefined> {
    const [style] = await db.select().from(userStyles).where(eq(userStyles.sessionId, sessionId));
    return style;
  }

  async upsertUserStyle(data: InsertUserStyle): Promise<UserStyle> {
    const existing = await this.getUserStyle(data.sessionId);
    if (existing) {
      const [updated] = await db.update(userStyles).set(data).where(eq(userStyles.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(userStyles).values(data).returning();
    return created;
  }

  // ===== EQ =====

  async getEqDomains(): Promise<EqDomain[]> {
    return db.select().from(eqDomains).orderBy(eqDomains.orderIndex);
  }

  async getUserEqScores(sessionId: number): Promise<UserEqScore[]> {
    return db.select().from(userEqScores).where(eq(userEqScores.sessionId, sessionId));
  }

  async createUserEqScore(data: InsertUserEqScore): Promise<UserEqScore> {
    const [score] = await db.insert(userEqScores).values(data).returning();
    return score;
  }

  // ===== PRACTICE LIBRARY =====

  async getPractices(domainKey?: string): Promise<PracticeLibraryItem[]> {
    const allPractices = await db.select().from(practiceLibrary).orderBy(practiceLibrary.orderIndex);
    if (!domainKey) return allPractices;
    return allPractices.filter(p => (p.domainKeys as string[] || []).includes(domainKey));
  }

  async getPractice(key: string): Promise<PracticeLibraryItem | undefined> {
    const [practice] = await db.select().from(practiceLibrary).where(eq(practiceLibrary.key, key));
    return practice;
  }

  async getUserPracticeLogs(userId: string, sessionId?: number): Promise<UserPracticeLog[]> {
    if (sessionId) {
      return db.select().from(userPracticeLogs).where(and(eq(userPracticeLogs.userId, userId), eq(userPracticeLogs.sessionId, sessionId))).orderBy(desc(userPracticeLogs.date));
    }
    return db.select().from(userPracticeLogs).where(eq(userPracticeLogs.userId, userId)).orderBy(desc(userPracticeLogs.date));
  }

  async createUserPracticeLog(data: InsertUserPracticeLog): Promise<UserPracticeLog> {
    const [log] = await db.insert(userPracticeLogs).values(data).returning();
    return log;
  }

  // ===== WDEP =====

  async createWdepEntry(data: InsertWdepEntry): Promise<WdepEntry> {
    const [entry] = await db.insert(wdepEntries).values(data).returning();
    return entry;
  }

  async getWdepEntry(id: number): Promise<WdepEntry | undefined> {
    const [entry] = await db.select().from(wdepEntries).where(eq(wdepEntries.id, id));
    return entry;
  }

  async getWdepEntries(userId: string, sessionId?: number): Promise<WdepEntry[]> {
    if (sessionId) {
      return db.select().from(wdepEntries).where(and(eq(wdepEntries.userId, userId), eq(wdepEntries.sessionId, sessionId))).orderBy(desc(wdepEntries.createdAt));
    }
    return db.select().from(wdepEntries).where(eq(wdepEntries.userId, userId)).orderBy(desc(wdepEntries.createdAt));
  }

  async updateWdepEntry(id: number, data: Partial<WdepEntry>): Promise<WdepEntry> {
    const [entry] = await db.update(wdepEntries).set({ ...data, updatedAt: new Date() }).where(eq(wdepEntries.id, id)).returning();
    return entry;
  }

  async upsertWdepWants(wdepEntryId: number, data: Omit<InsertWdepWants, 'wdepEntryId'>): Promise<WdepWants> {
    const existing = await this.getWdepWants(wdepEntryId);
    if (existing) {
      const [updated] = await db.update(wdepWants).set(data).where(eq(wdepWants.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(wdepWants).values({ ...data, wdepEntryId }).returning();
    return created;
  }

  async getWdepWants(wdepEntryId: number): Promise<WdepWants | undefined> {
    const [wants] = await db.select().from(wdepWants).where(eq(wdepWants.wdepEntryId, wdepEntryId));
    return wants;
  }

  async upsertWdepDoing(wdepEntryId: number, data: Omit<InsertWdepDoing, 'wdepEntryId'>): Promise<WdepDoing> {
    const existing = await this.getWdepDoing(wdepEntryId);
    if (existing) {
      const [updated] = await db.update(wdepDoing).set(data).where(eq(wdepDoing.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(wdepDoing).values({ ...data, wdepEntryId }).returning();
    return created;
  }

  async getWdepDoing(wdepEntryId: number): Promise<WdepDoing | undefined> {
    const [doing] = await db.select().from(wdepDoing).where(eq(wdepDoing.wdepEntryId, wdepEntryId));
    return doing;
  }

  async upsertWdepEvaluation(wdepEntryId: number, data: Omit<InsertWdepEvaluation, 'wdepEntryId'>): Promise<WdepEvaluation> {
    const existing = await this.getWdepEvaluation(wdepEntryId);
    if (existing) {
      const [updated] = await db.update(wdepEvaluation).set(data).where(eq(wdepEvaluation.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(wdepEvaluation).values({ ...data, wdepEntryId }).returning();
    return created;
  }

  async getWdepEvaluation(wdepEntryId: number): Promise<WdepEvaluation | undefined> {
    const [evaluation] = await db.select().from(wdepEvaluation).where(eq(wdepEvaluation.wdepEntryId, wdepEntryId));
    return evaluation;
  }

  async upsertWdepPlan(wdepEntryId: number, data: Omit<InsertWdepPlan, 'wdepEntryId'>): Promise<WdepPlan> {
    const existing = await this.getWdepPlan(wdepEntryId);
    if (existing) {
      const [updated] = await db.update(wdepPlan).set(data).where(eq(wdepPlan.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(wdepPlan).values({ ...data, wdepEntryId }).returning();
    return created;
  }

  async getWdepPlan(wdepEntryId: number): Promise<WdepPlan | undefined> {
    const [plan] = await db.select().from(wdepPlan).where(eq(wdepPlan.wdepEntryId, wdepEntryId));
    return plan;
  }

  async createWdepExperiment(data: InsertWdepExperiment): Promise<WdepExperiment> {
    const [experiment] = await db.insert(wdepExperiments).values(data).returning();
    return experiment;
  }

  async getWdepExperiment(wdepEntryId: number): Promise<WdepExperiment | undefined> {
    const [experiment] = await db.select().from(wdepExperiments).where(eq(wdepExperiments.wdepEntryId, wdepEntryId));
    return experiment;
  }

  async getWdepExperimentById(id: number): Promise<WdepExperiment | undefined> {
    const [experiment] = await db.select().from(wdepExperiments).where(eq(wdepExperiments.id, id));
    return experiment;
  }

  async updateWdepExperiment(id: number, data: Partial<WdepExperiment>): Promise<WdepExperiment> {
    const [experiment] = await db.update(wdepExperiments).set(data).where(eq(wdepExperiments.id, id)).returning();
    return experiment;
  }

  async createWdepExperimentLog(data: InsertWdepExperimentLog): Promise<WdepExperimentLog> {
    const [log] = await db.insert(wdepExperimentLogs).values(data).returning();
    return log;
  }

  async getWdepExperimentLogs(experimentId: number): Promise<WdepExperimentLog[]> {
    return db.select().from(wdepExperimentLogs).where(eq(wdepExperimentLogs.experimentId, experimentId)).orderBy(wdepExperimentLogs.date);
  }

  // ===== SELF-CONCORDANT ACTION =====

  async createScaExercise(data: InsertScaExercise): Promise<ScaExercise> {
    const [exercise] = await db.insert(scaExercises).values(data).returning();
    return exercise;
  }

  async getScaExercise(id: number): Promise<ScaExercise | undefined> {
    const [exercise] = await db.select().from(scaExercises).where(eq(scaExercises.id, id));
    return exercise;
  }

  async getScaExercises(userId: string, sessionId?: number): Promise<ScaExercise[]> {
    if (sessionId) {
      return db.select().from(scaExercises).where(and(eq(scaExercises.userId, userId), eq(scaExercises.sessionId, sessionId))).orderBy(desc(scaExercises.createdAt));
    }
    return db.select().from(scaExercises).where(eq(scaExercises.userId, userId)).orderBy(desc(scaExercises.createdAt));
  }

  async updateScaExercise(id: number, data: Partial<ScaExercise>): Promise<ScaExercise> {
    const [exercise] = await db.update(scaExercises).set(data).where(eq(scaExercises.id, id)).returning();
    return exercise;
  }

  async createScaFocusItem(data: InsertScaFocusItem): Promise<ScaFocusItem> {
    const [item] = await db.insert(scaFocusItems).values(data).returning();
    return item;
  }

  async getScaFocusItems(scaExerciseId: number): Promise<ScaFocusItem[]> {
    return db.select().from(scaFocusItems).where(eq(scaFocusItems.scaExerciseId, scaExerciseId)).orderBy(scaFocusItems.itemIndex);
  }

  // ===== DAILY REFLECTIONS =====

  async getTodayReflection(): Promise<DailyReflection | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // First try to get a scheduled reflection for today
    const [scheduled] = await db.select().from(dailyReflections)
      .where(and(
        eq(dailyReflections.isActive, true),
        sql`${dailyReflections.scheduledDate} >= ${today}`,
        sql`${dailyReflections.scheduledDate} < ${tomorrow}`
      ));
    
    if (scheduled) return scheduled;

    // Get all unscheduled active reflections and pick one based on day of year
    const allUnscheduled = await db.select().from(dailyReflections)
      .where(and(
        eq(dailyReflections.isActive, true),
        sql`${dailyReflections.scheduledDate} IS NULL`
      ))
      .orderBy(dailyReflections.id);
    
    if (allUnscheduled.length === 0) return undefined;
    
    // Use day of year to deterministically select a reflection
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % allUnscheduled.length;
    
    return allUnscheduled[index];
  }

  async getReflection(id: number): Promise<DailyReflection | undefined> {
    const [reflection] = await db.select().from(dailyReflections).where(eq(dailyReflections.id, id));
    return reflection;
  }

  async getAllReflections(): Promise<DailyReflection[]> {
    return db.select().from(dailyReflections).where(eq(dailyReflections.isActive, true)).orderBy(desc(dailyReflections.createdAt));
  }

  async createReflection(data: InsertDailyReflection): Promise<DailyReflection> {
    const [reflection] = await db.insert(dailyReflections).values(data).returning();
    return reflection;
  }

  async getUserReflectionLog(userId: string, reflectionId: number): Promise<ReflectionLog | undefined> {
    const [log] = await db.select().from(reflectionLogs)
      .where(and(eq(reflectionLogs.userId, userId), eq(reflectionLogs.reflectionId, reflectionId)));
    return log;
  }

  async getUserReflectionStreak(userId: string): Promise<number> {
    const logs = await db.select({ viewedAt: reflectionLogs.viewedAt })
      .from(reflectionLogs)
      .where(eq(reflectionLogs.userId, userId))
      .orderBy(desc(reflectionLogs.viewedAt))
      .limit(30);
    
    if (logs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const hasLog = logs.some(log => {
        if (!log.viewedAt) return false;
        const logDate = new Date(log.viewedAt);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === checkDate.getTime();
      });
      
      if (hasLog) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  }

  async logReflectionView(userId: string, reflectionId: number): Promise<ReflectionLog> {
    const existing = await this.getUserReflectionLog(userId, reflectionId);
    if (existing) return existing;
    
    const [log] = await db.insert(reflectionLogs).values({
      userId,
      reflectionId,
    }).returning();
    return log;
  }

  async logReflectionEngagement(userId: string, reflectionId: number, data: { journalEntry?: string; reaction?: string }): Promise<ReflectionLog> {
    const existing = await this.getUserReflectionLog(userId, reflectionId);
    
    if (existing) {
      const [updated] = await db.update(reflectionLogs)
        .set({
          journalEntry: data.journalEntry ?? existing.journalEntry,
          reaction: data.reaction ?? existing.reaction,
          engagedAt: new Date(),
        })
        .where(eq(reflectionLogs.id, existing.id))
        .returning();
      return updated;
    }
    
    const [log] = await db.insert(reflectionLogs).values({
      userId,
      reflectionId,
      journalEntry: data.journalEntry,
      reaction: data.reaction,
      engagedAt: new Date(),
    }).returning();
    return log;
  }
}

export const storage = new DatabaseStorage();
