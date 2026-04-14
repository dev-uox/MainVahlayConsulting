/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        batangas: ['Batangas', 'serif'],
      },
      animation: {
        slowspin: 'spin 20s linear infinite', // Defines a 20-second infinite rotation
        'marquee-vertical': 'marquee-vertical 20s linear infinite',
      },
      keyframes: {
        'marquee-vertical': {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
