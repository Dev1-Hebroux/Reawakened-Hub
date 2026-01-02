import {
  users,
  posts,
  reactions,
  sparks,
  sparkReactions,
  prayerMessages,
  prayerSessions,
  sparkSubscriptions,
  reflectionCards,
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
  coachProfiles,
  sessionSlots,
  sessionBookings,
  sessionFollowUps,
  feedbackCampaigns,
  feedbackInvites,
  feedbackAnswers,
  feedbackSelfAssessment,
  feedbackAggregates,
  aiCoachSessions,
  aiCoachMessages,
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
  type PrayerMessage,
  type InsertPrayerMessage,
  type PrayerSession,
  type InsertPrayerSession,
  type SparkSubscription,
  type InsertSparkSubscription,
  type ReflectionCard,
  type InsertReflectionCard,
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
  type CoachProfile,
  type InsertCoachProfile,
  type SessionSlot,
  type InsertSessionSlot,
  type SessionBooking,
  type InsertSessionBooking,
  type SessionFollowUp,
  type InsertSessionFollowUp,
  type FeedbackCampaign,
  type InsertFeedbackCampaign,
  type FeedbackInvite,
  type InsertFeedbackInvite,
  type FeedbackAnswer,
  type InsertFeedbackAnswer,
  type FeedbackSelfAssessment,
  type InsertFeedbackSelfAssessment,
  type FeedbackAggregate,
  type InsertFeedbackAggregate,
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
  missionPillars,
  missionProfiles,
  missionPlans,
  missionFocuses,
  prayerGuideDays,
  missionAdoptions,
  missionPrayerSessions,
  missionProjects,
  projectUpdates,
  missionOpportunities,
  opportunityInterests,
  digitalActions,
  shareCards,
  missionInvites,
  liveRooms,
  roomSessions,
  followUpThreads,
  followUpMessages,
  trainingModules,
  trainingProgress,
  missionChallenges,
  challengeEnrollments,
  missionDonations,
  recurringDonations,
  missionTestimonies,
  projectFollows,
  type MissionPillar,
  type InsertMissionPillar,
  type MissionProfile,
  type InsertMissionProfile,
  type MissionPlan,
  type InsertMissionPlan,
  type MissionFocus,
  type InsertMissionFocus,
  type PrayerGuideDay,
  type InsertPrayerGuideDay,
  type MissionAdoption,
  type InsertMissionAdoption,
  type MissionPrayerSession,
  type InsertMissionPrayerSession,
  type MissionProject,
  type InsertMissionProject,
  type ProjectUpdate,
  type InsertProjectUpdate,
  type MissionOpportunity,
  type InsertMissionOpportunity,
  type OpportunityInterest,
  type InsertOpportunityInterest,
  type DigitalAction,
  type InsertDigitalAction,
  type ShareCard,
  type InsertShareCard,
  type MissionInvite,
  type InsertMissionInvite,
  type LiveRoom,
  type InsertLiveRoom,
  type RoomSession,
  type InsertRoomSession,
  type FollowUpThread,
  type InsertFollowUpThread,
  type FollowUpMessage,
  type InsertFollowUpMessage,
  type TrainingModule,
  type InsertTrainingModule,
  type TrainingProgress,
  type InsertTrainingProgress,
  type MissionChallenge,
  type InsertMissionChallenge,
  type ChallengeEnrollment,
  type InsertChallengeEnrollment,
  type MissionDonation,
  type InsertMissionDonation,
  type RecurringDonation,
  type InsertRecurringDonation,
  type MissionTestimony,
  type InsertMissionTestimony,
  type ProjectFollow,
  type InsertProjectFollow,
  type AiCoachSession,
  type InsertAiCoachSession,
  type AiCoachMessage,
  type InsertAiCoachMessage,
  coaches,
  coachingSessions,
  coachingCohorts,
  cohortParticipants,
  type Coach,
  type InsertCoach,
  type CoachingSession,
  type InsertCoachingSession,
  type CoachingCohort,
  type InsertCoachingCohort,
  type CohortParticipant,
  type InsertCohortParticipant,
  notificationPreferences,
  notifications,
  type NotificationPreferences,
  type InsertNotificationPreferences,
  type Notification,
  type InsertNotification,
  challenges,
  challengeParticipants,
  type Challenge,
  type InsertChallenge,
  type ChallengeParticipant,
  type InsertChallengeParticipant,
  missionTrips,
  tripApplications,
  type MissionTrip,
  type InsertMissionTrip,
  type TripApplication,
  type InsertTripApplication,
  goalTemplates,
  visionGoals,
  visionHabits,
  habitLogs,
  tracks,
  modules,
  pathwaySessions,
  type GoalTemplate,
  type InsertGoalTemplate,
  userSettings,
  comments,
  type UserSettings,
  type InsertUserSettings,
  type Comment,
  type InsertComment,
  prayerFocusGroups,
  ukCampuses,
  campusAltars,
  altarMembers,
  prayerSubscriptions,
  prayerWallEntries,
  prayerLogs,
  prayerReminders,
  type PrayerFocusGroup,
  type InsertPrayerFocusGroup,
  type UkCampus,
  type InsertUkCampus,
  type CampusAltar,
  type InsertCampusAltar,
  type AltarMember,
  type InsertAltarMember,
  type PrayerSubscription,
  type InsertPrayerSubscription,
  type PrayerWallEntry,
  type InsertPrayerWallEntry,
  type PrayerLog,
  type InsertPrayerLog,
  type PrayerReminder,
  type InsertPrayerReminder,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, inArray, count, ilike, or, gte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserPreferences(userId: string, preferences: { contentMode?: string; audienceSegment?: string | null }): Promise<User>;

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
  updateSpark(id: number, updates: Partial<InsertSpark>): Promise<Spark>;
  deleteSpark(id: number): Promise<void>;
  getPublishedSparks(audienceSegment?: string): Promise<Spark[]>;
  getFeaturedSparks(audienceSegment?: string): Promise<Spark[]>;
  getTodaySpark(audienceSegment?: string): Promise<Spark | undefined>;

  // Reflection Cards
  getReflectionCards(audienceSegment?: string): Promise<ReflectionCard[]>;
  getTodayReflectionCard(audienceSegment?: string): Promise<ReflectionCard | undefined>;
  createReflectionCard(card: InsertReflectionCard): Promise<ReflectionCard>;

  // Spark Reactions
  getSparkReactions(sparkId: number): Promise<SparkReaction[]>;
  getSparkReactionCounts(sparkId: number): Promise<{ reactionType: string; count: number }[]>;
  getUserSparkReaction(sparkId: number, userId: string): Promise<SparkReaction | undefined>;
  createSparkReaction(reaction: InsertSparkReaction): Promise<SparkReaction>;
  deleteSparkReaction(sparkId: number, userId: string, reactionType: string): Promise<void>;

  // Prayer Messages (Live Intercession)
  getPrayerMessages(sparkId?: number, sessionId?: number, limit?: number): Promise<PrayerMessage[]>;
  createPrayerMessage(message: InsertPrayerMessage): Promise<PrayerMessage>;

  // Leader Prayer Sessions (Live Intercession)
  getLeaderPrayerSessions(status?: string, region?: string): Promise<PrayerSession[]>;
  getLeaderPrayerSession(id: number): Promise<PrayerSession | undefined>;
  createLeaderPrayerSession(session: InsertPrayerSession): Promise<PrayerSession>;
  endLeaderPrayerSession(id: number, leaderId: string): Promise<PrayerSession>;
  incrementLeaderPrayerSessionParticipants(id: number): Promise<void>;

  // Spark Subscriptions
  getSubscriptions(userId: string): Promise<SparkSubscription[]>;
  createSubscription(subscription: InsertSparkSubscription): Promise<SparkSubscription>;
  deleteSubscription(userId: string, category: string): Promise<void>;

  // Events
  getEvents(type?: string): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  // Event Registrations
  getEventRegistrations(eventId: number): Promise<EventRegistration[]>;
  getAllEventRegistrations(): Promise<EventRegistration[]>;
  getUserEventRegistration(eventId: number, userId: string): Promise<EventRegistration | undefined>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;

  // Blog
  getBlogPosts(category?: string): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;

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

  // ===== SIMPLE GOALS & RESOLUTIONS =====
  getUserGoals(userId: string): Promise<any[]>;
  createSimpleGoal(data: {
    userId: string;
    title: string;
    category: string;
    targetDate: Date | null;
    why?: string;
    firstStep?: string;
    habitTitle?: string;
  }): Promise<any>;
  toggleHabitLog(habitId: number, date: string, completed: boolean): Promise<any>;

  // ===== AI COACHING =====
  createAiCoachSession(data: InsertAiCoachSession): Promise<AiCoachSession>;
  getAiCoachSession(id: number): Promise<AiCoachSession | undefined>;
  getUserAiCoachSessions(userId: string): Promise<AiCoachSession[]>;
  updateAiCoachSession(id: number, data: Partial<AiCoachSession>): Promise<AiCoachSession>;
  createAiCoachMessage(data: InsertAiCoachMessage): Promise<AiCoachMessage>;
  getAiCoachMessages(sessionId: number): Promise<AiCoachMessage[]>;

  // ===== NOTIFICATIONS =====
  getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined>;
  upsertNotificationPreferences(userId: string, prefs: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences>;
  getNotifications(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number, userId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  getUsersWithPushEnabled(): Promise<Array<{ userId: string; pushSubscription: string }>>;
  getUsersForPrayerNotifications(excludeUserId: string): Promise<string[]>;
  createBulkNotifications(notificationsData: InsertNotification[]): Promise<void>;

  // ===== ADMIN COACHING =====
  getCoaches(): Promise<Coach[]>;
  getCoach(id: number): Promise<Coach | undefined>;
  createCoach(data: InsertCoach): Promise<Coach>;
  updateCoach(id: number, data: Partial<InsertCoach>): Promise<Coach>;
  getCoachingSessions(status?: string): Promise<CoachingSession[]>;
  getCoachingSession(id: number): Promise<CoachingSession | undefined>;
  updateCoachingSession(id: number, data: Partial<InsertCoachingSession>): Promise<CoachingSession>;
  getCoachingCohorts(): Promise<CoachingCohort[]>;
  getCoachingCohort(id: number): Promise<CoachingCohort | undefined>;
  createCoachingCohort(data: InsertCoachingCohort): Promise<CoachingCohort>;
  updateCoachingCohort(id: number, data: Partial<InsertCoachingCohort>): Promise<CoachingCohort>;
  getCohortParticipants(cohortId: number): Promise<CohortParticipant[]>;

  // ===== ADMIN CHALLENGES =====
  getChallenges(options?: { status?: string; search?: string; page?: number; pageSize?: number }): Promise<{ challenges: Challenge[]; total: number }>;
  getChallenge(id: number): Promise<Challenge | undefined>;
  createChallenge(data: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: number, data: Partial<InsertChallenge>): Promise<Challenge>;
  deleteChallenge(id: number): Promise<void>;
  getChallengeParticipants(challengeId: number): Promise<ChallengeParticipant[]>;
  getChallengeParticipant(challengeId: number, userId: string): Promise<ChallengeParticipant | undefined>;
  createChallengeParticipant(data: InsertChallengeParticipant): Promise<ChallengeParticipant>;
  getUserChallengeParticipations(userId: string): Promise<ChallengeParticipant[]>;

  // ===== PUBLIC DISCOVERY =====
  getMissionTrip(id: number): Promise<MissionTrip | undefined>;
  getTripApplication(tripId: number, userId: string): Promise<TripApplication | undefined>;
  createTripApplication(data: InsertTripApplication): Promise<TripApplication>;
  getCohortParticipant(cohortId: number, userId: string): Promise<CohortParticipant | undefined>;
  createCohortParticipant(data: InsertCohortParticipant): Promise<CohortParticipant>;
  createCoachingSession(data: InsertCoachingSession): Promise<CoachingSession>;

  // ===== ANALYTICS =====
  getTotalUserCount(): Promise<number>;
  getActiveUserCount(days: number): Promise<number>;
  getTotalSparkViews(): Promise<number>;
  getCompletedChallengesCount(): Promise<number>;

  // ===== ADMIN GOAL TEMPLATES =====
  getGoalTemplates(): Promise<GoalTemplate[]>;
  getGoalTemplate(id: number): Promise<GoalTemplate | undefined>;
  createGoalTemplate(data: InsertGoalTemplate): Promise<GoalTemplate>;
  updateGoalTemplate(id: number, data: Partial<InsertGoalTemplate>): Promise<GoalTemplate>;
  deleteGoalTemplate(id: number): Promise<void>;
  getUserProgressStats(): Promise<{
    totalUsersWithGoals: number;
    averageCompletionRate: number;
    activeJourneys: number;
    userProgress: Array<{
      userId: string;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
      goalsCount: number;
      habitsTracked: number;
      lastActivity: Date | null;
    }>;
  }>;
  getGrowthTracks(): Promise<Array<{
    id: number;
    key: string;
    title: string;
    description: string | null;
    isEnabled: boolean;
    modulesCount: number;
  }>>;

  // ===== USER SETTINGS =====
  getUserSettings(userId: string): Promise<UserSettings | null>;
  upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings>;

  // ===== COMMENTS =====
  getCommentsByPost(postId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  deleteComment(id: number, userId: string): Promise<void>;

  // ===== PRAYER MOVEMENT =====
  // Prayer Focus Groups
  getPrayerFocusGroups(category?: string): Promise<PrayerFocusGroup[]>;
  getPrayerFocusGroup(id: number): Promise<PrayerFocusGroup | undefined>;
  createPrayerFocusGroup(group: InsertPrayerFocusGroup): Promise<PrayerFocusGroup>;
  updatePrayerFocusGroup(id: number, updates: Partial<InsertPrayerFocusGroup>): Promise<PrayerFocusGroup>;

  // UK Campuses
  getUkCampuses(type?: string, region?: string): Promise<UkCampus[]>;
  getUkCampus(id: number): Promise<UkCampus | undefined>;
  searchUkCampuses(query: string): Promise<UkCampus[]>;
  createUkCampus(campus: InsertUkCampus): Promise<UkCampus>;

  // Campus Altars
  getCampusAltars(status?: string): Promise<CampusAltar[]>;
  getCampusAltar(id: number): Promise<CampusAltar | undefined>;
  getCampusAltarByCampus(campusId: number): Promise<CampusAltar | undefined>;
  createCampusAltar(altar: InsertCampusAltar): Promise<CampusAltar>;
  updateCampusAltar(id: number, updates: Partial<InsertCampusAltar>): Promise<CampusAltar>;

  // Altar Members
  getAltarMembers(altarId: number): Promise<AltarMember[]>;
  getAltarMember(altarId: number, userId: string): Promise<AltarMember | undefined>;
  createAltarMember(member: InsertAltarMember): Promise<AltarMember>;
  updateAltarMember(id: number, updates: Partial<InsertAltarMember>): Promise<AltarMember>;

  // Prayer Subscriptions
  getPrayerSubscriptions(userId: string): Promise<PrayerSubscription[]>;
  getPrayerSubscription(userId: string, focusGroupId?: number, altarId?: number): Promise<PrayerSubscription | undefined>;
  createPrayerSubscription(subscription: InsertPrayerSubscription): Promise<PrayerSubscription>;
  updatePrayerSubscription(id: number, updates: Partial<InsertPrayerSubscription>): Promise<PrayerSubscription>;
  deletePrayerSubscription(id: number): Promise<void>;

  // Prayer Wall
  getPrayerWallEntries(focusGroupId?: number, altarId?: number, limit?: number): Promise<PrayerWallEntry[]>;
  createPrayerWallEntry(entry: InsertPrayerWallEntry): Promise<PrayerWallEntry>;
  updatePrayerWallEntry(id: number, updates: Partial<InsertPrayerWallEntry>): Promise<PrayerWallEntry>;
  incrementPrayerCount(entryId: number): Promise<void>;

  // Prayer Logs
  createPrayerLog(log: InsertPrayerLog): Promise<PrayerLog>;
  getPrayerStats(): Promise<{ totalHours: number; totalIntercessors: number; campusesCovered: number }>;
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

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserPreferences(userId: string, preferences: { contentMode?: string; audienceSegment?: string | null }): Promise<User> {
    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (preferences.contentMode !== undefined) {
      updateData.contentMode = preferences.contentMode;
    }
    if (preferences.audienceSegment !== undefined) {
      updateData.audienceSegment = preferences.audienceSegment;
    }
    const [user] = await db.update(users).set(updateData).where(eq(users.id, userId)).returning();
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

    // Get reaction and comment counts for all posts
    const postIds = results.map(p => p.id);
    let reactionCounts: { postId: number; count: number }[] = [];
    let commentCounts: { postId: number; count: number }[] = [];
    
    if (postIds.length > 0) {
      [reactionCounts, commentCounts] = await Promise.all([
        db
          .select({
            postId: reactions.postId,
            count: count(reactions.id),
          })
          .from(reactions)
          .where(inArray(reactions.postId, postIds))
          .groupBy(reactions.postId),
        db
          .select({
            postId: comments.postId,
            count: count(comments.id),
          })
          .from(comments)
          .where(inArray(comments.postId, postIds))
          .groupBy(comments.postId),
      ]);
    }

    // Map reaction and comment counts to posts
    const postsWithCounts = results.map(post => ({
      ...post,
      reactionCount: reactionCounts.find(r => r.postId === post.id)?.count || 0,
      commentCount: commentCounts.find(c => c.postId === post.id)?.count || 0,
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

  async updateSpark(id: number, updates: Partial<InsertSpark>): Promise<Spark> {
    const [spark] = await db.update(sparks).set(updates).where(eq(sparks.id, id)).returning();
    return spark;
  }

  async deleteSpark(id: number): Promise<void> {
    await db.delete(sparks).where(eq(sparks.id, id));
  }

  private getLondonDate(): string {
    const londonTime = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });
    const parts = londonTime.split(',')[0].split('/');
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }

  async getPublishedSparks(audienceSegment?: string): Promise<Spark[]> {
    const now = new Date();
    const conditions = [
      sql`${sparks.status} IN ('published', 'scheduled')`,
      sql`(${sparks.publishAt} IS NULL OR ${sparks.publishAt} <= ${now})`,
    ];
    if (audienceSegment) {
      conditions.push(eq(sparks.audienceSegment, audienceSegment));
    } else {
      conditions.push(sql`(${sparks.audienceSegment} IS NULL OR ${sparks.audienceSegment} = '')`);
    }
    return db.select().from(sparks).where(and(...conditions)).orderBy(desc(sparks.publishAt));
  }

  async getFeaturedSparks(audienceSegment?: string): Promise<Spark[]> {
    const conditions = [
      eq(sparks.featured, true),
      sql`${sparks.status} IN ('published', 'scheduled')`,
    ];
    if (audienceSegment) {
      conditions.push(eq(sparks.audienceSegment, audienceSegment));
    } else {
      conditions.push(sql`(${sparks.audienceSegment} IS NULL OR ${sparks.audienceSegment} = '')`);
    }
    return db.select().from(sparks).where(and(...conditions)).orderBy(desc(sparks.publishAt)).limit(5);
  }

  async getTodaySpark(audienceSegment?: string): Promise<Spark | undefined> {
    const todayLondon = this.getLondonDate();
    const conditions = [
      eq(sparks.dailyDate, todayLondon),
      sql`${sparks.status} IN ('published', 'scheduled')`,
    ];
    if (audienceSegment) {
      conditions.push(eq(sparks.audienceSegment, audienceSegment));
    } else {
      conditions.push(sql`(${sparks.audienceSegment} IS NULL OR ${sparks.audienceSegment} = '')`);
    }
    const [spark] = await db.select().from(sparks).where(and(...conditions)).limit(1);
    return spark;
  }

  // Reflection Cards
  async getReflectionCards(audienceSegment?: string): Promise<ReflectionCard[]> {
    const now = new Date();
    const conditions = [
      sql`${reflectionCards.status} IN ('published', 'scheduled')`,
      sql`(${reflectionCards.publishAt} IS NULL OR ${reflectionCards.publishAt} <= ${now})`,
    ];
    if (audienceSegment) {
      conditions.push(eq(reflectionCards.audienceSegment, audienceSegment));
    } else {
      conditions.push(sql`(${reflectionCards.audienceSegment} IS NULL OR ${reflectionCards.audienceSegment} = '')`);
    }
    return db.select().from(reflectionCards).where(and(...conditions)).orderBy(desc(reflectionCards.publishAt));
  }

  async getTodayReflectionCard(audienceSegment?: string): Promise<ReflectionCard | undefined> {
    const todayLondon = this.getLondonDate();
    const conditions = [
      eq(reflectionCards.dailyDate, todayLondon),
      sql`${reflectionCards.status} IN ('published', 'scheduled')`,
    ];
    if (audienceSegment) {
      conditions.push(eq(reflectionCards.audienceSegment, audienceSegment));
    } else {
      conditions.push(sql`(${reflectionCards.audienceSegment} IS NULL OR ${reflectionCards.audienceSegment} = '')`);
    }
    const [card] = await db.select().from(reflectionCards).where(and(...conditions)).limit(1);
    return card;
  }

  async createReflectionCard(cardData: InsertReflectionCard): Promise<ReflectionCard> {
    const [card] = await db.insert(reflectionCards).values(cardData).returning();
    return card;
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

  // Prayer Messages (Live Intercession)
  async getPrayerMessages(sparkId?: number, sessionId?: number, limit: number = 50): Promise<PrayerMessage[]> {
    const conditions = [];
    if (sparkId) {
      conditions.push(eq(prayerMessages.sparkId, sparkId));
    }
    if (sessionId) {
      conditions.push(eq(prayerMessages.sessionId, sessionId));
    }
    if (conditions.length > 0) {
      return db.select().from(prayerMessages)
        .where(and(...conditions))
        .orderBy(desc(prayerMessages.createdAt))
        .limit(limit);
    }
    return db.select().from(prayerMessages)
      .orderBy(desc(prayerMessages.createdAt))
      .limit(limit);
  }

  async createPrayerMessage(messageData: InsertPrayerMessage): Promise<PrayerMessage> {
    const [message] = await db.insert(prayerMessages).values(messageData).returning();
    return message;
  }

  // Leader Prayer Sessions (Live Intercession)
  async getLeaderPrayerSessions(status?: string, region?: string): Promise<PrayerSession[]> {
    const conditions = [];
    if (status) {
      conditions.push(eq(prayerSessions.status, status));
    }
    if (region) {
      conditions.push(eq(prayerSessions.region, region));
    }
    if (conditions.length > 0) {
      return db.select().from(prayerSessions)
        .where(and(...conditions))
        .orderBy(desc(prayerSessions.startedAt));
    }
    return db.select().from(prayerSessions).orderBy(desc(prayerSessions.startedAt));
  }

  async getLeaderPrayerSession(id: number): Promise<PrayerSession | undefined> {
    const [session] = await db.select().from(prayerSessions).where(eq(prayerSessions.id, id));
    return session;
  }

  async createLeaderPrayerSession(sessionData: InsertPrayerSession): Promise<PrayerSession> {
    const [session] = await db.insert(prayerSessions).values(sessionData).returning();
    return session;
  }

  async endLeaderPrayerSession(id: number, leaderId: string): Promise<PrayerSession> {
    const [session] = await db.update(prayerSessions)
      .set({ status: 'ended', endedAt: new Date() })
      .where(and(eq(prayerSessions.id, id), eq(prayerSessions.leaderId, leaderId)))
      .returning();
    return session;
  }

  async incrementLeaderPrayerSessionParticipants(id: number): Promise<void> {
    await db.update(prayerSessions)
      .set({ participantCount: sql`${prayerSessions.participantCount} + 1` })
      .where(eq(prayerSessions.id, id));
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

  async updateEvent(id: number, updates: Partial<InsertEvent>): Promise<Event> {
    const [event] = await db.update(events).set(updates).where(eq(events.id, id)).returning();
    return event;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Event Registrations
  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId));
  }

  async getAllEventRegistrations(): Promise<EventRegistration[]> {
    return db.select().from(eventRegistrations).orderBy(desc(eventRegistrations.createdAt));
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

  async updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [post] = await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id)).returning();
    return post;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
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

  // ===== SESSION BOOKING =====

  async getCoachProfile(userId: string): Promise<CoachProfile | undefined> {
    const [profile] = await db.select().from(coachProfiles).where(eq(coachProfiles.userId, userId));
    return profile;
  }

  async getCoachProfileById(id: number): Promise<CoachProfile | undefined> {
    const [profile] = await db.select().from(coachProfiles).where(eq(coachProfiles.id, id));
    return profile;
  }

  async getAllActiveCoaches(): Promise<CoachProfile[]> {
    return db.select().from(coachProfiles).where(eq(coachProfiles.isActive, true));
  }

  async createCoachProfile(data: InsertCoachProfile): Promise<CoachProfile> {
    const [profile] = await db.insert(coachProfiles).values(data).returning();
    return profile;
  }

  async updateCoachProfile(id: number, data: Partial<CoachProfile>): Promise<CoachProfile> {
    const [profile] = await db.update(coachProfiles).set(data).where(eq(coachProfiles.id, id)).returning();
    return profile;
  }

  async getAvailableSlots(coachId: number): Promise<SessionSlot[]> {
    const now = new Date();
    return db.select().from(sessionSlots)
      .where(and(
        eq(sessionSlots.coachId, coachId),
        eq(sessionSlots.isBooked, false),
        sql`${sessionSlots.startTime} > ${now}`
      ))
      .orderBy(sessionSlots.startTime);
  }

  async createSessionSlot(data: InsertSessionSlot): Promise<SessionSlot> {
    const [slot] = await db.insert(sessionSlots).values(data).returning();
    return slot;
  }

  async updateSessionSlot(id: number, data: Partial<SessionSlot>): Promise<SessionSlot> {
    const [slot] = await db.update(sessionSlots).set(data).where(eq(sessionSlots.id, id)).returning();
    return slot;
  }

  async getSessionBooking(id: number): Promise<SessionBooking | undefined> {
    const [booking] = await db.select().from(sessionBookings).where(eq(sessionBookings.id, id));
    return booking;
  }

  async getUserSessionBookings(userId: string): Promise<SessionBooking[]> {
    return db.select().from(sessionBookings)
      .where(eq(sessionBookings.userId, userId))
      .orderBy(desc(sessionBookings.createdAt));
  }

  async getCoachSessionBookings(coachId: number): Promise<SessionBooking[]> {
    return db.select().from(sessionBookings)
      .where(eq(sessionBookings.coachId, coachId))
      .orderBy(desc(sessionBookings.createdAt));
  }

  async createSessionBooking(data: InsertSessionBooking): Promise<SessionBooking> {
    const [booking] = await db.insert(sessionBookings).values(data).returning();
    if (data.slotId) {
      await db.update(sessionSlots).set({ isBooked: true }).where(eq(sessionSlots.id, data.slotId));
    }
    return booking;
  }

  async updateSessionBooking(id: number, data: Partial<SessionBooking>): Promise<SessionBooking> {
    const [booking] = await db.update(sessionBookings).set(data).where(eq(sessionBookings.id, id)).returning();
    return booking;
  }

  async createSessionFollowUp(data: InsertSessionFollowUp): Promise<SessionFollowUp> {
    const [followUp] = await db.insert(sessionFollowUps).values(data).returning();
    return followUp;
  }

  async getSessionFollowUps(bookingId: number): Promise<SessionFollowUp[]> {
    return db.select().from(sessionFollowUps)
      .where(eq(sessionFollowUps.bookingId, bookingId))
      .orderBy(desc(sessionFollowUps.createdAt));
  }

  // ===== MINI-360 FEEDBACK =====

  async getFeedbackCampaign(id: number): Promise<FeedbackCampaign | undefined> {
    const [campaign] = await db.select().from(feedbackCampaigns).where(eq(feedbackCampaigns.id, id));
    return campaign;
  }

  async getUserFeedbackCampaigns(userId: string): Promise<FeedbackCampaign[]> {
    return db.select().from(feedbackCampaigns)
      .where(eq(feedbackCampaigns.userId, userId))
      .orderBy(desc(feedbackCampaigns.createdAt));
  }

  async createFeedbackCampaign(data: InsertFeedbackCampaign): Promise<FeedbackCampaign> {
    const [campaign] = await db.insert(feedbackCampaigns).values(data).returning();
    return campaign;
  }

  async updateFeedbackCampaign(id: number, data: Partial<FeedbackCampaign>): Promise<FeedbackCampaign> {
    const [campaign] = await db.update(feedbackCampaigns).set(data).where(eq(feedbackCampaigns.id, id)).returning();
    return campaign;
  }

  async getFeedbackInvite(id: number): Promise<FeedbackInvite | undefined> {
    const [invite] = await db.select().from(feedbackInvites).where(eq(feedbackInvites.id, id));
    return invite;
  }

  async getFeedbackInviteByToken(token: string): Promise<FeedbackInvite | undefined> {
    const [invite] = await db.select().from(feedbackInvites).where(eq(feedbackInvites.token, token));
    return invite;
  }

  async getCampaignInvites(campaignId: number): Promise<FeedbackInvite[]> {
    return db.select().from(feedbackInvites)
      .where(eq(feedbackInvites.campaignId, campaignId));
  }

  async createFeedbackInvite(data: InsertFeedbackInvite): Promise<FeedbackInvite> {
    const [invite] = await db.insert(feedbackInvites).values(data).returning();
    return invite;
  }

  async updateFeedbackInvite(id: number, data: Partial<FeedbackInvite>): Promise<FeedbackInvite> {
    const [invite] = await db.update(feedbackInvites).set(data).where(eq(feedbackInvites.id, id)).returning();
    return invite;
  }

  async createFeedbackAnswer(data: InsertFeedbackAnswer): Promise<FeedbackAnswer> {
    const [answer] = await db.insert(feedbackAnswers).values(data).returning();
    return answer;
  }

  async getCampaignAnswers(campaignId: number): Promise<FeedbackAnswer[]> {
    return db.select().from(feedbackAnswers)
      .where(eq(feedbackAnswers.campaignId, campaignId));
  }

  async createFeedbackSelfAssessment(data: InsertFeedbackSelfAssessment): Promise<FeedbackSelfAssessment> {
    const [assessment] = await db.insert(feedbackSelfAssessment).values(data).returning();
    return assessment;
  }

  async getCampaignSelfAssessment(campaignId: number, userId: string): Promise<FeedbackSelfAssessment[]> {
    return db.select().from(feedbackSelfAssessment)
      .where(and(
        eq(feedbackSelfAssessment.campaignId, campaignId),
        eq(feedbackSelfAssessment.userId, userId)
      ));
  }

  async createFeedbackAggregate(data: InsertFeedbackAggregate): Promise<FeedbackAggregate> {
    const [aggregate] = await db.insert(feedbackAggregates).values(data).returning();
    return aggregate;
  }

  async getCampaignAggregates(campaignId: number): Promise<FeedbackAggregate[]> {
    return db.select().from(feedbackAggregates)
      .where(eq(feedbackAggregates.campaignId, campaignId));
  }

  // ===== MISSION HUB - DIGITAL FIRST =====

  // Mission Pillars
  async getMissionPillars(): Promise<MissionPillar[]> {
    return db.select().from(missionPillars).orderBy(missionPillars.name);
  }

  // Mission Profiles
  async getMissionProfile(userId: string): Promise<MissionProfile | undefined> {
    const [profile] = await db.select().from(missionProfiles).where(eq(missionProfiles.userId, userId));
    return profile;
  }

  async createMissionProfile(data: InsertMissionProfile): Promise<MissionProfile> {
    const [profile] = await db.insert(missionProfiles).values(data).returning();
    return profile;
  }

  async updateMissionProfile(userId: string, data: Partial<MissionProfile>): Promise<MissionProfile> {
    const [profile] = await db.update(missionProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(missionProfiles.userId, userId))
      .returning();
    return profile;
  }

  // Mission Plans (Weekly goals)
  async getMissionPlan(userId: string): Promise<MissionPlan | undefined> {
    const [plan] = await db.select().from(missionPlans)
      .where(eq(missionPlans.userId, userId))
      .orderBy(desc(missionPlans.weekStartDate))
      .limit(1);
    return plan;
  }

  async createMissionPlan(data: InsertMissionPlan): Promise<MissionPlan> {
    const [plan] = await db.insert(missionPlans).values(data).returning();
    return plan;
  }

  // Mission Focuses (People Groups / Nations / Cities)
  async getMissionFocuses(type?: string): Promise<MissionFocus[]> {
    if (type) {
      return db.select().from(missionFocuses)
        .where(eq(missionFocuses.type, type))
        .orderBy(missionFocuses.name);
    }
    return db.select().from(missionFocuses).orderBy(missionFocuses.name);
  }

  async getMissionFocus(id: number): Promise<MissionFocus | undefined> {
    const [focus] = await db.select().from(missionFocuses).where(eq(missionFocuses.id, id));
    return focus;
  }

  async createMissionFocus(data: InsertMissionFocus): Promise<MissionFocus> {
    const [focus] = await db.insert(missionFocuses).values(data).returning();
    return focus;
  }

  // Prayer Guide Days
  async getPrayerGuideDays(focusId: number): Promise<PrayerGuideDay[]> {
    return db.select().from(prayerGuideDays)
      .where(eq(prayerGuideDays.focusId, focusId))
      .orderBy(prayerGuideDays.dayNumber);
  }

  async getPrayerGuideDay(focusId: number, dayNumber: number): Promise<PrayerGuideDay | undefined> {
    const [day] = await db.select().from(prayerGuideDays)
      .where(and(
        eq(prayerGuideDays.focusId, focusId),
        eq(prayerGuideDays.dayNumber, dayNumber)
      ));
    return day;
  }

  async createPrayerGuideDay(data: InsertPrayerGuideDay): Promise<PrayerGuideDay> {
    const [day] = await db.insert(prayerGuideDays).values(data).returning();
    return day;
  }

  // Mission Adoptions
  async getUserAdoptions(userId: string): Promise<MissionAdoption[]> {
    return db.select().from(missionAdoptions)
      .where(eq(missionAdoptions.userId, userId))
      .orderBy(desc(missionAdoptions.createdAt));
  }

  async getActiveAdoption(userId: string): Promise<MissionAdoption | undefined> {
    const [adoption] = await db.select().from(missionAdoptions)
      .where(and(
        eq(missionAdoptions.userId, userId),
        eq(missionAdoptions.status, 'active')
      ))
      .limit(1);
    return adoption;
  }

  async createAdoption(data: InsertMissionAdoption): Promise<MissionAdoption> {
    const [adoption] = await db.insert(missionAdoptions).values(data).returning();
    return adoption;
  }

  async updateAdoption(id: number, data: Partial<MissionAdoption>): Promise<MissionAdoption> {
    const [adoption] = await db.update(missionAdoptions)
      .set(data)
      .where(eq(missionAdoptions.id, id))
      .returning();
    return adoption;
  }

  async updateAdoptionForUser(userId: string, id: number, data: Partial<MissionAdoption>): Promise<MissionAdoption | undefined> {
    const [adoption] = await db.update(missionAdoptions)
      .set(data)
      .where(and(
        eq(missionAdoptions.id, id),
        eq(missionAdoptions.userId, userId)
      ))
      .returning();
    return adoption;
  }

  // Mission Prayer Sessions
  async createPrayerSession(data: InsertMissionPrayerSession): Promise<MissionPrayerSession> {
    const [session] = await db.insert(missionPrayerSessions).values(data).returning();
    return session;
  }

  async getUserPrayerSessions(userId: string, limit?: number): Promise<MissionPrayerSession[]> {
    const query = db.select().from(missionPrayerSessions)
      .where(eq(missionPrayerSessions.userId, userId))
      .orderBy(desc(missionPrayerSessions.createdAt));
    if (limit) return query.limit(limit);
    return query;
  }

  async getUserPrayerStreak(userId: string): Promise<number> {
    const sessions = await db.select().from(missionPrayerSessions)
      .where(and(
        eq(missionPrayerSessions.userId, userId),
        eq(missionPrayerSessions.completed, true)
      ))
      .orderBy(desc(missionPrayerSessions.createdAt));
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const session of sessions) {
      if (!session.createdAt) continue;
      const sessionDate = new Date(session.createdAt);
      sessionDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }
    return streak;
  }

  // Mission Projects (sorted by digital actions first)
  async getMissionProjects(filters?: { pillarTag?: string; hasDigitalActions?: boolean; status?: string }): Promise<MissionProject[]> {
    let query = db.select().from(missionProjects);
    const conditions = [];
    
    if (filters?.status) conditions.push(eq(missionProjects.status, filters.status));
    if (filters?.hasDigitalActions !== undefined) conditions.push(eq(missionProjects.hasDigitalActions, filters.hasDigitalActions));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    return query.orderBy(desc(missionProjects.hasDigitalActions), desc(missionProjects.createdAt));
  }

  async getMissionProject(id: number): Promise<MissionProject | undefined> {
    const [project] = await db.select().from(missionProjects).where(eq(missionProjects.id, id));
    return project;
  }

  async createMissionProject(data: InsertMissionProject): Promise<MissionProject> {
    const [project] = await db.insert(missionProjects).values(data).returning();
    return project;
  }

  // Project Updates
  async getProjectUpdates(projectId: number): Promise<ProjectUpdate[]> {
    return db.select().from(projectUpdates)
      .where(eq(projectUpdates.projectId, projectId))
      .orderBy(desc(projectUpdates.createdAt));
  }

  async createProjectUpdate(data: InsertProjectUpdate): Promise<ProjectUpdate> {
    const [update] = await db.insert(projectUpdates).values(data).returning();
    return update;
  }

  // Project Follows
  async getProjectFollows(userId: string): Promise<ProjectFollow[]> {
    return db.select().from(projectFollows)
      .where(eq(projectFollows.userId, userId));
  }

  async isProjectFollowed(userId: string, projectId: number): Promise<boolean> {
    const [follow] = await db.select().from(projectFollows)
      .where(and(
        eq(projectFollows.userId, userId),
        eq(projectFollows.projectId, projectId)
      ));
    return !!follow;
  }

  async followProject(data: InsertProjectFollow): Promise<ProjectFollow> {
    const [follow] = await db.insert(projectFollows).values(data).returning();
    return follow;
  }

  async unfollowProject(userId: string, projectId: number): Promise<void> {
    await db.delete(projectFollows)
      .where(and(
        eq(projectFollows.userId, userId),
        eq(projectFollows.projectId, projectId)
      ));
  }

  // Mission Opportunities (online first by default)
  async getMissionOpportunities(filters?: { deliveryMode?: string; type?: string; status?: string }): Promise<MissionOpportunity[]> {
    let query = db.select().from(missionOpportunities);
    const conditions = [];
    
    if (filters?.deliveryMode) conditions.push(eq(missionOpportunities.deliveryMode, filters.deliveryMode));
    if (filters?.type) conditions.push(eq(missionOpportunities.type, filters.type));
    if (filters?.status) conditions.push(eq(missionOpportunities.status, filters.status));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }
    
    return query.orderBy(
      sql`CASE WHEN ${missionOpportunities.deliveryMode} = 'online' THEN 0 ELSE 1 END`,
      desc(missionOpportunities.createdAt)
    );
  }

  async getMissionOpportunity(id: number): Promise<MissionOpportunity | undefined> {
    const [opp] = await db.select().from(missionOpportunities).where(eq(missionOpportunities.id, id));
    return opp;
  }

  async createMissionOpportunity(data: InsertMissionOpportunity): Promise<MissionOpportunity> {
    const [opp] = await db.insert(missionOpportunities).values(data).returning();
    return opp;
  }

  // Opportunity Interests
  async createOpportunityInterest(data: InsertOpportunityInterest): Promise<OpportunityInterest> {
    const [interest] = await db.insert(opportunityInterests).values(data).returning();
    return interest;
  }

  async getUserOpportunityInterests(userId: string): Promise<OpportunityInterest[]> {
    return db.select().from(opportunityInterests)
      .where(eq(opportunityInterests.userId, userId))
      .orderBy(desc(opportunityInterests.createdAt));
  }

  // Digital Actions
  async createDigitalAction(data: InsertDigitalAction): Promise<DigitalAction> {
    const [action] = await db.insert(digitalActions).values(data).returning();
    return action;
  }

  async getUserDigitalActions(userId: string, limit?: number): Promise<DigitalAction[]> {
    const query = db.select().from(digitalActions)
      .where(eq(digitalActions.userId, userId))
      .orderBy(desc(digitalActions.createdAt));
    if (limit) return query.limit(limit);
    return query;
  }

  // Share Cards
  async getShareCards(type?: string): Promise<ShareCard[]> {
    if (type) {
      return db.select().from(shareCards)
        .where(eq(shareCards.type, type))
        .orderBy(desc(shareCards.createdAt));
    }
    return db.select().from(shareCards).orderBy(desc(shareCards.createdAt));
  }

  async getShareCard(id: number): Promise<ShareCard | undefined> {
    const [card] = await db.select().from(shareCards).where(eq(shareCards.id, id));
    return card;
  }

  async createShareCard(data: InsertShareCard): Promise<ShareCard> {
    const [card] = await db.insert(shareCards).values(data).returning();
    return card;
  }

  // Mission Invites
  async createMissionInvite(data: InsertMissionInvite): Promise<MissionInvite> {
    const [invite] = await db.insert(missionInvites).values(data).returning();
    return invite;
  }

  async getMissionInviteByCode(code: string): Promise<MissionInvite | undefined> {
    const [invite] = await db.select().from(missionInvites).where(eq(missionInvites.inviteCode, code));
    return invite;
  }

  async incrementInviteClicks(code: string): Promise<void> {
    await db.update(missionInvites)
      .set({ clickCount: sql`${missionInvites.clickCount} + 1` })
      .where(eq(missionInvites.inviteCode, code));
  }

  async incrementInviteJoins(code: string): Promise<void> {
    await db.update(missionInvites)
      .set({ joinCount: sql`${missionInvites.joinCount} + 1` })
      .where(eq(missionInvites.inviteCode, code));
  }

  // Live Rooms
  async getLiveRooms(status?: string): Promise<LiveRoom[]> {
    if (status) {
      return db.select().from(liveRooms)
        .where(eq(liveRooms.status, status))
        .orderBy(sql`CASE WHEN ${liveRooms.scheduleType} = 'always_on' THEN 0 ELSE 1 END`, liveRooms.scheduledAt);
    }
    return db.select().from(liveRooms).orderBy(sql`CASE WHEN ${liveRooms.scheduleType} = 'always_on' THEN 0 ELSE 1 END`, liveRooms.scheduledAt);
  }

  async getLiveRoom(id: number): Promise<LiveRoom | undefined> {
    const [room] = await db.select().from(liveRooms).where(eq(liveRooms.id, id));
    return room;
  }

  async createLiveRoom(data: InsertLiveRoom): Promise<LiveRoom> {
    const [room] = await db.insert(liveRooms).values(data).returning();
    return room;
  }

  // Training Modules
  async getTrainingModules(pillarTag?: string): Promise<TrainingModule[]> {
    return db.select().from(trainingModules)
      .where(eq(trainingModules.isActive, true))
      .orderBy(trainingModules.orderIndex);
  }

  async getTrainingModule(id: number): Promise<TrainingModule | undefined> {
    const [module] = await db.select().from(trainingModules).where(eq(trainingModules.id, id));
    return module;
  }

  async createTrainingModule(data: InsertTrainingModule): Promise<TrainingModule> {
    const [module] = await db.insert(trainingModules).values(data).returning();
    return module;
  }

  // Training Progress
  async getTrainingProgress(userId: string): Promise<TrainingProgress[]> {
    return db.select().from(trainingProgress)
      .where(eq(trainingProgress.userId, userId));
  }

  async createTrainingProgress(data: InsertTrainingProgress): Promise<TrainingProgress> {
    const [progress] = await db.insert(trainingProgress).values(data).returning();
    return progress;
  }

  // Mission Challenges
  async getMissionChallenges(isActive?: boolean): Promise<MissionChallenge[]> {
    if (isActive !== undefined) {
      return db.select().from(missionChallenges)
        .where(eq(missionChallenges.isActive, isActive))
        .orderBy(desc(missionChallenges.startDate));
    }
    return db.select().from(missionChallenges).orderBy(desc(missionChallenges.startDate));
  }

  async getMissionChallenge(id: number): Promise<MissionChallenge | undefined> {
    const [challenge] = await db.select().from(missionChallenges).where(eq(missionChallenges.id, id));
    return challenge;
  }

  async createMissionChallenge(data: InsertMissionChallenge): Promise<MissionChallenge> {
    const [challenge] = await db.insert(missionChallenges).values(data).returning();
    return challenge;
  }

  // Challenge Enrollments
  async getChallengeEnrollments(userId: string): Promise<ChallengeEnrollment[]> {
    return db.select().from(challengeEnrollments)
      .where(eq(challengeEnrollments.userId, userId));
  }

  async getChallengeEnrollment(userId: string, challengeId: number): Promise<ChallengeEnrollment | undefined> {
    const [enrollment] = await db.select().from(challengeEnrollments)
      .where(and(
        eq(challengeEnrollments.userId, userId),
        eq(challengeEnrollments.challengeId, challengeId)
      ));
    return enrollment;
  }

  async createChallengeEnrollment(data: InsertChallengeEnrollment): Promise<ChallengeEnrollment> {
    const [enrollment] = await db.insert(challengeEnrollments).values(data).returning();
    return enrollment;
  }

  async updateChallengeEnrollment(id: number, data: Partial<ChallengeEnrollment>): Promise<ChallengeEnrollment> {
    const [enrollment] = await db.update(challengeEnrollments)
      .set(data)
      .where(eq(challengeEnrollments.id, id))
      .returning();
    return enrollment;
  }

  // Mission Donations
  async createMissionDonation(data: InsertMissionDonation): Promise<MissionDonation> {
    const [donation] = await db.insert(missionDonations).values(data).returning();
    return donation;
  }

  async getUserDonations(userId: string): Promise<MissionDonation[]> {
    return db.select().from(missionDonations)
      .where(eq(missionDonations.userId, userId))
      .orderBy(desc(missionDonations.createdAt));
  }

  // Recurring Donations
  async createRecurringDonation(data: InsertRecurringDonation): Promise<RecurringDonation> {
    const [donation] = await db.insert(recurringDonations).values(data).returning();
    return donation;
  }

  async getUserRecurringDonations(userId: string): Promise<RecurringDonation[]> {
    return db.select().from(recurringDonations)
      .where(eq(recurringDonations.userId, userId));
  }

  // Mission Testimonies
  async getMissionTestimonies(visibility?: string): Promise<MissionTestimony[]> {
    const conditions = [eq(missionTestimonies.moderationStatus, 'approved')];
    if (visibility) conditions.push(eq(missionTestimonies.visibility, visibility));
    
    return db.select().from(missionTestimonies)
      .where(and(...conditions))
      .orderBy(desc(missionTestimonies.createdAt));
  }

  async createMissionTestimony(data: InsertMissionTestimony): Promise<MissionTestimony> {
    const [testimony] = await db.insert(missionTestimonies).values(data).returning();
    return testimony;
  }

  // ===== SIMPLE GOALS & RESOLUTIONS =====
  
  async getUserGoals(userId: string): Promise<any[]> {
    const userSessions = await db.select()
      .from(pathwaySessions)
      .where(eq(pathwaySessions.userId, userId));
    
    if (userSessions.length === 0) {
      return [];
    }
    
    const sessionIds = userSessions.map(s => s.id);
    const today = new Date().toISOString().split('T')[0];
    
    const goalsData = await db.select()
      .from(visionGoals)
      .where(inArray(visionGoals.sessionId, sessionIds))
      .orderBy(desc(visionGoals.createdAt));
    
    const allHabits = await db.select()
      .from(visionHabits)
      .where(inArray(visionHabits.sessionId, sessionIds));
    
    const habitsWithStatus = await Promise.all(allHabits.map(async (habit) => {
      const todayLog = await db.select()
        .from(habitLogs)
        .where(and(
          eq(habitLogs.habitId, habit.id),
          eq(habitLogs.date, today)
        ))
        .limit(1);
      
      const allLogs = await db.select()
        .from(habitLogs)
        .where(and(
          eq(habitLogs.habitId, habit.id),
          eq(habitLogs.completed, true)
        ))
        .orderBy(desc(habitLogs.date))
        .limit(30);
      
      let streak = 0;
      const todayDate = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(todayDate);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (allLogs.some(l => l.date === dateStr)) {
          streak++;
        } else {
          break;
        }
      }
      
      return {
        id: habit.id,
        title: habit.title,
        frequency: habit.frequency,
        completedToday: todayLog.length > 0 && todayLog[0].completed,
        streak,
      };
    }));
    
    const goalsWithDetails = await Promise.all(goalsData.map(async (goal, index) => {
      const milestones = await db.select()
        .from(goalMilestones)
        .where(eq(goalMilestones.goalId, goal.id));
      
      const completedMilestones = milestones.filter(m => m.completedAt).length;
      const progress = milestones.length > 0 
        ? Math.round((completedMilestones / milestones.length) * 100)
        : 0;
      
      return {
        id: goal.id,
        title: goal.title,
        category: goal.relevant || 'faith',
        targetDate: goal.deadline?.toISOString() || new Date().toISOString(),
        progress,
        habits: index === 0 ? habitsWithStatus : [],
        milestones: milestones.map(m => ({
          id: m.id,
          title: m.title,
          dueDate: m.dueDate?.toISOString() || '',
          completed: !!m.completedAt,
        })),
      };
    }));
    
    return goalsWithDetails;
  }

  async createSimpleGoal(data: {
    userId: string;
    title: string;
    category: string;
    targetDate: Date | null;
    why?: string;
    firstStep?: string;
    habitTitle?: string;
  }): Promise<any> {
    let session = await db.select()
      .from(pathwaySessions)
      .where(eq(pathwaySessions.userId, data.userId))
      .limit(1);
    
    let sessionId: number;
    
    if (session.length === 0) {
      const [newSession] = await db.insert(pathwaySessions)
        .values({
          userId: data.userId,
          seasonType: 'new_year',
          seasonLabel: `${new Date().getFullYear()} Goals`,
          mode: 'faith',
        })
        .returning();
      sessionId = newSession.id;
    } else {
      sessionId = session[0].id;
    }
    
    const [goal] = await db.insert(visionGoals)
      .values({
        sessionId,
        title: data.title,
        why: data.why,
        relevant: data.category,
        deadline: data.targetDate,
        firstStep: data.firstStep,
        status: 'active',
      })
      .returning();
    
    if (data.habitTitle) {
      await db.insert(visionHabits)
        .values({
          sessionId,
          title: data.habitTitle,
          frequency: 'daily',
          targetPerWeek: 7,
          isActive: true,
        });
    }
    
    return goal;
  }

  async toggleHabitLog(habitId: number, date: string, completed: boolean): Promise<any> {
    const existingLog = await db.select()
      .from(habitLogs)
      .where(and(
        eq(habitLogs.habitId, habitId),
        eq(habitLogs.date, date)
      ))
      .limit(1);
    
    if (existingLog.length > 0) {
      const [updatedLog] = await db.update(habitLogs)
        .set({ completed })
        .where(eq(habitLogs.id, existingLog[0].id))
        .returning();
      return updatedLog;
    } else {
      const [newLog] = await db.insert(habitLogs)
        .values({ habitId, date, completed })
        .returning();
      return newLog;
    }
  }

  // ===== AI COACHING =====
  
  async createAiCoachSession(data: InsertAiCoachSession): Promise<AiCoachSession> {
    const [session] = await db.insert(aiCoachSessions).values(data).returning();
    return session;
  }

  async getAiCoachSession(id: number): Promise<AiCoachSession | undefined> {
    const [session] = await db.select().from(aiCoachSessions).where(eq(aiCoachSessions.id, id));
    return session;
  }

  async getUserAiCoachSessions(userId: string): Promise<AiCoachSession[]> {
    return db.select()
      .from(aiCoachSessions)
      .where(eq(aiCoachSessions.userId, userId))
      .orderBy(desc(aiCoachSessions.updatedAt));
  }

  async updateAiCoachSession(id: number, data: Partial<AiCoachSession>): Promise<AiCoachSession> {
    const [session] = await db.update(aiCoachSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiCoachSessions.id, id))
      .returning();
    return session;
  }

  async createAiCoachMessage(data: InsertAiCoachMessage): Promise<AiCoachMessage> {
    const [message] = await db.insert(aiCoachMessages).values(data).returning();
    await db.update(aiCoachSessions)
      .set({ lastMessageAt: new Date(), updatedAt: new Date() })
      .where(eq(aiCoachSessions.id, data.sessionId));
    return message;
  }

  async getAiCoachMessages(sessionId: number): Promise<AiCoachMessage[]> {
    return db.select()
      .from(aiCoachMessages)
      .where(eq(aiCoachMessages.sessionId, sessionId))
      .orderBy(aiCoachMessages.createdAt);
  }

  // ===== NOTIFICATIONS =====
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | undefined> {
    const [prefs] = await db.select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return prefs;
  }

  async upsertNotificationPreferences(userId: string, prefs: Partial<InsertNotificationPreferences>): Promise<NotificationPreferences> {
    const existing = await this.getNotificationPreferences(userId);
    if (existing) {
      const [updated] = await db.update(notificationPreferences)
        .set({ ...prefs, updatedAt: new Date() })
        .where(eq(notificationPreferences.userId, userId))
        .returning();
      return updated;
    }
    const [created] = await db.insert(notificationPreferences)
      .values({ userId, ...prefs })
      .returning();
    return created;
  }

  async getNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    return db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const result = await db.select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.read, false)
      ));
    return result[0]?.count || 0;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationRead(id: number, userId: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }

  async getUsersWithPushEnabled(): Promise<Array<{ userId: string; pushSubscription: string }>> {
    const results = await db.select({
      userId: notificationPreferences.userId,
      pushSubscription: notificationPreferences.pushSubscription,
    })
    .from(notificationPreferences)
    .where(and(
      eq(notificationPreferences.pushEnabled, true),
      sql`${notificationPreferences.pushSubscription} IS NOT NULL`
    ));
    return results.filter(r => r.pushSubscription !== null) as Array<{ userId: string; pushSubscription: string }>;
  }

  async getUsersForPrayerNotifications(excludeUserId: string): Promise<string[]> {
    const allUsers = await db.select({ id: users.id }).from(users).where(sql`${users.id} != ${excludeUserId}`);
    const disabledUsers = await db.select({ userId: notificationPreferences.userId })
      .from(notificationPreferences)
      .where(eq(notificationPreferences.prayerSessionAlerts, false));
    const disabledSet = new Set(disabledUsers.map(u => u.userId));
    return allUsers.filter(u => !disabledSet.has(u.id)).map(u => u.id);
  }

  async createBulkNotifications(notificationsData: InsertNotification[]): Promise<void> {
    if (notificationsData.length === 0) return;
    await db.insert(notifications).values(notificationsData);
  }

  // ===== ADMIN COACHING =====
  async getCoaches(): Promise<Coach[]> {
    return db.select().from(coaches).orderBy(desc(coaches.createdAt));
  }

  async getCoach(id: number): Promise<Coach | undefined> {
    const [coach] = await db.select().from(coaches).where(eq(coaches.id, id));
    return coach;
  }

  async createCoach(data: InsertCoach): Promise<Coach> {
    const [coach] = await db.insert(coaches).values(data).returning();
    return coach;
  }

  async updateCoach(id: number, data: Partial<InsertCoach>): Promise<Coach> {
    const [coach] = await db.update(coaches)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(coaches.id, id))
      .returning();
    return coach;
  }

  async getCoachingSessions(status?: string): Promise<CoachingSession[]> {
    if (status) {
      return db.select().from(coachingSessions)
        .where(eq(coachingSessions.status, status))
        .orderBy(desc(coachingSessions.scheduledAt));
    }
    return db.select().from(coachingSessions).orderBy(desc(coachingSessions.scheduledAt));
  }

  async getCoachingSession(id: number): Promise<CoachingSession | undefined> {
    const [session] = await db.select().from(coachingSessions).where(eq(coachingSessions.id, id));
    return session;
  }

  async updateCoachingSession(id: number, data: Partial<InsertCoachingSession>): Promise<CoachingSession> {
    const [session] = await db.update(coachingSessions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(coachingSessions.id, id))
      .returning();
    return session;
  }

  async getCoachingCohorts(): Promise<CoachingCohort[]> {
    return db.select().from(coachingCohorts).orderBy(desc(coachingCohorts.createdAt));
  }

  async getCoachingCohort(id: number): Promise<CoachingCohort | undefined> {
    const [cohort] = await db.select().from(coachingCohorts).where(eq(coachingCohorts.id, id));
    return cohort;
  }

  async createCoachingCohort(data: InsertCoachingCohort): Promise<CoachingCohort> {
    const [cohort] = await db.insert(coachingCohorts).values(data).returning();
    return cohort;
  }

  async updateCoachingCohort(id: number, data: Partial<InsertCoachingCohort>): Promise<CoachingCohort> {
    const [cohort] = await db.update(coachingCohorts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(coachingCohorts.id, id))
      .returning();
    return cohort;
  }

  async getCohortParticipants(cohortId: number): Promise<CohortParticipant[]> {
    return db.select().from(cohortParticipants)
      .where(eq(cohortParticipants.cohortId, cohortId))
      .orderBy(cohortParticipants.joinedAt);
  }

  // ===== ADMIN CHALLENGES =====
  async getChallenges(options?: { status?: string; search?: string; page?: number; pageSize?: number }): Promise<{ challenges: Challenge[]; total: number }> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (options?.status) {
      conditions.push(eq(challenges.status, options.status));
    }
    if (options?.search) {
      conditions.push(
        or(
          ilike(challenges.title, `%${options.search}%`),
          ilike(challenges.description, `%${options.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: count() })
      .from(challenges)
      .where(whereClause);

    const challengesList = await db
      .select()
      .from(challenges)
      .where(whereClause)
      .orderBy(desc(challenges.createdAt))
      .limit(pageSize)
      .offset(offset);

    const challengeIds = challengesList.map(c => c.id);
    let participantCounts: { challengeId: number; count: number }[] = [];
    if (challengeIds.length > 0) {
      participantCounts = await db
        .select({
          challengeId: challengeParticipants.challengeId,
          count: count(challengeParticipants.id),
        })
        .from(challengeParticipants)
        .where(inArray(challengeParticipants.challengeId, challengeIds))
        .groupBy(challengeParticipants.challengeId);
    }

    const challengesWithCounts = challengesList.map(challenge => ({
      ...challenge,
      currentParticipants: participantCounts.find(p => p.challengeId === challenge.id)?.count || 0,
    }));

    return {
      challenges: challengesWithCounts,
      total: Number(countResult?.count || 0),
    };
  }

  async getChallenge(id: number): Promise<Challenge | undefined> {
    const [challenge] = await db.select().from(challenges).where(eq(challenges.id, id));
    return challenge;
  }

  async createChallenge(data: InsertChallenge): Promise<Challenge> {
    const [challenge] = await db.insert(challenges).values(data).returning();
    return challenge;
  }

  async updateChallenge(id: number, data: Partial<InsertChallenge>): Promise<Challenge> {
    const [challenge] = await db
      .update(challenges)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(challenges.id, id))
      .returning();
    return challenge;
  }

  async deleteChallenge(id: number): Promise<void> {
    await db.delete(challenges).where(eq(challenges.id, id));
  }

  async getChallengeParticipants(challengeId: number): Promise<ChallengeParticipant[]> {
    const participants = await db
      .select({
        id: challengeParticipants.id,
        challengeId: challengeParticipants.challengeId,
        userId: challengeParticipants.userId,
        teamId: challengeParticipants.teamId,
        progress: challengeParticipants.progress,
        points: challengeParticipants.points,
        streak: challengeParticipants.streak,
        bestStreak: challengeParticipants.bestStreak,
        lastActionAt: challengeParticipants.lastActionAt,
        status: challengeParticipants.status,
        rank: challengeParticipants.rank,
        completedAt: challengeParticipants.completedAt,
        joinedAt: challengeParticipants.joinedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(challengeParticipants)
      .leftJoin(users, eq(challengeParticipants.userId, users.id))
      .where(eq(challengeParticipants.challengeId, challengeId))
      .orderBy(desc(challengeParticipants.points));
    
    return participants as any;
  }

  async getChallengeParticipant(challengeId: number, userId: string): Promise<ChallengeParticipant | undefined> {
    const [participant] = await db
      .select()
      .from(challengeParticipants)
      .where(and(
        eq(challengeParticipants.challengeId, challengeId),
        eq(challengeParticipants.userId, userId)
      ));
    return participant;
  }

  async createChallengeParticipant(data: InsertChallengeParticipant): Promise<ChallengeParticipant> {
    const [participant] = await db.insert(challengeParticipants).values(data).returning();
    return participant;
  }

  async getUserChallengeParticipations(userId: string): Promise<ChallengeParticipant[]> {
    return db
      .select()
      .from(challengeParticipants)
      .where(eq(challengeParticipants.userId, userId));
  }

  // ===== ADMIN MISSION TRIPS =====
  async getMissionTrips(options?: { status?: string; search?: string; page?: number; pageSize?: number }): Promise<{ trips: MissionTrip[]; total: number }> {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (options?.status) {
      conditions.push(eq(missionTrips.status, options.status));
    }
    if (options?.search) {
      conditions.push(
        or(
          ilike(missionTrips.title, `%${options.search}%`),
          ilike(missionTrips.destination, `%${options.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await db
      .select({ count: count() })
      .from(missionTrips)
      .where(whereClause);

    const tripsList = await db
      .select()
      .from(missionTrips)
      .where(whereClause)
      .orderBy(desc(missionTrips.createdAt))
      .limit(pageSize)
      .offset(offset);

    const tripIds = tripsList.map(t => t.id);
    let applicationCounts: { tripId: number; count: number }[] = [];
    if (tripIds.length > 0) {
      applicationCounts = await db
        .select({
          tripId: tripApplications.tripId,
          count: count(tripApplications.id),
        })
        .from(tripApplications)
        .where(inArray(tripApplications.tripId, tripIds))
        .groupBy(tripApplications.tripId);
    }

    const tripsWithCounts = tripsList.map(trip => ({
      ...trip,
      currentParticipants: applicationCounts.find(a => a.tripId === trip.id)?.count || 0,
    }));

    return {
      trips: tripsWithCounts,
      total: Number(countResult?.count || 0),
    };
  }

  async getMissionTrip(id: number): Promise<MissionTrip | undefined> {
    const [trip] = await db.select().from(missionTrips).where(eq(missionTrips.id, id));
    return trip;
  }

  async createMissionTrip(data: InsertMissionTrip): Promise<MissionTrip> {
    const [trip] = await db.insert(missionTrips).values(data).returning();
    return trip;
  }

  async updateMissionTrip(id: number, data: Partial<InsertMissionTrip>): Promise<MissionTrip> {
    const [trip] = await db
      .update(missionTrips)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(missionTrips.id, id))
      .returning();
    return trip;
  }

  async deleteMissionTrip(id: number): Promise<void> {
    await db.delete(missionTrips).where(eq(missionTrips.id, id));
  }

  async getTripApplications(tripId: number): Promise<TripApplication[]> {
    const applications = await db
      .select({
        id: tripApplications.id,
        tripId: tripApplications.tripId,
        userId: tripApplications.userId,
        status: tripApplications.status,
        role: tripApplications.role,
        emergencyContact: tripApplications.emergencyContact,
        medicalInfo: tripApplications.medicalInfo,
        dietaryRestrictions: tripApplications.dietaryRestrictions,
        specialSkills: tripApplications.specialSkills,
        whyApply: tripApplications.whyApply,
        documents: tripApplications.documents,
        amountPaid: tripApplications.amountPaid,
        fundraisingAmount: tripApplications.fundraisingAmount,
        fundraisingPageUrl: tripApplications.fundraisingPageUrl,
        notes: tripApplications.notes,
        reviewedBy: tripApplications.reviewedBy,
        reviewedAt: tripApplications.reviewedAt,
        appliedAt: tripApplications.appliedAt,
        updatedAt: tripApplications.updatedAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(tripApplications)
      .leftJoin(users, eq(tripApplications.userId, users.id))
      .where(eq(tripApplications.tripId, tripId))
      .orderBy(desc(tripApplications.appliedAt));
    
    return applications as any;
  }

  async updateTripApplication(id: number, data: Partial<InsertTripApplication>): Promise<TripApplication> {
    const [application] = await db
      .update(tripApplications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tripApplications.id, id))
      .returning();
    return application;
  }

  async getTripApplication(tripId: number, userId: string): Promise<TripApplication | undefined> {
    const [application] = await db
      .select()
      .from(tripApplications)
      .where(and(
        eq(tripApplications.tripId, tripId),
        eq(tripApplications.userId, userId)
      ));
    return application;
  }

  async createTripApplication(data: InsertTripApplication): Promise<TripApplication> {
    const [application] = await db.insert(tripApplications).values(data).returning();
    return application;
  }

  async getCohortParticipant(cohortId: number, userId: string): Promise<CohortParticipant | undefined> {
    const [participant] = await db
      .select()
      .from(cohortParticipants)
      .where(and(
        eq(cohortParticipants.cohortId, cohortId),
        eq(cohortParticipants.userId, userId)
      ));
    return participant;
  }

  async createCohortParticipant(data: InsertCohortParticipant): Promise<CohortParticipant> {
    const [participant] = await db.insert(cohortParticipants).values(data).returning();
    return participant;
  }

  async createCoachingSession(data: InsertCoachingSession): Promise<CoachingSession> {
    const [session] = await db.insert(coachingSessions).values(data).returning();
    return session;
  }

  // ===== ANALYTICS =====
  async getTotalUserCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(users);
    return Number(result?.count || 0);
  }

  async getActiveUserCount(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const [result] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.lastActiveAt, cutoffDate));
    return Number(result?.count || 0);
  }

  async getTotalSparkViews(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(sparkReactions);
    return Number(result?.count || 0);
  }

  async getCompletedChallengesCount(): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(challengeParticipants)
      .where(eq(challengeParticipants.status, 'completed'));
    return Number(result?.count || 0);
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.firstName);
  }

  // ===== ADMIN GOAL TEMPLATES =====
  async getGoalTemplates(): Promise<GoalTemplate[]> {
    return db.select().from(goalTemplates).orderBy(desc(goalTemplates.createdAt));
  }

  async getGoalTemplate(id: number): Promise<GoalTemplate | undefined> {
    const [template] = await db.select().from(goalTemplates).where(eq(goalTemplates.id, id));
    return template;
  }

  async createGoalTemplate(data: InsertGoalTemplate): Promise<GoalTemplate> {
    const [template] = await db.insert(goalTemplates).values(data).returning();
    return template;
  }

  async updateGoalTemplate(id: number, data: Partial<InsertGoalTemplate>): Promise<GoalTemplate> {
    const [template] = await db
      .update(goalTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(goalTemplates.id, id))
      .returning();
    return template;
  }

  async deleteGoalTemplate(id: number): Promise<void> {
    await db.delete(goalTemplates).where(eq(goalTemplates.id, id));
  }

  async getUserProgressStats(): Promise<{
    totalUsersWithGoals: number;
    averageCompletionRate: number;
    activeJourneys: number;
    userProgress: Array<{
      userId: string;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
      goalsCount: number;
      habitsTracked: number;
      lastActivity: Date | null;
    }>;
  }> {
    const [usersWithGoalsResult] = await db
      .select({ count: count() })
      .from(visionGoals)
      .innerJoin(users, eq(visionGoals.userId, users.id));
    const totalUsersWithGoals = Number(usersWithGoalsResult?.count || 0);

    const [activeJourneysResult] = await db
      .select({ count: count() })
      .from(pathwaySessions)
      .where(eq(pathwaySessions.status, 'active'));
    const activeJourneys = Number(activeJourneysResult?.count || 0);

    const goalsData = await db
      .select({
        total: count(),
        completed: sql<number>`count(*) filter (where ${visionGoals.status} = 'completed')`,
      })
      .from(visionGoals);
    const totalGoals = Number(goalsData[0]?.total || 0);
    const completedGoals = Number(goalsData[0]?.completed || 0);
    const averageCompletionRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

    const userProgressData = await db
      .select({
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        goalsCount: sql<number>`count(distinct ${visionGoals.id})`,
        habitsTracked: sql<number>`count(distinct ${visionHabits.id})`,
        lastActivity: sql<Date>`max(${habitLogs.loggedAt})`,
      })
      .from(users)
      .leftJoin(visionGoals, eq(users.id, visionGoals.userId))
      .leftJoin(visionHabits, eq(users.id, visionHabits.userId))
      .leftJoin(habitLogs, eq(visionHabits.id, habitLogs.habitId))
      .groupBy(users.id, users.firstName, users.lastName, users.profileImageUrl)
      .having(sql`count(distinct ${visionGoals.id}) > 0 OR count(distinct ${visionHabits.id}) > 0`)
      .orderBy(desc(sql`max(${habitLogs.loggedAt})`))
      .limit(50);

    return {
      totalUsersWithGoals,
      averageCompletionRate,
      activeJourneys,
      userProgress: userProgressData.map(u => ({
        userId: u.userId,
        firstName: u.firstName,
        lastName: u.lastName,
        profileImageUrl: u.profileImageUrl,
        goalsCount: Number(u.goalsCount),
        habitsTracked: Number(u.habitsTracked),
        lastActivity: u.lastActivity,
      })),
    };
  }

  async getGrowthTracks(): Promise<Array<{
    id: number;
    key: string;
    title: string;
    description: string | null;
    isEnabled: boolean;
    modulesCount: number;
  }>> {
    const tracksData = await db
      .select({
        id: tracks.id,
        key: tracks.key,
        title: tracks.title,
        description: tracks.description,
        isEnabled: tracks.isEnabled,
        modulesCount: sql<number>`count(${modules.id})`,
      })
      .from(tracks)
      .leftJoin(modules, eq(tracks.id, modules.trackId))
      .groupBy(tracks.id, tracks.key, tracks.title, tracks.description, tracks.isEnabled)
      .orderBy(tracks.orderIndex);

    return tracksData.map(t => ({
      id: t.id,
      key: t.key,
      title: t.title,
      description: t.description,
      isEnabled: t.isEnabled ?? true,
      modulesCount: Number(t.modulesCount),
    }));
  }

  // ===== USER SETTINGS =====
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings || null;
  }

  async upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [result] = await db
      .insert(userSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  // ===== COMMENTS =====
  async getCommentsByPost(postId: number): Promise<any[]> {
    const results = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.createdAt));
    return results;
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [result] = await db
      .insert(comments)
      .values(comment)
      .returning();
    return result;
  }

  async deleteComment(id: number, userId: string): Promise<void> {
    await db
      .delete(comments)
      .where(and(eq(comments.id, id), eq(comments.userId, userId)));
  }

  // ===== PRAYER MOVEMENT =====
  
  // Prayer Focus Groups
  async getPrayerFocusGroups(category?: string): Promise<PrayerFocusGroup[]> {
    if (category) {
      return db.select().from(prayerFocusGroups)
        .where(and(eq(prayerFocusGroups.category, category), eq(prayerFocusGroups.isActive, true)))
        .orderBy(prayerFocusGroups.name);
    }
    return db.select().from(prayerFocusGroups)
      .where(eq(prayerFocusGroups.isActive, true))
      .orderBy(prayerFocusGroups.name);
  }

  async getPrayerFocusGroup(id: number): Promise<PrayerFocusGroup | undefined> {
    const [group] = await db.select().from(prayerFocusGroups).where(eq(prayerFocusGroups.id, id));
    return group;
  }

  async createPrayerFocusGroup(group: InsertPrayerFocusGroup): Promise<PrayerFocusGroup> {
    const [result] = await db.insert(prayerFocusGroups).values(group).returning();
    return result;
  }

  async updatePrayerFocusGroup(id: number, updates: Partial<InsertPrayerFocusGroup>): Promise<PrayerFocusGroup> {
    const [result] = await db.update(prayerFocusGroups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prayerFocusGroups.id, id))
      .returning();
    return result;
  }

  // UK Campuses
  async getUkCampuses(type?: string, region?: string): Promise<UkCampus[]> {
    let conditions = [];
    if (type) conditions.push(eq(ukCampuses.type, type));
    if (region) conditions.push(eq(ukCampuses.region, region));
    
    if (conditions.length > 0) {
      return db.select().from(ukCampuses).where(and(...conditions)).orderBy(ukCampuses.name);
    }
    return db.select().from(ukCampuses).orderBy(ukCampuses.name);
  }

  async getUkCampus(id: number): Promise<UkCampus | undefined> {
    const [campus] = await db.select().from(ukCampuses).where(eq(ukCampuses.id, id));
    return campus;
  }

  async searchUkCampuses(query: string): Promise<UkCampus[]> {
    return db.select().from(ukCampuses)
      .where(or(
        ilike(ukCampuses.name, `%${query}%`),
        ilike(ukCampuses.city, `%${query}%`)
      ))
      .orderBy(ukCampuses.name)
      .limit(20);
  }

  async createUkCampus(campus: InsertUkCampus): Promise<UkCampus> {
    const [result] = await db.insert(ukCampuses).values(campus).returning();
    return result;
  }

  // Campus Altars
  async getCampusAltars(status?: string): Promise<CampusAltar[]> {
    if (status) {
      return db.select().from(campusAltars).where(eq(campusAltars.status, status)).orderBy(desc(campusAltars.memberCount));
    }
    return db.select().from(campusAltars).orderBy(desc(campusAltars.memberCount));
  }

  async getCampusAltar(id: number): Promise<CampusAltar | undefined> {
    const [altar] = await db.select().from(campusAltars).where(eq(campusAltars.id, id));
    return altar;
  }

  async getCampusAltarByCampus(campusId: number): Promise<CampusAltar | undefined> {
    const [altar] = await db.select().from(campusAltars).where(eq(campusAltars.campusId, campusId));
    return altar;
  }

  async createCampusAltar(altar: InsertCampusAltar): Promise<CampusAltar> {
    const [result] = await db.insert(campusAltars).values(altar).returning();
    // Update campus hasAltar flag
    await db.update(ukCampuses).set({ hasAltar: true }).where(eq(ukCampuses.id, altar.campusId));
    return result;
  }

  async updateCampusAltar(id: number, updates: Partial<InsertCampusAltar>): Promise<CampusAltar> {
    const [result] = await db.update(campusAltars)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(campusAltars.id, id))
      .returning();
    return result;
  }

  // Altar Members
  async getAltarMembers(altarId: number): Promise<AltarMember[]> {
    return db.select().from(altarMembers).where(eq(altarMembers.altarId, altarId)).orderBy(desc(altarMembers.prayerHours));
  }

  async getAltarMember(altarId: number, userId: string): Promise<AltarMember | undefined> {
    const [member] = await db.select().from(altarMembers)
      .where(and(eq(altarMembers.altarId, altarId), eq(altarMembers.userId, userId)));
    return member;
  }

  async createAltarMember(member: InsertAltarMember): Promise<AltarMember> {
    const [result] = await db.insert(altarMembers).values(member).returning();
    // Increment altar member count
    await db.update(campusAltars)
      .set({ memberCount: sql`${campusAltars.memberCount} + 1` })
      .where(eq(campusAltars.id, member.altarId));
    return result;
  }

  async updateAltarMember(id: number, updates: Partial<InsertAltarMember>): Promise<AltarMember> {
    const [result] = await db.update(altarMembers).set(updates).where(eq(altarMembers.id, id)).returning();
    return result;
  }

  // Prayer Subscriptions
  async getPrayerSubscriptions(userId: string): Promise<PrayerSubscription[]> {
    return db.select().from(prayerSubscriptions).where(eq(prayerSubscriptions.userId, userId));
  }

  async getPrayerSubscription(userId: string, focusGroupId?: number, altarId?: number): Promise<PrayerSubscription | undefined> {
    let conditions = [eq(prayerSubscriptions.userId, userId)];
    if (focusGroupId) conditions.push(eq(prayerSubscriptions.focusGroupId, focusGroupId));
    if (altarId) conditions.push(eq(prayerSubscriptions.altarId, altarId));
    
    const [subscription] = await db.select().from(prayerSubscriptions).where(and(...conditions));
    return subscription;
  }

  async createPrayerSubscription(subscription: InsertPrayerSubscription): Promise<PrayerSubscription> {
    const [result] = await db.insert(prayerSubscriptions).values(subscription).returning();
    // Increment intercessor count on focus group if applicable
    if (subscription.focusGroupId) {
      await db.update(prayerFocusGroups)
        .set({ intercessorCount: sql`${prayerFocusGroups.intercessorCount} + 1` })
        .where(eq(prayerFocusGroups.id, subscription.focusGroupId));
    }
    return result;
  }

  async updatePrayerSubscription(id: number, updates: Partial<InsertPrayerSubscription>): Promise<PrayerSubscription> {
    const [result] = await db.update(prayerSubscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prayerSubscriptions.id, id))
      .returning();
    return result;
  }

  async deletePrayerSubscription(id: number): Promise<void> {
    await db.delete(prayerSubscriptions).where(eq(prayerSubscriptions.id, id));
  }

  // Prayer Wall
  async getPrayerWallEntries(focusGroupId?: number, altarId?: number, limit: number = 50): Promise<PrayerWallEntry[]> {
    let conditions = [eq(prayerWallEntries.status, "active")];
    if (focusGroupId) conditions.push(eq(prayerWallEntries.focusGroupId, focusGroupId));
    if (altarId) conditions.push(eq(prayerWallEntries.altarId, altarId));
    
    return db.select().from(prayerWallEntries)
      .where(and(...conditions))
      .orderBy(desc(prayerWallEntries.createdAt))
      .limit(limit);
  }

  async createPrayerWallEntry(entry: InsertPrayerWallEntry): Promise<PrayerWallEntry> {
    const [result] = await db.insert(prayerWallEntries).values(entry).returning();
    return result;
  }

  async updatePrayerWallEntry(id: number, updates: Partial<InsertPrayerWallEntry>): Promise<PrayerWallEntry> {
    const [result] = await db.update(prayerWallEntries)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prayerWallEntries.id, id))
      .returning();
    return result;
  }

  async incrementPrayerCount(entryId: number): Promise<void> {
    await db.update(prayerWallEntries)
      .set({ prayerCount: sql`${prayerWallEntries.prayerCount} + 1` })
      .where(eq(prayerWallEntries.id, entryId));
  }

  // Prayer Logs
  async createPrayerLog(log: InsertPrayerLog): Promise<PrayerLog> {
    const [result] = await db.insert(prayerLogs).values(log).returning();
    return result;
  }

  async getPrayerStats(): Promise<{ totalHours: number; totalIntercessors: number; campusesCovered: number }> {
    // Get total prayer hours
    const [hoursResult] = await db.select({
      totalMinutes: sql<number>`COALESCE(SUM(${prayerLogs.durationMinutes}), 0)`
    }).from(prayerLogs);
    
    // Get unique intercessors
    const [intercessorsResult] = await db.select({
      count: sql<number>`COUNT(DISTINCT ${prayerSubscriptions.userId})`
    }).from(prayerSubscriptions);
    
    // Get campuses with altars
    const [campusesResult] = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(campusAltars).where(eq(campusAltars.status, "active"));
    
    return {
      totalHours: Math.floor(Number(hoursResult?.totalMinutes || 0) / 60),
      totalIntercessors: Number(intercessorsResult?.count || 0),
      campusesCovered: Number(campusesResult?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
