import { useState, useRef, useEffect, useCallback } from 'react';

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
