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
        },
        zen: {
          paper: '#FAF9F5',
          surface: '#FFFFFF',
          darkBg: '#0F1117',
          darkSurface: '#171922',
          darkCard: '#1E202B',
          indigo: '#4F46E5',
          crimson: '#E11D48',
          matcha: '#10B981',
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        jp: ['Noto Sans JP', 'Hiragino Kaku Gothic Pro', 'Meiryo', 'sans-serif'],
        serif: ['Shippori Mincho', 'serif']
      }
    },
  },
  plugins: [],
}
