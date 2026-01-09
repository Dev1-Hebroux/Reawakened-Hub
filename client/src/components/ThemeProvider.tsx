import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  colors, 
  typography, 
  spacing, 
  borderRadius, 
  shadows, 
  transitions,
} from '@shared/constants/design-system';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
}

const darkModeColors = {
  text: {
    primary: '#F5F3F0',
    secondary: '#B0ACA6',
    muted: '#8B9B8E',
    disabled: '#6B7B6E',
    inverse: '#2C3E2D',
    inverseMuted: 'rgba(44, 62, 45, 0.7)',
  },
  background: {
    default: '#1A2744',
    paper: '#243352',
    subtle: '#2D3D5A',
    muted: '#374763',
    inverse: '#FAF8F5',
  },
  border: {
    light: '#374763',
    default: '#4A5A73',
    dark: '#5A6A83',
    focus: '#7C9A8E',
  },
};

function generateLightModeVariables(): string {
  return `
:root {
  --color-sage-50: ${colors.primary.sage[50]};
  --color-sage-100: ${colors.primary.sage[100]};
  --color-sage-200: ${colors.primary.sage[200]};
  --color-sage-300: ${colors.primary.sage[300]};
  --color-sage-400: ${colors.primary.sage[400]};
  --color-sage-500: ${colors.primary.sage[500]};
  --color-sage-600: ${colors.primary.sage[600]};
  --color-sage-700: ${colors.primary.sage[700]};
  --color-sage-800: ${colors.primary.sage[800]};
  --color-sage-900: ${colors.primary.sage[900]};
  
  --color-teal-50: ${colors.primary.teal[50]};
  --color-teal-100: ${colors.primary.teal[100]};
  --color-teal-200: ${colors.primary.teal[200]};
  --color-teal-300: ${colors.primary.teal[300]};
  --color-teal-400: ${colors.primary.teal[400]};
  --color-teal-500: ${colors.primary.teal[500]};
  --color-teal-600: ${colors.primary.teal[600]};
  --color-teal-700: ${colors.primary.teal[700]};
  
  --color-beige-50: ${colors.primary.beige[50]};
  --color-beige-100: ${colors.primary.beige[100]};
  --color-beige-200: ${colors.primary.beige[200]};
  --color-beige-300: ${colors.primary.beige[300]};
  --color-beige-400: ${colors.primary.beige[400]};
  --color-beige-500: ${colors.primary.beige[500]};
  
  --color-cream-50: ${colors.primary.cream[50]};
  --color-cream-100: ${colors.primary.cream[100]};
  --color-cream-200: ${colors.primary.cream[200]};
  --color-cream-300: ${colors.primary.cream[300]};
  --color-cream-400: ${colors.primary.cream[400]};
  
  --color-success-light: ${colors.semantic.success.light};
  --color-success-main: ${colors.semantic.success.main};
  --color-success-dark: ${colors.semantic.success.dark};
  --color-warning-light: ${colors.semantic.warning.light};
  --color-warning-main: ${colors.semantic.warning.main};
  --color-warning-dark: ${colors.semantic.warning.dark};
  --color-error-light: ${colors.semantic.error.light};
  --color-error-main: ${colors.semantic.error.main};
  --color-error-dark: ${colors.semantic.error.dark};
  --color-info-light: ${colors.semantic.info.light};
  --color-info-main: ${colors.semantic.info.main};
  --color-info-dark: ${colors.semantic.info.dark};
  
  --color-text-primary: ${colors.text.primary};
  --color-text-secondary: ${colors.text.secondary};
  --color-text-muted: ${colors.text.muted};
  --color-text-disabled: ${colors.text.disabled};
  --color-text-inverse: ${colors.text.inverse};
  
  --color-bg-default: ${colors.background.default};
  --color-bg-paper: ${colors.background.paper};
  --color-bg-subtle: ${colors.background.subtle};
  --color-bg-muted: ${colors.background.muted};
  --color-bg-inverse: ${colors.background.inverse};
  
  --color-border-light: ${colors.border.light};
  --color-border-default: ${colors.border.default};
  --color-border-dark: ${colors.border.dark};
  --color-border-focus: ${colors.border.focus};
  
  --font-family-display: ${typography.fontFamily.display};
  --font-family-body: ${typography.fontFamily.body};
  --font-family-mono: ${typography.fontFamily.mono};
  
  --font-size-xs: ${typography.fontSize.xs};
  --font-size-sm: ${typography.fontSize.sm};
  --font-size-base: ${typography.fontSize.base};
  --font-size-lg: ${typography.fontSize.lg};
  --font-size-xl: ${typography.fontSize.xl};
  --font-size-2xl: ${typography.fontSize['2xl']};
  --font-size-3xl: ${typography.fontSize['3xl']};
  --font-size-4xl: ${typography.fontSize['4xl']};
  
  --spacing-1: ${spacing[1]};
  --spacing-2: ${spacing[2]};
  --spacing-3: ${spacing[3]};
  --spacing-4: ${spacing[4]};
  --spacing-5: ${spacing[5]};
  --spacing-6: ${spacing[6]};
  --spacing-8: ${spacing[8]};
  --spacing-10: ${spacing[10]};
  --spacing-12: ${spacing[12]};
  --spacing-16: ${spacing[16]};
  
  --radius-sm: ${borderRadius.sm};
  --radius-md: ${borderRadius.md};
  --radius-lg: ${borderRadius.lg};
  --radius-xl: ${borderRadius.xl};
  --radius-2xl: ${borderRadius['2xl']};
  --radius-full: ${borderRadius.full};
  
  --shadow-sm: ${shadows.sm};
  --shadow-default: ${shadows.default};
  --shadow-md: ${shadows.md};
  --shadow-lg: ${shadows.lg};
  --shadow-xl: ${shadows.xl};
  
  --transition-fast: ${transitions.duration.fast};
  --transition-normal: ${transitions.duration.normal};
  --transition-slow: ${transitions.duration.slow};
}
  `.trim();
}

function generateDarkModeVariables(): string {
  return `
[data-theme="dark"] {
  --color-text-primary: ${darkModeColors.text.primary};
  --color-text-secondary: ${darkModeColors.text.secondary};
  --color-text-muted: ${darkModeColors.text.muted};
  --color-text-disabled: ${darkModeColors.text.disabled};
  --color-text-inverse: ${darkModeColors.text.inverse};
  
  --color-bg-default: ${darkModeColors.background.default};
  --color-bg-paper: ${darkModeColors.background.paper};
  --color-bg-subtle: ${darkModeColors.background.subtle};
  --color-bg-muted: ${darkModeColors.background.muted};
  --color-bg-inverse: ${darkModeColors.background.inverse};
  
  --color-border-light: ${darkModeColors.border.light};
  --color-border-default: ${darkModeColors.border.default};
  --color-border-dark: ${darkModeColors.border.dark};
}
  `.trim();
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({ 
  children, 
  defaultMode = 'system',
  storageKey = 'reawakened-theme',
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultMode;
    const stored = localStorage.getItem(storageKey);
    return (stored as ThemeMode) || defaultMode;
  });

  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedMode(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) => {
        setResolvedMode(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setResolvedMode(mode);
    }
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedMode);
  }, [resolvedMode]);

  useEffect(() => {
    const styleId = 'reawakened-theme-vars';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      ${generateLightModeVariables()}
      ${generateDarkModeVariables()}
    `;

    return () => {
      styleElement?.remove();
    };
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(storageKey, newMode);
  }, [storageKey]);

  const value: ThemeContextValue = {
    mode,
    resolvedMode,
    setMode,
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { mode, setMode } = useTheme();

  const options: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
  ];

  return (
    <select
      value={mode}
      onChange={(e) => setMode(e.target.value as ThemeMode)}
      className={className}
      aria-label="Select theme"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export { colors, typography, spacing, borderRadius, shadows, transitions };
