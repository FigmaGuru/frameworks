/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",   // ✅ pick up all your views, components, etc.
    "./AliasPreviewUI.tsx"   // ✅ keep if you're still using this directly
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};