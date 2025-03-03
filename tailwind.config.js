// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6B21A8',
        secondary: '#7C3AED',
        accent: '#8B5CF6',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        shimmer: 'shimmer 2s infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'border-dance': 'border-dance 4s ease infinite',
        'shine': 'shine 1.5s ease infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'orbit-reverse': 'orbit 15s linear infinite reverse',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'grid-scroll': 'gridScroll 20s linear infinite',
        'grid-scroll-horizontal': 'gridScroll 15s linear infinite',
        'particle': 'particle 4s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate3d(1, 1, 1, 0deg)' },
          '100%': { transform: 'rotate3d(1, 1, 1, 360deg)' },
        },
        gridScroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(10px)' },
        },
        particle: {
          '0%, 100%': { 
            transform: 'scale(1)',
            opacity: '0.3',
          },
          '50%': { 
            transform: 'scale(2)',
            opacity: '0.8',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'border-dance': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(1deg)' },
          '75%': { transform: 'rotate(-1deg)' },
        },
        'shine': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      fontFamily: {
        'game': ['Press Start 2P', 'cursive'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
};
