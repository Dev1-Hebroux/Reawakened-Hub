import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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
  };
}

interface UseTTSOptions {
  sparkId: number | null;
  textContent: string | null | undefined;
  onPlaybackStart?: () => void;
  onPlaybackEnd?: () => void;
  backgroundAudioRef?: React.RefObject<HTMLAudioElement | null>;
  backgroundVolume?: number;
}

interface UseTTSReturn {
  isSpeaking: boolean;
  isLoadingTTS: boolean;
  startTextToSpeech: () => Promise<void>;
  stopTextToSpeech: () => void;
  cleanup: () => void;
}

export function useTTS(options: UseTTSOptions): UseTTSReturn {
  const {
    sparkId,
    textContent,
    onPlaybackStart,
    onPlaybackEnd,
    backgroundAudioRef,
    backgroundVolume = 0.3,
  } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsUrlRef = useRef<string | null>(null);
  const ttsBlobUrlRef = useRef<boolean>(false);
  const ttsSparkIdRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const safePlay = useCallback(async (audio: HTMLAudioElement): Promise<boolean> => {
    try {
      await audio.play();
      return true;
    } catch (err) {
      const error = err as Error;
      if (error.name !== 'AbortError') {
        console.error("TTS play error:", error);
      }
      return false;
    }
  }, []);

  const cleanupTTS = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (ttsUrlRef.current && ttsBlobUrlRef.current) {
      URL.revokeObjectURL(ttsUrlRef.current);
    }
    
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current.src = '';
      ttsAudioRef.current = null;
    }
    
    ttsUrlRef.current = null;
    ttsBlobUrlRef.current = false;
    ttsSparkIdRef.current = null;
    setIsSpeaking(false);
    setIsLoadingTTS(false);
  }, []);

  const stopTextToSpeech = useCallback(() => {
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
    }
    if (backgroundAudioRef?.current) {
      backgroundAudioRef.current.pause();
    }
    setIsSpeaking(false);
  }, [backgroundAudioRef]);

  const resumeAll = useCallback(async () => {
    if (ttsAudioRef.current) {
      await safePlay(ttsAudioRef.current);
      setIsSpeaking(true);
    }
    if (backgroundAudioRef?.current) {
      backgroundAudioRef.current.volume = backgroundVolume;
      await safePlay(backgroundAudioRef.current);
    }
  }, [backgroundAudioRef, backgroundVolume, safePlay]);

  const startTextToSpeech = useCallback(async () => {
    if (!textContent || !sparkId) return;
    if (isLoadingTTS) return;
    
    if (isSpeaking) {
      stopTextToSpeech();
      return;
    }
    
    if (ttsSparkIdRef.current !== sparkId) {
      cleanupTTS();
      ttsSparkIdRef.current = sparkId;
    }
    
    if (ttsAudioRef.current && ttsUrlRef.current) {
      await resumeAll();
      onPlaybackStart?.();
      return;
    }

    setIsLoadingTTS(true);
    
    abortControllerRef.current = new AbortController();
    
    try {
      const audioResponse = await fetch(`/api/sparks/${sparkId}/audio`, {
        signal: abortControllerRef.current.signal,
      });
      
      if (!audioResponse.ok) {
        throw new Error('Failed to get audio');
      }
      
      const audioData = await audioResponse.json();
      const audioUrl = audioData.audioUrl;
      
      if (ttsUrlRef.current && ttsBlobUrlRef.current) {
        URL.revokeObjectURL(ttsUrlRef.current);
      }
      
      ttsUrlRef.current = audioUrl;
      ttsBlobUrlRef.current = false;
      
      const ttsAudio = new Audio(audioUrl);
      ttsAudioRef.current = ttsAudio;
      
      ttsAudio.onended = () => {
        setIsSpeaking(false);
        if (backgroundAudioRef?.current) {
          backgroundAudioRef.current.pause();
        }
        onPlaybackEnd?.();
      };
      
      ttsAudio.onerror = () => {
        setIsSpeaking(false);
        setIsLoadingTTS(false);
        toast.error("Audio playback failed");
      };
      
      await resumeAll();
      onPlaybackStart?.();
    } catch (error) {
      const err = error as Error;
      if (err.name !== 'AbortError') {
        console.error("TTS error:", error);
        toast.error("Could not generate audio");
      }
    } finally {
      setIsLoadingTTS(false);
    }
  }, [
    sparkId, 
    textContent, 
    isLoadingTTS, 
    isSpeaking, 
    stopTextToSpeech, 
    cleanupTTS, 
    resumeAll,
    onPlaybackStart,
    onPlaybackEnd,
    backgroundAudioRef,
  ]);

  useEffect(() => {
    return cleanupTTS;
  }, [cleanupTTS]);

  useEffect(() => {
    if (sparkId !== ttsSparkIdRef.current && ttsSparkIdRef.current !== null) {
      cleanupTTS();
    }
  }, [sparkId, cleanupTTS]);

  return {
    isSpeaking,
    isLoadingTTS,
    startTextToSpeech,
    stopTextToSpeech,
    cleanup: cleanupTTS,
  };
}

interface UseProgressiveRevealOptions {
  totalParagraphs: number;
  isSpeaking: boolean;
  wordCounts?: number[];
  wordsPerSecond?: number;
}

interface UseProgressiveRevealReturn {
  revealedParagraphs: number;
  allRevealed: boolean;
  revealNext: () => void;
  revealAll: () => void;
  reset: () => void;
}

export function useProgressiveReveal(options: UseProgressiveRevealOptions): UseProgressiveRevealReturn {
  const {
    totalParagraphs,
    isSpeaking,
    wordCounts = [],
    wordsPerSecond = 2.5,
  } = options;

  const [revealedParagraphs, setRevealedParagraphs] = useState(1);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const allRevealed = revealedParagraphs >= totalParagraphs;

  const revealNext = useCallback(() => {
    setRevealedParagraphs(prev => Math.min(prev + 1, totalParagraphs));
  }, [totalParagraphs]);

  const revealAll = useCallback(() => {
    setRevealedParagraphs(totalParagraphs);
  }, [totalParagraphs]);

  const reset = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setRevealedParagraphs(1);
  }, []);

  useEffect(() => {
    if (!isSpeaking || totalParagraphs === 0) {
      return;
    }

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (wordCounts.length === totalParagraphs) {
      let elapsed = 0;
      
      for (let i = revealedParagraphs; i < totalParagraphs; i++) {
        const paragraphDuration = (wordCounts[i - 1] / wordsPerSecond) * 1000;
        elapsed += paragraphDuration;
        
        const timer = setTimeout(() => {
          setRevealedParagraphs(prev => Math.max(prev, i + 1));
        }, elapsed);
        
        timersRef.current.push(timer);
      }
    } else {
      const interval = setInterval(() => {
        setRevealedParagraphs(prev => {
          if (prev >= totalParagraphs) {
            clearInterval(interval);
            return totalParagraphs;
          }
          return prev + 1;
        });
      }, 12000);
      
      timersRef.current.push(interval as unknown as NodeJS.Timeout);
    }

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [isSpeaking, totalParagraphs, wordCounts, wordsPerSecond, revealedParagraphs]);

  return {
    revealedParagraphs,
    allRevealed,
    revealNext,
    revealAll,
    reset,
  };
}
