/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Ocean Base
        ocean: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f3045',   // Surface
          800: '#0a2235',   // Mid
          900: '#051520',   // Deep
          950: '#030b12',   // Abyss
        },
        // Bioluminescent accents
        glow: {
          cyan: '#00e5cc',
          teal: '#14b8a6',
          aqua: '#22d3ee',
        },
        // Warm coral accents
        coral: {
          warm: '#ff7e67',
          pink: '#fda4af',
        },
        // Reef accents
        reef: {
          gold: '#fcd34d',
          purple: '#a78bfa',
        },
        // Score colors with more vibrance
        score: {
          red: '#ef4444',
          orange: '#f97316',
          yellow: '#eab308',
          green: '#22c55e',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Dela Gothic One', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 229, 204, 0.2)',
        'glow-strong': '0 0 30px rgba(0, 229, 204, 0.4), 0 0 60px rgba(0, 229, 204, 0.2)',
        'glow-coral': '0 0 20px rgba(255, 126, 103, 0.3)',
      },
    },
  },
  plugins: [],
}
