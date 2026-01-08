/**
 * Shared constants for the DOMINION campaign and Sparks content system.
 * Centralizes magic strings to prevent inconsistencies across client and server.
 */

// Content Categories
export const CATEGORIES = {
  DAILY_DEVOTIONAL: 'daily-devotional',
  WORSHIP: 'worship',
  TESTIMONY: 'testimony',
  TEACHING: 'teaching',
  PRAYER: 'prayer',
  INSPIRATION: 'inspiration',
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  [CATEGORIES.DAILY_DEVOTIONAL]: 'Daily Devotional',
  [CATEGORIES.WORSHIP]: 'Worship',
  [CATEGORIES.TESTIMONY]: 'Testimony',
  [CATEGORIES.TEACHING]: 'Teaching',
  [CATEGORIES.PRAYER]: 'Prayer',
  [CATEGORIES.INSPIRATION]: 'Inspiration',
  'All': 'All',
};

// Media Types
export const MEDIA_TYPES = {
  VIDEO: 'video',
  AUDIO: 'audio',
  QUICK_READ: 'quick-read',
  DOWNLOAD: 'download',
} as const;

export const MEDIA_TYPE_LABELS: Record<string, string> = {
  [MEDIA_TYPES.VIDEO]: 'Watch',
  [MEDIA_TYPES.AUDIO]: 'Listen',
  [MEDIA_TYPES.QUICK_READ]: 'Read',
  [MEDIA_TYPES.DOWNLOAD]: 'Download',
};

// Content Status
export const STATUSES = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

// Audience Segments
export const AUDIENCE_SEGMENTS = {
  SCHOOLS: 'schools',
  UNIVERSITIES: 'universities',
  EARLY_CAREER: 'early-career',
  BUILDERS: 'builders',
  COUPLES: 'couples',
} as const;

export const AUDIENCE_LABELS: Record<string, string> = {
  [AUDIENCE_SEGMENTS.SCHOOLS]: 'Schools',
  [AUDIENCE_SEGMENTS.UNIVERSITIES]: 'Universities',
  [AUDIENCE_SEGMENTS.EARLY_CAREER]: 'Early Career (9-5 Reset)',
  [AUDIENCE_SEGMENTS.BUILDERS]: 'Builders',
  [AUDIENCE_SEGMENTS.COUPLES]: 'Couples',
};

// Week Themes for DOMINION campaign
export const WEEK_THEMES = {
  WEEK_1: 'Week 1: Identity & Belonging',
  WEEK_2: 'Week 2: Prayer & Presence',
  WEEK_3: 'Week 3: Peace & Anxiety',
  WEEK_4: 'Week 4: Bold Witness & Mission',
  FINAL: 'Days 29–30: Consecration & Commission',
} as const;

// User Roles (hierarchy: super_admin > admin > leader > member)
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  LEADER: 'leader',
  MEMBER: 'member',
} as const;

export const ELEVATED_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.LEADER,
] as const;

// Reaction Types
export const REACTION_TYPES = {
  FLAME: 'flame',
  AMEN: 'amen',
  PRAYING: 'praying',
} as const;

// Content View Modes
export const VIEW_MODES = {
  REFLECTION: 'reflection',
  FAITH: 'faith',
} as const;

// CTA Button Types
export const CTA_TYPES = {
  PRAY: 'Pray',
  GO: 'Go',
  GIVE: 'Give',
} as const;

// Validation Constants
export const VALIDATION = {
  MAX_JOURNAL_LENGTH: 10000,
  MAX_PRAYER_LENGTH: 2000,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 2000,
  MIN_AUDIO_DURATION: 10, // seconds
  MAX_AUDIO_DURATION: 1800, // 30 minutes
} as const;

// Audio Settings
export const AUDIO_SETTINGS = {
  WORDS_PER_MINUTE: 150,
  WORDS_PER_SECOND: 2.5,
  BACKGROUND_VOLUME: 0.3,
  DEFAULT_REVEAL_INTERVAL_MS: 12000,
} as const;

// Streak Settings
export const STREAK_SETTINGS = {
  MAX_STREAK_CHECK_DAYS: 30,
  STREAK_RESET_HOUR: 4, // 4 AM local time
} as const;

// Type exports for TypeScript usage
export type Category = typeof CATEGORIES[keyof typeof CATEGORIES];
export type MediaType = typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES];
export type Status = typeof STATUSES[keyof typeof STATUSES];
export type AudienceSegment = typeof AUDIENCE_SEGMENTS[keyof typeof AUDIENCE_SEGMENTS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type ReactionType = typeof REACTION_TYPES[keyof typeof REACTION_TYPES];
export type ViewMode = typeof VIEW_MODES[keyof typeof VIEW_MODES];
export type CtaType = typeof CTA_TYPES[keyof typeof CTA_TYPES];

/**
 * Type guard to check if a string is a valid audience segment
 */
export function isValidAudienceSegment(value: string | null | undefined): value is AudienceSegment {
  if (!value) return false;
  return Object.values(AUDIENCE_SEGMENTS).includes(value as AudienceSegment);
}

/**
 * Type guard to check if a string is a valid category
 */
export function isValidCategory(value: string | null | undefined): value is Category {
  if (!value) return false;
  return Object.values(CATEGORIES).includes(value as Category);
}

/**
 * Type guard to check if a string is a valid status
 */
export function isValidStatus(value: string | null | undefined): value is Status {
  if (!value) return false;
  return Object.values(STATUSES).includes(value as Status);
}

/**
 * Safely parse and validate an audience segment from user input
 */
export function parseAudienceSegment(value: string | null | undefined): AudienceSegment | null {
  if (!value || value === 'null' || value === 'undefined' || value === '') {
    return null;
  }
  return isValidAudienceSegment(value) ? value : null;
}
