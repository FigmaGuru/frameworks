# Variable Generator Plugin

A simple Interlink plugin that generates **primitive color tokens** and **semantic color tokens** that reference them.

## 🎨 **Figma Plugin Version**

This repository includes a **Figma plugin** that automatically extracts color styles from your Figma file and generates the Interlink plugin code for you!

### How the Figma Plugin Works

1. **Install the plugin** in Figma
2. **Create color styles** in your Figma file (name them like "Blue/500", "Primary", etc.)
3. **Run the plugin** to extract colors and generate Interlink code
4. **Copy the generated code** directly into your project

### Figma Plugin Files

- `manifest.json` - Plugin metadata and configuration
- `code.js` - Main plugin logic that extracts Figma styles
- `ui.html` - User interface for the plugin

## How It Works

Think of this like Figma's color system:

- **Primitive tokens** = Your base color swatches (raw hex values)
- **Semantic tokens** = Component styles that reference those swatches

## Installation

### For Interlink Projects

```bash
npm install interlink
```

### For Figma Plugin Development

1. Clone this repository
2. Open the folder in Figma as a plugin
3. Or publish to Figma Community for others to use

## Setup

Add the plugin to your `interlink.config.js`:

```javascript
module.exports = {
  content: ["./src/**/*.{html,js}"],
  plugins: [
    require('interlink')
  ],
}
```

## Usage

### Primitive Colors (Base Values)

These are your raw color values - like the hex codes you'd define in Figma:

```html
<!-- Background colors -->
<div class="bg-primitive-blue-500">Blue background</div>
<div class="bg-primitive-gray-100">Light gray background</div>

<!-- Text colors -->
<p class="text-primitive-blue-600">Blue text</p>
<p class="text-primitive-gray-800">Dark gray text</p>

<!-- Border colors -->
<div class="border border-primitive-blue-500">Blue border</div>
```

### Semantic Colors (Component Tokens)

These reference the primitives - like component styles in Figma:

```html
<!-- Primary brand colors -->
<button class="bg-primary text-white">Primary button</button>
<button class="bg-primary-dark text-white">Dark primary button</button>

<!-- Surface and background colors -->
<div class="bg-surface">Card surface</div>
<div class="bg-background">Page background</div>

<!-- Text colors -->
<h1 class="text-secondary">Secondary heading</h1>
```

## Generated Utilities

### Primitive Utilities
- `bg-primitive-{color}` - Background colors
- `text-primitive-{color}` - Text colors  
- `border-primitive-{color}` - Border colors

### Semantic Utilities
- `bg-{semantic}` - Background colors
- `text-{semantic}` - Text colors
- `border-{semantic}` - Border colors

## CSS Custom Properties

The plugin also generates CSS custom properties for easy reference:

```css
:root {
  /* Primitive tokens */
  --color-blue-500: #3B82F6;
  --color-blue-600: #2563EB;
  --color-gray-100: #F3F4F6;
  --color-gray-800: #1F2937;
  --color-white: #FFFFFF;
  
  /* Semantic tokens */
  --color-primary: #3B82F6;
  --color-primary-dark: #2563EB;
  --color-secondary: #1F2937;
  --color-surface: #F3F4F6;
  --color-background: #FFFFFF;
}
```

## Extending

To add more colors, edit the `primitiveColors` and `semanticColors` objects in `index.js`:

```javascript
const primitiveColors = {
  'blue-500': '#3B82F6',
  'blue-600': '#2563EB',
  'green-500': '#10B981', // Add new primitive
  // ... more colors
}

const semanticColors = {
  'primary': primitiveColors['blue-500'],
  'success': primitiveColors['green-500'], // Add new semantic
  // ... more semantics
}
```

## Why This Structure?

This mirrors how design systems work:

1. **Primitives** = Your source of truth (like Figma color styles)
2. **Semantics** = Meaningful names that reference primitives (like component styles)
3. **Utilities** = Ready-to-use CSS classes (like Interlink's built-in utilities)

This separation makes it easy to:
- Change colors globally by updating primitives
- Maintain consistent naming across your design system
- Scale up as your project grows

## 🎯 **Figma Integration Benefits**

The Figma plugin version makes this even more powerful:

- **Single source of truth**: Colors live in Figma, code is generated automatically
- **Visual feedback**: See your colors as swatches before generating code
- **Consistent naming**: Plugin intelligently categorizes primitives vs semantics
- **One-click generation**: No manual copying of hex values needed

### Figma Style Naming Conventions

The plugin automatically detects:

**Primitive colors** (base values):
- `Blue/500` → `blue-500`
- `Gray/100` → `gray-100`
- `#3B82F6` → `#3b82f6`

**Semantic colors** (component tokens):
- `Primary` → `primary`
- `Secondary` → `secondary`
- `Surface` → `surface` 