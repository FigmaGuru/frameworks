// Color utility functions for managing design system tokens
import tailwindColors from './tailwind-colors.json';

export interface ColorToken {
  name: string;
  hex: string;
  type: 'primitive' | 'semantic';
  lightHex?: string;
  darkHex?: string;
  relatedPrimitives?: string[];
}

export interface SemanticColor {
  light: string;
  dark: string;
}

export interface SemanticPreset {
  [category: string]: {
    [variant: string]: SemanticColor;
  };
}

/**
 * Converts a semantic color reference (e.g., "slate-50") to its hex value
 */
export const resolveSemanticColor = (colorRef: string): string => {
  // If it's already a hex value, return it
  if (colorRef.startsWith('#')) {
    return colorRef;
  }
  
  // Parse the reference (e.g., "slate-50" -> family: "slate", step: "50")
  const [family, step] = colorRef.split('-');
  
  if (!family || !step || !(tailwindColors as any)[family] || !(tailwindColors as any)[family][step]) {
    console.warn(`Invalid color reference: ${colorRef}`);
    return '#000000'; // fallback
  }
  
  return (tailwindColors as any)[family][step];
};

/**
 * Validates that all semantic colors reference valid primitive colors
 */
export const validateSemanticColors = (semanticPresets: SemanticPreset): string[] => {
  const errors: string[] = [];
  
  Object.entries(semanticPresets).forEach(([category, variants]) => {
    Object.entries(variants).forEach(([variant, colors]) => {
      const lightRef = colors.light;
      const darkRef = colors.dark;
      
      if (!isValidColorReference(lightRef)) {
        errors.push(`${category}.${variant}.light: Invalid reference "${lightRef}"`);
      }
      
      if (!isValidColorReference(darkRef)) {
        errors.push(`${category}.${variant}.dark: Invalid reference "${darkRef}"`);
      }
    });
  });
  
  return errors;
};

/**
 * Checks if a color reference is valid
 */
export const isValidColorReference = (colorRef: string): boolean => {
  if (colorRef.startsWith('#')) {
    return /^#([0-9a-f]{6})$/i.test(colorRef);
  }
  
  const [family, step] = colorRef.split('-');
  return !!(family && step && (tailwindColors as any)[family] && (tailwindColors as any)[family][step]);
};

/**
 * Gets all available primitive colors grouped by family
 */
export const getPrimitiveColors = () => {
  const grouped: Record<string, Array<{ step: string; hex: string; alias: string }>> = {};
  
  Object.entries(tailwindColors).forEach(([family, steps]) => {
    grouped[family] = Object.entries(steps as Record<string, string>).map(([step, hex]) => ({
      step,
      hex,
      alias: `${family}-${step}`
    }));
  });
  
  return grouped;
};

/**
 * Generates CSS custom properties for semantic colors
 */
export const generateCSSVariables = (semanticPresets: SemanticPreset): string => {
  let css = ':root {\n';
  
  Object.entries(semanticPresets).forEach(([category, variants]) => {
    Object.entries(variants).forEach(([variant, colors]) => {
      const lightHex = resolveSemanticColor(colors.light);
      const darkHex = resolveSemanticColor(colors.dark);
      
      css += `  --color-${category.toLowerCase()}-${variant}: ${lightHex};\n`;
    });
  });
  
  css += '}\n\n';
  css += '.dark {\n';
  
  Object.entries(semanticPresets).forEach(([category, variants]) => {
    Object.entries(variants).forEach(([variant, colors]) => {
      const darkHex = resolveSemanticColor(colors.dark);
      css += `  --color-${category.toLowerCase()}-${variant}: ${darkHex};\n`;
    });
  });
  
  css += '}\n';
  
  return css;
};

/**
 * Finds primitive colors that match semantic colors
 */
export const findMatchingPrimitives = (
  semanticPresets: SemanticPreset, 
  primitiveColors: ReturnType<typeof getPrimitiveColors>
): Record<string, string[]> => {
  const map: Record<string, string[]> = {};
  
  Object.entries(semanticPresets).forEach(([category, variants]) => {
    Object.entries(variants).forEach(([variant, colors]) => {
      const semanticName = `${category.toLowerCase()}-${variant}`;
      const matchingPrimitives: string[] = [];
      
      const lightHex = resolveSemanticColor(colors.light);
      const darkHex = resolveSemanticColor(colors.dark);
      
      Object.entries(primitiveColors).forEach(([family, items]) => {
        items.forEach(item => {
          if (item.hex === lightHex || item.hex === darkHex) {
            matchingPrimitives.push(item.alias);
          }
        });
      });
      
      if (matchingPrimitives.length > 0) {
        map[semanticName] = matchingPrimitives;
      }
    });
  });
  
  return map;
};
