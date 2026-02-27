/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Overriding Slate with Warm Espresso / Parchment Theme
        slate: {
          50: '#e8e8e5', // Stone Gray
          100: '#dcdcd8', // Soft Pebble
          200: '#cfcfca', // Light Slate Gray
          300: '#d5bea1',
          400: '#b89972',
          500: '#9b764d', // warm bronze
          600: '#835e3b',
          700: '#69482d',
          800: '#54362d', // rich warm brown
          900: '#2b1b15', // deep espresso
          950: '#140c0a', // very dark background
        },
        // Overriding Stone with richer earthy colors
        stone: {
          50: '#faf7f3',
          100: '#f0e8df',
          200: '#e3d2bf',
          300: '#d1b89d',
          400: '#b89874',
          500: '#a37c54',
          600: '#8c6543',
          700: '#735034',
          800: '#593f2a',
          900: '#402d1d',
          950: '#1e140c',
        }
      }
    },
  },
  plugins: [],
}