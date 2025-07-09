/**
 * Tailwind Color Generator Plugin
 * 
 * This plugin creates:
 * 1. Primitive tokens (raw color values)
 * 2. Semantic tokens (primary, secondary, surface) that reference primitives
 * 
 * Think of primitives like your base color swatches in Figma,
 * and semantics like your component styles that reference those swatches.
 */

const plugin = require('tailwindcss/plugin')

// Primitive color tokens - these are your base color values
// Like the raw hex codes you'd define in Figma's color styles
const primitiveColors = {
  // Base colors
  'blue-500': '#3B82F6',
  'blue-600': '#2563EB', 
  'gray-100': '#F3F4F6',
  'gray-800': '#1F2937',
  'white': '#FFFFFF',
}

// Semantic color tokens - these reference the primitives
// Like component styles in Figma that use your color tokens
const semanticColors = {
  // Primary brand colors
  'primary': primitiveColors['blue-500'],
  'primary-dark': primitiveColors['blue-600'],
  
  // Secondary/neutral colors  
  'secondary': primitiveColors['gray-800'],
  'surface': primitiveColors['gray-100'],
  'background': primitiveColors['white'],
}

module.exports = plugin(
  function({ addUtilities, theme }) {
    // Generate utility classes for primitive colors
    const primitiveUtilities = {}
    
    Object.entries(primitiveColors).forEach(([name, value]) => {
      // Create background color utilities
      primitiveUtilities[`.bg-primitive-${name}`] = {
        backgroundColor: value
      }
      
      // Create text color utilities  
      primitiveUtilities[`.text-primitive-${name}`] = {
        color: value
      }
      
      // Create border color utilities
      primitiveUtilities[`.border-primitive-${name}`] = {
        borderColor: value
      }
    })
    
    // Generate utility classes for semantic colors
    const semanticUtilities = {}
    
    Object.entries(semanticColors).forEach(([name, value]) => {
      // Create background color utilities
      semanticUtilities[`.bg-${name}`] = {
        backgroundColor: value
      }
      
      // Create text color utilities
      semanticUtilities[`.text-${name}`] = {
        color: value
      }
      
      // Create border color utilities
      semanticUtilities[`.border-${name}`] = {
        borderColor: value
      }
    })
    
    // Add all utilities to Tailwind
    addUtilities({
      ...primitiveUtilities,
      ...semanticUtilities
    })
  },
  
  // Extend Tailwind's theme with our colors
  function({ addBase, theme }) {
    // Add CSS custom properties for easy reference
    addBase({
      ':root': {
        // Primitive tokens as CSS variables
        '--color-blue-500': primitiveColors['blue-500'],
        '--color-blue-600': primitiveColors['blue-600'],
        '--color-gray-100': primitiveColors['gray-100'],
        '--color-gray-800': primitiveColors['gray-800'],
        '--color-white': primitiveColors['white'],
        
        // Semantic tokens as CSS variables
        '--color-primary': semanticColors['primary'],
        '--color-primary-dark': semanticColors['primary-dark'],
        '--color-secondary': semanticColors['secondary'],
        '--color-surface': semanticColors['surface'],
        '--color-background': semanticColors['background'],
      }
    })
  }
) 