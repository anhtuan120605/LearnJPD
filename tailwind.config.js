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
        japan: {
          crimson: '#E83929',
          sakura: '#FEDFE1',
          matcha: '#647D50',
          indigo: '#1C3144',
          slate: '#2B3A42',
          paper: '#FDFBF7'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        jp: ['Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Meiryo', 'sans-serif'],
        serif: ['Shippori Mincho', 'serif']
      }
    },
  },
  plugins: [],
}
