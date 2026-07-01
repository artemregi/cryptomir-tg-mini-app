/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#E4F3FB',
          card: '#FFFFFF',
          elevated: '#F2F9FE',
        },
        accent: {
          purple: '#4F8EC4',
          'purple-light': '#5FA0D4',
          'purple-dark': '#3A7AB0',
          cyan: '#4DB4EA',
          'cyan-dark': '#3AA0D6',
        },
        success: '#00B894',
        error: '#E17055',
        text: {
          primary: '#183650',
          secondary: '#6B8FAA',
          muted: '#90ABBD',
        },
        border: {
          DEFAULT: '#BDDCF2',
          light: '#D0E8F7',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #4F8EC4 0%, #5FA0D4 100%)',
        'gradient-cyan': 'linear-gradient(135deg, #4DB4EA 0%, #3AA0D6 100%)',
        'gradient-card': 'linear-gradient(145deg, #F2F9FE 0%, #FFFFFF 100%)',
        'gradient-balance': 'linear-gradient(135deg, #4F8EC4 0%, #4DB4EA 50%, #FFFFFF 100%)',
        'glow-purple': 'radial-gradient(ellipse at center, rgba(79,142,196,0.15) 0%, transparent 70%)',
        'glow-cyan': 'radial-gradient(ellipse at center, rgba(77,180,234,0.1) 0%, transparent 70%)',
      },
      boxShadow: {
        'glow-purple': '0 0 30px rgba(79, 142, 196, 0.2)',
        'glow-cyan': '0 0 30px rgba(77, 180, 234, 0.15)',
        'card': '0 4px 24px rgba(24, 54, 80, 0.08)',
        'button': '0 4px 15px rgba(79, 142, 196, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
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
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
