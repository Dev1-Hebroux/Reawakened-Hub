import { parseAudienceSegment, isValidAudienceSegment, AUDIO_SETTINGS } from '@shared/constants';

/**
 * Safely build audience segment query parameter.
 * Validates and encodes the segment to prevent injection and malformed URLs.
 */
export function buildAudienceParam(segment: string | null | undefined): string {
  const parsed = parseAudienceSegment(segment);
  if (!parsed) return '';
  return `?audience=${encodeURIComponent(parsed)}`;
}

/**
 * Get the effective audience segment from multiple sources.
 * Priority: user preference > localStorage > empty (global)
 */
export function getEffectiveAudience(
  userAudienceSegment: string | null | undefined,
  localStorageKey = 'user_audience_segment'
): string | null {
  // First check user preference
  if (userAudienceSegment && isValidAudienceSegment(userAudienceSegment)) {
    return userAudienceSegment;
  }
  
  // Then check localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(localStorageKey);
    if (stored && isValidAudienceSegment(stored)) {
      return stored;
    }
  }
  
  return null;
}

/**
 * Save audience segment to localStorage for persistence.
 */
export function saveAudienceToStorage(
  segment: string | null | undefined,
  localStorageKey = 'user_audience_segment'
): void {
  if (typeof window === 'undefined') return;
  
  const parsed = parseAudienceSegment(segment);
  if (parsed) {
    localStorage.setItem(localStorageKey, parsed);
  } else {
    localStorage.removeItem(localStorageKey);
  }
}

/**
 * Calculate word counts for paragraphs in a text.
 */
export function calculateWordCounts(text: string): number[] {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  return paragraphs.map(p => p.split(/\s+/).filter(w => w.length > 0).length);
}

/**
 * Estimate reading duration in milliseconds based on word count.
 */
export function estimateReadingDuration(
  wordCount: number,
  wordsPerSecond = AUDIO_SETTINGS.WORDS_PER_SECOND
): number {
  return (wordCount / wordsPerSecond) * 1000;
}

/**
 * Calculate progressive reveal timings for paragraphs.
 * Returns array of cumulative milliseconds for each paragraph reveal.
 */
export function calculateRevealTimings(
  text: string,
  wordsPerSecond = AUDIO_SETTINGS.WORDS_PER_SECOND
): number[] {
  const wordCounts = calculateWordCounts(text);
  const timings: number[] = [];
  let cumulative = 0;
  
  for (const count of wordCounts) {
    cumulative += estimateReadingDuration(count, wordsPerSecond);
    timings.push(cumulative);
  }
  
  return timings;
}

/**
 * Format duration in seconds to display format (M:SS or H:MM:SS).
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format a date string for display with London timezone awareness.
 */
export function formatSparkDate(dateStr: string | null | undefined): string {
  if (!dateStr) {
    return new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      timeZone: 'Europe/London',
    });
  }
  
  return new Date(dateStr).toLocaleDateString('en-GB', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    timeZone: 'Europe/London',
  });
}

/**
 * Get today's date in YYYY-MM-DD format for London timezone.
 */
export function getTodayLondon(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
}

/**
 * Safe share function that handles navigator.share with proper fallback.
 * Doesn't show clipboard toast if user cancelled the share dialog.
 */
export async function safeShare(
  data: ShareData,
  onCopied?: () => void
): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share(data);
      return true;
    }
  } catch (error) {
    const err = error as Error;
    // User cancelled - don't fall back to clipboard
    if (err.name === 'AbortError') {
      return false;
    }
  }
  
  // Fallback to clipboard
  try {
    const textToCopy = data.url || data.text || '';
    await navigator.clipboard.writeText(textToCopy);
    onCopied?.();
    return true;
  } catch {
    return false;
  }
}

/**
 * Debounce function for limiting rapid calls.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function for limiting call frequency.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
