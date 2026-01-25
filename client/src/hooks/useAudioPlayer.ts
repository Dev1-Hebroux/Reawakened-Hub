import { useState, useRef, useEffect, useCallback } from 'react';

export interface BackgroundTrack {
  id: string;
  name: string;
  url: string;
}

export const DEFAULT_BACKGROUND_TRACKS: BackgroundTrack[] = [
  { id: "track1", name: "Peaceful Dawn", url: "/attached_assets/DappyTKeys_-_Background_Music_-_01_Background_Music_-_1_1767469486425.mp3" },
  { id: "track2", name: "Gentle Waters", url: "/attached_assets/DappyTKeys_-_Background_Music_-_02_Background_Music_-_2_1767469511632.mp3" },
  { id: "track3", name: "Morning Light", url: "/attached_assets/DappyTKeys_-_Background_Music_-_03_Background_Music_-_3_1767469511633.mp3" },
  { id: "track4", name: "Still Moments", url: "/attached_assets/DappyTKeys_-_Background_Music_-_04_Background_Music_-_4_1767469511634.mp3" },
  { id: "track5", name: "Grace Notes", url: "/attached_assets/DappyTKeys_-_Background_Music_-_05_Background_Music_-_5_1767469511635.mp3" },
];

interface UseAudioPlayerOptions {
  initialTrack?: BackgroundTrack;
  backgroundVolume?: number;
}

interface UseAudioPlayerReturn {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  selectedTrack: BackgroundTrack;
  setSelectedTrack: (track: BackgroundTrack) => void;
  isBackgroundPlaying: boolean;
  toggleBackgroundPlayback: () => Promise<void>;
  cleanup: () => void;
  /** Prefetch audio for a track to enable instant playback on user action (e.g., on hover). */
  prefetchAudio: (url: string) => void;
}

export function useAudioPlayer(options: UseAudioPlayerOptions = {}): UseAudioPlayerReturn {
  const {
    initialTrack = DEFAULT_BACKGROUND_TRACKS[0],
    backgroundVolume = 0.3,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedTrack, setSelectedTrackState] = useState<BackgroundTrack>(initialTrack);
  const [isBackgroundPlaying, setIsBackgroundPlaying] = useState(false);

  const safePlay = useCallback(async (audio: HTMLAudioElement): Promise<boolean> => {
    try {
      audio.volume = backgroundVolume;
      await audio.play();
      return true;
    } catch (err) {
      const error = err as Error;
      if (error.name !== 'AbortError') {
        console.error("Audio play error:", error);
      }
      return false;
    }
  }, [backgroundVolume]);

  const toggleBackgroundPlayback = useCallback(async () => {
    if (!audioRef.current) return;

    if (isBackgroundPlaying) {
      audioRef.current.pause();
      setIsBackgroundPlaying(false);
    } else {
      const success = await safePlay(audioRef.current);
      setIsBackgroundPlaying(success);
    }
  }, [isBackgroundPlaying, safePlay]);

  const setSelectedTrack = useCallback((track: BackgroundTrack) => {
    setSelectedTrackState(track);

    if (audioRef.current) {
      const wasPlaying = isBackgroundPlaying;
      audioRef.current.pause();
      audioRef.current.src = track.url;

      if (wasPlaying) {
        audioRef.current.load();
        safePlay(audioRef.current);
      }
    }
  }, [isBackgroundPlaying, safePlay]);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    setIsBackgroundPlaying(false);
  }, []);

  /**
   * Prefetch audio for instant playback.
   * Creates a hidden Audio element that preloads the content.
   * Call this on hover or anticipation of user action.
   */
  const prefetchAudio = useCallback((url: string) => {
    if (typeof window === 'undefined') return;
    // Create a temporary audio element to preload
    const audio = new Audio();
    audio.preload = 'auto';
    audio.src = url;
    // The browser will start downloading the audio in the background
    // We don't need to keep a reference; the browser's internal cache handles it.
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    audioRef,
    selectedTrack,
    setSelectedTrack,
    isBackgroundPlaying,
    toggleBackgroundPlayback,
    cleanup,
    prefetchAudio,
  };
}
