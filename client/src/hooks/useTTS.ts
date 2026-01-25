import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

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
