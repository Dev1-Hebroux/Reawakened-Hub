export const colors = {
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
  
  navy: '#1a2744',
  navyLight: '#243656',
  
  forest: '#2C3E2D',
  forestLight: '#3C4E3D',
  
  textPrimary: '#2C3E2D',
  textSecondary: '#6B7B6E',
  textMuted: '#8B9B8E',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.7)',
  
  success: '#5B8C5A',
  successLight: '#6B9C6A',
  warning: '#C17767',
  warningLight: '#D18777',
  error: '#DC2626',
  errorLight: '#EF4444',
  
  border: '#E8E4DE',
  borderLight: '#F0ECE6',
} as const;

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

export const gradients = {
  sage: `linear-gradient(135deg, ${colors.sage} 0%, ${colors.sageDark} 100%)`,
  teal: `linear-gradient(135deg, ${colors.teal} 0%, ${colors.tealDark} 100%)`,
  beige: `linear-gradient(135deg, ${colors.beige} 0%, ${colors.beigeDark} 100%)`,
  navy: `linear-gradient(135deg, ${colors.navy} 0%, ${colors.navyLight} 100%)`,
  
  darkHero: `linear-gradient(to bottom, #0a1628 0%, #0d1e36 100%)`,
  warmHero: `linear-gradient(135deg, ${colors.cream} 0%, #F5EFE7 100%)`,
  
  cardOverlay: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
} as const;

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  primary: `0 4px 14px 0 ${colors.sage}40`,
} as const;

export function getCategoryColorClasses(category: string): string {
  const c = categoryColors[category] || categoryColors.personal;
  return `bg-[${c.bg}] text-[${c.text}] border-[${c.border}]`;
}

export function getDifficultyColorClasses(difficulty: string): string {
  const c = difficultyColors[difficulty] || difficultyColors.beginner;
  return `bg-[${c.bg}] text-[${c.text}] border-[${c.border}]`;
}

export function getStatusColorClasses(status: string): string {
  const c = statusColors[status] || statusColors.draft;
  return `bg-[${c.bg}] text-[${c.text}] border-[${c.border}]`;
}
