/**
 * Tailwind Color Generator - Figma Plugin
 * 
 * This plugin extracts color styles from Figma and generates
 * Tailwind CSS color tokens (primitives and semantics).
 */

// Show the plugin UI
figma.showUI(__html__, { width: 400, height: 600 });

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'generate-colors') {
    await generateColorTokens();
  } else if (msg.type === 'settings') {
    figma.ui.postMessage({ type: 'show-settings' });
  } else if (msg.type === 'create-modes-and-variables') {
    await createLightDarkModesWithVariables();
  } else if (msg.type === 'apply-token') {
    // Apply the selected token color to all selected nodes
    const token = msg.token;
    if (!token || !token.value) {
      figma.notify('No token value provided.');
      return;
    }
    const rgb = hexToRgbObj(token.value);
    if (!rgb) {
      figma.notify('Invalid color value: ' + token.value);
      return;
    }
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify('Select at least one node.');
      return;
    }
    for (const node of selection) {
      if ('fills' in node) {
        const newPaint = { type: 'SOLID', color: rgb, opacity: 1 };
        node.fills = [newPaint];
      }
    }
    figma.notify('Applied token to selection!');
  }
};

/**
 * Create a variable collection with Light and Dark modes, and a color variable for both
 */
async function createLightDarkModesWithVariables() {
  // 1. Find or create the variable collection
  let collection = figma.variables.getLocalVariableCollections().find(c => c.name === "Theme Colors");
  if (!collection) {
    collection = figma.variables.createVariableCollection("Theme Colors");
  }

  // 2. Find or add Light and Dark modes
  let lightMode = collection.modes.find(m => m.name === "Light");
  let darkMode = collection.modes.find(m => m.name === "Dark");

  let lightModeId, darkModeId;
  if (!lightMode) {
    lightModeId = collection.modes[0].modeId;
    collection.renameMode(lightModeId, "Light");
  } else {
    lightModeId = lightMode.modeId;
  }
  if (!darkMode) {
    darkModeId = collection.addMode("Dark");
  } else {
    darkModeId = darkMode.modeId;
  }

  // 3. Define Tailwind color values for each variable in both modes
  const colorVars = [
    {
      name: "background",
      light: { r: 0.976, g: 0.98, b: 0.984, a: 1 }, // gray-50 #F9FAFB
      dark:  { r: 0.067, g: 0.094, b: 0.153, a: 1 } // gray-900 #111827
    },
    {
      name: "surface",
      light: { r: 0.953, g: 0.957, b: 0.965, a: 1 }, // gray-100 #F3F4F6
      dark:  { r: 0.122, g: 0.137, b: 0.216, a: 1 } // gray-800 #1F2937
    },
    {
      name: "border",
      light: { r: 0.82, g: 0.843, b: 0.859, a: 1 }, // gray-300 #D1D5DB
      dark:  { r: 0.278, g: 0.341, b: 0.384, a: 1 } // gray-700 #374151
    },
    {
      name: "text",
      light: { r: 0.067, g: 0.094, b: 0.153, a: 1 }, // gray-900 #111827
      dark:  { r: 0.953, g: 0.957, b: 0.965, a: 1 } // gray-100 #F3F4F6
    },
    {
      name: "primary",
      light: { r: 0.149, g: 0.388, b: 0.965, a: 1 }, // blue-600 #2563EB
      dark:  { r: 0.255, g: 0.522, b: 0.961, a: 1 } // blue-400 #60A5FA
    },
    {
      name: "secondary",
      light: { r: 0.294, g: 0.333, b: 0.388, a: 1 }, // gray-600 #4B5563
      dark:  { r: 0.82, g: 0.843, b: 0.859, a: 1 } // gray-300 #D1D5DB
    },
    {
      name: "success",
      light: { r: 0.039, g: 0.725, b: 0.506, a: 1 }, // green-600 #10B981
      dark:  { r: 0.204, g: 0.89, b: 0.816, a: 1 } // green-400 #34D399
    },
    {
      name: "warning",
      light: { r: 0.961, g: 0.62, b: 0.259, a: 1 }, // yellow-500 #F59E42
      dark:  { r: 0.988, g: 0.839, b: 0.329, a: 1 } // yellow-400 #FBBF24
    },
    {
      name: "error",
      light: { r: 0.937, g: 0.267, b: 0.267, a: 1 }, // red-600 #DC2626
      dark:  { r: 0.973, g: 0.443, b: 0.443, a: 1 } // red-400 #F87171
    }
  ];

  // 4. Create or update variables and assign values for each mode
  for (const v of colorVars) {
    let variable = figma.variables.getLocalVariables().find(
      x => x.name === v.name && x.variableCollectionId === collection.id
    );
    if (!variable) {
      variable = figma.variables.createVariable(v.name, collection, "COLOR");
    }
    variable.setValueForMode(lightModeId, v.light);
    variable.setValueForMode(darkModeId, v.dark);
  }

  figma.closePlugin("Created Light and Dark theme variables with Tailwind-based values!");
}

/**
 * Generate Tailwind color tokens from Figma styles
 */
async function generateColorTokens() {
  try {
    // --- NEW: Remove existing Primitives and Semantics collections ---
    const collections = figma.variables.getLocalVariableCollections();
    for (const col of collections) {
      if (col.name === 'Primitives' || col.name === 'Semantics') {
        await figma.variables.deleteVariableCollection(col.id);
      }
    }

    // --- EXPANDED PRIMITIVES PALETTE ---
    const primitiveColors = {
      // Blue
      'blue-50':  '#EFF6FF',
      'blue-100': '#DBEAFE',
      'blue-200': '#BFDBFE',
      'blue-300': '#93C5FD',
      'blue-400': '#60A5FA',
      'blue-500': '#3B82F6',
      'blue-600': '#2563EB',
      'blue-700': '#1D4ED8',
      'blue-800': '#1E40AF',
      'blue-900': '#1E3A8A',
      // Gray
      'gray-50':  '#F9FAFB',
      'gray-100': '#F3F4F6',
      'gray-200': '#E5E7EB',
      'gray-300': '#D1D5DB',
      'gray-400': '#9CA3AF',
      'gray-500': '#6B7280',
      'gray-600': '#4B5563',
      'gray-700': '#374151',
      'gray-800': '#1F2937',
      'gray-900': '#111827',
      // Green
      'green-50':  '#ECFDF5',
      'green-100': '#D1FAE5',
      'green-200': '#A7F3D0',
      'green-300': '#6EE7B7',
      'green-400': '#34D399',
      'green-500': '#10B981',
      'green-600': '#059669',
      'green-700': '#047857',
      'green-800': '#065F46',
      'green-900': '#064E3B',
      // Red
      'red-50':  '#FEF2F2',
      'red-100': '#FEE2E2',
      'red-200': '#FECACA',
      'red-300': '#FCA5A5',
      'red-400': '#F87171',
      'red-500': '#EF4444',
      'red-600': '#DC2626',
      'red-700': '#B91C1C',
      'red-800': '#991B1B',
      'red-900': '#7F1D1D',
      // Yellow
      'yellow-50':  '#FFFBEB',
      'yellow-100': '#FEF3C7',
      'yellow-200': '#FDE68A',
      'yellow-300': '#FCD34D',
      'yellow-400': '#FBBF24',
      'yellow-500': '#F59E42',
      'yellow-600': '#D97706',
      'yellow-700': '#B45309',
      'yellow-800': '#92400E',
      'yellow-900': '#78350F',
      // Purple
      'purple-50':  '#F5F3FF',
      'purple-100': '#EDE9FE',
      'purple-200': '#DDD6FE',
      'purple-300': '#C4B5FD',
      'purple-400': '#A78BFA',
      'purple-500': '#8B5CF6',
      'purple-600': '#7C3AED',
      'purple-700': '#6D28D9',
      'purple-800': '#5B21B6',
      'purple-900': '#4C1D95',
      // Accent
      'accent-500': '#F472B6',
    };

    // --- EXPANDED SEMANTIC TOKENS ---
    const semanticColors = {
      'primary': primitiveColors['blue-600'],
      'primary-hover': primitiveColors['blue-700'],
      'secondary': primitiveColors['gray-600'],
      'secondary-hover': primitiveColors['gray-700'],
      'background': primitiveColors['gray-50'],
      'surface': primitiveColors['gray-100'],
      'surface-alt': primitiveColors['gray-200'],
      'border': primitiveColors['gray-300'],
      'border-strong': primitiveColors['gray-400'],
      'text': primitiveColors['gray-900'],
      'text-secondary': primitiveColors['gray-700'],
      'text-disabled': primitiveColors['gray-400'],
      'success': primitiveColors['green-600'],
      'success-bg': primitiveColors['green-50'],
      'warning': primitiveColors['yellow-500'],
      'warning-bg': primitiveColors['yellow-50'],
      'error': primitiveColors['red-600'],
      'error-bg': primitiveColors['red-50'],
      'info': primitiveColors['blue-500'],
      'info-bg': primitiveColors['blue-50'],
      'muted': primitiveColors['gray-200'],
      'accent': primitiveColors['accent-500'],
      'link': primitiveColors['blue-600'],
      'link-hover': primitiveColors['blue-800'],
      'focus': primitiveColors['purple-500'],
      'focus-ring': primitiveColors['purple-200'],
      'inverse-bg': primitiveColors['gray-900'],
      'inverse-text': primitiveColors['gray-50'],
    };

    // --- PRIMITIVE DESCRIPTIONS ---
    const primitiveDescriptions = {
      // Blue
      'blue-50':  'Blue 50: Lightest blue, used for backgrounds and subtle highlights.',
      'blue-100': 'Blue 100: Very light blue, background hover states.',
      'blue-200': 'Blue 200: Light blue, secondary backgrounds.',
      'blue-300': 'Blue 300: Soft blue, used for selected states.',
      'blue-400': 'Blue 400: Medium blue, used for info backgrounds.',
      'blue-500': 'Blue 500: Brand blue, used for links and accents.',
      'blue-600': 'Blue 600: Primary brand blue, main actions and highlights.',
      'blue-700': 'Blue 700: Strong blue, hover/active states.',
      'blue-800': 'Blue 800: Deep blue, focus rings.',
      'blue-900': 'Blue 900: Darkest blue, used for contrast.',
      // Gray
      'gray-50':  'Gray 50: Lightest gray, main app background.',
      'gray-100': 'Gray 100: Very light gray, surfaces and cards.',
      'gray-200': 'Gray 200: Light gray, muted backgrounds.',
      'gray-300': 'Gray 300: Subtle borders and dividers.',
      'gray-400': 'Gray 400: Disabled text and icons.',
      'gray-500': 'Gray 500: Secondary text.',
      'gray-600': 'Gray 600: Tertiary text, secondary buttons.',
      'gray-700': 'Gray 700: Headings, strong text.',
      'gray-800': 'Gray 800: Main text on light backgrounds.',
      'gray-900': 'Gray 900: Main text, highest contrast.',
      // Green
      'green-50':  'Green 50: Lightest green, success backgrounds.',
      'green-100': 'Green 100: Very light green, success highlights.',
      'green-200': 'Green 200: Light green, success surfaces.',
      'green-300': 'Green 300: Soft green, success selected.',
      'green-400': 'Green 400: Medium green, success info.',
      'green-500': 'Green 500: Brand green, success accents.',
      'green-600': 'Green 600: Primary success, confirmations.',
      'green-700': 'Green 700: Strong green, success hover.',
      'green-800': 'Green 800: Deep green, success focus.',
      'green-900': 'Green 900: Darkest green, success contrast.',
      // Red
      'red-50':  'Red 50: Lightest red, error backgrounds.',
      'red-100': 'Red 100: Very light red, error highlights.',
      'red-200': 'Red 200: Light red, error surfaces.',
      'red-300': 'Red 300: Soft red, error selected.',
      'red-400': 'Red 400: Medium red, error info.',
      'red-500': 'Red 500: Brand red, error accents.',
      'red-600': 'Red 600: Primary error, destructive actions.',
      'red-700': 'Red 700: Strong red, error hover.',
      'red-800': 'Red 800: Deep red, error focus.',
      'red-900': 'Red 900: Darkest red, error contrast.',
      // Yellow
      'yellow-50':  'Yellow 50: Lightest yellow, warning backgrounds.',
      'yellow-100': 'Yellow 100: Very light yellow, warning highlights.',
      'yellow-200': 'Yellow 200: Light yellow, warning surfaces.',
      'yellow-300': 'Yellow 300: Soft yellow, warning selected.',
      'yellow-400': 'Yellow 400: Medium yellow, warning info.',
      'yellow-500': 'Yellow 500: Brand yellow, warning accents.',
      'yellow-600': 'Yellow 600: Primary warning, caution actions.',
      'yellow-700': 'Yellow 700: Strong yellow, warning hover.',
      'yellow-800': 'Yellow 800: Deep yellow, warning focus.',
      'yellow-900': 'Yellow 900: Darkest yellow, warning contrast.',
      // Purple
      'purple-50':  'Purple 50: Lightest purple, focus backgrounds.',
      'purple-100': 'Purple 100: Very light purple, focus highlights.',
      'purple-200': 'Purple 200: Light purple, focus surfaces.',
      'purple-300': 'Purple 300: Soft purple, focus selected.',
      'purple-400': 'Purple 400: Medium purple, focus info.',
      'purple-500': 'Purple 500: Brand purple, focus accents.',
      'purple-600': 'Purple 600: Primary focus, focus rings.',
      'purple-700': 'Purple 700: Strong purple, focus hover.',
      'purple-800': 'Purple 800: Deep purple, focus focus.',
      'purple-900': 'Purple 900: Darkest purple, focus contrast.',
      // Accent
      'accent-500': 'Accent 500: Brand accent, used for highlights and special UI.',
    };

    // --- SEMANTIC DESCRIPTIONS ---
    const semanticDescriptions = {
      'primary': 'Primary: Main call-to-action buttons and links.',
      'primary-hover': 'Primary Hover: Hover state for main actions.',
      'secondary': 'Secondary: Secondary buttons and UI elements.',
      'secondary-hover': 'Secondary Hover: Hover state for secondary actions.',
      'background': 'Background: Main app background.',
      'surface': 'Surface: Card and surface backgrounds.',
      'surface-alt': 'Surface Alt: Alternate surface backgrounds.',
      'border': 'Border: Default borders and dividers.',
      'border-strong': 'Border Strong: Stronger borders for emphasis.',
      'text': 'Text: Main body text.',
      'text-secondary': 'Text Secondary: Secondary and muted text.',
      'text-disabled': 'Text Disabled: Disabled text and icons.',
      'success': 'Success: Success states and positive actions.',
      'success-bg': 'Success BG: Background for success alerts.',
      'warning': 'Warning: Warning states and caution actions.',
      'warning-bg': 'Warning BG: Background for warning alerts.',
      'error': 'Error: Error states and destructive actions.',
      'error-bg': 'Error BG: Background for error alerts.',
      'info': 'Info: Informational states and highlights.',
      'info-bg': 'Info BG: Background for info alerts.',
      'muted': 'Muted: Muted backgrounds and UI elements.',
      'accent': 'Accent: Special highlights and accent UI.',
      'link': 'Link: Hyperlinks and interactive text.',
      'link-hover': 'Link Hover: Hover state for links.',
      'focus': 'Focus: Focus rings and outlines.',
      'focus-ring': 'Focus Ring: Subtle focus backgrounds.',
      'inverse-bg': 'Inverse BG: Background for dark mode or inverse UI.',
      'inverse-text': 'Inverse Text: Text on dark backgrounds.',
    };

    // --- NEW: Remove all existing Primitives and Semantics collections (again, in case of rerun) ---
    // (already done above)

    // --- Create Primitives and Semantics variable collections and variables ---
    const primitivesCollection = await figma.variables.createVariableCollection('Primitives');
    const modeId = primitivesCollection.modes[0].modeId;
    const primitiveVarMap = {};
    for (const [name, hex] of Object.entries(primitiveColors)) {
      const v = await figma.variables.createVariable(
        name,
        primitivesCollection, // Pass the collection node, not id
        'COLOR',
        { description: primitiveDescriptions[name] || '' }
      );
      v.setValueForMode(modeId, hexToRgbObj(hex));
      console.log('Created variable', name, 'with description:', primitiveDescriptions[name]);
      primitiveVarMap[name] = v;
    }
    const semanticsCollection = await figma.variables.createVariableCollection('Semantics');
    const semanticsModeId = semanticsCollection.modes[0].modeId;
    for (const [name, hex] of Object.entries(semanticColors)) {
      const v = await figma.variables.createVariable(
        name,
        semanticsCollection, // Pass the collection node, not id
        'COLOR',
        { description: semanticDescriptions[name] || '' }
      );
      // Try to alias to a primitive if possible
      const primitiveKey = Object.keys(primitiveColors).find(k => primitiveColors[k] === hex);
      if (primitiveKey && primitiveVarMap[primitiveKey]) {
        v.setValueForMode(semanticsModeId, { type: 'VARIABLE_ALIAS', id: primitiveVarMap[primitiveKey].id });
      } else {
        v.setValueForMode(semanticsModeId, hexToRgbObj(hex));
      }
    }

    // 3. Generate Tailwind plugin code
    const pluginCode = generatePluginCode(primitiveColors, semanticColors);

    // 4. Send output to UI with the expected format
    figma.ui.postMessage({ 
      type: 'generated-code', 
      code: pluginCode, 
      primitiveColors,
      semanticColors
    });
  } catch (error) {
    console.error('Error generating color tokens:', error);
    figma.ui.postMessage({ type: 'error', message: error.message });
  }
}

/**
 * Convert RGB values to hex color
 */
function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Check if a style name represents a primitive color
 * Primitive colors typically have names like "Blue/500", "Gray/100", etc.
 */
function isPrimitiveColor(styleName) {
  const primitivePatterns = [
    /^\w+\/\d+$/,           // Blue/500, Gray/100
    /^\w+-\d+$/,            // blue-500, gray-100
    /^\w+\s+\d+$/,          // Blue 500, Gray 100
    /^#[0-9a-f]{6}$/i       // #3B82F6
  ];
  
  return primitivePatterns.some(pattern => pattern.test(styleName));
}

/**
 * Extract color name from primitive style name
 */
function extractColorName(styleName) {
  // Handle different naming patterns
  if (styleName.includes('/')) {
    // "Blue/500" -> "blue-500"
    return styleName.replace('/', '-').toLowerCase();
  } else if (styleName.includes(' ')) {
    // "Blue 500" -> "blue-500"
    return styleName.replace(/\s+/, '-').toLowerCase();
  } else if (styleName.startsWith('#')) {
    // "#3B82F6" -> "blue-500" (we'll use the hex as the key)
    return styleName.toLowerCase();
  }
  
  return styleName.toLowerCase();
}

/**
 * Extract semantic name from style name
 */
function extractSemanticName(styleName) {
  // Remove common prefixes and clean up the name
  return styleName
    .toLowerCase()
    .replace(/^(color|style|token)\s*/, '')  // Remove "Color", "Style", "Token" prefixes
    .replace(/[^a-z0-9]/g, '-')              // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-')                     // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');                  // Remove leading/trailing hyphens
}

/**
 * Generate the Tailwind plugin code
 */
function generatePluginCode(primitiveColors, semanticColors) {
  const primitiveEntries = Object.entries(primitiveColors)
    .map(([name, value]) => `  '${name}': '${value}'`)
    .join(',\n');
    
  const semanticEntries = Object.entries(semanticColors)
    .map(([name, value]) => `  '${name}': primitiveColors['${Object.keys(primitiveColors).find(key => primitiveColors[key] === value) || name}']`)
    .join(',\n');

  // Generate CSS variables for primitives
  const cssVars = Object.entries(primitiveColors)
    .map(([name, value]) => `  --color-${name}: ${value};`)
    .join('\n');

  return `/**
 * Tailwind Color Generator Plugin
 * Generated from Figma styles
 */

const plugin = require('tailwindcss/plugin')

// Primitive color tokens - extracted from Figma
const primitiveColors = {
${primitiveEntries}
}

// Semantic color tokens - referencing primitives
const semanticColors = {
${semanticEntries}
}

module.exports = plugin(
  function({ addUtilities, theme }) {
    // Generate utility classes for primitive colors
    const primitiveUtilities = {}
    
    Object.entries(primitiveColors).forEach(([name, value]) => {
      primitiveUtilities[\`.bg-primitive-\${name}\`] = {
        backgroundColor: value
      }
      primitiveUtilities[\`.text-primitive-\${name}\`] = {
        color: value
      }
      primitiveUtilities[\`.border-primitive-\${name}\`] = {
        borderColor: value
      }
    })
    
    // Generate utility classes for semantic colors
    const semanticUtilities = {}
    
    Object.entries(semanticColors).forEach(([name, value]) => {
      semanticUtilities[\`.bg-\${name}\`] = {
        backgroundColor: value
      }
      semanticUtilities[\`.text-\${name}\`] = {
        color: value
      }
      semanticUtilities[\`.border-\${name}\`] = {
        borderColor: value
      }
    })
    
    addUtilities({
      ...primitiveUtilities,
      ...semanticUtilities
    })
  },
  
  function({ addBase, theme }) {
    addBase({
      ':root': {
${Object.entries(primitiveColors).map(([name, value]) => `        '--color-${name}': '${value}',`).join('\n')}
      }
    })
  }
)

/* CSS Variables for reference:
:root {
${cssVars}
}
*/
`;
} 

// Helper: Convert hex to Figma RGB object
function hexToRgbObj(hex) {
  if (!hex) return null;
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return null;
  const num = parseInt(c, 16);
  return {
    r: ((num >> 16) & 255) / 255,
    g: ((num >> 8) & 255) / 255,
    b: (num & 255) / 255
  };
} 