import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './client/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
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
      },
      
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1.25' }],
        '6xl': ['3.75rem', { lineHeight: '1.2' }],
      },
      
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      
      borderRadius: {
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'primary': '0 4px 14px 0 rgba(124, 154, 142, 0.25)',
        'success': '0 4px 14px 0 rgba(16, 185, 129, 0.25)',
        'warning': '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
        'error': '0 4px 14px 0 rgba(239, 68, 68, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      
      transitionDuration: {
        '0': '0ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },
      
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      
      backgroundImage: {
        'gradient-sage': 'linear-gradient(135deg, #7C9A8E 0%, #5A7A6E 100%)',
        'gradient-teal': 'linear-gradient(135deg, #5A9494 0%, #3A6C6C 100%)',
        'gradient-beige': 'linear-gradient(135deg, #D4A574 0%, #B48354 100%)',
        'gradient-navy': 'linear-gradient(135deg, #41557D 0%, #152036 100%)',
        'gradient-hero-light': 'linear-gradient(180deg, #FAF8F5 0%, #F5F3F0 100%)',
        'gradient-hero-dark': 'linear-gradient(180deg, #101828 0%, #0B101A 100%)',
        'gradient-hero-warm': 'linear-gradient(135deg, #FAF8F5 0%, #F9F0E7 100%)',
        'gradient-card-overlay': 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)',
      },
      
      maxWidth: {
        'prose': '65ch',
        'content': '1280px',
        'narrow': '640px',
        'wide': '1536px',
      },
      
      zIndex: {
        'docked': '10',
        'dropdown': '1000',
        'sticky': '1100',
        'banner': '1200',
        'overlay': '1300',
        'modal': '1400',
        'popover': '1500',
        'toast': '1700',
        'tooltip': '1800',
      },
    },
  },
  plugins: [],
};

export default config;
