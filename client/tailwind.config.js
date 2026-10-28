/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#000000',
          secondary: '#0A0A0A',
          card: '#121212',
          elevated: '#1A1A1A',
        },
        creden: {
          cyan: '#00F0FF',
          violet: '#8B5CF6',
          white: '#FFFFFF',
          success: '#36D399',
          warning: '#FBBF24',
          critical: '#FB7185',
          text: '#F1F5F9',
          muted: '#A1A1AA',
          border: '#262626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 25px rgba(255, 255, 255, 0.7))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
