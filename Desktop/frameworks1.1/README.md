# Framework Figma Plugin

A Figma plugin for generating design tokens as local variables. Supports colors, spacing, and typography tokens with semantic naming.

## 🏗️ Project Structure

```
frameworks1.1/
├── code.ts                 # Main plugin logic (TypeScript)
├── custom-ui/              # React UI components
│   ├── src/
│   │   ├── views/         # Main view components
│   │   ├── components/    # Reusable UI components
│   │   └── lib/          # Utility functions
│   └── dist/              # Built UI (generated)
├── dist/                   # Built plugin code (generated)
└── manifest.json          # Plugin configuration
```

## 🚀 Build Process

### Prerequisites
```bash
npm run install:all
```

### Development
```bash
# Watch TypeScript compilation
npm run dev

# In another terminal, watch UI changes
cd custom-ui && npm run dev
```

### Production Build
```bash
npm run build
```

This will:
1. Compile `code.ts` → `dist/code.js`
2. Build React UI → `custom-ui/dist/`

## 📦 Plugin Features

- **Colors**: Generate semantic color variables with light/dark modes
- **Spacing**: Create consistent spacing scale variables
- **Typography**: Build font system variables (size, weight, line-height)

## 🔧 Development

- **Main Thread**: `code.ts` handles Figma API calls
- **UI Thread**: React components in `custom-ui/src/views/`
- **Communication**: Messages passed via `postMessage` API

## 📋 Requirements

- Figma Plugin API 1.0.0
- Node.js 16+
- TypeScript 5.9+ 