import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from 'sonner';
import { VALIDATION } from '@shared/constants';

interface UseJournalingOptions {
  sparkId: number | null;
  reflectionId?: number | null;
  onSuccess?: () => void;
}

interface UseJournalingReturn {
  journalText: string;
  setJournalText: (text: string) => void;
  isRecording: boolean;
  showJournal: boolean;
  setShowJournal: (show: boolean) => void;
  isSaving: boolean;
  saveJournal: () => void;
  startVoiceRecording: () => void;
  stopVoiceRecording: () => void;
  characterCount: number;
  maxCharacters: number;
  isOverLimit: boolean;
  hasVoiceSupport: boolean;
}

// Helper for localStorage key
const getStorageKey = (id: number | null) => id ? `journal_draft_${id}` : null;

export function useJournaling(options: UseJournalingOptions): UseJournalingReturn {
  const { sparkId, reflectionId, onSuccess } = options;
  const queryClient = useQueryClient();
  const storageKey = getStorageKey(sparkId);

  // Initialize from localStorage
  const [journalText, setJournalTextState] = useState(() => {
    if (typeof window === 'undefined' || !storageKey) return '';
    try {
      return localStorage.getItem(storageKey) || '';
    } catch {
      return '';
    }
  });
  const [isRecording, setIsRecording] = useState(false);
  const [showJournal, setShowJournal] = useState(false);

  const recognitionRef = useRef<any>(null);

  const maxCharacters = VALIDATION.MAX_JOURNAL_LENGTH;
  const characterCount = journalText.length;
  const isOverLimit = characterCount > maxCharacters;

  const hasVoiceSupport = typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const journalMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!sparkId) throw new Error('No spark selected');

      if (content.length > maxCharacters) {
        throw new Error(`Reflection too long. Maximum ${maxCharacters.toLocaleString()} characters.`);
      }

      if (content.trim().length === 0) {
        throw new Error('Reflection cannot be empty');
      }

      await apiRequest("POST", `/api/sparks/${sparkId}/journal`, {
        textContent: content,
        reflectionId: reflectionId || undefined,
      });
    },
    onSuccess: () => {
      setShowJournal(false);
      setJournalTextState('');
      // Clear localStorage draft on successful save
      if (storageKey) {
        try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/sparks", sparkId, "journal"] });
      toast.success("Reflection saved");
      onSuccess?.();
    },
    onError: (error: Error) => {
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        toast.error("Please sign in to save reflections");
      } else {
        toast.error(error.message || "Failed to save reflection");
      }
    },
  });

  const setJournalText = useCallback((text: string) => {
    setJournalTextState(text);
    // Persist to localStorage on every change
    if (storageKey) {
      try { localStorage.setItem(storageKey, text); } catch { /* storage full or unavailable */ }
    }
  }, [storageKey]);

  const saveJournal = useCallback(() => {
    if (isOverLimit) {
      toast.error(`Please reduce your reflection to under ${maxCharacters.toLocaleString()} characters`);
      return;
    }
    journalMutation.mutate(journalText);
  }, [journalText, isOverLimit, maxCharacters, journalMutation]);

  const startVoiceRecording = useCallback(async () => {
    if (!hasVoiceSupport) {
      toast.error("Voice recording is not supported in this browser");
      return;
    }

    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (result.state === 'denied') {
          toast.error("Microphone access was denied. Please enable it in browser settings.");
          return;
        }
      } catch {
        // Permission API not fully supported, continue anyway
      }
    }

    setShowJournal(true);

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-GB';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setJournalTextState(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please allow microphone in your browser settings.");
        } else if (event.error === 'no-speech') {
          toast.info("No speech detected. Try speaking closer to the microphone.");
        } else {
          toast.error("Voice recording error. Please try again or type your reflection.");
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Could not start voice recording. Please type your reflection instead.");
      setIsRecording(false);
    }
  }, [hasVoiceSupport]);

  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (!showJournal && isRecording) {
      stopVoiceRecording();
    }
  }, [showJournal, isRecording, stopVoiceRecording]);

  return {
    journalText,
    setJournalText,
    isRecording,
    showJournal,
    setShowJournal,
    isSaving: journalMutation.isPending,
    saveJournal,
    startVoiceRecording,
    stopVoiceRecording,
    characterCount,
    maxCharacters,
    isOverLimit,
    hasVoiceSupport,
  };
}
