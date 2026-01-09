/**
 * Audio Preloader Hook
 * 
 * Preloads today's spark audio in the background after page load,
 * so playback starts instantly when users tap the play button.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useDashboard } from './useDashboard';

interface PreloadedAudio {
  url: string;
  audio: HTMLAudioElement;
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

const audioCache = new Map<string, PreloadedAudio>();

function getCachedAudio(url: string): PreloadedAudio | null {
  return audioCache.get(url) || null;
}

function setCachedAudio(url: string, audio: PreloadedAudio): void {
  if (audioCache.size > 5) {
    const firstKey = audioCache.keys().next().value;
    if (firstKey) {
      const old = audioCache.get(firstKey);
      if (old) {
        old.audio.src = '';
      }
      audioCache.delete(firstKey);
    }
  }
  audioCache.set(url, audio);
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

    const cached = getCachedAudio(audioUrl);
    if (cached?.ready) {
      audioRef.current = cached.audio;
      setDuration(cached.duration);
      setStatus('ready');
      return;
    }

    setStatus('loading');
    setError(null);

    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = 'auto';
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleCanPlayThrough = () => {
      setStatus('ready');
      setCachedAudio(audioUrl, {
        url: audioUrl,
        audio,
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

    audio.src = audioUrl;
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
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

export function AudioPreloader(): null {
  useTodaySparkAudioPreloader();
  return null;
}
