/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
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
        cosmic: {
          950: '#060714',
          900: '#0b0d1e',
          850: '#11142e',
          800: '#181d3d',
          700: '#262d59',
        },
        status: {
          active: '#38bdf8',
          complete: '#10b981',
          waiting: '#f59e0b',
          overdue: '#f43f5e',
          focus: '#a855f7',
        }
      }
    },
  },
  plugins: [],
}
