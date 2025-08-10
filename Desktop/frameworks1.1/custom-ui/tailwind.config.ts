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
        // Semantic color system
        surface: {
          primary: 'var(--color-surface-primary)',
          secondary: 'var(--color-surface-secondary)',
          tertiary: 'var(--color-surface-tertiary)',
          quaternary: 'var(--color-surface-quaternary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          quaternary: 'var(--color-text-quaternary)',
        },
        icon: {
          primary: 'var(--color-icon-primary)',
          secondary: 'var(--color-icon-secondary)',
          tertiary: 'var(--color-icon-tertiary)',
          quaternary: 'var(--color-icon-quaternary)',
        },
        border: {
          primary: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
          tertiary: 'var(--color-border-tertiary)',
          quaternary: 'var(--color-border-quaternary)',
        },
        brand: {
          primary: 'var(--color-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
          accent: 'var(--color-brand-accent)',
        },
        elevation: {
          low: 'var(--color-elevation-low)',
          medium: 'var(--color-elevation-medium)',
          high: 'var(--color-elevation-high)',
          overlay: 'var(--color-elevation-overlay)',
        },
        state: {
          hover: 'var(--color-state-hover)',
          focus: 'var(--color-state-focus)',
          active: 'var(--color-state-active)',
          selected: 'var(--color-state-selected)',
          disabled: 'var(--color-state-disabled)',
        },
        status: {
          success: 'var(--color-status-success)',
          warning: 'var(--color-status-warning)',
          error: 'var(--color-status-error)',
          info: 'var(--color-status-info)',
        },
        // Legacy support
        background: {
          light: '#fafafa',
          dark:  '#1f1f1f',
        },
        text: {
          light: '#111827',
          dark:  '#e5e5e5',
        },
        border: {
          light: '#e5e7eb',
          dark:  '#374151',
        },
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