import { useState, useEffect } from 'react';

export function useCountdown(targetDate: Date): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isComplete: boolean;
} {
    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
}

function calculateTimeLeft(targetDate: Date) {
    const difference = targetDate.getTime() - Date.now();

    if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
    }

    return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isComplete: false,
    };
}
