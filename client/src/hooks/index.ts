/**
 * React Hooks
 * 
 * Comprehensive collection of custom React hooks for the platform.
 * Provides data fetching, mutations, offline support, and utilities.
 */

export * from './useCurrentUser';
export * from './useUserPreferences';
export * from './useNotifications';
export * from './useReadingPlans';
export * from './useRecommendations';
export * from './useStreakData';
export * from './useOfflineStatus';
export * from './useDebounce';
export * from './useLocalStorage';
export * from './useMediaQuery';
export * from './useKeyboardShortcut';
export * from './useIntersectionObserver';
export * from './useCountdown';
export * from './useFormValidation';
export * from './useAudioPlayer';
export * from './useTTS';
export * from './useProgressiveReveal';

export type { OfflineSyncStatus } from '../services/offlineService';
