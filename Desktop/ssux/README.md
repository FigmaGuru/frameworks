# SSUX Design Token System

A React + TypeScript project that demonstrates a single source of truth for all design tokens using `variables.json`.

## 🎯 Project Goals

- **Single Source of Truth**: All styles come from `src/design/variables.json`
- **No Hardcoded Values**: No hex colors, RGB values, or pixel measurements in code
- **Theme Support**: Light/dark themes and product themes (Core/Quant/Expressive)
- **CSS Variables**: All tokens are converted to CSS custom properties
- **ESLint Enforcement**: Rules prevent hardcoded values

## 🏗️ Project Structure

```
ssux/
├── src/
│   ├── design/
│   │   └── variables.json          # Design token source file
│   ├── styles/
│   │   ├── tokens.color.css        # Generated color tokens
│   │   ├── tokens.product.css      # Generated product theme tokens
│   │   └── tokens.sizing.css       # Generated sizing/spacing tokens
│   ├── components/
│   │   ├── ThemeProvider.tsx       # Theme context provider
│   │   └── DemoComponent.tsx       # Demo component using tokens
│   ├── App.tsx                     # Main app component
│   ├── index.css                   # Global styles + token imports
│   └── main.tsx                    # App entry point
├── scripts/
│   └── build-tokens.js             # Token to CSS converter
├── tailwind.config.js              # Tailwind config (CSS variables only)
├── eslint.config.js                # ESLint rules (no hardcoded values)
└── package.json                    # Project dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
# Generate CSS tokens from variables.json
npm run build:tokens

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 Design Token System

### Token Categories

1. **Color Semantic** (`tokens.color.css`)
   - Light/Dark mode support
   - Surface colors (neutral, brand, status)
   - Text colors
   - Border colors
   - Data visualization colors

2. **Product Themes** (`tokens.product.css`)
   - Core theme
   - Quant theme  
   - Expressive theme
   - Typography scales
   - Spacing scales
   - Elevation scales

3. **Sizing & Spacing** (`tokens.sizing.css`)
   - Layout scales
   - Component dimensions
   - Border radius values

### CSS Variable Naming Convention

Tokens are converted from Figma's format to valid CSS:
- `surface/neutral-minimal` → `--surface-neutral-minimal`
- `font-weight-display` → `--font-weight-display`
- `elevation-scale-1` → `--elevation-scale-1`

### Theme Switching

The app supports two types of themes:

1. **Color Theme** (`data-theme`)
   - `light` - Light mode colors
   - `dark` - Dark mode colors

2. **Product Theme** (`data-product`)
   - `Core` - Default product theme
   - `Quant` - Quantitative product theme
   - `Expressive` - Expressive product theme

## 🛠️ Usage Examples

### Using CSS Variables in Components

```tsx
// ✅ Correct - Using CSS variables
<div style={{
  backgroundColor: 'var(--surface-neutral-minimal)',
  color: 'var(--text-neutral-regular)',
  padding: 'var(--layout-scale-4)',
  borderRadius: 'var(--radius-scale-button)'
}}>
  Content
</div>

// ❌ Wrong - Hardcoded values
<div style={{
  backgroundColor: '#FFFFFF',
  color: '#000000',
  padding: '24px',
  borderRadius: '8px'
}}>
  Content
</div>
```

### Theme Context Hook

```tsx
import { useTheme } from './components/ThemeProvider';

function MyComponent() {
  const { theme, product, setTheme, setProduct, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  );
}
```

## 🔒 ESLint Rules

The project includes ESLint rules that prevent:
- Hex color values (`#FFFFFF`)
- RGB/RGBA values (`rgb(255, 255, 255)`)
- HSL values (`hsl(0, 0%, 100%)`)
- Pixel values (`24px`)
- Rem values (`1.5rem`)

**Exception**: `0` values are allowed (e.g., `0px`, `0rem`)

## 🎯 Tailwind Integration

Tailwind CSS is configured to work with CSS variables:
- No hardcoded values in `tailwind.config.js`
- All utilities should reference CSS variables
- Custom utilities can be created using CSS variables

## 📝 Missing Tokens

If you encounter missing tokens during development:

1. Check `src/design/variables.json` for the token
2. If it exists, ensure the build script can parse it
3. If it doesn't exist, add it to the appropriate collection
4. Regenerate CSS with `npm run build:tokens`

## 🔄 Token Updates

When updating `variables.json`:

1. Make changes to the JSON file
2. Run `npm run build:tokens` to regenerate CSS
3. Restart the dev server if needed
4. Test that all components still work correctly

## 🚨 Troubleshooting

### Build Errors
- Ensure all CSS variables are valid (no spaces, special characters)
- Check that `variables.json` is valid JSON
- Verify the build script can parse all token types

### Missing Styles
- Check browser dev tools for CSS variable values
- Ensure tokens are being generated correctly
- Verify CSS imports in `index.css`

### Theme Not Working
- Check HTML attributes: `data-theme` and `data-product`
- Verify ThemeProvider is wrapping your app
- Check console for JavaScript errors

## 📚 Resources

- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Design Tokens](https://www.designtokens.org/)
- [Figma Tokens](https://docs.figma.com/design-tokens/overview/)
