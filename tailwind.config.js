/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        debit: {
          light: '#ecfdf5',
          DEFAULT: '#059669',
          dark: '#047857'
        },
        credit: {
          light: '#eff6ff',
          DEFAULT: '#2563eb',
          dark: '#1d4ed8'
        }
      }
    },
  },
  plugins: [],
}
