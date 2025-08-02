# Frameworks 1.1

A Figma plugin project for generating and managing design tokens with a custom UI built using React, TypeScript, and Tailwind CSS.

## Project Structure

```
frameworks1.1/
├── code.ts                 # Main Figma plugin code
├── code.js                 # Compiled plugin code
├── manifest.json           # Figma plugin manifest
├── webpack.config.js       # Webpack configuration
├── tsconfig.json          # TypeScript configuration
├── .gitignore             # Git ignore rules
└── custom-ui/             # Custom UI application
    ├── src/
    │   ├── App.tsx        # Main React application
    │   ├── views/         # UI view components
    │   │   ├── ColorsView.tsx
    │   │   ├── SpacingView.tsx
    │   │   ├── TypographyView.tsx
    │   │   └── AliasPreviewUI.tsx
    │   ├── lib/           # Utility functions and data
    │   └── components/    # Reusable UI components
    ├── package.json       # UI dependencies
    ├── tailwind.config.ts # Tailwind CSS configuration
    └── vite.config.ts     # Vite build configuration
```

## Features

- **Design Token Generation**: Create and manage color, spacing, and typography tokens
- **Custom UI**: Modern React-based interface with Tailwind CSS styling
- **Figma Integration**: Seamless integration with Figma's design system
- **TypeScript**: Full type safety throughout the application

## Development

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Figma Desktop app

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd custom-ui
   npm install
   ```

3. Build the UI:
   ```bash
   npm run build
   ```

4. Load the plugin in Figma:
   - Open Figma Desktop
   - Go to Plugins > Development > Import plugin from manifest
   - Select the `manifest.json` file

## Building

The project uses Webpack to compile the TypeScript code and bundle the custom UI. The build process creates the necessary files for the Figma plugin to run.

## Contributing

This project is designed to help understand code structure and development workflows. Feel free to explore and modify the code to learn more about:

- React component architecture
- TypeScript type definitions
- Tailwind CSS styling
- Figma plugin development
- Modern build tools and workflows 