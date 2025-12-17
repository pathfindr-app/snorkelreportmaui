/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#e6f4f9',
          100: '#c0e4f0',
          200: '#8dcde5',
          300: '#4fb4d9',
          400: '#2196c4',
          500: '#0a7ea4',
          600: '#086589',
          700: '#064c6e',
          800: '#0a3854',   // Primary background
          900: '#0c2a40',   // Darker elements
          950: '#071a2b',   // Deepest dark
        },
        score: {
          red: '#ef4444',
          orange: '#f97316',
          yellow: '#eab308',
          green: '#22c55e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
