/**
 * Shared Type Definitions
 * 
 * Comprehensive TypeScript types used across client and server.
 * Provides type safety and consistency throughout the platform.
 */

// ============================================================================
// Content Categories
// ============================================================================

export const ContentCategories = [
  'faith',
  'prayer',
  'scripture',
  'discipleship',
  'relationships',
  'marriage',
  'parenting',
  'finances',
  'career',
  'health',
  'leadership',
  'evangelism',
  'community',
  'purpose',
  'mental_health',
] as const;

export type ContentCategory = typeof ContentCategories[number];

// ============================================================================
// Wheel of Life
// ============================================================================

export interface WheelOfLifeScores {
  faith: number;
  family: number;
  finances: number;
  fitness: number;
  friends: number;
  fun: number;
  career: number;
  contribution: number;
}

export type WheelOfLifeArea = keyof WheelOfLifeScores;

// ============================================================================
// Notification Types
// ============================================================================

export const NotificationTypes = [
  'streak_reminder',
  'streak_at_risk',
  'streak_milestone',
  'daily_reading',
  'journey_continue',
  'group_discussion',
  'group_lab_reminder',
  'prayer_request',
  'accountability_checkin',
  'goal_milestone',
  'system',
] as const;

export type NotificationType = typeof NotificationTypes[number];

// ============================================================================
// User Types
// ============================================================================

export interface UserProfile {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  contentMode: 'reflection' | 'faith';
  contentTone: 'seeker' | 'faith';
  audienceSegment: AudienceSegment | null;
  role: UserRole;
  region: string | null;
  community: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'member' | 'leader' | 'admin';

export type AudienceSegment = 
  | 'sixth_form'
  | 'university'
  | 'early_career'
  | 'builders'
  | 'couples';

// ============================================================================
// Notification Settings
// ============================================================================

export interface NotificationSettings {
  dailyReminders: boolean;
  dailyReminderTime: string;
  streakAlerts: boolean;
  groupNotifications: boolean;
  emailDigest: 'daily' | 'weekly' | 'never';
  pushEnabled: boolean;
}

export interface DisplaySettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'group' | 'private';
  showStreak: boolean;
  showProgress: boolean;
  allowAccountabilityRequests: boolean;
}

export interface UserPreferences {
  notificationSettings: NotificationSettings;
  displaySettings: DisplaySettings;
  privacySettings: PrivacySettings;
}

// ============================================================================
// Content Types
// ============================================================================

export type ContentDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ReadingPlan {
  id: number;
  title: string;
  description: string;
  category: ContentCategory;
  difficulty: ContentDifficulty;
  totalDays: number;
  imageUrl: string | null;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date;
}

export interface ReadingPlanDay {
  id: number;
  planId: number;
  dayNumber: number;
  title: string;
  scriptureRef: string;
  content: string;
  reflectionQuestions: string[];
  prayerPrompt: string | null;
}

export interface Journey {
  id: number;
  title: string;
  description: string;
  category: ContentCategory;
  difficulty: ContentDifficulty;
  totalDays: number;
  imageUrl: string | null;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date;
}

export interface JourneyDay {
  id: number;
  journeyId: number;
  dayNumber: number;
  title: string;
  overview: string;
}

export interface JourneyStep {
  id: number;
  dayId: number;
  stepNumber: number;
  type: 'video' | 'reading' | 'reflection' | 'action';
  title: string;
  content: string;
  mediaUrl: string | null;
  duration: number | null;
}

// ============================================================================
// Progress Types
// ============================================================================

export interface UserReadingProgress {
  id: number;
  userId: string;
  planId: number;
  currentDay: number;
  startedAt: Date;
  lastActivityAt: Date;
  completedAt: Date | null;
}

export interface UserJourneyProgress {
  id: number;
  userId: string;
  journeyId: number;
  currentDay: number;
  currentStep: number;
  startedAt: Date;
  lastActivityAt: Date;
  completedAt: Date | null;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  completedToday: boolean;
}

// ============================================================================
// Goal Types
// ============================================================================

export type GoalMode = 'classic' | 'self_concordant';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';
export type GoalTimeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface UserGoal {
  id: number;
  userId: string;
  title: string;
  description: string | null;
  category: ContentCategory;
  mode: GoalMode;
  status: GoalStatus;
  targetDate: Date | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface GoalMilestone {
  id: number;
  goalId: number;
  title: string;
  isCompleted: boolean;
  completedAt: Date | null;
  dueDate: Date | null;
}

export interface GoalHabit {
  id: number;
  goalId: number;
  title: string;
  frequency: GoalTimeframe;
  currentStreak: number;
  longestStreak: number;
}

// ============================================================================
// Group Types
// ============================================================================

export type GroupRole = 'member' | 'leader' | 'admin';
export type GroupVisibility = 'public' | 'private' | 'invite_only';

export interface Group {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  visibility: GroupVisibility;
  maxMembers: number;
  createdAt: Date;
}

export interface GroupMember {
  id: number;
  groupId: number;
  userId: string;
  role: GroupRole;
  joinedAt: Date;
}

export interface GroupDiscussion {
  id: number;
  groupId: number;
  userId: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: Date;
}

export interface GroupLab {
  id: number;
  groupId: number;
  title: string;
  description: string | null;
  scheduledAt: Date;
  duration: number;
  meetingUrl: string | null;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface ScheduledNotification {
  id: number;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed';
  sentAt: Date | null;
  error: string | null;
  createdAt: Date;
}

export interface PushSubscription {
  id: number;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
}

// ============================================================================
// Spiritual Profile Types
// ============================================================================

export interface SpiritualProfile {
  id: number;
  userId: string;
  wheelOfLifeScores: WheelOfLifeScores;
  primaryGrowthAreas: ContentCategory[];
  spiritualGifts: string[];
  assessmentCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Journal Types
// ============================================================================

export type JournalContextType = 
  | 'reading_plan'
  | 'journey'
  | 'spark'
  | 'goal'
  | 'personal';

export interface JournalEntry {
  id: number;
  userId: string;
  contextType: JournalContextType;
  contextId: number | null;
  content: string;
  isPrivate: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  userMessage: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

// ============================================================================
// Recommendation Types
// ============================================================================

export interface ScoredItem<T> {
  item: T;
  score: number;
  reasons: string[];
}

export interface RecommendationResult<T> {
  items: ScoredItem<T>[];
  strategy: string;
  generatedAt: Date;
}

export interface ContentItem {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  totalDays: number;
  tags: string[];
  isFeatured: boolean;
}

// ============================================================================
// Sync Types (for offline support)
// ============================================================================

export type SyncOperation = 'create' | 'update' | 'delete';
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  endpoint: string;
  method: string;
  body?: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface OfflineSyncStatus {
  isOnline: boolean;
  pendingOperations: number;
  lastSyncAt: Date | null;
  syncInProgress: boolean;
}

// ============================================================================
// Event Types
// ============================================================================

export interface CalendarEvent {
  id: number;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date;
  location: string | null;
  isOnline: boolean;
  meetingUrl: string | null;
  imageUrl: string | null;
  category: string;
  registrationRequired: boolean;
  maxAttendees: number | null;
}

export interface EventRegistration {
  id: number;
  eventId: number;
  userId: string;
  status: 'registered' | 'attended' | 'cancelled';
  registeredAt: Date;
}

// ============================================================================
// Prayer Types
// ============================================================================

export interface PrayerRequest {
  id: number;
  userId: string;
  content: string;
  isAnonymous: boolean;
  isPrivate: boolean;
  status: 'active' | 'answered' | 'closed';
  prayerCount: number;
  createdAt: Date;
}

export interface PrayerPartner {
  id: number;
  userId: string;
  partnerId: string;
  status: 'pending' | 'active' | 'inactive';
  createdAt: Date;
}

// ============================================================================
// Mission Types
// ============================================================================

export interface MissionOpportunity {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  category: string;
  skillsNeeded: string[];
  spotsAvailable: number;
  imageUrl: string | null;
}

export interface MissionApplication {
  id: number;
  opportunityId: number;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  applicationText: string;
  submittedAt: Date;
}
