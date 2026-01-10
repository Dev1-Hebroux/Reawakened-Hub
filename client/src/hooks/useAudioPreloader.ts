/**
 * Audio Preloader Hook
 * 
 * Preloads today's spark audio in the background after page load,
 * so playback starts instantly when users tap the play button.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDashboard } from './useDashboard';

interface CachedAudioData {
  url: string;
  duration: number;
  ready: boolean;
}

interface UseAudioPreloaderReturn {
  isReady: boolean;
  duration: number;
  play: () => Promise<void>;
  pause: () => void;
  currentTime: number;
  isPlaying: boolean;
  seekTo: (time: number) => void;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
}

const audioDataCache = new Map<string, CachedAudioData>();

function getCachedData(url: string): CachedAudioData | null {
  return audioDataCache.get(url) || null;
}

function setCachedData(url: string, data: CachedAudioData): void {
  if (audioDataCache.size > 10) {
    const firstKey = audioDataCache.keys().next().value;
    if (firstKey) {
      audioDataCache.delete(firstKey);
    }
  }
  audioDataCache.set(url, data);
}

export function useAudioPreloader(audioUrl: string | null | undefined): UseAudioPreloaderReturn {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioUrl) {
      setStatus('idle');
      return;
    }

    const cached = getCachedData(audioUrl);
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = 'auto';
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleCanPlayThrough = () => {
      setStatus('ready');
      setCachedData(audioUrl, {
        url: audioUrl,
        duration: audio.duration,
        ready: true,
      });
    };

    const handleError = () => {
      setStatus('error');
      setError('Failed to load audio');
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);

    if (cached?.ready) {
      setDuration(cached.duration);
      setStatus('ready');
    } else {
      setStatus('loading');
      setError(null);
    }

    audio.src = audioUrl;
    audio.load();

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.src = '';
    };
  }, [audioUrl]);

  const play = useCallback(async () => {
    if (!audioRef.current) return;
    
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setError('Tap to play audio');
    }
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(time, duration));
    setCurrentTime(audioRef.current.currentTime);
  }, [duration]);

  return {
    isReady: status === 'ready',
    duration,
    play,
    pause,
    currentTime,
    isPlaying,
    seekTo,
    status,
    error,
  };
}

export function useTodaySparkAudioPreloader() {
  const { todaySpark } = useDashboard();
  const audioUrl = todaySpark?.narrationAudioUrl || todaySpark?.audioUrl;
  return useAudioPreloader(audioUrl);
}

/**
 * Hook to track user interaction - returns true after first click/touch
 * Used to defer resource-heavy operations until user engages with the page
 */
function useHasInteracted(): boolean {
  const [hasInteracted, setHasInteracted] = useState(false);
  
  useEffect(() => {
    if (hasInteracted) return;
    
    const handleInteraction = () => {
      setHasInteracted(true);
    };
    
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [hasInteracted]);
  
  return hasInteracted;
}

/**
 * Deferred audio preloader - only loads audio after user interaction
 * Passes null URL until interaction, preventing early downloads on mobile
 */
function useDeferredTodaySparkAudioPreloader() {
  const { todaySpark } = useDashboard();
  const hasInteracted = useHasInteracted();
  
  // Only provide the URL after user interaction to defer loading
  const audioUrl = hasInteracted 
    ? (todaySpark?.narrationAudioUrl || todaySpark?.audioUrl)
    : null;
    
  return useAudioPreloader(audioUrl);
}

/**
 * AudioPreloader component - defers audio loading until user interaction
 * This prevents mobile bandwidth issues by not auto-downloading audio on page load
 */
export function AudioPreloader(): null {
  useDeferredTodaySparkAudioPreloader();
  return null;
}
