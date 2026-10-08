// Tailwind configuration for the archived v1 prototype (moved out of its inline <script>, D027).
// Rebuild with `npm run build:legacy-css` from the repository root.
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: { relative: true, files: ['./index.html', './js/**/*.js'] },
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'Inter', 'sans-serif'],
      },
      colors: {
        appleBlue: '#007AFF',
        applePurple: '#AF52DE',
        appleGreen: '#34C759',
        appleOrange: '#FF9500',
        appleGray: '#8E8E93',
        glassBg: 'rgba(255, 255, 255, 0.75)',
        glassBorder: 'rgba(255, 255, 255, 0.4)',
      },
    },
  },
};
