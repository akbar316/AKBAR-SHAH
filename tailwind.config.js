/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        dice: {
          bg: '#0a0e17',
          accent: '#00b4d8',
          card: '#111625',
        }
      }
    },
  },
  plugins: [],
}