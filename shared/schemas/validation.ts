/**
 * Validation Schemas
 * 
 * Zod validation schemas for all platform entities.
 * Used for both client-side form validation and server-side request validation.
 */

import { z } from 'zod';
import { ContentCategories, NotificationTypes } from '../types';

// ============================================================================
// Common Schemas
// ============================================================================

export const idSchema = z.number().int().positive();
export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email('Please enter a valid email address');
export const urlSchema = z.string().url('Please enter a valid URL').optional().nullable();
export const dateSchema = z.coerce.date();
export const optionalDateSchema = z.coerce.date().optional().nullable();

// String constraints
export const shortTextSchema = z.string().min(1, 'Required').max(100, 'Maximum 100 characters');
export const mediumTextSchema = z.string().min(1, 'Required').max(500, 'Maximum 500 characters');
export const longTextSchema = z.string().min(1, 'Required').max(5000, 'Maximum 5000 characters');
export const optionalShortTextSchema = shortTextSchema.optional().nullable();
export const optionalMediumTextSchema = mediumTextSchema.optional().nullable();
export const optionalLongTextSchema = longTextSchema.optional().nullable();

// Enums
export const contentCategorySchema = z.enum(ContentCategories);
export const difficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
export const notificationTypeSchema = z.enum(NotificationTypes);

// ============================================================================
// User Schemas
// ============================================================================

export const userProfileSchema = z.object({
  firstName: optionalShortTextSchema,
  lastName: optionalShortTextSchema,
  profileImageUrl: urlSchema,
  contentMode: z.enum(['reflection', 'faith']).default('reflection'),
  contentTone: z.enum(['seeker', 'faith']).default('faith'),
  audienceSegment: z.enum(['sixth_form', 'university', 'early_career', 'builders', 'couples']).optional().nullable(),
  region: optionalShortTextSchema,
  community: optionalShortTextSchema,
});

export const updateUserProfileSchema = userProfileSchema.partial();

export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

// ============================================================================
// User Preferences Schemas
// ============================================================================

export const notificationSettingsSchema = z.object({
  dailyReminders: z.boolean().default(true),
  dailyReminderTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:MM)').default('08:00'),
  streakAlerts: z.boolean().default(true),
  groupNotifications: z.boolean().default(true),
  emailDigest: z.enum(['daily', 'weekly', 'never']).default('weekly'),
  pushEnabled: z.boolean().default(true),
});

export const displaySettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  reducedMotion: z.boolean().default(false),
  highContrast: z.boolean().default(false),
});

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'group', 'private']).default('group'),
  showStreak: z.boolean().default(true),
  showProgress: z.boolean().default(true),
  allowAccountabilityRequests: z.boolean().default(true),
});

export const userPreferencesSchema = z.object({
  notificationSettings: notificationSettingsSchema.optional(),
  displaySettings: displaySettingsSchema.optional(),
  privacySettings: privacySettingsSchema.optional(),
});

export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
export type DisplaySettingsInput = z.infer<typeof displaySettingsSchema>;
export type PrivacySettingsInput = z.infer<typeof privacySettingsSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

// ============================================================================
// Reading Plan Schemas
// ============================================================================

export const createReadingPlanSchema = z.object({
  title: shortTextSchema,
  description: mediumTextSchema,
  category: contentCategorySchema,
  difficulty: difficultySchema.default('beginner'),
  totalDays: z.number().int().min(1).max(365),
  imageUrl: urlSchema,
  tags: z.array(z.string().max(50)).max(10).default([]),
  isFeatured: z.boolean().default(false),
});

export const updateReadingPlanSchema = createReadingPlanSchema.partial();

export const createReadingPlanDaySchema = z.object({
  planId: idSchema,
  dayNumber: z.number().int().min(1),
  title: shortTextSchema,
  scriptureRef: shortTextSchema,
  content: longTextSchema,
  reflectionQuestions: z.array(mediumTextSchema).min(1).max(5),
  prayerPrompt: optionalMediumTextSchema,
});

export const updateReadingPlanDaySchema = createReadingPlanDaySchema.omit({ planId: true }).partial();

export type CreateReadingPlanInput = z.infer<typeof createReadingPlanSchema>;
export type UpdateReadingPlanInput = z.infer<typeof updateReadingPlanSchema>;
export type CreateReadingPlanDayInput = z.infer<typeof createReadingPlanDaySchema>;
export type UpdateReadingPlanDayInput = z.infer<typeof updateReadingPlanDaySchema>;

// ============================================================================
// Journey Schemas
// ============================================================================

export const createJourneySchema = z.object({
  title: shortTextSchema,
  description: mediumTextSchema,
  category: contentCategorySchema,
  difficulty: difficultySchema.default('beginner'),
  totalDays: z.number().int().min(1).max(90),
  imageUrl: urlSchema,
  tags: z.array(z.string().max(50)).max(10).default([]),
  isFeatured: z.boolean().default(false),
});

export const updateJourneySchema = createJourneySchema.partial();

export const createJourneyDaySchema = z.object({
  journeyId: idSchema,
  dayNumber: z.number().int().min(1),
  title: shortTextSchema,
  overview: mediumTextSchema,
});

export const createJourneyStepSchema = z.object({
  dayId: idSchema,
  stepNumber: z.number().int().min(1),
  type: z.enum(['video', 'reading', 'reflection', 'action']),
  title: shortTextSchema,
  content: longTextSchema,
  mediaUrl: urlSchema,
  duration: z.number().int().min(0).optional().nullable(),
});

export type CreateJourneyInput = z.infer<typeof createJourneySchema>;
export type UpdateJourneyInput = z.infer<typeof updateJourneySchema>;
export type CreateJourneyDayInput = z.infer<typeof createJourneyDaySchema>;
export type CreateJourneyStepInput = z.infer<typeof createJourneyStepSchema>;

// ============================================================================
// Goal Schemas
// ============================================================================

export const createUserGoalSchema = z.object({
  title: shortTextSchema,
  description: optionalMediumTextSchema,
  category: contentCategorySchema,
  mode: z.enum(['classic', 'self_concordant']).default('classic'),
  targetDate: optionalDateSchema,
});

export const updateUserGoalSchema = createUserGoalSchema.partial().extend({
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional(),
});

export const createGoalMilestoneSchema = z.object({
  goalId: idSchema,
  title: shortTextSchema,
  dueDate: optionalDateSchema,
});

export const createGoalHabitSchema = z.object({
  goalId: idSchema,
  title: shortTextSchema,
  frequency: z.enum(['daily', 'weekly', 'monthly']),
});

export type CreateUserGoalInput = z.infer<typeof createUserGoalSchema>;
export type UpdateUserGoalInput = z.infer<typeof updateUserGoalSchema>;
export type CreateGoalMilestoneInput = z.infer<typeof createGoalMilestoneSchema>;
export type CreateGoalHabitInput = z.infer<typeof createGoalHabitSchema>;

// ============================================================================
// Group Schemas
// ============================================================================

export const createGroupSchema = z.object({
  name: shortTextSchema,
  description: optionalMediumTextSchema,
  imageUrl: urlSchema,
  visibility: z.enum(['public', 'private', 'invite_only']).default('private'),
  maxMembers: z.number().int().min(2).max(100).default(20),
});

export const updateGroupSchema = createGroupSchema.partial();

export const createGroupDiscussionSchema = z.object({
  groupId: idSchema,
  title: shortTextSchema,
  content: longTextSchema,
});

export const createGroupLabSchema = z.object({
  groupId: idSchema,
  title: shortTextSchema,
  description: optionalMediumTextSchema,
  scheduledAt: dateSchema,
  duration: z.number().int().min(15).max(180).default(60),
  meetingUrl: urlSchema,
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type CreateGroupDiscussionInput = z.infer<typeof createGroupDiscussionSchema>;
export type CreateGroupLabInput = z.infer<typeof createGroupLabSchema>;

// ============================================================================
// Journal Schemas
// ============================================================================

export const createJournalEntrySchema = z.object({
  contextType: z.enum(['reading_plan', 'journey', 'spark', 'goal', 'personal']),
  contextId: idSchema.optional().nullable(),
  content: longTextSchema,
  isPrivate: z.boolean().default(true),
  tags: z.array(z.string().max(30)).max(10).default([]),
});

export const updateJournalEntrySchema = z.object({
  content: longTextSchema.optional(),
  isPrivate: z.boolean().optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
});

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;

// ============================================================================
// Notification Schemas
// ============================================================================

export const createNotificationSchema = z.object({
  userId: z.string(),
  type: notificationTypeSchema,
  title: shortTextSchema,
  body: mediumTextSchema,
  data: z.record(z.unknown()).default({}),
});

export const scheduleNotificationSchema = createNotificationSchema.extend({
  scheduledFor: dateSchema,
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type ScheduleNotificationInput = z.infer<typeof scheduleNotificationSchema>;
export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;

// ============================================================================
// Spiritual Profile Schemas
// ============================================================================

export const wheelOfLifeScoresSchema = z.object({
  faith: z.number().min(1).max(10),
  family: z.number().min(1).max(10),
  finances: z.number().min(1).max(10),
  fitness: z.number().min(1).max(10),
  friends: z.number().min(1).max(10),
  fun: z.number().min(1).max(10),
  career: z.number().min(1).max(10),
  contribution: z.number().min(1).max(10),
});

export const updateSpiritualProfileSchema = z.object({
  wheelOfLifeScores: wheelOfLifeScoresSchema.optional(),
  primaryGrowthAreas: z.array(contentCategorySchema).max(3).optional(),
  spiritualGifts: z.array(z.string().max(50)).max(7).optional(),
});

export type WheelOfLifeScoresInput = z.infer<typeof wheelOfLifeScoresSchema>;
export type UpdateSpiritualProfileInput = z.infer<typeof updateSpiritualProfileSchema>;

// ============================================================================
// Event Schemas
// ============================================================================

const eventBaseSchema = z.object({
  title: shortTextSchema,
  description: optionalMediumTextSchema,
  startDate: dateSchema,
  endDate: dateSchema,
  location: optionalShortTextSchema,
  isOnline: z.boolean().default(false),
  meetingUrl: urlSchema,
  imageUrl: urlSchema,
  category: z.string().max(50),
  registrationRequired: z.boolean().default(false),
  maxAttendees: z.number().int().min(1).optional().nullable(),
});

export const createEventSchema = eventBaseSchema.refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const updateEventSchema = eventBaseSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

// ============================================================================
// Prayer Request Schemas
// ============================================================================

export const createPrayerRequestSchema = z.object({
  content: mediumTextSchema,
  isAnonymous: z.boolean().default(false),
  isPrivate: z.boolean().default(false),
});

export const updatePrayerRequestSchema = z.object({
  content: mediumTextSchema.optional(),
  status: z.enum(['active', 'answered', 'closed']).optional(),
});

export type CreatePrayerRequestInput = z.infer<typeof createPrayerRequestSchema>;
export type UpdatePrayerRequestInput = z.infer<typeof updatePrayerRequestSchema>;

// ============================================================================
// Mission Schemas
// ============================================================================

export const createMissionOpportunitySchema = z.object({
  title: shortTextSchema,
  description: longTextSchema,
  location: shortTextSchema,
  startDate: dateSchema,
  endDate: dateSchema,
  category: z.string().max(50),
  skillsNeeded: z.array(z.string().max(50)).max(10).default([]),
  spotsAvailable: z.number().int().min(1),
  imageUrl: urlSchema,
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const createMissionApplicationSchema = z.object({
  opportunityId: idSchema,
  applicationText: longTextSchema,
});

export type CreateMissionOpportunityInput = z.infer<typeof createMissionOpportunitySchema>;
export type CreateMissionApplicationInput = z.infer<typeof createMissionApplicationSchema>;

// ============================================================================
// Progress Tracking Schemas
// ============================================================================

export const startReadingPlanSchema = z.object({
  planId: idSchema,
});

export const completeReadingDaySchema = z.object({
  planId: idSchema,
  dayNumber: z.number().int().min(1),
  timeSpent: z.number().int().min(0).optional(),
});

export const startJourneySchema = z.object({
  journeyId: idSchema,
});

export const completeJourneyStepSchema = z.object({
  journeyId: idSchema,
  dayNumber: z.number().int().min(1),
  stepNumber: z.number().int().min(1),
});

export type StartReadingPlanInput = z.infer<typeof startReadingPlanSchema>;
export type CompleteReadingDayInput = z.infer<typeof completeReadingDaySchema>;
export type StartJourneyInput = z.infer<typeof startJourneySchema>;
export type CompleteJourneyStepInput = z.infer<typeof completeJourneyStepSchema>;

// ============================================================================
// Pagination and Filter Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const contentFilterSchema = z.object({
  category: contentCategorySchema.optional(),
  difficulty: difficultySchema.optional(),
  search: z.string().max(100).optional(),
  isFeatured: z.boolean().optional(),
  sortBy: z.enum(['createdAt', 'title', 'popularity']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const combinedFilterSchema = paginationSchema.merge(contentFilterSchema);

export type PaginationInput = z.infer<typeof paginationSchema>;
export type ContentFilterInput = z.infer<typeof contentFilterSchema>;
export type CombinedFilterInput = z.infer<typeof combinedFilterSchema>;

// ============================================================================
// Export All Schemas
// ============================================================================

export const schemas = {
  // User
  userProfile: userProfileSchema,
  updateUserProfile: updateUserProfileSchema,
  
  // Preferences
  notificationSettings: notificationSettingsSchema,
  displaySettings: displaySettingsSchema,
  privacySettings: privacySettingsSchema,
  userPreferences: userPreferencesSchema,
  
  // Reading Plans
  createReadingPlan: createReadingPlanSchema,
  updateReadingPlan: updateReadingPlanSchema,
  createReadingPlanDay: createReadingPlanDaySchema,
  updateReadingPlanDay: updateReadingPlanDaySchema,
  
  // Journeys
  createJourney: createJourneySchema,
  updateJourney: updateJourneySchema,
  createJourneyDay: createJourneyDaySchema,
  createJourneyStep: createJourneyStepSchema,
  
  // Goals
  createUserGoal: createUserGoalSchema,
  updateUserGoal: updateUserGoalSchema,
  createGoalMilestone: createGoalMilestoneSchema,
  createGoalHabit: createGoalHabitSchema,
  
  // Groups
  createGroup: createGroupSchema,
  updateGroup: updateGroupSchema,
  createGroupDiscussion: createGroupDiscussionSchema,
  createGroupLab: createGroupLabSchema,
  
  // Journal
  createJournalEntry: createJournalEntrySchema,
  updateJournalEntry: updateJournalEntrySchema,
  
  // Notifications
  createNotification: createNotificationSchema,
  scheduleNotification: scheduleNotificationSchema,
  pushSubscription: pushSubscriptionSchema,
  
  // Spiritual Profile
  wheelOfLifeScores: wheelOfLifeScoresSchema,
  updateSpiritualProfile: updateSpiritualProfileSchema,
  
  // Events
  createEvent: createEventSchema,
  updateEvent: updateEventSchema,
  
  // Prayer
  createPrayerRequest: createPrayerRequestSchema,
  updatePrayerRequest: updatePrayerRequestSchema,
  
  // Missions
  createMissionOpportunity: createMissionOpportunitySchema,
  createMissionApplication: createMissionApplicationSchema,
  
  // Progress
  startReadingPlan: startReadingPlanSchema,
  completeReadingDay: completeReadingDaySchema,
  startJourney: startJourneySchema,
  completeJourneyStep: completeJourneyStepSchema,
  
  // Pagination & Filters
  pagination: paginationSchema,
  contentFilter: contentFilterSchema,
  combinedFilter: combinedFilterSchema,
} as const;
