/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bollywood: {
          bg: '#080a1a',
          surface: '#10142e',
          card: '#161c3e',
          border: '#2a3468',
          gold: '#f59e0b',
          saffron: '#f97316',
          ruby: '#ef4444',
          magenta: '#d946ef',
          teal: '#14b8a6',
          neon: '#06b6d4',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        }
      }
    },
  },
  plugins: [],
}
