export default {
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translate(-50%, -20px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' }
        },
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        glow: {
          '0%, 100%': { filter: 'brightness(100%)' },
          '50%': { filter: 'brightness(150%)' }
        },
        'particle-float': {
          '0%': { transform: 'translateY(0)', opacity: 0 },
          '50%': { opacity: 0.8 },
          '100%': { transform: 'translateY(-100px)', opacity: 0 }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        shine: 'shine 2s linear infinite',
        glow: 'glow 2s ease-in-out infinite',
      }
    }
  }
} 