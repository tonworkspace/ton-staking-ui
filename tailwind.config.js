module.exports = {
  theme: {
    extend: {
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translate(-50%, -20px)' },
          '100%': { opacity: '1', transform: 'translate(-50%, 0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out'
      }
    }
  }
} 