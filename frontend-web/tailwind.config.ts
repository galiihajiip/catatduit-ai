import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Use CSS variables for theme-aware colors
        background: {
          primary: 'var(--color-background-primary)',
          secondary: 'var(--color-background-secondary)',
          surface: 'var(--color-background-surface)',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: 'var(--color-secondary-light)',
          dark: 'var(--color-secondary-dark)',
        },
        accent: {
          orange: 'var(--color-accent-orange)',
          red: 'var(--color-accent-red)',
          purple: 'var(--color-accent-purple)',
          pink: 'var(--color-accent-pink)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        border: {
          light: 'var(--color-border-light)',
          medium: 'var(--color-border-medium)',
          dark: 'var(--color-border-dark)',
        },
        category: {
          food: '#E74C3C',
          transport: '#3498DB',
          bills: '#F39C12',
          household: '#9B59B6',
          shopping: '#1ABC9C',
          entertainment: '#E91E63',
          health: '#00BCD4',
          income: '#16A085',
        }
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-success': 'var(--gradient-success)',
        'gradient-warning': 'var(--gradient-warning)',
        'gradient-danger': 'var(--gradient-danger)',
        'gradient-purple': 'var(--gradient-purple)',
        'gradient-card': 'var(--gradient-card)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'modal': 'var(--shadow-modal)',
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
