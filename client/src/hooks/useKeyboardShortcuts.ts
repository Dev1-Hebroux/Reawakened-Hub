/**
 * useKeyboardShortcuts Hook
 * Power-user keyboard navigation and shortcuts
 * Inspired by Gmail, Notion, and Linear shortcuts
 */

import { useEffect, useCallback, useRef, useState } from "react";

export interface ShortcutConfig {
  /** Keyboard key or combination */
  key: string;
  /** Callback when shortcut is triggered */
  action: () => void;
  /** Description for help menu */
  description?: string;
  /** Ctrl/Cmd required */
  ctrl?: boolean;
  /** Shift required */
  shift?: boolean;
  /** Alt required */
  alt?: boolean;
  /** Prevent default browser behavior */
  preventDefault?: boolean;
  /** Only trigger when not in input field */
  ignoreInputs?: boolean;
}

type ShortcutMap = Map<string, ShortcutConfig>;

const isInputElement = (element: HTMLElement): boolean => {
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    element.isContentEditable
  );
};

const getShortcutKey = (config: ShortcutConfig): string => {
  const parts = [];
  if (config.ctrl) parts.push("ctrl");
  if (config.shift) parts.push("shift");
  if (config.alt) parts.push("alt");
  parts.push(config.key.toLowerCase());
  return parts.join("+");
};

/**
 * Register keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const shortcutMap = useRef<ShortcutMap>(new Map());

  // Build shortcut map
  useEffect(() => {
    shortcutMap.current = new Map();
    shortcuts.forEach((config) => {
      const key = getShortcutKey(config);
      shortcutMap.current.set(key, config);
    });
  }, [shortcuts]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Build current key combination
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push("ctrl");
    if (e.shiftKey) parts.push("shift");
    if (e.altKey) parts.push("alt");
    parts.push(e.key.toLowerCase());
    const pressedKey = parts.join("+");

    const config = shortcutMap.current.get(pressedKey);
    if (!config) return;

    // Check if we should ignore due to input focus
    const target = e.target as HTMLElement;
    if (config.ignoreInputs && isInputElement(target)) {
      return;
    }

    // Prevent default if configured
    if (config.preventDefault) {
      e.preventDefault();
    }

    // Execute action
    config.action();
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts: Array.from(shortcutMap.current.values())
  };
}

/**
 * Common shortcut presets
 */
export const COMMON_SHORTCUTS = {
  // Navigation
  NEXT_ITEM: { key: "j", description: "Next item" },
  PREV_ITEM: { key: "k", description: "Previous item" },
  OPEN_ITEM: { key: "Enter", description: "Open selected item" },
  GO_BACK: { key: "Escape", description: "Go back / Close" },

  // Actions
  COMPLETE: { key: "c", description: "Complete task" },
  DELETE: { key: "d", description: "Delete" },
  EDIT: { key: "e", description: "Edit" },
  SAVE: { key: "s", ctrl: true, description: "Save" },
  UNDO: { key: "z", ctrl: true, description: "Undo" },
  REDO: { key: "z", ctrl: true, shift: true, description: "Redo" },

  // Search & Filter
  SEARCH: { key: "/", description: "Focus search" },
  FILTER: { key: "f", description: "Open filters" },

  // View
  TOGGLE_SIDEBAR: { key: "\\", description: "Toggle sidebar" },
  TOGGLE_THEME: { key: "t", description: "Toggle theme" },
  HELP: { key: "?", description: "Show keyboard shortcuts" },

  // Refresh
  REFRESH: { key: "r", description: "Refresh" }
} as const;

/**
 * Hook for navigation shortcuts (j/k style)
 */
export function useNavigationShortcuts(config: {
  onNext?: () => void;
  onPrev?: () => void;
  onOpen?: () => void;
  onBack?: () => void;
  enabled?: boolean;
}) {
  const { onNext, onPrev, onOpen, onBack, enabled = true } = config;

  const shortcuts: ShortcutConfig[] = [];

  if (onNext) {
    shortcuts.push({
      key: "j",
      action: onNext,
      description: "Next item",
      ignoreInputs: true
    });
    shortcuts.push({
      key: "ArrowDown",
      action: onNext,
      description: "Next item (arrow)",
      ignoreInputs: true
    });
  }

  if (onPrev) {
    shortcuts.push({
      key: "k",
      action: onPrev,
      description: "Previous item",
      ignoreInputs: true
    });
    shortcuts.push({
      key: "ArrowUp",
      action: onPrev,
      description: "Previous item (arrow)",
      ignoreInputs: true
    });
  }

  if (onOpen) {
    shortcuts.push({
      key: "Enter",
      action: onOpen,
      description: "Open selected item",
      ignoreInputs: true
    });
  }

  if (onBack) {
    shortcuts.push({
      key: "Escape",
      action: onBack,
      description: "Go back",
      ignoreInputs: false
    });
  }

  useKeyboardShortcuts(enabled ? shortcuts : []);
}

/**
 * Hook for search shortcut (/)
 */
export function useSearchShortcut(
  inputRef: React.RefObject<HTMLInputElement>,
  enabled: boolean = true
) {
  const handleFocus = useCallback(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  useKeyboardShortcuts(
    enabled
      ? [
        {
          key: "/",
          action: handleFocus,
          description: "Focus search",
          preventDefault: true,
          ignoreInputs: true
        }
      ]
      : []
  );
}

/**
 * Hook for toggle shortcut
 */
export function useToggleShortcut(
  key: string,
  onToggle: () => void,
  options: { description?: string; ctrl?: boolean; enabled?: boolean } = {}
) {
  const { description, ctrl = false, enabled = true } = options;

  useKeyboardShortcuts(
    enabled
      ? [
        {
          key,
          action: onToggle,
          description,
          ctrl,
          ignoreInputs: true
        }
      ]
      : []
  );
}

/**
 * Hook for showing keyboard shortcuts help
 */
export function useShortcutHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Register ? shortcut to open help
  useKeyboardShortcuts([
    {
      key: "?",
      action: toggle,
      description: "Show keyboard shortcuts",
      ignoreInputs: true
    }
  ]);

  return {
    isOpen,
    toggle,
    close: () => setIsOpen(false)
  };
}

// Fix missing import
// Removed duplicate import

/**
 * Hook for sequential shortcuts (Gmail-style)
 * Example: "g i" for "go to inbox"
 */
export function useSequentialShortcuts(
  sequences: { keys: string[]; action: () => void; description?: string }[],
  timeout: number = 1000
) {
  const currentSequence = useRef<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetSequence = useCallback(() => {
    currentSequence.current = [];
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if in input
      const target = e.target as HTMLElement;
      if (isInputElement(target)) return;

      // Add key to sequence
      currentSequence.current.push(e.key.toLowerCase());

      // Check if any sequence matches
      const matchingSequence = sequences.find((seq) => {
        if (seq.keys.length !== currentSequence.current.length) return false;
        return seq.keys.every(
          (key, i) => key.toLowerCase() === currentSequence.current[i]
        );
      });

      if (matchingSequence) {
        e.preventDefault();
        matchingSequence.action();
        resetSequence();
      } else {
        // Check if this could be the start of a sequence
        const possibleMatch = sequences.some((seq) =>
          seq.keys
            .slice(0, currentSequence.current.length)
            .every((key, i) => key.toLowerCase() === currentSequence.current[i])
        );

        if (!possibleMatch) {
          resetSequence();
        } else {
          // Reset timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(resetSequence, timeout);
        }
      }
    },
    [sequences, timeout, resetSequence]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleKeyDown]);
}
