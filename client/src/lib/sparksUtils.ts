import { parseAudienceSegment, isValidAudienceSegment, AUDIO_SETTINGS, TIMEZONE } from '@shared/constants';

export function buildAudienceParam(segment: string | null | undefined): string {
  const parsed = parseAudienceSegment(segment);
  if (!parsed) return '';
  return `?audience=${encodeURIComponent(parsed)}`;
}

export function getEffectiveAudience(
  userAudienceSegment: string | null | undefined,
  localStorageKey = 'user_audience_segment'
): string | null {
  if (userAudienceSegment && isValidAudienceSegment(userAudienceSegment)) {
    return userAudienceSegment;
  }
  
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(localStorageKey);
    if (stored && isValidAudienceSegment(stored)) {
      return stored;
    }
  }
  
  return null;
}

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

export function calculateWordCounts(text: string): number[] {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  return paragraphs.map(p => p.split(/\s+/).filter(w => w.length > 0).length);
}

export function estimateReadingDuration(
  wordCount: number,
  wordsPerSecond = AUDIO_SETTINGS.WORDS_PER_SECOND
): number {
  return (wordCount / wordsPerSecond) * 1000;
}

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

export function formatSparkDate(dateStr: string | null | undefined): string {
  if (!dateStr) {
    return new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      timeZone: TIMEZONE,
    });
  }
  
  return new Date(dateStr).toLocaleDateString('en-GB', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    timeZone: TIMEZONE,
  });
}

export function getTodayLondon(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

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
    if (err.name === 'AbortError') {
      return false;
    }
  }
  
  try {
    const textToCopy = data.url || data.text || '';
    await navigator.clipboard.writeText(textToCopy);
    onCopied?.();
    return true;
  } catch {
    return false;
  }
}

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
