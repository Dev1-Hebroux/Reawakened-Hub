/**
 * Theme Context
 * Manages contextual theming state across the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  ThemeMode,
  ThemeConfig,
  getThemeConfig,
  AutoThemeUpdater,
  saveThemePreference,
  loadThemePreference,
  getCurrentTimeOfDay,
  getGreeting,
  getMotivationalMessage,
} from "@/lib/contextualTheme";

interface ThemeContextType {
  /** Current theme configuration */
  theme: ThemeConfig;
  /** Current theme mode */
  mode: ThemeMode;
  /** Set theme mode (auto, morning, afternoon, evening, night, celebration) */
  setMode: (mode: ThemeMode) => void;
  /** Enable celebration theme temporarily */
  celebrationMode: () => void;
  /** Get contextual greeting */
  greeting: string;
  /** Get motivational message */
  motivationalMessage: string;
  /** Whether auto theme updates are enabled */
  isAutoMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  /** Initial theme mode (defaults to user preference or auto) */
  initialMode?: ThemeMode;
}

export function ThemeProvider({ children, initialMode }: ThemeProviderProps) {
  // Load saved preference or use initial mode
  const [mode, setModeState] = useState<ThemeMode>(() => {
    return initialMode || loadThemePreference();
  });

  const [theme, setTheme] = useState<ThemeConfig>(() => getThemeConfig(mode));
  const [greeting, setGreeting] = useState<string>(getGreeting());
  const [motivationalMessage, setMotivationalMessage] = useState<string>(getMotivationalMessage());
  const [autoUpdater] = useState(() => new AutoThemeUpdater(handleThemeChange));

  /**
   * Handle theme change from auto updater
   */
  function handleThemeChange(newTheme: ThemeConfig) {
    setTheme(newTheme);
    setGreeting(getGreeting());
    setMotivationalMessage(getMotivationalMessage(newTheme.mood));
  }

  /**
   * Set theme mode
   */
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    saveThemePreference(newMode);

    const newTheme = getThemeConfig(newMode);
    setTheme(newTheme);
    setGreeting(getGreeting());
    setMotivationalMessage(getMotivationalMessage(newTheme.mood));

    // Update auto updater mode
    if (newMode === "auto") {
      autoUpdater.start("auto");
    } else {
      autoUpdater.stop();
    }
  };

  /**
   * Enable celebration mode temporarily (5 seconds)
   */
  const celebrationMode = () => {
    const originalMode = mode;
    setMode("celebration");

    setTimeout(() => {
      setMode(originalMode);
    }, 5000);
  };

  /**
   * Initialize auto theme updater
   */
  useEffect(() => {
    if (mode === "auto") {
      autoUpdater.start("auto");
    }

    return () => {
      autoUpdater.stop();
    };
  }, [mode, autoUpdater]);

  /**
   * Update greeting and motivational message periodically
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
      setMotivationalMessage(getMotivationalMessage(theme.mood));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [theme.mood]);

  const value: ThemeContextType = {
    theme,
    mode,
    setMode,
    celebrationMode,
    greeting,
    motivationalMessage,
    isAutoMode: mode === "auto",
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

/**
 * Hook for theme-aware styling
 * Returns inline styles based on current theme
 */
export function useThemedStyles() {
  const { theme } = useTheme();

  return {
    background: {
      background: theme.background,
    },
    card: {
      background: theme.cardBackground,
      borderColor: theme.borderColor,
      boxShadow: `0 4px 12px ${theme.shadowColor}`,
    },
    text: {
      primary: {
        color: theme.textPrimary,
      },
      secondary: {
        color: theme.textSecondary,
      },
    },
    accent: {
      color: theme.accent,
    },
    accentBg: {
      backgroundColor: theme.accent,
      color: theme.time === "evening" || theme.time === "night" ? "#FFFFFF" : "#2C3E2D",
    },
    glow: {
      boxShadow: `0 0 20px ${theme.glowColor}40`,
    },
  };
}

/**
 * Hook to get time-based recommendations
 */
export function useTimeBasedRecommendations() {
  const [recommendations, setRecommendations] = useState<{
    isDeepWorkTime: boolean;
    isReflectionTime: boolean;
    currentTime: string;
  }>({
    isDeepWorkTime: false,
    isReflectionTime: false,
    currentTime: getCurrentTimeOfDay(),
  });

  useEffect(() => {
    const updateRecommendations = () => {
      const hour = new Date().getHours();
      setRecommendations({
        isDeepWorkTime: (hour >= 9 && hour <= 11) || (hour >= 15 && hour <= 17),
        isReflectionTime: hour >= 19 && hour <= 21,
        currentTime: getCurrentTimeOfDay(),
      });
    };

    updateRecommendations();
    const interval = setInterval(updateRecommendations, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return recommendations;
}

/**
 * Theme toggle component helper
 */
export function useThemeToggle() {
  const { mode, setMode } = useTheme();

  const toggleMode = () => {
    const modes: ThemeMode[] = ["auto", "morning", "afternoon", "evening", "night"];
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMode(modes[nextIndex]);
  };

  return { currentMode: mode, toggleMode };
}
