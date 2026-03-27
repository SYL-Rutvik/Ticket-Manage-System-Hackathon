/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        base:     '#0D1117',
        surface:  '#161B22',
        elevated: '#21262D',
        hover:    '#30363D',
        border:   '#30363D',
        primary: {
          DEFAULT: '#4F46E5',
          light:   '#6366F1',
          dark:    '#3730A3',
        },
      },
    },
  },
  plugins: [],
}
