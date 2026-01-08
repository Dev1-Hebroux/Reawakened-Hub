/**
 * Design System Constants
 * 
 * Comprehensive design system for the Reawakened platform.
 * Centralizes all visual design tokens and provides utilities
 * for consistent styling across the application.
 */

// ============================================================================
// Color System
// ============================================================================

export const colors = {
  // Primary Brand Colors - Warm Coaching Palette
  primary: {
    sage: {
      50: '#F0F5F3',
      100: '#DCE8E3',
      200: '#B9D1C7',
      300: '#96BAAB',
      400: '#7C9A8E',
      500: '#6B8B7E',
      600: '#5A7A6E',
      700: '#4A695D',
      800: '#3A584D',
      900: '#2A473C',
    },
    teal: {
      50: '#F0F7F7',
      100: '#DCE8E8',
      200: '#B9D1D1',
      300: '#7AABAB',
      400: '#5A9494',
      500: '#4A7C7C',
      600: '#3A6C6C',
      700: '#2A5C5C',
      800: '#1A4C4C',
      900: '#0A3C3C',
    },
    beige: {
      50: '#FDF9F5',
      100: '#F9F0E7',
      200: '#F0DCC7',
      300: '#E7C8A7',
      400: '#D4A574',
      500: '#C49464',
      600: '#B48354',
      700: '#A47244',
      800: '#946134',
      900: '#845024',
    },
    cream: {
      50: '#FEFDFB',
      100: '#FAF8F5',
      200: '#F5F3F0',
      300: '#F0EDE7',
      400: '#E8E4DE',
      500: '#E0DCD6',
      600: '#D0CCC6',
      700: '#C0BCB6',
      800: '#B0ACA6',
      900: '#A09C96',
    },
  },
  
  // Neutral Colors
  neutral: {
    navy: {
      50: '#F0F2F5',
      100: '#D9DDE5',
      200: '#B3BBCB',
      300: '#8D99B1',
      400: '#677797',
      500: '#41557D',
      600: '#1A2744',
      700: '#152036',
      800: '#101828',
      900: '#0B101A',
    },
    forest: {
      50: '#F2F4F2',
      100: '#DCE0DC',
      200: '#B9C1B9',
      300: '#96A296',
      400: '#738373',
      500: '#506450',
      600: '#3C4E3D',
      700: '#2C3E2D',
      800: '#1C2E1D',
      900: '#0C1E0D',
    },
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  
  // Semantic Colors
  semantic: {
    success: {
      light: '#D1FAE5',
      main: '#10B981',
      dark: '#059669',
      contrast: '#FFFFFF',
    },
    warning: {
      light: '#FEF3C7',
      main: '#F59E0B',
      dark: '#D97706',
      contrast: '#000000',
    },
    error: {
      light: '#FEE2E2',
      main: '#EF4444',
      dark: '#DC2626',
      contrast: '#FFFFFF',
    },
    info: {
      light: '#DBEAFE',
      main: '#3B82F6',
      dark: '#2563EB',
      contrast: '#FFFFFF',
    },
  },
  
  // Text Colors
  text: {
    primary: '#2C3E2D',
    secondary: '#6B7B6E',
    muted: '#8B9B8E',
    disabled: '#B0B8B2',
    inverse: '#FFFFFF',
    inverseMuted: 'rgba(255, 255, 255, 0.7)',
  },
  
  // Background Colors
  background: {
    default: '#FFFFFF',
    paper: '#FAF8F5',
    subtle: '#F5F3F0',
    muted: '#E8E4DE',
    inverse: '#1A2744',
  },
  
  // Border Colors
  border: {
    light: '#F0ECE6',
    default: '#E8E4DE',
    dark: '#D0CCC6',
    focus: '#7C9A8E',
  },
} as const;

// ============================================================================
// Typography System
// ============================================================================

export const typography = {
  fontFamily: {
    display: '"Space Grotesk", system-ui, -apple-system, sans-serif',
    body: '"DM Sans", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// Predefined text styles
export const textStyles = {
  // Display headings (for hero sections)
  display1: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['6xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  display2: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
  },
  
  // Page headings
  h1: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  h2: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.tight,
  },
  h3: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
  },
  h4: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
  },
  h5: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
  },
  h6: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
  },
  
  // Body text
  bodyLarge: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
  },
  body: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  bodySmall: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  
  // UI text
  label: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
  },
  caption: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
  },
  overline: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase' as const,
  },
} as const;

// ============================================================================
// Spacing System
// ============================================================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const;

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  default: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ============================================================================
// Shadows
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  
  // Brand-colored shadows
  primary: `0 4px 14px 0 ${colors.primary.sage[400]}40`,
  success: `0 4px 14px 0 ${colors.semantic.success.main}40`,
  warning: `0 4px 14px 0 ${colors.semantic.warning.main}40`,
  error: `0 4px 14px 0 ${colors.semantic.error.main}40`,
} as const;

// ============================================================================
// Transitions
// ============================================================================

export const transitions = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Common transition presets
export const transitionPresets = {
  default: `all ${transitions.duration.normal} ${transitions.timing.default}`,
  fast: `all ${transitions.duration.fast} ${transitions.timing.default}`,
  slow: `all ${transitions.duration.slow} ${transitions.timing.default}`,
  colors: `background-color ${transitions.duration.fast} ${transitions.timing.default}, border-color ${transitions.duration.fast} ${transitions.timing.default}, color ${transitions.duration.fast} ${transitions.timing.default}`,
  transform: `transform ${transitions.duration.normal} ${transitions.timing.default}`,
  opacity: `opacity ${transitions.duration.normal} ${transitions.timing.default}`,
} as const;

// ============================================================================
// Z-Index Scale
// ============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ============================================================================
// Breakpoints
// ============================================================================

export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
} as const;

// ============================================================================
// Category Colors
// ============================================================================

import type { ContentCategory } from '../types';

const categoryColorMap: Record<ContentCategory, { bg: string; text: string; border: string }> = {
  faith: { bg: '#7C9A8E20', text: '#6B8B7E', border: '#7C9A8E30' },
  prayer: { bg: '#4A7C7C20', text: '#4A7C7C', border: '#4A7C7C30' },
  scripture: { bg: '#D4A57420', text: '#A47244', border: '#D4A57430' },
  discipleship: { bg: '#7C9A8E20', text: '#5A7A6E', border: '#7C9A8E30' },
  relationships: { bg: '#F59E0B20', text: '#D97706', border: '#F59E0B30' },
  marriage: { bg: '#EF444420', text: '#DC2626', border: '#EF444430' },
  parenting: { bg: '#F59E0B20', text: '#D97706', border: '#F59E0B30' },
  finances: { bg: '#10B98120', text: '#059669', border: '#10B98130' },
  career: { bg: '#3B82F620', text: '#2563EB', border: '#3B82F630' },
  health: { bg: '#10B98120', text: '#10B981', border: '#10B98130' },
  leadership: { bg: '#8B5CF620', text: '#7C3AED', border: '#8B5CF630' },
  evangelism: { bg: '#EF444420', text: '#EF4444', border: '#EF444430' },
  community: { bg: '#F59E0B20', text: '#F59E0B', border: '#F59E0B30' },
  purpose: { bg: '#6366F120', text: '#4F46E5', border: '#6366F130' },
  mental_health: { bg: '#EC489920', text: '#DB2777', border: '#EC489930' },
};

export function getCategoryColor(category: ContentCategory): { bg: string; text: string; border: string } {
  return categoryColorMap[category] || categoryColorMap.faith;
}

// ============================================================================
// Status Colors
// ============================================================================

type StatusType = 'active' | 'completed' | 'paused' | 'cancelled' | 'pending' | 'draft';

const statusColorMap: Record<StatusType, { bg: string; text: string; border: string }> = {
  active: { bg: '#10B98120', text: '#10B981', border: '#10B98130' },
  completed: { bg: '#3B82F620', text: '#3B82F6', border: '#3B82F630' },
  paused: { bg: '#F59E0B20', text: '#F59E0B', border: '#F59E0B30' },
  cancelled: { bg: '#6B728020', text: '#6B7280', border: '#6B728030' },
  pending: { bg: '#F59E0B20', text: '#D97706', border: '#F59E0B30' },
  draft: { bg: '#9CA3AF20', text: '#6B7280', border: '#9CA3AF30' },
};

export function getStatusColor(status: StatusType): { bg: string; text: string; border: string } {
  return statusColorMap[status] || statusColorMap.pending;
}

// ============================================================================
// Component Variants
// ============================================================================

export const buttonVariants = {
  primary: {
    bg: colors.primary.sage[500],
    text: colors.text.inverse,
    border: colors.primary.sage[500],
    hoverBg: colors.primary.sage[600],
    activeBg: colors.primary.sage[700],
  },
  secondary: {
    bg: 'transparent',
    text: colors.primary.sage[600],
    border: colors.primary.sage[300],
    hoverBg: colors.primary.sage[50],
    activeBg: colors.primary.sage[100],
  },
  ghost: {
    bg: 'transparent',
    text: colors.text.primary,
    border: 'transparent',
    hoverBg: colors.neutral.gray[100],
    activeBg: colors.neutral.gray[200],
  },
  danger: {
    bg: colors.semantic.error.main,
    text: colors.semantic.error.contrast,
    border: colors.semantic.error.main,
    hoverBg: colors.semantic.error.dark,
    activeBg: '#B91C1C',
  },
} as const;

export const inputVariants = {
  default: {
    bg: colors.background.default,
    text: colors.text.primary,
    border: colors.border.default,
    focusBorder: colors.primary.sage[500],
    placeholder: colors.text.muted,
  },
  filled: {
    bg: colors.background.subtle,
    text: colors.text.primary,
    border: 'transparent',
    focusBorder: colors.primary.sage[500],
    placeholder: colors.text.muted,
  },
  error: {
    bg: colors.semantic.error.light,
    text: colors.text.primary,
    border: colors.semantic.error.main,
    focusBorder: colors.semantic.error.dark,
    placeholder: colors.text.muted,
  },
} as const;

// ============================================================================
// Animation Keyframes (for CSS-in-JS)
// ============================================================================

export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideInUp: {
    from: { transform: 'translateY(10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInDown: {
    from: { transform: 'translateY(-10px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  pulse: {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 },
  },
  spin: {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
    '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
  },
} as const;
