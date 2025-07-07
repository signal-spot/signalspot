/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        background: {
          primary: '#FFFFFF',
          secondary: '#F2F2F7',
        },
        text: {
          primary: '#000000',
          secondary: '#3C3C43',
        },
      },
    },
  },
  plugins: [],
};