/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        yellow: {
          400: '#0189EF',
          500: '#50abed',
          600: '#b45309',
        },
      },
    },
  },
  plugins: [],
};
