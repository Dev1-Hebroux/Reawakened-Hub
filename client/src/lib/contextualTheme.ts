/**
 * Contextual Theming System
 * Adapts UI atmosphere based on time of day and user state
 * Inspired by Apple's dynamic system appearance and Huawei's intelligent theming
 */

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type UserMood = "energizing" | "focused" | "reflective" | "restful" | "celebration";
export type ThemeMode = "auto" | "morning" | "afternoon" | "evening" | "night" | "celebration";

/**
 * Theme Configuration
 * Each time period has its own visual identity
 */
export interface ThemeConfig {
  /** Time period identifier */
  time: TimeOfDay;
  /** Emotional mood of the theme */
  mood: UserMood;
  /** Background gradient */
  background: string;
  /** Primary accent color */
  accent: string;
  /** Secondary accent color */
  accentSecondary: string;
  /** Text color primary */
  textPrimary: string;
  /** Text color secondary */
  textSecondary: string;
  /** Card background */
  cardBackground: string;
  /** Border color */
  borderColor: string;
  /** Shadow color */
  shadowColor: string;
  /** Glow/highlight color */
  glowColor: string;
}

/**
 * Contextual Themes
 * Time-based visual configurations
 */
export const contextualThemes: Record<TimeOfDay, ThemeConfig> = {
  morning: {
    time: "morning",
    mood: "energizing",
    background: "linear-gradient(135deg, #FFF5E6 0%, #FFE8CC 100%)",
    accent: "#D4A574",
    accentSecondary: "#7C9A8E",
    textPrimary: "#2C3E2D",
    textSecondary: "#6B7B6E",
    cardBackground: "rgba(255, 255, 255, 0.9)",
    borderColor: "rgba(212, 165, 116, 0.2)",
    shadowColor: "rgba(212, 165, 116, 0.15)",
    glowColor: "#D4A574",
  },
  afternoon: {
    time: "afternoon",
    mood: "focused",
    background: "linear-gradient(135deg, #FAF8F5 0%, #F5EFE7 100%)",
    accent: "#7C9A8E",
    accentSecondary: "#4A7C7C",
    textPrimary: "#2C3E2D",
    textSecondary: "#6B7B6E",
    cardBackground: "rgba(255, 255, 255, 0.95)",
    borderColor: "rgba(124, 154, 142, 0.2)",
    shadowColor: "rgba(124, 154, 142, 0.1)",
    glowColor: "#7C9A8E",
  },
  evening: {
    time: "evening",
    mood: "reflective",
    background: "linear-gradient(135deg, #2C2E3E 0%, #1A1C2E 100%)",
    accent: "#9B8AA6",
    accentSecondary: "#D4A574",
    textPrimary: "#F5EFE7",
    textSecondary: "rgba(245, 239, 231, 0.7)",
    cardBackground: "rgba(42, 46, 62, 0.8)",
    borderColor: "rgba(155, 138, 166, 0.3)",
    shadowColor: "rgba(155, 138, 166, 0.2)",
    glowColor: "#9B8AA6",
  },
  night: {
    time: "night",
    mood: "restful",
    background: "linear-gradient(135deg, #0a1628 0%, #0d1e36 100%)",
    accent: "#4A7C7C",
    accentSecondary: "#7C9A8E",
    textPrimary: "#E5E7EB",
    textSecondary: "rgba(229, 231, 235, 0.6)",
    cardBackground: "rgba(15, 30, 56, 0.85)",
    borderColor: "rgba(74, 124, 124, 0.25)",
    shadowColor: "rgba(74, 124, 124, 0.15)",
    glowColor: "#4A7C7C",
  },
};

/**
 * Special Celebration Theme
 * Vibrant, energetic theme for achievements
 */
export const celebrationTheme: ThemeConfig = {
  time: "afternoon",
  mood: "celebration",
  background: "linear-gradient(135deg, #FFE8CC 0%, #FFDAB9 50%, #FFB6C1 100%)",
  accent: "#FFD700",
  accentSecondary: "#7C9A8E",
  textPrimary: "#2C3E2D",
  textSecondary: "#6B7B6E",
  cardBackground: "rgba(255, 255, 255, 0.95)",
  borderColor: "rgba(255, 215, 0, 0.3)",
  shadowColor: "rgba(255, 215, 0, 0.2)",
  glowColor: "#FFD700",
};

/**
 * Get current time of day based on user's local time
 */
export const getCurrentTimeOfDay = (): TimeOfDay => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "morning"; // 5am - 12pm
  } else if (hour >= 12 && hour < 17) {
    return "afternoon"; // 12pm - 5pm
  } else if (hour >= 17 && hour < 21) {
    return "evening"; // 5pm - 9pm
  } else {
    return "night"; // 9pm - 5am
  }
};

/**
 * Get theme configuration based on mode
 */
export const getThemeConfig = (mode: ThemeMode = "auto"): ThemeConfig => {
  if (mode === "celebration") {
    return celebrationTheme;
  }

  if (mode === "auto") {
    const currentTime = getCurrentTimeOfDay();
    return contextualThemes[currentTime];
  }

  return contextualThemes[mode as TimeOfDay];
};

/**
 * Apply theme to document root
 * Updates CSS custom properties for global theme application
 */
export const applyThemeToDocument = (theme: ThemeConfig): void => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Set data attribute for CSS selectors
  root.setAttribute("data-time", theme.time);
  root.setAttribute("data-mood", theme.mood);

  // Set CSS custom properties
  root.style.setProperty("--theme-background", theme.background);
  root.style.setProperty("--theme-accent", theme.accent);
  root.style.setProperty("--theme-accent-secondary", theme.accentSecondary);
  root.style.setProperty("--theme-text-primary", theme.textPrimary);
  root.style.setProperty("--theme-text-secondary", theme.textSecondary);
  root.style.setProperty("--theme-card-background", theme.cardBackground);
  root.style.setProperty("--theme-border-color", theme.borderColor);
  root.style.setProperty("--theme-shadow-color", theme.shadowColor);
  root.style.setProperty("--theme-glow-color", theme.glowColor);
};

/**
 * Get greeting message based on time of day
 */
export const getGreeting = (): string => {
  const timeOfDay = getCurrentTimeOfDay();

  const greetings = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    night: "Good evening",
  };

  return greetings[timeOfDay];
};

/**
 * Get motivational message based on time and mood
 */
export const getMotivationalMessage = (mood?: UserMood): string => {
  const currentMood = mood || getThemeConfig("auto").mood;

  const messages: Record<UserMood, string[]> = {
    energizing: [
      "Let's make today count!",
      "Your daily spark awaits",
      "Start strong, finish stronger",
      "Today is full of potential",
    ],
    focused: [
      "Stay present, stay focused",
      "You're making progress",
      "Keep the momentum going",
      "One step at a time",
    ],
    reflective: [
      "Time to reflect and grow",
      "How did today shape you?",
      "Pause and appreciate",
      "What did you learn today?",
    ],
    restful: [
      "Rest well, you've earned it",
      "Tomorrow is a new beginning",
      "Reflect on today's victories",
      "Peace be with you tonight",
    ],
    celebration: [
      "Amazing work!",
      "You're on fire!",
      "Keep up the great work!",
      "Incredible progress!",
    ],
  };

  const messageList = messages[currentMood];
  return messageList[Math.floor(Math.random() * messageList.length)];
};

/**
 * Check if it's a good time for deep work
 * Based on circadian rhythms and productivity research
 */
export const isDeepWorkTime = (): boolean => {
  const hour = new Date().getHours();
  // Peak focus times: 9-11am and 3-5pm
  return (hour >= 9 && hour <= 11) || (hour >= 15 && hour <= 17);
};

/**
 * Check if it's a good time for reflection
 */
export const isReflectionTime = (): boolean => {
  const hour = new Date().getHours();
  // Evening reflection: 7-9pm
  return hour >= 19 && hour <= 21;
};

/**
 * Get recommended activity based on time
 */
export const getRecommendedActivity = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 8) {
    return "morning-prayer";
  } else if (hour >= 8 && hour < 12) {
    return "watch-spark";
  } else if (hour >= 12 && hour < 17) {
    return "take-action";
  } else if (hour >= 17 && hour < 21) {
    return "daily-reflection";
  } else {
    return "gratitude-journal";
  }
};

/**
 * Theme Transition Helper
 * Smooth transition between themes
 */
export const transitionTheme = (
  fromTheme: ThemeConfig,
  toTheme: ThemeConfig,
  duration: number = 300
): void => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  // Add transition class
  root.style.transition = `background ${duration}ms ease-in-out, color ${duration}ms ease-in-out`;

  // Apply new theme
  applyThemeToDocument(toTheme);

  // Remove transition after completion
  setTimeout(() => {
    root.style.transition = "";
  }, duration);
};

/**
 * Auto Theme Updater
 * Automatically updates theme based on time changes
 */
export class AutoThemeUpdater {
  private intervalId: number | null = null;
  private currentTheme: ThemeConfig | null = null;
  private mode: ThemeMode = "auto";
  private onThemeChange?: (theme: ThemeConfig) => void;

  constructor(onThemeChange?: (theme: ThemeConfig) => void) {
    this.onThemeChange = onThemeChange;
  }

  start(mode: ThemeMode = "auto"): void {
    this.mode = mode;
    this.updateTheme();

    // Check for theme changes every minute
    this.intervalId = window.setInterval(() => {
      this.updateTheme();
    }, 60000);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  setMode(mode: ThemeMode): void {
    this.mode = mode;
    this.updateTheme();
  }

  private updateTheme(): void {
    const newTheme = getThemeConfig(this.mode);

    // Only update if theme actually changed
    if (!this.currentTheme || this.currentTheme.time !== newTheme.time) {
      if (this.currentTheme) {
        transitionTheme(this.currentTheme, newTheme);
      } else {
        applyThemeToDocument(newTheme);
      }

      this.currentTheme = newTheme;

      if (this.onThemeChange) {
        this.onThemeChange(newTheme);
      }
    }
  }

  getCurrentTheme(): ThemeConfig | null {
    return this.currentTheme;
  }
}

/**
 * Storage helpers for user theme preferences
 */
const THEME_STORAGE_KEY = "reawakened-theme-mode";

export const saveThemePreference = (mode: ThemeMode): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (error) {
    console.error("Failed to save theme preference:", error);
  }
};

export const loadThemePreference = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved as ThemeMode) || "auto";
  } catch (error) {
    console.error("Failed to load theme preference:", error);
    return "auto";
  }
};

/**
 * Export everything
 */
export default {
  contextualThemes,
  celebrationTheme,
  getCurrentTimeOfDay,
  getThemeConfig,
  applyThemeToDocument,
  getGreeting,
  getMotivationalMessage,
  isDeepWorkTime,
  isReflectionTime,
  getRecommendedActivity,
  transitionTheme,
  AutoThemeUpdater,
  saveThemePreference,
  loadThemePreference,
};
