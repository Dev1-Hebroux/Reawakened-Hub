/**
 * Theme Constants
 * 
 * Centralized theme configuration for the Reawakened platform.
 * Eliminates hardcoded color values scattered across components.
 * 
 * FIX: Addresses duplicated color/theme constants issue.
 */

/**
 * Core brand colors.
 * Based on warm coaching palette per replit.md specification.
 */
export const colors = {
  // Primary palette
  sage: '#7C9A8E',
  sageDark: '#6B8B7E',
  sageLight: '#8BAA9E',
  
  teal: '#4A7C7C',
  tealDark: '#3A6C6C',
  tealLight: '#5A8C8C',
  
  beige: '#D4A574',
  beigeDark: '#C49464',
  beigeLight: '#E4B584',
  
  cream: '#FAF8F5',
  creamDark: '#F5F3F0',
  
  // Neutral palette
  navy: '#1a2744',
  navyLight: '#243656',
  
  forest: '#2C3E2D',
  forestLight: '#3C4E3D',
  
  // Text colors
  textPrimary: '#2C3E2D',
  textSecondary: '#6B7B6E',
  textMuted: '#8B9B8E',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.7)',
  
  // Semantic colors
  success: '#5B8C5A',
  successLight: '#6B9C6A',
  warning: '#C17767',
  warningLight: '#D18777',
  error: '#DC2626',
  errorLight: '#EF4444',
  
  // Border colors
  border: '#E8E4DE',
  borderLight: '#F0ECE6',
} as const;

/**
 * Category-specific colors for goals, journeys, etc.
 */
export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  faith: {
    bg: `${colors.sage}20`,
    text: colors.sage,
    border: `${colors.sage}30`,
  },
  career: {
    bg: '#5A7A8E20',
    text: '#5A7A8E',
    border: '#5A7A8E30',
  },
  health: {
    bg: `${colors.success}20`,
    text: colors.success,
    border: `${colors.success}30`,
  },
  relationships: {
    bg: `${colors.beige}20`,
    text: colors.beige,
    border: `${colors.beige}30`,
  },
  finance: {
    bg: '#8B735520',
    text: '#8B7355',
    border: '#8B735530',
  },
  personal: {
    bg: `${colors.teal}20`,
    text: colors.teal,
    border: `${colors.teal}30`,
  },
  purpose: {
    bg: '#5A7A8E20',
    text: '#5A7A8E',
    border: '#5A7A8E30',
  },
  anxiety: {
    bg: `${colors.sage}20`,
    text: colors.sage,
    border: `${colors.sage}30`,
  },
};

/**
 * Difficulty level colors.
 */
export const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  beginner: {
    bg: '#10B98120',
    text: '#10B981',
    border: '#10B98130',
  },
  intermediate: {
    bg: '#F59E0B20',
    text: '#F59E0B',
    border: '#F59E0B30',
  },
  advanced: {
    bg: '#EF444420',
    text: '#EF4444',
    border: '#EF444430',
  },
};

/**
 * Status colors for various states.
 */
export const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  active: {
    bg: '#10B98120',
    text: '#10B981',
    border: '#10B98130',
  },
  upcoming: {
    bg: '#3B82F620',
    text: '#3B82F6',
    border: '#3B82F630',
  },
  completed: {
    bg: '#6B728020',
    text: '#6B7280',
    border: '#6B728030',
  },
  draft: {
    bg: '#F59E0B20',
    text: '#F59E0B',
    border: '#F59E0B30',
  },
};

/**
 * Gradient configurations for cards and backgrounds.
 */
export const gradients = {
  // Primary gradients
  sage: `linear-gradient(135deg, ${colors.sage} 0%, ${colors.sageDark} 100%)`,
  teal: `linear-gradient(135deg, ${colors.teal} 0%, ${colors.tealDark} 100%)`,
  beige: `linear-gradient(135deg, ${colors.beige} 0%, ${colors.beigeDark} 100%)`,
  navy: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
  
  // Hero backgrounds
  darkHero: `linear-gradient(to bottom, #0a1628 0%, #0d1e36 100%)`,
  warmHero: `linear-gradient(135deg, ${colors.cream} 0%, #F5EFE7 100%)`,
  
  // Card overlays
  cardOverlay: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
} as const;

/**
 * Spacing scale following 4px base unit.
 */
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

/**
 * Border radius scale.
 */
export const borderRadius = {
  sm: '0.375rem',  // 6px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

/**
 * Shadow configurations.
 */
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  primary: `0 4px 14px 0 ${colors.sage}40`,
} as const;

/**
 * Typography configurations.
 */
export const typography = {
  fontFamily: {
    body: 'DM Sans, system-ui, sans-serif',
    display: 'Space Grotesk, system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
} as const;

/**
 * Helper function to get category color classes.
 */
export function getCategoryColorClasses(category: string): string {
  const colors = categoryColors[category] || categoryColors.personal;
  return `bg-[${colors.bg}] text-[${colors.text}] border-[${colors.border}]`;
}

/**
 * Helper function to get difficulty color classes.
 */
export function getDifficultyColorClasses(difficulty: string): string {
  const colors = difficultyColors[difficulty] || difficultyColors.beginner;
  return `bg-[${colors.bg}] text-[${colors.text}] border-[${colors.border}]`;
}

/**
 * Helper function to get status color classes.
 */
export function getStatusColorClasses(status: string): string {
  const colors = statusColors[status] || statusColors.draft;
  return `bg-[${colors.bg}] text-[${colors.text}] border-[${colors.border}]`;
}
