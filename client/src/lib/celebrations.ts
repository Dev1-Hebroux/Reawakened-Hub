/**
 * Celebrations Library - Delightful User Feedback
 * Multi-stage confetti, success animations, and reward systems
 */

import confetti from "canvas-confetti";

/**
 * Brand Colors for Confetti
 */
const BRAND_COLORS = {
  sage: "#7C9A8E",
  teal: "#4A7C7C",
  beige: "#D4A574",
  cream: "#FAF8F5",
  lavender: "#9B8AA6",
  coral: "#C17767",
  gold: "#FFD700",
  white: "#FFFFFF",
} as const;

/**
 * Confetti Presets
 * Based on achievement importance and milestone significance
 */

/** Subtle confetti for small wins (e.g., single task completion) */
export const celebrateTask = () => {
  confetti({
    particleCount: 30,
    spread: 50,
    origin: { y: 0.6 },
    colors: [BRAND_COLORS.sage, BRAND_COLORS.beige],
    ticks: 150,
    gravity: 0.8,
    scalar: 0.8,
  });
};

/** Medium confetti for daily goal completion */
export const celebrateDailyGoal = () => {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.6 },
    colors: [BRAND_COLORS.sage, BRAND_COLORS.teal, BRAND_COLORS.beige],
    ticks: 200,
    gravity: 1,
    scalar: 1,
  });
};

/** Streak milestone celebrations - escalating based on days */
export const celebrateStreak = (days: number) => {
  if (days === 3) {
    // 3-day streak - First milestone
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: [BRAND_COLORS.sage, BRAND_COLORS.beige],
      ticks: 180,
    });
  } else if (days === 7) {
    // 7-day streak - Week Warrior
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: [BRAND_COLORS.sage, BRAND_COLORS.teal, BRAND_COLORS.beige, BRAND_COLORS.lavender],
      ticks: 250,
      gravity: 1.2,
    });
  } else if (days === 14) {
    // 14-day streak - Consistent
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [BRAND_COLORS.sage, BRAND_COLORS.gold],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [BRAND_COLORS.teal, BRAND_COLORS.gold],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  } else if (days >= 30) {
    // 30+ day streak - Champion level
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 300,
      zIndex: 0,
      colors: [
        BRAND_COLORS.sage,
        BRAND_COLORS.teal,
        BRAND_COLORS.beige,
        BRAND_COLORS.lavender,
        BRAND_COLORS.gold,
        BRAND_COLORS.white,
      ],
    };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 100 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }
};

/** Level up celebration - explosive and rewarding */
export const celebrateLevelUp = (newLevel: number) => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: [BRAND_COLORS.gold, BRAND_COLORS.sage, BRAND_COLORS.teal, BRAND_COLORS.white],
  };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  };

  // Fireworks-style burst
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
};

/** Badge unlock celebration */
export const celebrateBadgeUnlock = (badgeCode: string) => {
  const isFirstBadge = badgeCode === "FIRST_SPARK";

  if (isFirstBadge) {
    // Extra special for first badge
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: [BRAND_COLORS.gold, BRAND_COLORS.sage, BRAND_COLORS.white],
      ticks: 250,
      gravity: 1,
      scalar: 1.2,
      shapes: ["circle", "square"],
    });
  } else {
    // Standard badge celebration
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: [BRAND_COLORS.sage, BRAND_COLORS.beige, BRAND_COLORS.teal],
      ticks: 200,
    });
  }
};

/** Challenge completion celebration */
export const celebrateChallenge = () => {
  const duration = 2500;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    confetti({
      particleCount: 50,
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      origin: { x: Math.random(), y: Math.random() - 0.2 },
      colors: [BRAND_COLORS.sage, BRAND_COLORS.teal, BRAND_COLORS.beige, BRAND_COLORS.lavender],
    });
  }, 200);
};

/** First-time user celebration (onboarding completion) */
export const celebrateFirstTime = () => {
  const duration = 4000;
  const end = Date.now() + duration;

  const colors = [
    BRAND_COLORS.sage,
    BRAND_COLORS.teal,
    BRAND_COLORS.beige,
    BRAND_COLORS.lavender,
    BRAND_COLORS.gold,
  ];

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

/**
 * Success Feedback System
 * Visual feedback beyond confetti
 */

/** Toast notification with success animation */
export const showSuccessToast = (
  message: string,
  toastFunction: (message: string, options?: any) => void
) => {
  toastFunction(message, {
    duration: 3000,
    icon: "✓",
    style: {
      background: BRAND_COLORS.sage,
      color: BRAND_COLORS.white,
      border: `2px solid ${BRAND_COLORS.white}`,
      borderRadius: "12px",
      padding: "12px 16px",
      fontSize: "14px",
      fontWeight: 600,
    },
  });
};

/** Points gained animation helper */
export const animatePointsGain = (points: number, element: HTMLElement) => {
  const span = document.createElement("span");
  span.textContent = `+${points}`;
  span.style.position = "absolute";
  span.style.color = BRAND_COLORS.gold;
  span.style.fontWeight = "bold";
  span.style.fontSize = "20px";
  span.style.animation = "floatUp 1.5s ease-out forwards";
  span.style.pointerEvents = "none";
  span.style.zIndex = "1000";

  // Add CSS animation if not already present
  if (!document.getElementById("floatUpAnimation")) {
    const style = document.createElement("style");
    style.id = "floatUpAnimation";
    style.textContent = `
      @keyframes floatUp {
        0% {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateY(-50px) scale(1.3);
        }
      }
    `;
    document.head.appendChild(style);
  }

  element.appendChild(span);
  setTimeout(() => span.remove(), 1500);
};

/**
 * Sound Effects (optional)
 * Gentle, non-intrusive audio feedback
 */

/** Create a simple success beep */
export const playSuccessSound = () => {
  if (typeof window !== "undefined" && "AudioContext" in window) {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      // Silent fail - audio not critical
      console.debug("Audio not available:", error);
    }
  }
};

/** Create a level-up sound */
export const playLevelUpSound = () => {
  if (typeof window !== "undefined" && "AudioContext" in window) {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Ascending notes
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
      oscillator.type = "triangle";

      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.debug("Audio not available:", error);
    }
  }
};

/**
 * Celebration Manager
 * Intelligent celebration system that prevents over-celebration
 */
class CelebrationManager {
  private lastCelebration: number = 0;
  private cooldownMs: number = 2000; // Minimum time between celebrations

  canCelebrate(): boolean {
    const now = Date.now();
    if (now - this.lastCelebration > this.cooldownMs) {
      this.lastCelebration = now;
      return true;
    }
    return false;
  }

  setCooldown(ms: number) {
    this.cooldownMs = ms;
  }
}

export const celebrationManager = new CelebrationManager();

/**
 * Smart Celebration Trigger
 * Automatically chooses appropriate celebration based on achievement type
 */
export const celebrate = (
  type: "task" | "daily-goal" | "streak" | "level-up" | "badge" | "challenge" | "first-time",
  data?: { days?: number; level?: number; badgeCode?: string }
) => {
  if (!celebrationManager.canCelebrate() && type !== "level-up" && type !== "first-time") {
    return; // Skip if in cooldown (except for major milestones)
  }

  switch (type) {
    case "task":
      celebrateTask();
      break;
    case "daily-goal":
      celebrateDailyGoal();
      break;
    case "streak":
      if (data?.days) celebrateStreak(data.days);
      break;
    case "level-up":
      if (data?.level) celebrateLevelUp(data.level);
      playLevelUpSound();
      break;
    case "badge":
      if (data?.badgeCode) celebrateBadgeUnlock(data.badgeCode);
      playSuccessSound();
      break;
    case "challenge":
      celebrateChallenge();
      break;
    case "first-time":
      celebrateFirstTime();
      playLevelUpSound();
      break;
  }
};

/**
 * Export all celebration functions
 */
export default {
  celebrate,
  celebrateTask,
  celebrateDailyGoal,
  celebrateStreak,
  celebrateLevelUp,
  celebrateBadgeUnlock,
  celebrateChallenge,
  celebrateFirstTime,
  showSuccessToast,
  animatePointsGain,
  playSuccessSound,
  playLevelUpSound,
  celebrationManager,
  BRAND_COLORS,
};
