/**
 * Spark Audio Hook
 * 
 * React hook for playing pre-generated spark devotional audio.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SparkAudioState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isReady: boolean;
  error: string | null;
  currentTime: number;
  duration: number;
  progress: number;
}

interface UseSparkAudioOptions {
  backgroundMusicUrl?: string;
  backgroundMusicVolume?: number;
  autoPlay?: boolean;
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

interface UseSparkAudioReturn extends SparkAudioState {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  restart: () => void;
}

const DEFAULT_BACKGROUND_MUSIC = '/audio/ambient-meditation.mp3';
const DEFAULT_BACKGROUND_VOLUME = 0.15;

async function fetchSparkAudioUrl(sparkId: number): Promise<string> {
  const response = await fetch(`/api/sparks/${sparkId}/audio`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Audio not available for this spark');
    }
    throw new Error('Failed to load audio');
  }
  
  const data = await response.json();
  return data.audioUrl;
}

export function useSparkAudio(
  sparkId: number,
  options: UseSparkAudioOptions = {}
): UseSparkAudioReturn {
  const {
    backgroundMusicUrl = DEFAULT_BACKGROUND_MUSIC,
    backgroundMusicVolume = DEFAULT_BACKGROUND_VOLUME,
    autoPlay = false,
    onEnded,
    onError,
  } = options;

  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const backgroundRef = useRef<HTMLAudioElement | null>(null);

  const [state, setState] = useState<SparkAudioState>({
    isLoading: true,
    isPlaying: false,
    isPaused: false,
    isReady: false,
    error: null,
    currentTime: 0,
    duration: 0,
    progress: 0,
  });

  const { data: audioUrl, error: fetchError, isLoading: isFetching } = useQuery({
    queryKey: ['sparkAudio', sparkId],
    queryFn: () => fetchSparkAudioUrl(sparkId),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const fadeOutBackground = useCallback(() => {
    const background = backgroundRef.current;
    if (!background) return;

    const fadeInterval = setInterval(() => {
      if (background.volume > 0.01) {
        background.volume = Math.max(0, background.volume - 0.02);
      } else {
        background.pause();
        background.volume = backgroundMusicVolume;
        clearInterval(fadeInterval);
      }
    }, 50);
  }, [backgroundMusicVolume]);

  const fadeInBackground = useCallback(() => {
    const background = backgroundRef.current;
    if (!background) return;

    background.volume = 0;
    background.play().catch(() => {});

    const fadeInterval = setInterval(() => {
      if (background.volume < backgroundMusicVolume) {
        background.volume = Math.min(backgroundMusicVolume, background.volume + 0.02);
      } else {
        clearInterval(fadeInterval);
      }
    }, 50);
  }, [backgroundMusicVolume]);

  const playAudio = useCallback(() => {
    const narration = narrationRef.current;
    if (!narration) return;

    narration.play()
      .then(() => {
        setState(prev => ({
          ...prev,
          isPlaying: true,
          isPaused: false,
        }));
        fadeInBackground();
      })
      .catch(error => {
        setState(prev => ({
          ...prev,
          error: 'Failed to play audio. Please try again.',
        }));
        onError?.(error);
      });
  }, [fadeInBackground, onError]);

  useEffect(() => {
    if (!audioUrl) return;

    const narration = new Audio(audioUrl);
    narration.preload = 'auto';
    narrationRef.current = narration;

    const background = new Audio(backgroundMusicUrl);
    background.preload = 'auto';
    background.loop = true;
    background.volume = backgroundMusicVolume;
    backgroundRef.current = background;

    const handleCanPlay = () => {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isReady: true,
        duration: narration.duration || 0,
      }));

      if (autoPlay) {
        playAudio();
      }
    };

    const handleTimeUpdate = () => {
      setState(prev => ({
        ...prev,
        currentTime: narration.currentTime,
        progress: narration.duration ? (narration.currentTime / narration.duration) * 100 : 0,
      }));
    };

    const handleEnded = () => {
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
      }));
      fadeOutBackground();
      onEnded?.();
    };

    const handleError = () => {
      const error = new Error('Failed to load audio');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      onError?.(error);
    };

    narration.addEventListener('canplay', handleCanPlay);
    narration.addEventListener('timeupdate', handleTimeUpdate);
    narration.addEventListener('ended', handleEnded);
    narration.addEventListener('error', handleError);

    return () => {
      narration.removeEventListener('canplay', handleCanPlay);
      narration.removeEventListener('timeupdate', handleTimeUpdate);
      narration.removeEventListener('ended', handleEnded);
      narration.removeEventListener('error', handleError);
      
      narration.pause();
      background.pause();
      
      narrationRef.current = null;
      backgroundRef.current = null;
    };
  }, [audioUrl, backgroundMusicUrl, backgroundMusicVolume, autoPlay, onEnded, onError, playAudio, fadeOutBackground]);

  useEffect(() => {
    if (fetchError) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: fetchError instanceof Error ? fetchError.message : 'Failed to load audio',
      }));
      onError?.(fetchError instanceof Error ? fetchError : new Error('Failed to load audio'));
    }
  }, [fetchError, onError]);

  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: isFetching,
    }));
  }, [isFetching]);

  const pauseAudio = useCallback(() => {
    const narration = narrationRef.current;
    const background = backgroundRef.current;

    if (narration) {
      narration.pause();
    }
    if (background) {
      background.pause();
    }

    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: true,
    }));
  }, []);

  const toggleAudio = useCallback(() => {
    if (state.isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  }, [state.isPlaying, playAudio, pauseAudio]);

  const seekTo = useCallback((time: number) => {
    const narration = narrationRef.current;
    if (!narration) return;

    narration.currentTime = Math.max(0, Math.min(time, narration.duration || 0));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const narration = narrationRef.current;
    if (narration) {
      narration.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const restart = useCallback(() => {
    const narration = narrationRef.current;
    if (narration) {
      narration.currentTime = 0;
      playAudio();
    }
  }, [playAudio]);

  return {
    ...state,
    play: playAudio,
    pause: pauseAudio,
    toggle: toggleAudio,
    seek: seekTo,
    setVolume,
    restart,
  };
}

export function formatAudioTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function useSparkAudioAvailability(sparkId: number): {
  isAvailable: boolean;
  isChecking: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ['sparkAudioAvailability', sparkId],
    queryFn: async () => {
      const response = await fetch(`/api/sparks/${sparkId}/audio`);
      return response.ok;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    isAvailable: data ?? false,
    isChecking: isLoading,
  };
}
