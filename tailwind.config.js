/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--accent)',
          50: '#e8faf1',
          100: '#c5f2db',
          200: '#9de9c2',
          300: '#6edfa6',
          400: '#3dd68a',
          500: 'var(--accent)',
          600: 'var(--accent-hover)',
          700: '#0b7a4c',
          800: '#085b39',
          900: '#043d26',
          dark: 'var(--accent-hover)',
          light: 'var(--accent)',
        },
        accent: 'var(--accent)',
        dark: {
          DEFAULT: 'var(--bg-page)',
          50: 'var(--bg-elevated)',
          100: 'var(--bg-elevated)',
          200: 'var(--bg-card)',
          300: 'var(--bg-elevated)',
          400: 'var(--bg-elevated)',
          500: 'var(--bg-elevated)',
          600: 'var(--bg-card)',
          700: 'var(--bg-card)',
          800: 'var(--bg-page)',
          900: 'var(--bg-page)',
          bg: 'var(--bg-page)',
          surface: 'var(--bg-card)',
          card: 'var(--bg-card)',
          border: 'var(--border)',
          text: 'var(--text-body)',
          muted: 'var(--text-muted)',
        },
        bg: {
          darkest: 'var(--bg-page)',
          dark: 'var(--bg-page)',
          card: 'var(--bg-card)',
          'card-hover': 'var(--bg-card-hover)',
          input: 'var(--bg-input)',
        },
        border: {
          DEFAULT: 'var(--border)',
          light: 'var(--border-hover)',
        },
        text: {
          primary: 'var(--text-heading)',
          secondary: 'var(--text-muted)',
          muted: 'var(--text-muted)',
        },
        status: {
          amber: 'var(--warning)',
          red: 'var(--danger)',
          blue: 'var(--info)',
          green: 'var(--success)',
        },
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        success: 'var(--success)',
        // Standard Tailwind gray overrides for theme awareness
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: 'var(--text-body)',
          400: 'var(--text-muted)',
          500: 'var(--text-muted)',
          600: 'var(--text-muted)',
          700: 'var(--border)',
          800: 'var(--border)',
          900: 'var(--bg-page)',
        },
        white: 'var(--text-heading)',
        green: {
          400: 'var(--success)',
          500: 'var(--success)',
        },
        red: {
          400: 'var(--danger)',
          500: 'var(--danger)',
          600: 'var(--danger)',
        },
        yellow: {
          400: 'var(--warning)',
          500: 'var(--warning)',
        },
        blue: {
          400: 'var(--info)',
          500: 'var(--info)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'counter': 'counter 1.5s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'score-fill': 'score-fill 2s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'slide-in': 'slide-in 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'gauge-fill': 'gaugeFill 1s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: 'var(--shadow-glow)' },
          '50%': { boxShadow: 'var(--accent-glow)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: 'var(--shadow-glow)' },
          '100%': { boxShadow: 'var(--accent-glow)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: 'var(--shadow-glow)' },
          '50%': { boxShadow: 'var(--accent-glow)' },
        },
        'score-fill': {
          '0%': { strokeDashoffset: '440' },
          '100%': { strokeDashoffset: 'var(--score-offset)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        gaugeFill: {
          '0%': { strokeDashoffset: '283' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
