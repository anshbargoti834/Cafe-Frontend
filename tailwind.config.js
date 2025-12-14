/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cafe: {
          50:  "#FAF9F6",
          100: "#F5F1E8",
          200: "#E8E1D9",
          // ADDED YOUR NEW COLOR HERE AS 'base'
          base: "#AB886D", 
          300: "#D4C5B0",
          400: "#C8B282",
          500: "#A38058",
          600: "#8A6A4B",
          800: "#4A3B32",
          900: "#2C1A1D",
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Lato"', 'sans-serif'],
      },
      backgroundImage: {
        'grain': "url('https://www.transparenttextures.com/patterns/stardust.png')", 
      }
    },
  },
  plugins: [],
}