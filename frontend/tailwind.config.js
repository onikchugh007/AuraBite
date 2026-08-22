/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b35',
        'primary-dark': '#e55a2b',
        secondary: '#1a1a2e',
        accent: '#16213e',
      },
    },
  },
  plugins: [],
}
