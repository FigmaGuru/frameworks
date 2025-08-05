/** @type {import('tailwindcss').Config} */
export default {
  // Enable class-based dark mode
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./AliasPreviewUI.tsx"
  ],
  theme: {
    extend: {
      colors: {
        // light/dark background
        background: {
          light: '#fafafa',
          dark:  '#1f1f1f',
        },
        // light/dark text
        text: {
          light: '#111827',
          dark:  '#e5e5e5',
        },
        // light/dark border
        border: {
          light: '#e5e7eb',
          dark:  '#374151',
        },
        // example semantic tokens
        primary: {
          light: '#1d4ed8',
          dark:  '#3b82f6',
        },
        accent: {
          light: '#db2777',
          dark:  '#f472b6',
        },
      },
    },
  },
  plugins: [],
}