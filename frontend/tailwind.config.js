/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef7ff',
          100: '#d9edff',
          200: '#bce0ff',
          300: '#8eccff',
          400: '#59afff',
          500: '#338bff',
          600: '#1b6af5',
          700: '#1454e1',
          800: '#1744b6',
          900: '#193d8f',
          950: '#142757',
        },
        medical: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6de',
          300: '#5eeace',
          400: '#2dd4ba',
          500: '#14b8a0',
          600: '#0d9484',
          700: '#0f766c',
          800: '#115e57',
          900: '#134e48',
          950: '#042f2e',
        },
      },
    },
  },
  plugins: [],
}
