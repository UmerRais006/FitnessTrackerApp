/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./services/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#667eea',
          dark: '#764ba2',
        },
        accent: '#f093fb',
        dark: '#2d3436',
        'gray-text': '#636e72',
        'gray-light': '#f8f9fa',
        'gray-border': '#e9ecef',
        error: '#ff4757',
        success: '#00b894',
      },
    },
  },
  plugins: [],
}
