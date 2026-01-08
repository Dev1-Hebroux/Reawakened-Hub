export const AUDIENCE_SEGMENTS = ['schools', 'universities', 'early-career', 'builders', 'couples'] as const;
export type AudienceSegment = typeof AUDIENCE_SEGMENTS[number];

export const SPARK_CATEGORIES = [
  'daily-devotional',
  'worship', 
  'testimony',
  'teaching',
  'prayer',
  'mission',
] as const;
export type SparkCategory = typeof SPARK_CATEGORIES[number];

export const SPARK_STATUSES = ['draft', 'scheduled', 'published', 'archived'] as const;
export type SparkStatus = typeof SPARK_STATUSES[number];

export const USER_ROLES = ['member', 'leader', 'admin', 'super_admin'] as const;
export type UserRole = typeof USER_ROLES[number];

export const CONTENT_MODES = ['reflection', 'faith'] as const;
export type ContentMode = typeof CONTENT_MODES[number];

export const CONTENT_TONES = ['seeker', 'faith'] as const;
export type ContentTone = typeof CONTENT_TONES[number];

export function isValidAudienceSegment(value: unknown): value is AudienceSegment {
  return typeof value === 'string' && AUDIENCE_SEGMENTS.includes(value as AudienceSegment);
}

export function parseAudienceSegment(value: string | null | undefined): AudienceSegment | null {
  if (!value || value === 'null' || value === 'undefined') {
    return null;
  }
  return isValidAudienceSegment(value) ? value : null;
}

export function isValidSparkCategory(value: unknown): value is SparkCategory {
  return typeof value === 'string' && SPARK_CATEGORIES.includes(value as SparkCategory);
}

export function isValidSparkStatus(value: unknown): value is SparkStatus {
  return typeof value === 'string' && SPARK_STATUSES.includes(value as SparkStatus);
}

export function isValidUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && USER_ROLES.includes(value as UserRole);
}

export const AUDIO_SETTINGS = {
  WORDS_PER_SECOND: 2.5,
  DEFAULT_BACKGROUND_VOLUME: 0.3,
  TTS_VOLUME: 1.0,
} as const;

export const VALIDATION = {
  MAX_JOURNAL_LENGTH: 10000,
  MAX_POST_LENGTH: 5000,
  MAX_PRAYER_REQUEST_LENGTH: 2000,
  MIN_PASSWORD_LENGTH: 8,
} as const;

export const API_CACHE = {
  DASHBOARD_STALE_TIME: 2 * 60 * 1000, // 2 minutes
  SPARK_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  USER_STALE_TIME: 10 * 60 * 1000, // 10 minutes
} as const;

export const TIMEZONE = 'Europe/London' as const;

export function getTodayLondon(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}
