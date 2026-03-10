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
          DEFAULT: '#13b973',
          50: '#e8faf1',
          100: '#c5f2db',
          200: '#9de9c2',
          300: '#6edfa6',
          400: '#3dd68a',
          500: '#13b973',
          600: '#0f9a60',
          700: '#0b7a4c',
          800: '#085b39',
          900: '#043d26',
          dark: '#0f9a5f',
          light: '#16d484',
        },
        accent: '#0ed4e6',
        dark: {
          DEFAULT: '#0a0a0f',
          50: '#18181f',
          100: '#1a1a24',
          200: '#1e1e2a',
          300: '#252530',
          400: '#2a2a36',
          500: '#32323e',
          600: '#1a1a28',
          700: '#14141f',
          800: '#0f0f18',
          900: '#0a0a0f',
          bg: '#0a0a0f',
          surface: '#12121a',
          card: '#1a1a26',
          border: '#2a2a3a',
          text: '#e0e0e8',
          muted: '#8888a0',
        },
        // Project tracker custom colors
        bg: {
          darkest: '#0a0a0f',
          dark: '#0f0f18',
          card: '#141422',
          'card-hover': '#1a1a2e',
          input: '#1a1a2e',
        },
        border: {
          DEFAULT: '#2a2a3e',
          light: '#3a3a4e',
        },
        text: {
          primary: '#e8e8f0',
          secondary: '#9999aa',
          muted: '#666678',
        },
        status: {
          amber: '#f59e0b',
          red: '#ef4444',
          blue: '#3b82f6',
          green: '#13b973',
        },
        // Client-onboarding custom colors
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#13b973',
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(19, 185, 115, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(19, 185, 115, 0.6)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(19, 185, 115, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(19, 185, 115, 0.4)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(19, 185, 115, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(19, 185, 115, 0.6)' },
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
