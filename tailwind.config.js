// Tailwind CSS configuration (D027). Moved out of the inline <script> in the old prototype.html (now index.html).
// Design system: Apple Human Interface Guidelines (.claude/skills/apple-hig-designer).
// Colours resolve to CSS variables in css/app.css, so every class follows light and dark mode.
// Build: `npm run build:css` writes css/tailwind.css from src/styles/tailwind.css.

const rgb = v => `rgb(var(${v}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Every file that contains class names. Class names must appear as whole strings
  // (never built like 'bg-' + colour), or the build can't see them.
  content: ['./index.html', './js/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"SF Pro Display"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"SF Mono"', 'SFMono-Regular', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        caption2: ['11px', '13px'],
        caption: ['12px', '16px'],
        footnote: ['13px', '18px'],
        subhead: ['15px', '20px'],
        callout: ['16px', '21px'],
        body: ['17px', '22px'],
        title3: ['20px', '25px'],
        title2: ['22px', '28px'],
        title1: ['28px', '34px'],
        largetitle: ['34px', '41px'],
      },
      colors: {
        canvas: 'var(--bg-grouped)',
        surface: 'var(--surface)',
        elevated: 'var(--surface-2)',
        fill: 'var(--fill)',
        fill2: 'var(--fill-2)',
        separator: 'var(--separator)',
        hairline: 'var(--hairline)',
        label: 'var(--label)',
        'label-2': 'var(--label-2)',
        'label-3': 'var(--label-3)',
        appleBlue: rgb('--blue'),
        applePurple: rgb('--purple'),
        appleGreen: rgb('--green'),
        appleOrange: rgb('--orange'),
        appleRed: rgb('--red'),
        blueText: rgb('--blue-text'),
        purpleText: rgb('--purple-text'),
        greenText: rgb('--green-text'),
        orangeText: rgb('--orange-text'),
        redText: rgb('--red-text'),
      },
      transitionTimingFunction: { apple: 'cubic-bezier(0.25, 0.1, 0.25, 1)' },
    },
  },
  plugins: [],
};
