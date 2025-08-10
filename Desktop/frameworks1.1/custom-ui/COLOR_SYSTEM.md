# Color Token System

This document explains the color token system implemented in the custom-ui project.

## Overview

The color system is built on two main concepts:

1. **Primitive Colors** - Raw color values from the Tailwind CSS palette
2. **Semantic Colors** - Named colors that reference primitives and have specific purposes

## Structure

### Primitive Colors

Primitive colors are the foundation - they're the actual hex values from Tailwind CSS:

```json
{
  "slate": {
    "50": "#f8fafc",
    "100": "#f1f5f9",
    "200": "#e2e8f0",
    // ... more steps
  },
  "blue": {
    "50": "#eff6ff",
    "100": "#dbeafe",
    "200": "#bfdbfe",
    // ... more steps
  }
}
```

### Semantic Colors

Semantic colors reference primitive colors and provide meaning:

```typescript
const semanticPresets = {
  Surface: {
    primary: { light: "slate-50", dark: "slate-950" },
    secondary: { light: "slate-100", dark: "slate-800" }
  },
  Text: {
    primary: { light: "slate-950", dark: "slate-50" },
    secondary: { light: "slate-700", dark: "slate-300" }
  }
}
```

## Categories

### 1. Surface
Background colors for different UI layers:
- `primary` - Main background
- `secondary` - Secondary background
- `tertiary` - Tertiary background
- `quaternary` - Quaternary background

### 2. Text
Typography colors with proper contrast:
- `primary` - Main text
- `secondary` - Secondary text
- `tertiary` - Tertiary text
- `quaternary` - Quaternary text

### 3. Icon
Icon-specific colors:
- `primary` - Main icon color
- `secondary` - Secondary icon color
- `tertiary` - Tertiary icon color
- `quaternary` - Quaternary icon color

### 4. Border
Border and divider colors:
- `primary` - Main border
- `secondary` - Secondary border
- `tertiary` - Tertiary border
- `quaternary` - Quaternary border

### 5. Brand
Brand-specific colors:
- `primary` - Primary brand color
- `secondary` - Secondary brand color
- `accent` - Accent brand color

### 6. Elevation
Shadow and depth colors:
- `low` - Low elevation
- `medium` - Medium elevation
- `high` - High elevation
- `overlay` - Overlay background

### 7. States & Interaction
Interactive state colors:
- `hover` - Hover state
- `focus` - Focus state
- `active` - Active state
- `selected` - Selected state
- `disabled` - Disabled state

### 8. Status / Feedback
Status and feedback colors:
- `success` - Success state
- `warning` - Warning state
- `error` - Error state
- `info` - Info state

### 9. Alpha
Transparency overlays:
- `white-5`, `white-10`, `white-20` - White overlays
- `black-5`, `black-10`, `black-20`, `black-90` - Black overlays

## Usage

### In Components

```tsx
import { resolveSemanticColor } from '../lib/colorUtils';

// Get the actual hex value for a semantic color
const backgroundColor = resolveSemanticColor('slate-50');
const textColor = resolveSemanticColor('slate-950');
```

### In Tailwind CSS

The system generates CSS custom properties that can be used in Tailwind:

```css
:root {
  --color-surface-primary: #f8fafc;
  --color-text-primary: #0f172a;
}

.dark {
  --color-surface-primary: #020617;
  --color-text-primary: #f8fafc;
}
```

### In Tailwind Config

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        surface: {
          primary: 'var(--color-surface-primary)',
          secondary: 'var(--color-surface-secondary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
        }
      }
    }
  }
}
```

## Benefits

1. **Consistency** - All colors reference the same primitive palette
2. **Maintainability** - Change a primitive, update all semantic tokens
3. **Semantic Meaning** - Colors have clear purposes, not just hex values
4. **Theme Support** - Built-in light/dark mode support
5. **Validation** - Automatic validation of color references
6. **Documentation** - Clear naming conventions and categories

## Adding New Colors

### New Semantic Category

```typescript
const semanticPresets = {
  // ... existing categories
  NewCategory: {
    variant1: { light: "blue-500", dark: "blue-400" },
    variant2: { light: "indigo-500", dark: "indigo-400" }
  }
};
```

### New Primitive Color

Add to `tailwind-colors.json`:

```json
{
  "newcolor": {
    "50": "#f0f9ff",
    "100": "#e0f2fe",
    "200": "#bae6fd"
  }
}
```

## Validation

The system automatically validates:
- All semantic colors reference valid primitives
- Color references follow the correct format
- Hex values are valid

Errors are displayed in the UI when validation fails.

## Migration from Hardcoded Values

If you have existing hardcoded hex values:

1. **Before**: `{ light: "#f8fafc", dark: "#020617" }`
2. **After**: `{ light: "slate-50", dark: "slate-950" }`

Benefits:
- Easier to maintain
- Consistent with design system
- Automatic validation
- Better documentation
