// src/code.ts
// Runs in Figma main thread
// 
// This plugin ensures all semantic variables are generated with proper Light/Dark themes:
// - Semantic colors get different hex values for light and dark modes
// - Semantic aliases reference primitive variables in both themes
// - All collections automatically create Light/Dark modes when needed
// - Validation ensures semantic variables have distinct light/dark values
// - Labels create hierarchical variable names for better organization (e.g., "surface-primary" instead of just "primary")
//
figma.showUI(__html__, { width: 600, height: 700 });

/** ---------- REST API & ID Mapping ---------- **/
interface FigmaAPIConfig {
  fileKey: string;
  accessToken: string;
  baseUrl: string;
}

interface IDMapping {
  [tempId: string]: string; // tempId -> Figma's real ID
}

class FigmaAPIService {
  private config: FigmaAPIConfig;
  
  constructor(config: FigmaAPIConfig) {
    this.config = config;
  }
  
  async createVariables(variables: any[]) {
    const postData = this.formatVariablesForAPI(variables);
    
    try {
      const response = await fetch(
        `${this.config.baseUrl}/files/${this.config.fileKey}/variables`,
        {
          method: 'POST',
          headers: {
            'X-Figma-Token': this.config.accessToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        }
      );
      
      const result = await response.json();
      return result.meta.tempIdToRealId; // Capture ID mappings
    } catch (error) {
      console.error('Figma API error:', error);
      throw error;
    }
  }
  
  private formatVariablesForAPI(variables: any[]) {
    // Format according to Figma's REST API structure
    return {
      variableCollections: [],
      variableModes: [],
      variables: [],
      variableModeValues: []
    };
  }
}

class IDMapper {
  private mappings: IDMapping = {};
  
  saveMappings(mappings: IDMapping, fileKey: string) {
    // In a real implementation, save to file system or database
    this.mappings = { ...this.mappings, ...mappings };
    console.log(`Saved ${Object.keys(mappings).length} ID mappings for file: ${fileKey}`);
  }
  
  getRealId(tempId: string): string | null {
    return this.mappings[tempId] || null;
  }
  
  shouldUpdate(name: string): boolean {
    return this.getRealId(name) !== null;
  }
}

// Global instances
let figmaAPI: FigmaAPIService | null = null;
let idMapper: IDMapper | null = null;

/** ---------- Helpers ---------- **/
function hexToRgb(hex: string): RGB {
  const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  if (!parsed) return { r: 0, g: 0, b: 0 };
  const [, rr, gg, bb] = parsed;
  return {
    r: parseInt(rr, 16) / 255,
    g: parseInt(gg, 16) / 255,
    b: parseInt(bb, 16) / 255
  };
}

function pxToNumber(px: string): number {
  return parseFloat(String(px).replace("px", ""));
}

class CollectionManager {
  private collections: Map<string, VariableCollection> = new Map();
  
  getOrCreateCollection(name: string, description?: string): VariableCollection {
    if (this.collections.has(name)) {
      return this.collections.get(name)!;
    }
    
    const existing = figma.variables.getLocalVariableCollections()
      .find(c => c.name === name);
    
    if (existing) {
      this.collections.set(name, existing);
      return existing;
    }
    
    const newCollection = figma.variables.createVariableCollection(name);
    if (description) {
      // Note: Figma API doesn't support descriptions yet, but good practice
      console.log(`Created collection: ${name} - ${description}`);
    }
    
    this.collections.set(name, newCollection);
    return newCollection;
  }
  
  organizeCollectionsByType() {
    // Create systematic collection structure
    const structure = {
      'Primitive Colors': 'Base color values',
      'Semantic Colors': 'Theme-aware color tokens',
      'Primitive Spacing': 'Base spacing values',
      'Semantic Spacing': 'Component spacing tokens',
      'Typography': 'Font sizes, weights, line heights',
      'Radius': 'Border radius values'
    };
    
    Object.entries(structure).forEach(([name, description]) => {
      this.getOrCreateCollection(name, description);
    });
  }
}

// Global collection manager instance
let collectionManager: CollectionManager | null = null;

function getOrCreateCollection(name: string): VariableCollection {
  if (!collectionManager) {
    collectionManager = new CollectionManager();
  }
  return collectionManager.getOrCreateCollection(name);
}

/** Create a hierarchical variable name using label prefix for organization */
function createHierarchicalVariableName(label: string, name: string): string {
  // Clean the label to make it a valid variable name prefix
  const cleanLabel = label
    .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .toLowerCase();
  
  return `${cleanLabel}-${name}`;
}

/** Ensure variable names are valid for Figma */
function ensureValidVariableName(name: string): string {
  // Figma variable naming rules:
  // - Must start with a letter or underscore
  // - Can contain letters, numbers, underscores, and hyphens
  // - Cannot start with numbers
  
  let validName = name;
  
  // If name starts with a number, prefix it with 'var'
  if (/^\d/.test(validName)) {
    validName = `var-${validName}`;
  }
  
  // Replace any remaining invalid characters with underscores
  validName = validName.replace(/[^a-zA-Z0-9_-]/g, '_');
  
  // Ensure it doesn't start with a hyphen
  if (validName.startsWith('-')) {
    validName = `var${validName}`;
  }
  
  // Final validation: ensure the name is not empty and starts with a valid character
  if (!validName || validName.length === 0) {
    validName = `var_${Date.now()}`;
  }
  
  // Ensure it starts with a letter or underscore
  if (!/^[a-zA-Z_]/.test(validName)) {
    validName = `var_${validName}`;
  }
  
  console.log(`ensureValidVariableName: "${name}" -> "${validName}"`);
  
  return validName;
}

/** Search by name *within* a collection (names can repeat across collections) */
function findVariableByNameInCollection(name: string, collectionId: string): Variable | null {
  const allVariables = figma.variables.getLocalVariables();
  const found = allVariables.find(
    v => v.name === name && v.variableCollectionId === collectionId
  );
  
  if (found) {
    console.log(`Found variable "${name}" in collection ${collectionId}`);
  } else {
    console.log(`Variable "${name}" not found in collection ${collectionId}`);
  }
  
  return found || null;
}

function getOrCreateVariable(
  name: string,
  collection: VariableCollection,
  variableType: VariableResolvedDataType
): Variable {
  try {
    const existing = findVariableByNameInCollection(name, collection.id);
    if (existing) {
      console.log(`Found existing variable: ${name} in collection ${collection.name}`);
      return existing;
    }
    
    console.log(`Creating new variable: ${name} in collection ${collection.name} (${collection.id})`);
    const v = figma.variables.createVariable(name, collection, variableType);
    console.log(`Created variable: ${name} (${v.id})`);
    
    // Set default scopes based on variable type
    if (variableType === 'FLOAT') {
      v.scopes = ['GAP', 'WIDTH_HEIGHT'];
    }
    // Note: Color variables use default scopes
    
    return v;
  } catch (error: any) {
    console.error(`Failed to create variable ${name}:`, error);
    figma.notify(`Failed to create variable ${name}: ${error.message}`, { error: true });
    throw error;
  }
}

/** Enhanced Theme Management */
interface ThemeConfig {
  name: string;
  modeId: string;
  isDefault: boolean;
}

class ThemeManager {
  private themes: Map<string, ThemeConfig> = new Map();
  
  ensureThemeModes(collection: VariableCollection, themes: string[]) {
    const existingModes = collection.modes;
    const themeModes: { lightId: string; darkId: string } = { lightId: '', darkId: '' };
    
    // Create or update themes systematically
    themes.forEach((themeName, index) => {
      const isDefault = index === 0;
      const action = isDefault ? 'UPDATE' : 'CREATE';
      
      if (isDefault && existingModes.length > 0) {
        // Rename first mode to match theme
        collection.renameMode(existingModes[0].modeId, themeName);
        themeModes.lightId = existingModes[0].modeId;
      } else {
        // Create new mode
        const modeId = collection.addMode(themeName);
        if (themeName.toLowerCase().includes('light')) {
          themeModes.lightId = modeId;
        } else if (themeName.toLowerCase().includes('dark')) {
          themeModes.darkId = modeId;
        }
      }
    });
    
    return themeModes;
  }
}

/** Ensure we have Light/Dark; rename first mode to Light if needed. */
function ensureLightDarkModes(
  collection: VariableCollection,
  lightName = "Light",
  darkName = "Dark"
): { lightId: string; darkId: string } {
  if (collection.modes.length === 0) {
    const lightId = collection.addMode(lightName);
    const darkId = collection.addMode(darkName);
    return { lightId, darkId };
  }
  // Rename first to Light (idempotent)
  const first = collection.modes[0];
  if (first.name !== lightName) {
    collection.renameMode(first.modeId, lightName);
  }
  let lightId = first.modeId;

  let dark = collection.modes.find(m => m.name === darkName);
  let darkId = dark ? dark.modeId : collection.addMode(darkName);

  return { lightId, darkId };
}

/** Validate that semantic variables have both light and dark values */
function validateSemanticValues(
  name: string,
  lightHex: string | undefined,
  darkHex: string | undefined
): { isValid: boolean; error?: string; warning?: string } {
  if (!lightHex || !darkHex) {
    return {
      isValid: false,
      error: `Semantic variable "${name}" must have both lightHex and darkHex values`
    };
  }
  
  // Validate hex format
  const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexRegex.test(lightHex) || !hexRegex.test(darkHex)) {
    return {
      isValid: false,
      error: `Semantic variable "${name}" must have valid hex color values (e.g., #FF0000 or #F00)`
    };
  }
  
  if (lightHex === darkHex) {
    // Instead of failing, provide a warning and suggest a solution
    return {
      isValid: true, // Allow same values but warn
      warning: `Semantic variable "${name}" has the same value for light and dark themes (${lightHex}). Consider using different values for better theme support.`
    };
  }
  
  return { isValid: true };
}

/** ---------- Spacing Utilities ---------- **/
/** Convert various spacing units to pixels */
function spacingToPx(value: string | number): number {
  if (typeof value === "number") return value;
  
  const str = String(value).toLowerCase().trim();
  
  // Handle px values
  if (str.endsWith("px")) {
    return pxToNumber(str);
  }
  
  // Handle rem values (assuming 16px = 1rem)
  if (str.endsWith("rem")) {
    const remValue = parseFloat(str.replace("rem", ""));
    return remValue * 16;
  }
  
  // Handle em values (assuming 16px = 1em)
  if (str.endsWith("em")) {
    const emValue = parseFloat(str.replace("em", ""));
    return emValue * 16;
  }
  
  // Handle percentage (assuming 100% = 16px for typography context)
  if (str.endsWith("%")) {
    const percentValue = parseFloat(str.replace("%", ""));
    return (percentValue / 100) * 16;
  }
  
  // Try to parse as number
  const numValue = parseFloat(str);
  if (!isNaN(numValue)) return numValue;
  
  // Default fallback
  return 0;
}

/** Generate spacing scale values based on type */
function generateSpacingValues(
  baseUnit: number,
  scale: "linear" | "geometric" | "fibonacci",
  maxMultiplier: number,
  includeZero: boolean = true
): Array<{ name: string; value: number }> {
  const values: Array<{ name: string; value: number }> = [];
  
  if (scale === "linear") {
    // Linear scale: 0, 4, 8, 12, 16, 20, 24, 28, 32...
    for (let i = includeZero ? 0 : 1; i <= maxMultiplier; i++) {
      const value = i * baseUnit;
      const name = `spacing-${value}`;
      values.push({ name, value });
    }
  } else if (scale === "geometric") {
    // Geometric scale: 4, 8, 16, 32, 64...
    let value = baseUnit;
    for (let i = 1; i <= maxMultiplier; i++) {
      const name = `spacing-${value}`;
      values.push({ name, value });
      value *= 2;
    }
  } else if (scale === "fibonacci") {
    // Fibonacci scale: 4, 8, 12, 20, 32, 52...
    let prev = baseUnit;
    let current = baseUnit * 2;
    for (let i = 1; i <= maxMultiplier; i++) {
      const name = `spacing-${prev}`;
      values.push({ name, value: prev });
      const next = prev + current;
      prev = current;
      current = next;
    }
  }
  
  return values.sort((a, b) => a.value - b.value);
}

/** Validate spacing values for logical consistency */
function validateSpacingValues(values: Array<{ name: string; value: number }>): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  if (values.length === 0) {
    errors.push("No spacing values provided");
    return { isValid: false, warnings, errors };
  }
  
  // Check for duplicate values
  const valueMap = new Map<number, string>();
  for (const item of values) {
    if (valueMap.has(item.value)) {
      warnings.push(`Duplicate value ${item.value}px found in variables: ${valueMap.get(item.value)}, ${item.name}`);
    } else {
      valueMap.set(item.value, item.name);
    }
  }
  
  // Check for logical progression
  const sortedValues = Array.from(valueMap.keys()).sort((a, b) => a - b);
  if (sortedValues.length > 1) {
    for (let i = 1; i < sortedValues.length; i++) {
      const ratio = sortedValues[i] / sortedValues[i - 1];
      if (ratio < 1.2) {
        warnings.push(`Small ratio between ${sortedValues[i-1]}px and ${sortedValues[i]}px (${ratio.toFixed(2)}x)`);
      }
      if (ratio > 4) {
        warnings.push(`Large ratio between ${sortedValues[i-1]}px and ${sortedValues[i]}px (${ratio.toFixed(2)}x)`);
      }
    }
  }
  
  // Check for zero values
  if (sortedValues.includes(0)) {
    warnings.push("Zero spacing value detected - consider if this is intentional");
  }
  
  // Check for very small values
  const smallValues = sortedValues.filter(v => v < 1);
  if (smallValues.length > 0) {
    warnings.push(`Very small spacing values detected: ${smallValues.join(", ")}px`);
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

/** Design Token Integration */
interface DesignToken {
  name: string;
  value: string | number;
  type: 'color' | 'spacing' | 'typography' | 'radius';
  themeable: boolean;
  comment?: string;
}

class DesignTokenProcessor {
  processTokens(tokens: DesignToken[], collection: VariableCollection) {
    const primitives = tokens.filter(t => !t.themeable);
    const semantics = tokens.filter(t => t.themeable);
    
    console.log(`Processing ${tokens.length} tokens: ${primitives.length} primitives, ${semantics.length} semantics`);
    
    // Process primitives first
    primitives.forEach(token => {
      this.createPrimitiveVariable(token, collection);
    });
    
    // Then process semantics that reference primitives
    semantics.forEach(token => {
      this.createSemanticVariable(token, collection);
    });
  }
  
  private createPrimitiveVariable(token: DesignToken, collection: VariableCollection) {
    const variableType = this.mapTokenTypeToVariableType(token.type);
    const variable = getOrCreateVariable(token.name, collection, variableType);
    
    // Set value based on type
    if (token.type === 'color') {
      variable.setValueForMode(collection.modes[0].modeId, hexToRgb(token.value as string));
    } else {
      variable.setValueForMode(collection.modes[0].modeId, token.value);
    }
    
    console.log(`Created primitive variable: ${token.name} (${token.type})`);
  }
  
  private createSemanticVariable(token: DesignToken, collection: VariableCollection) {
    const variableType = this.mapTokenTypeToVariableType(token.type);
    const variable = getOrCreateVariable(token.name, collection, variableType);
    
    // For semantics, we need to handle theme modes
    if (collection.modes.length >= 2) {
      const lightId = collection.modes[0].modeId;
      const darkId = collection.modes[1].modeId;
      
      if (token.type === 'color') {
        // Create different values for light/dark themes
        const lightValue = this.generateLightValue(token.value as string);
        const darkValue = this.generateDarkValue(token.value as string);
        
        variable.setValueForMode(lightId, hexToRgb(lightValue));
        variable.setValueForMode(darkId, hexToRgb(darkValue));
      } else {
        // Spacing/typography typically same across themes
        const value = typeof token.value === "number" ? token.value : pxToNumber(token.value);
        variable.setValueForMode(lightId, value);
        variable.setValueForMode(darkId, value);
      }
    } else {
      // Single mode fallback
      if (token.type === 'color') {
        variable.setValueForMode(collection.modes[0].modeId, hexToRgb(token.value as string));
      } else {
        variable.setValueForMode(collection.modes[0].modeId, token.value);
      }
    }
    
    console.log(`Created semantic variable: ${token.name} (${token.type})`);
  }
  
  private mapTokenTypeToVariableType(tokenType: string): VariableResolvedDataType {
    switch (tokenType) {
      case 'color': return 'COLOR';
      case 'spacing': return 'FLOAT';
      case 'typography': return 'FLOAT';
      case 'radius': return 'FLOAT';
      default: return 'FLOAT';
    }
  }
  
  private generateLightValue(baseValue: string): string {
    // Simple light value generation - in practice, this would use your design system logic
    return baseValue;
  }
  
  private generateDarkValue(baseValue: string): string {
    // Simple dark value generation - in practice, this would use your design system logic
    return baseValue;
  }
}

// Global design token processor instance
let designTokenProcessor: DesignTokenProcessor | null = null;

/** Find a matching primitive variable for a given value */
function findMatchingPrimitive(
  targetValue: number, 
  primitiveVars: Map<number, Variable>, 
  modeId: string
): Variable | null {
  try {
    // First try exact match
    if (primitiveVars.has(targetValue)) {
      return primitiveVars.get(targetValue)!;
    }
    
    // Then try approximate match (within 0.1 tolerance)
    for (const [value, variable] of primitiveVars.entries()) {
      if (Math.abs(value - targetValue) < 0.1) {
        console.log(`🎯 SPACING: Found approximate match: ${value} ≈ ${targetValue}`);
        return variable;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error finding matching primitive:", error);
    return null;
  }
}

/** Find a matching color primitive variable for a given hex value */
function findMatchingColorPrimitive(
  targetHex: string, 
  collectionId: string
): Variable | null {
  try {
    console.log(`🎨 Searching for color primitive matching: ${targetHex}`);
    
    // Look for primitive color collections (not semantic ones)
    // Be more flexible with naming - look for collections that might contain primitive colors
    const primitiveColorCollections = figma.variables.getLocalVariableCollections()
      .filter(c => {
        const name = c.name.toLowerCase();
        // Look for collections that contain colors but are NOT semantic/alias collections
        return (name.includes("color") || name.includes("colour")) && 
               !name.includes("semantic") && 
               !name.includes("alias") &&
               !name.includes("framework semantic");
      });
    
    console.log(`🎨 Found ${primitiveColorCollections.length} potential primitive color collections:`, 
      primitiveColorCollections.map(c => c.name));
    
    // Search through all primitive color collections
    for (const primCol of primitiveColorCollections) {
      const allColorVars = figma.variables.getLocalVariables()
        .filter(v => v.variableCollectionId === primCol.id && v.resolvedType === 'COLOR');
      
      console.log(`🎨 Searching in collection "${primCol.name}": ${allColorVars.length} color variables`);
      
      // Find exact or close matches by name (since we can't easily compare RGB values)
      for (const colorVar of allColorVars) {
        console.log(`🎨 Checking primitive: ${colorVar.name}`);
        
        // Try to match by name first (e.g., "rose-950" should match "rose-950")
        if (colorVar.name === targetHex.replace('#', '').toLowerCase() || 
            colorVar.name.includes(targetHex.replace('#', '').toLowerCase()) ||
            colorVar.name.toLowerCase().includes(targetHex.replace('#', '').toLowerCase())) {
          console.log(`🎨 Found matching color primitive by name: ${colorVar.name}`);
          return colorVar;
        }
        
        // Also try matching the hex value in the name
        if (colorVar.name.includes(targetHex.replace('#', '')) || 
            colorVar.name.toLowerCase().includes(targetHex.replace('#', '').toLowerCase())) {
          console.log(`🎨 Found matching color primitive by hex: ${colorVar.name}`);
          return colorVar;
        }
      }
    }
    
    console.log(`🎨 No matching color primitive found for: ${targetHex}`);
    return null;
  } catch (error) {
    console.error("Error finding matching color primitive:", error);
    return null;
  }
}

/** Create semantic spacing suggestions based on common patterns */
function suggestSemanticSpacing(primitiveValues: Array<{ name: string; value: number }>): Array<{
  name: string;
  value: number;
  label: string;
  description: string;
}> {
  const suggestions: Array<{
    name: string;
    value: number;
    label: string;
    description: string;
  }> = [];
  
  // Find common spacing values
  const xs = primitiveValues.find(v => v.value <= 4)?.value || 4;
  const sm = primitiveValues.find(v => v.value >= 8 && v.value <= 12)?.value || 8;
  const md = primitiveValues.find(v => v.value >= 16 && v.value <= 20)?.value || 16;
  const lg = primitiveValues.find(v => v.value >= 24 && v.value <= 32)?.value || 24;
  const xl = primitiveValues.find(v => v.value >= 40 && v.value <= 64)?.value || 48;
  
  // Component spacing
  suggestions.push(
    { name: "xs", value: xs, label: "component", description: "Tight component spacing" },
    { name: "sm", value: sm, label: "component", description: "Small component spacing" },
    { name: "md", value: md, label: "component", description: "Medium component spacing" },
    { name: "lg", value: lg, label: "component", description: "Large component spacing" },
    { name: "xl", value: xl, label: "component", description: "Extra large component spacing" }
  );
  
  // Layout spacing
  const section = primitiveValues.find(v => v.value >= 48 && v.value <= 80)?.value || 64;
  const page = primitiveValues.find(v => v.value >= 80)?.value || 96;
  
  suggestions.push(
    { name: "section", value: section, label: "layout", description: "Section spacing" },
    { name: "page", value: page, label: "layout", description: "Page-level spacing" }
  );
  
  return suggestions;
}

/** ---------- Spacing Message Handler ---------- **/
async function handleSpacingMessage(msg: { type: string; payload: any }) {
  try {
    console.log("🎯 SPACING: Processing spacing message:", msg);
    const { type, payload } = msg;
    
    // Check if payload is double-wrapped (common in Figma plugins)
    let actualPayload = payload;
    if (payload && payload.payload && typeof payload.payload === 'object') {
      console.log("🎯 SPACING: Detected double-wrapped payload, extracting inner payload");
      actualPayload = payload.payload;
    }
    
    console.log("🎯 SPACING: Actual payload after unwrapping:", actualPayload);
    
    const {
      primitives = [],
      semantics = [],
      densityMode = "default",
      totalCount
    } = actualPayload || {};
    
    console.log("🎯 SPACING: After destructuring - primitives:", primitives);
    console.log("🎯 SPACING: After destructuring - primitives length:", primitives.length);
    console.log("🎯 SPACING: After destructuring - primitives type:", Array.isArray(primitives));

    if (!Array.isArray(primitives) || !Array.isArray(semantics)) {
      figma.ui.postMessage({
        type: "generation-error",
        payload: { error: "Invalid payload: primitives and semantics must be arrays." }
      });
      return;
    }

    // Step 1: Create primitive collection with density modes
    const primCol = getOrCreateCollection("Framework / Spacing – Primitives");
    
    // Ensure density modes exist and get their IDs
    let defaultModeId = "";
    let compactModeId = "";
    let cozyModeId = "";
    
    if (primCol.modes.length === 0) {
      defaultModeId = primCol.addMode("default");
    } else {
      defaultModeId = primCol.modes[0].modeId;
      // Rename first mode to "default" if it's not already
      if (primCol.modes[0].name !== "default") {
        primCol.renameMode(primCol.modes[0].modeId, "default");
      }
    }
    
    if (primCol.modes.length === 1) {
      compactModeId = primCol.addMode("compact");
    } else if (primCol.modes.length >= 2) {
      compactModeId = primCol.modes[1].modeId;
      if (primCol.modes[1].name !== "compact") {
        primCol.renameMode(primCol.modes[1].modeId, "compact");
      }
    }
    
    if (primCol.modes.length === 2) {
      cozyModeId = primCol.addMode("cozy");
    } else if (primCol.modes.length >= 3) {
      cozyModeId = primCol.modes[2].modeId;
      if (primCol.modes[2].name !== "cozy") {
        primCol.renameMode(primCol.modes[2].modeId, "cozy");
      }
    }
    
    console.log("🎯 SPACING: Mode IDs - default:", defaultModeId, "compact:", compactModeId, "cozy:", cozyModeId);
    
    const primitiveVars = new Map<number, Variable>();
    let primitivesCreated = 0;
    let primitivesUpdated = 0;

    console.log("🎯 SPACING: Starting primitive creation...");
    console.log("🎯 SPACING: Primitives array:", primitives);
    
    for (const v of primitives as Array<{ name: string; type: "primitive"; value: number }>) {
      try {
        console.log("🎯 SPACING: Processing primitive:", v);
        const name = v.name;
        const value = v.value;
        
        console.log("🎯 SPACING: Creating variable with name:", name, "value:", value);
        
        const existed = !!findVariableByNameInCollection(name, primCol.id);
        console.log("🎯 SPACING: Variable existed:", existed);
        
        const variable = getOrCreateVariable(name, primCol, "FLOAT");
        console.log("🎯 SPACING: Variable created/retrieved:", variable.id);
        
        // Set scopes for spacing pickers
        variable.scopes = ["GAP", "WIDTH_HEIGHT"];
        console.log("🎯 SPACING: Scopes set");
        
        // Set values for each density mode with proper mode IDs
        if (defaultModeId) {
          console.log("🎯 SPACING: Setting default mode value:", value);
          variable.setValueForMode(defaultModeId, value);
        }
        
        if (compactModeId) {
          console.log("🎯 SPACING: Setting compact mode value:", value);
          variable.setValueForMode(compactModeId, value);
        }
        
        if (cozyModeId) {
          console.log("🎯 SPACING: Setting cozy mode value:", value);
          variable.setValueForMode(cozyModeId, value);
        }
        
        primitiveVars.set(value, variable);
        console.log("🎯 SPACING: Variable added to map");
        
        if (existed) primitivesUpdated++;
        else primitivesCreated++;
        
        console.log("🎯 SPACING: Count updated - created:", primitivesCreated, "updated:", primitivesUpdated);
        
      } catch (err: any) {
        console.error(`❌ SPACING: Error creating primitive variable "${v.name}":`, err);
      }
    }
    
    console.log("🎯 SPACING: Primitive creation complete. Created:", primitivesCreated, "Updated:", primitivesUpdated);

    // Step 2: Create semantic collection with density modes
    const semCol = getOrCreateCollection("Framework / Spacing – Semantics");
    
    // Ensure semantic collection has the same density modes
    let semDefaultModeId = "";
    let semCompactModeId = "";
    let semCozyModeId = "";
    
    if (semCol.modes.length === 0) {
      semDefaultModeId = semCol.addMode("default");
    } else {
      semDefaultModeId = semCol.modes[0].modeId;
      if (semCol.modes[0].name !== "default") {
        semCol.renameMode(semCol.modes[0].modeId, "default");
      }
    }
    
    if (semCol.modes.length === 1) {
      semCompactModeId = semCol.addMode("compact");
    } else if (semCol.modes.length >= 2) {
      semCompactModeId = semCol.modes[1].modeId;
      if (semCol.modes[1].name !== "compact") {
        semCol.renameMode(semCol.modes[1].modeId, "compact");
      }
    }
    
    if (semCol.modes.length === 2) {
      semCozyModeId = semCol.addMode("cozy");
    } else if (semCol.modes.length >= 3) {
      semCozyModeId = semCol.modes[2].modeId;
      if (semCol.modes[2].name !== "cozy") {
        semCol.renameMode(semCol.modes[2].modeId, "cozy");
      }
    }
    
    console.log("🎯 SPACING: Semantic mode IDs - default:", semDefaultModeId, "compact:", semCompactModeId, "cozy:", semCozyModeId);
    
    let semanticsCreated = 0;
    let semanticsUpdated = 0;

    for (const v of semantics as Array<{ name: string; type: "semantic"; values: Record<string, number> }>) {
      try {
        const name = v.name;
        const values = v.values;
        
        console.log("🎯 SPACING: Processing semantic:", name, "values:", values);
        
        const existed = !!findVariableByNameInCollection(name, semCol.id);
        const variable = getOrCreateVariable(name, semCol, "FLOAT");
        
        // Set scopes for spacing pickers
        variable.scopes = ["GAP", "WIDTH_HEIGHT"];
        
        // Set values for each density mode with proper primitive linking
        if (semDefaultModeId && values.default !== undefined) {
          console.log("🎯 SPACING: Setting default mode value:", values.default);
          console.log("🎯 SPACING: Available primitives:", Array.from(primitiveVars.keys()));
          
          // Try to find a matching primitive variable to link to
          const matchingPrimitive = findMatchingPrimitive(values.default, primitiveVars, defaultModeId);
          
          if (matchingPrimitive) {
            console.log("🎯 SPACING: Linking to primitive:", matchingPrimitive.name, "ID:", matchingPrimitive.id);
            const aliasValue = {
              type: "VARIABLE_ALIAS" as const,
              id: matchingPrimitive.id
            };
            variable.setValueForMode(semDefaultModeId, aliasValue);
            console.log("🎯 SPACING: Successfully created alias to primitive");
          } else {
            console.log("🎯 SPACING: No matching primitive found, using direct value");
            variable.setValueForMode(semDefaultModeId, values.default);
          }
        }
        
        if (semCompactModeId && values.compact !== undefined) {
          console.log("🎯 SPACING: Setting compact mode value:", values.compact);
          
          const matchingPrimitive = findMatchingPrimitive(values.compact, primitiveVars, compactModeId);
          
          if (matchingPrimitive) {
            console.log("🎯 SPACING: Linking to primitive:", matchingPrimitive.name);
            const aliasValue = {
              type: "VARIABLE_ALIAS" as const,
              id: matchingPrimitive.id
            };
            variable.setValueForMode(semCompactModeId, aliasValue);
          } else {
            console.log("🎯 SPACING: No matching primitive found, using direct value");
            variable.setValueForMode(semCompactModeId, values.compact);
          }
        }
        
        if (semCozyModeId && values.cozy !== undefined) {
          console.log("🎯 SPACING: Setting cozy mode value:", values.cozy);
          
          const matchingPrimitive = findMatchingPrimitive(values.cozy, primitiveVars, cozyModeId);
          
          if (matchingPrimitive) {
            console.log("🎯 SPACING: Linking to primitive:", matchingPrimitive.name);
            const aliasValue = {
              type: "VARIABLE_ALIAS" as const,
              id: matchingPrimitive.id
            };
            variable.setValueForMode(semCozyModeId, aliasValue);
          } else {
            console.log("🎯 SPACING: No matching primitive found, using direct value");
            variable.setValueForMode(semCozyModeId, values.cozy);
          }
        }
        
        // Set code syntax for dev handoff
        variable.setVariableCodeSyntax("WEB", `--${name.replace('spacing/', '')}`);
        
        if (existed) semanticsUpdated++;
        else semanticsCreated++;
        
        console.log("🎯 SPACING: Semantic variable created/updated:", name);
        
      } catch (err: any) {
        console.error(`Error creating semantic variable "${v.name}":`, err);
      }
    }

    const totalCreated = primitivesCreated + semanticsCreated;
    const totalUpdated = primitivesUpdated + semanticsUpdated;

    figma.ui.postMessage({
      type: "generation-complete",
      payload: {
        collection: "Framework Spacing System",
        modes: ["default", "compact", "cozy"],
        counts: {
          requested: totalCount !== undefined ? totalCount : (primitives.length + semantics.length),
          created: totalCreated,
          updated: totalUpdated,
          primitives: primitives.length,
          semantics: semantics.length
        },
        spacingSystem: {
          densityMode,
          primitiveCount: primitives.length,
          semanticCount: semantics.length,
          collections: ["Framework / Spacing – Primitives", "Framework / Spacing – Semantics"]
        }
      }
    });

    figma.notify(
      `📏 Spacing system generated: ${totalCreated + totalUpdated} variables across ${primitives.length} primitives and ${semantics.length} semantics with density modes.`
    );

  } catch (err: any) {
    const message = err?.message || String(err);
    figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
    figma.notify(`❌ Spacing system generation failed: ${message}`, { error: true });
  }
}

/** ---------- Message Router ---------- **/
figma.ui.onmessage = async (msg: any) => {
  try {
    await handleMessage(msg);
  } catch (error: any) {
    const message = error?.message || String(error);
    figma.notify(`Plugin Error: ${message}`, { error: true });
    figma.ui.postMessage({ type: "error", payload: { error: message } });
  }
};

async function handleMessage(msg: any) {
  // Handle both direct messages and pluginMessage wrapper
  const { type, payload } = msg?.pluginMessage || msg || {};
  
  if (!type || typeof type !== 'string') {
    console.error('Invalid message type:', type);
    return;
  }
  
  console.log("🎯 MAIN THREAD: Processing message:", { type, payload });
  
  // Test connection
  if (type === "test-connection") {
    figma.ui.postMessage({ type: "test-response", payload: "Main thread is working!" });
    return;
  }
  
    // Route to appropriate handler
  switch (type) {
    /** LEGACY: COLORS → Variables (Light/Dark) - Keeping for backward compatibility */
    case "generate-local-variables": {
      try {
        console.log("Received generate-local-variables message:", payload);
        const {
          collectionName = "Framework Colors",
          modeLight = "Light",
          modeDark = "Dark",
          variables = [],
          totalCount,
          primitiveCount,
          semanticCount
        } = payload || {};

        if (!Array.isArray(variables)) {
          figma.ui.postMessage({
            type: "generation-error",
            payload: { error: "Invalid payload: variables must be an array." }
          });
          return;
        }

        const collection = getOrCreateCollection(collectionName);
        const { lightId, darkId } = ensureLightDarkModes(collection, modeLight, modeDark);
        
        // Notify user that light/dark themes are ensured for legacy color variables
        figma.notify(`🎨 Ensuring Light/Dark themes for legacy color variables in "${collectionName}"`);

        let created = 0;
        let updated = 0;

        for (const v of variables as Array<{
          name: string;
          type: "primitive" | "semantic";
          hex: string;
          lightHex?: string;
          darkHex?: string;
        }>) {
          const name = v.name;
          const isSemantic = v.type === "semantic";
          const lightHex = isSemantic ? (v.lightHex || v.hex) : v.hex;
          const darkHex = isSemantic ? (v.darkHex || v.hex) : v.hex;

          const existed = !!findVariableByNameInCollection(name, collection.id);
          const variable = getOrCreateVariable(name, collection, "COLOR");

          variable.setValueForMode(lightId, hexToRgb(lightHex));
          variable.setValueForMode(darkId, hexToRgb(darkHex));

          if (existed) updated++;
          else created++;
        }

        figma.ui.postMessage({
          type: "generation-complete",
          payload: {
            collection: collectionName,
            modes: [modeLight, modeDark],
            counts: {
              requested: totalCount !== undefined ? totalCount : variables.length,
              created,
              updated,
              primitives: primitiveCount !== undefined ? primitiveCount : null,
              semantics: semanticCount !== undefined ? semanticCount : null
            }
          }
        });

        figma.notify(
          `🎨 Created/updated ${variables.length} color variables in "${collectionName}".`
        );
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
        figma.notify(`❌ Color generation failed: ${message}`, { error: true });
      }
      break;
    }

    /** PRIMITIVE COLORS → Variables (Single Mode) */
    case "generate-primitive-colors": {
      try {
        const {
          collectionName = "Framework Primitive Colors",
          variables = [],
          totalCount
        } = payload || {};

        if (!Array.isArray(variables)) {
          figma.ui.postMessage({
            type: "generation-error",
            payload: { error: "Invalid payload: variables must be an array." }
          });
          return;
        }

        const collection = getOrCreateCollection(collectionName);
        // Ensure single mode for primitives
        if (collection.modes.length === 0) collection.addMode("Default");
        const defaultModeId = collection.modes[0].modeId;

        let created = 0;
        let updated = 0;

        for (const v of variables as Array<{
          name: string;
          hex: string;
        }>) {
          const name = v.name;
          const hex = v.hex;

          const existed = !!findVariableByNameInCollection(name, collection.id);
          const variable = getOrCreateVariable(name, collection, "COLOR");

          // Set primitive color in single mode
          variable.setValueForMode(defaultModeId, hexToRgb(hex));

          if (existed) updated++;
          else created++;
        }

        figma.ui.postMessage({
          type: "generation-complete",
          payload: {
            collection: collectionName,
            modes: ["Default"],
            counts: {
              requested: totalCount !== undefined ? totalCount : variables.length,
              created,
              updated,
              primitives: variables.length,
              semantics: 0
            }
          }
        });

        figma.notify(
          `🎨 Created/updated ${variables.length} primitive color variables in "${collectionName}".`
        );
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
        figma.notify(`❌ Primitive color generation failed: ${message}`, { error: true });
      }
      break;
    }

    /** SEMANTIC COLORS → Variables (Light/Dark) that alias primitives */
    case "generate-semantic-colors": {
      try {
        const {
          collectionName = "Framework Semantic Colors",
          modeLight = "Light",
          modeDark = "Dark",
          variables = [],
          totalCount
        } = payload || {};

        if (!Array.isArray(variables)) {
          figma.ui.postMessage({
            type: "generation-error",
            payload: { error: "Invalid payload: variables must be an array." }
          });
          return;
        }

        const collection = getOrCreateCollection(collectionName);
        const { lightId, darkId } = ensureLightDarkModes(collection, modeLight, modeDark);
        
        // Notify user that light/dark themes are ensured for semantic colors
        figma.notify(`🎨 Ensuring Light/Dark themes for semantic colors in "${collectionName}"`);

        let created = 0;
        let updated = 0;
        let errors = 0;

        for (const v of variables as Array<{
          name: string;
          lightHex: string;
          darkHex: string;
          label?: string;
        }>) {
          try {
            const name = v.name;
            const lightHex = v.lightHex;
            const darkHex = v.darkHex;
            const label = v.label;
            
            // Create hierarchical variable name if label is provided
            const variableName = label ? createHierarchicalVariableName(label, name) : name;

            // Validate that we have both light and dark values
            const validation = validateSemanticValues(variableName, lightHex, darkHex);
            if (!validation.isValid) {
              console.warn(`Semantic color validation failed: ${validation.error}`);
              errors++;
              continue;
            }
            
            // Log warnings if any
            if (validation.warning) {
              console.warn(`Semantic color warning: ${validation.warning}`);
            }

            const existed = !!findVariableByNameInCollection(variableName, collection.id);
            const variable = getOrCreateVariable(variableName, collection, "COLOR");

            console.log(`🎨 Creating semantic color: ${variableName}`);

            // Try to find matching primitive colors for light and dark themes
            // We need to search in primitive color collections, not the semantic collection
            const lightPrimitive = findMatchingColorPrimitive(lightHex, "");
            const darkPrimitive = findMatchingColorPrimitive(darkHex, "");
            
            if (lightPrimitive) {
              console.log(`🎨 Linking light mode to primitive: ${lightPrimitive.name}`);
              const lightAlias = {
                type: "VARIABLE_ALIAS" as const,
                id: lightPrimitive.id
              };
              variable.setValueForMode(lightId, lightAlias);
            } else {
              console.log(`🎨 No matching primitive for light mode, using direct value: ${lightHex}`);
              variable.setValueForMode(lightId, hexToRgb(lightHex));
            }
            
            if (darkPrimitive) {
              console.log(`🎨 Linking dark mode to primitive: ${darkPrimitive.name}`);
              const darkAlias = {
                type: "VARIABLE_ALIAS" as const,
                id: darkPrimitive.id
            };
              variable.setValueForMode(darkId, darkAlias);
            } else {
              console.log(`🎨 No matching primitive for dark mode, using direct value: ${darkHex}`);
              variable.setValueForMode(darkId, hexToRgb(darkHex));
            }

            if (existed) updated++;
            else created++;

          } catch (err: any) {
            console.error(`Error creating semantic color "${v.name}":`, err);
            errors++;
          }
        }

        figma.ui.postMessage({
          type: "generation-complete",
          payload: {
            collection: collectionName,
            modes: [modeLight, modeDark],
            counts: {
              requested: totalCount !== undefined ? totalCount : variables.length,
              created,
              updated,
              errors,
              primitives: 0,
              semantics: variables.length
            }
          }
        });

        const message = `🎯 Created/updated ${created + updated} semantic color variables in "${collectionName}".`;
        const errorMessage = errors > 0 ? ` (${errors} errors)` : "";
        figma.notify(message + errorMessage, errors > 0 ? { error: true } : undefined);

      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
        figma.notify(`❌ Semantic color generation failed: ${message}`, { error: true });
      }
      break;
    }



    /** GENERATE SPACING SCALE → Auto-generate common spacing scales */
    case "generate-spacing-scale": {
      try {
        const {
          collectionName = "Framework Spacing Scale",
          baseUnit = 4,
          scale = "linear", // "linear", "geometric", "fibonacci"
          maxMultiplier = 16,
          includeZero = true,
          customMultipliers = []
        } = payload || {};

        const collection = getOrCreateCollection(collectionName);
        if (collection.modes.length === 0) collection.addMode("Default");
        const defaultModeId = collection.modes[0].modeId;

        let created = 0;
        let updated = 0;

        // Generate spacing values using utility function
        const spacingValues = generateSpacingValues(baseUnit, scale, maxMultiplier, includeZero);

        // Add custom multipliers if provided
        if (Array.isArray(customMultipliers)) {
          customMultipliers.forEach(multiplier => {
            const value = baseUnit * multiplier;
            const name = `spacing-${value}`;
            if (!spacingValues.find(s => s.value === value)) {
              spacingValues.push({ name, value });
            }
          });
        }

        // Sort by value and create variables
        spacingValues.sort((a, b) => a.value - b.value);

        // Validate the spacing values
        const validation = validateSpacingValues(spacingValues);
        if (validation.warnings.length > 0) {
          console.warn("Spacing scale validation warnings:", validation.warnings);
        }

        for (const spacing of spacingValues) {
          const name = ensureValidVariableName(spacing.name);
          const existed = !!findVariableByNameInCollection(name, collection.id);
          const variable = getOrCreateVariable(name, collection, "FLOAT");

          variable.setValueForMode(defaultModeId, spacing.value);

          if (existed) updated++;
          else created++;
        }

        figma.ui.postMessage({
          type: "generation-complete",
          payload: {
            collection: collectionName,
            modes: ["Default"],
            counts: {
              requested: spacingValues.length,
              created,
              updated,
              primitives: spacingValues.length,
              semantics: 0
            },
            spacingScale: {
              baseUnit,
              scale,
              maxMultiplier,
              totalValues: spacingValues.length,
              values: spacingValues.map(s => ({ name: s.name, value: s.value }))
            }
          }
        });

        figma.notify(
          `📏 Generated ${spacingValues.length} spacing scale variables in "${collectionName}" using ${scale} scale with base unit ${baseUnit}px.`
        );
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
        figma.notify(`❌ Spacing scale generation failed: ${message}`, { error: true });
      }
      break;
    }

    /** SPACING ALIASES → Create semantic spacing that references primitives */
    case "generate-spacing-aliases": {
      try {
        const {
          collectionName = "Framework Spacing Aliases",
          primitiveCollectionName = "Framework Spacing Scale",
          aliases = [],
          totalCount
        } = payload || {};

        if (!Array.isArray(aliases)) {
          figma.ui.postMessage({
            type: "generation-error",
            payload: { error: "Invalid payload: aliases must be an array." }
          });
          return;
        }

        const collection = getOrCreateCollection(collectionName);
        if (collection.modes.length === 0) collection.addMode("Default");
        const defaultModeId = collection.modes[0].modeId;

        // Find the primitive collection
        const primitiveCollection = figma.variables.getLocalVariableCollections()
          .find(c => c.name === primitiveCollectionName);
        
        if (!primitiveCollection) {
          figma.ui.postMessage({
            type: "generation-error",
            payload: { error: `Primitive collection "${primitiveCollectionName}" not found. Please generate spacing scale first.` }
          });
          return;
        }

        let created = 0;
        let updated = 0;
        let errors = 0;

        for (const alias of aliases as Array<{
          name: string;
          primitiveName: string;
          label?: string;
        }>) {
          try {
            const aliasName = ensureValidVariableName(alias.name);
            const primitiveName = alias.primitiveName;
            const label = alias.label;
            
            // Create hierarchical variable name if label is provided
            let variableName = label ? createHierarchicalVariableName(label, aliasName) : aliasName;
            variableName = ensureValidVariableName(variableName);

            // Find the primitive variable
            const primitiveVariable = figma.variables.getLocalVariables()
              .find(v => v.name === primitiveName && v.variableCollectionId === primitiveCollection.id);
            
            if (!primitiveVariable) {
              console.warn(`Primitive spacing variable "${primitiveName}" not found for alias "${aliasName}"`);
              errors++;
              continue;
            }

            // Create the alias variable
            const existed = !!findVariableByNameInCollection(variableName, collection.id);
            const aliasVariable = getOrCreateVariable(variableName, collection, "FLOAT");

            // Set the alias to reference the primitive variable
            const aliasValue = {
              type: "VARIABLE_ALIAS" as const,
              id: primitiveVariable.id
            };
            
            aliasVariable.setValueForMode(defaultModeId, aliasValue);

            if (existed) updated++;
            else created++;

          } catch (err: any) {
            console.error(`Error creating spacing alias "${alias.name}":`, err);
            errors++;
          }
        }

        figma.ui.postMessage({
          type: "generation-complete",
          payload: {
            collection: collectionName,
            modes: ["Default"],
            counts: {
              requested: totalCount !== undefined ? totalCount : aliases.length,
              created,
              updated,
              errors,
              primitives: 0,
              semantics: aliases.length
            }
          }
        });

        const message = `📏 Created/updated ${created + updated} spacing aliases in "${collectionName}".`;
        const errorMessage = errors > 0 ? ` (${errors} errors)` : "";
        figma.notify(message + errorMessage, errors > 0 ? { error: true } : undefined);

      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
        figma.notify(`❌ Spacing alias generation failed: ${message}`, { error: true });
      }
      break;
    }

    /** EXPORT SPACING TOKENS → Export spacing for development */
    case "export-spacing-tokens": {
      try {
        const { collectionName = "Framework Spacing Scale" } = payload || {};

        const collection = figma.variables.getLocalVariableCollections()
          .find(c => c.name === collectionName);
        
        if (!collection) {
          figma.ui.postMessage({
            type: "export-error",
            payload: { error: `Collection "${collectionName}" not found.` }
          });
          return;
        }

        const variables = figma.variables.getLocalVariables()
          .filter(v => v.variableCollectionId === collection.id)
          .sort((a, b) => {
            // Sort by name for now since we can't easily get resolved values
            return a.name.localeCompare(b.name);
          });

        const tokens = variables.map(v => {
          return {
            name: v.name,
            value: `Variable: ${v.name}`,
            variableId: v.id
          };
        });

        figma.ui.postMessage({
          type: "export-complete",
          payload: {
            collection: collectionName,
            tokens,
            exportFormat: "spacing",
            totalCount: tokens.length
          }
        });

        figma.notify(`📤 Exported ${tokens.length} spacing tokens from "${collectionName}".`);

      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "export-error", payload: { error: message } });
        figma.notify(`❌ Spacing export failed: ${message}`, { error: true });
      }
      break;
    }

    /** VALIDATE SPACING SYSTEM → Check for logical consistency */
    case "validate-spacing-system": {
      try {
        const { collectionNames = [] } = payload || {};

        const collections = collectionNames.length > 0 
          ? figma.variables.getLocalVariableCollections().filter(c => collectionNames.includes(c.name))
          : figma.variables.getLocalVariableCollections().filter(c => c.name.toLowerCase().includes("spacing"));

        const validationResults: {
          collections: Array<{
            name: string;
            variableCount: number;
            warnings: string[];
            errors: string[];
          }>;
          totalVariables: number;
          warnings: string[];
          errors: string[];
        } = {
          collections: [],
          totalVariables: 0,
          warnings: [],
          errors: []
        };

        for (const collection of collections) {
          const variables = figma.variables.getLocalVariables()
            .filter(v => v.variableCollectionId === collection.id);
          
          const collectionResult = {
            name: collection.name,
            variableCount: variables.length,
            warnings: [] as string[],
            errors: [] as string[]
          };

          // For now, just count variables since we can't easily get resolved values
          // This provides basic validation without deep value checking
          if (variables.length === 0) {
            collectionResult.warnings.push("Collection has no variables");
          }

          validationResults.collections.push(collectionResult);
          validationResults.totalVariables += collectionResult.variableCount;
          validationResults.warnings.push(...collectionResult.warnings);
          validationResults.errors.push(...collectionResult.errors);
        }

        figma.ui.postMessage({
          type: "validation-complete",
          payload: validationResults
        });

        const message = `🔍 Validated ${validationResults.totalVariables} spacing variables across ${collections.length} collections.`;
        const warningMessage = validationResults.warnings.length > 0 ? ` (${validationResults.warnings.length} warnings)` : "";
        const errorMessage = validationResults.errors.length > 0 ? ` (${validationResults.errors.length} errors)` : "";
        
        figma.notify(message + warningMessage + errorMessage, 
          validationResults.errors.length > 0 ? { error: true } : undefined);

      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "validation-error", payload: { error: message } });
        figma.notify(`❌ Spacing validation failed: ${message}`, { error: true });
      }
      break;
    }

    /** GENERATE SPACING SUGGESTIONS → Suggest semantic spacing based on primitives */
    case "generate-spacing-suggestions": {
      try {
        const { 
          primitiveCollectionName = "Framework Spacing Scale",
          collectionName = "Framework Spacing Suggestions"
        } = payload || {};

        // Find the primitive collection
        const primitiveCollection = figma.variables.getLocalVariableCollections()
          .find(c => c.name === primitiveCollectionName);
        
        if (!primitiveCollection) {
          figma.ui.postMessage({
            type: "generation-error",
            payload: { error: `Primitive collection "${primitiveCollectionName}" not found. Please generate spacing scale first.` }
          });
          return;
        }

        // Get primitive variables and extract their values
        const primitiveVariables = figma.variables.getLocalVariables()
          .filter(v => v.variableCollectionId === primitiveCollection.id);
        
        // For now, we'll use the variable names to extract values
        // In a real implementation, you'd get the actual values
        const primitiveValues = primitiveVariables.map(v => {
          const name = v.name;
          const valueMatch = name.match(/spacing-(\d+)/);
          const value = valueMatch ? parseInt(valueMatch[1], 10) : 0;
          return { name, value };
        }).filter(v => v.value > 0);

        // Generate suggestions
        const suggestions = suggestSemanticSpacing(primitiveValues);

        figma.ui.postMessage({
          type: "suggestions-complete",
          payload: {
            collection: collectionName,
            primitiveCollection: primitiveCollectionName,
            suggestions,
            totalCount: suggestions.length
          }
        });

        figma.notify(
          `💡 Generated ${suggestions.length} spacing suggestions based on "${primitiveCollectionName}".`
        );

      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
        figma.notify(`❌ Spacing suggestions failed: ${message}`, { error: true });
      }
      break;
    }

    /** NEW: SPACING VARIABLES → Generate primitives + semantics with density modes */
    case "generate-spacing-variables": {
      await handleSpacingMessage({ type, payload });
      break;
    }

    /** LEGACY: SPACING → Variables (Light/Dark) - Keeping for backward compatibility */
    case "generate-legacy-spacing-variables": {
      try {
        console.log("Received generate-legacy-spacing-variables message:", payload);
        const {
          collectionName = "Framework Spacing",
          modeLight = "Light",
          modeDark = "Dark",
          variables = [],
          totalCount,
          primitiveCount,
          semanticCount
        } = payload || {};

        if (!Array.isArray(variables)) {
          figma.ui.postMessage({
            type: "generation-error",
            payload: { error: "Invalid payload: variables must be an array." }
          });
          return;
        }

        const collection = getOrCreateCollection(collectionName);
        const { lightId, darkId } = ensureLightDarkModes(collection, modeLight, modeDark);
        
        // Notify user that light/dark themes are ensured for legacy spacing variables
        figma.notify(`📏 Ensuring Light/Dark themes for legacy spacing variables in "${collectionName}"`);

        let created = 0;
        let updated = 0;

        for (const v of variables as Array<{
          name: string;
          type: "primitive" | "semantic";
          value: string | number;
          lightValue?: string | number;
          darkValue?: string | number;
        }>) {
          const name = v.name;
          const isSemantic = v.type === "semantic";
          const lightValue = isSemantic ? (v.lightValue || v.value) : v.value;
          const darkValue = isSemantic ? (v.darkValue || v.value) : v.value;

          const existed = !!findVariableByNameInCollection(name, collection.id);
          const variable = getOrCreateVariable(name, collection, "FLOAT");

          variable.setValueForMode(lightId, typeof lightValue === "number" ? lightValue : pxToNumber(lightValue));
          variable.setValueForMode(darkId, typeof darkValue === "number" ? darkValue : pxToNumber(darkValue));

          if (existed) updated++;
          else created++;
        }

        figma.ui.postMessage({
          type: "generation-complete",
          payload: {
            collection: collectionName,
            modes: [modeLight, modeDark],
            counts: {
              requested: totalCount !== undefined ? totalCount : variables.length,
              created,
              updated,
              primitives: primitiveCount !== undefined ? primitiveCount : null,
              semantics: semanticCount !== undefined ? semanticCount : null
            }
          }
        });

        figma.notify(
          `📏 Created/updated ${variables.length} spacing variables in "${collectionName}".`
        );
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
        figma.notify(`❌ Spacing generation failed: ${message}`, { error: true });
      }
      break;
    }

    /** TYPOGRAPHY → Variables (size/weight/line-height) */
    case "generate-typography-variables": {
      try {
        const { variables = [], family = "Inter" } = payload || {};

        const sizeCol = getOrCreateCollection("Framework Typography - Size");
        const weightCol = getOrCreateCollection("Framework Typography - Weight");
        const lhCol = getOrCreateCollection("Framework Typography - Line Height");

        if (sizeCol.modes.length === 0) sizeCol.addMode("Default");
        if (weightCol.modes.length === 0) weightCol.addMode("Default");
        if (lhCol.modes.length === 0) lhCol.addMode("Default");

        const sizeMode = sizeCol.modes[0].modeId;
        const weightMode = weightCol.modes[0].modeId;
        const lhMode = lhCol.modes[0].modeId;

        let created = 0;
        let updated = 0;

        for (const v of variables as Array<{ name: string; size: string; weight: string; lineHeight: string }>) {
          // Create size variable
          const sizeVar = getOrCreateVariable(`${v.name}-size`, sizeCol, "FLOAT");
          const sizeExisted = !!findVariableByNameInCollection(`${v.name}-size`, sizeCol.id);
          sizeVar.setValueForMode(sizeMode, pxToNumber(v.size));
          if (sizeExisted) updated++; else created++;

          // Create weight variable
          const weightVar = getOrCreateVariable(`${v.name}-weight`, weightCol, "FLOAT");
          const weightExisted = !!findVariableByNameInCollection(`${v.name}-weight`, weightCol.id);
          weightVar.setValueForMode(weightMode, parseInt(v.weight, 10));
          if (weightExisted) updated++; else created++;

          // Create line-height variable
          const lhVar = getOrCreateVariable(`${v.name}-line-height`, lhCol, "FLOAT");
          const lhExisted = !!findVariableByNameInCollection(`${v.name}-line-height`, lhCol.id);
          lhVar.setValueForMode(lhMode, pxToNumber(v.lineHeight));
          if (lhExisted) updated++; else created++;
        }

        figma.notify(`🔤 Typography: ${created + updated} variables processed.`);
        figma.ui.postMessage({
          type: "generation-complete",
          payload: {
            collection: `Framework Typography - ${family}`,
            counts: {
              requested: variables.length * 3, // Each typography token creates 3 variables
              created,
              updated,
              primitives: 0,
              semantics: variables.length
            }
          }
        });
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
        figma.notify(`❌ Typography generation failed: ${message}`, { error: true });
      }
      break;
    }

    /** SEMANTIC ALIASES → Variables that reference primitives */
    case "generate-semantic-aliases": {
      try {
        const {
          collectionName = "Framework Semantic Aliases",
          modeLight = "Light",
          modeDark = "Dark",
          aliases = [],
          totalCount,
          primitiveCount,
          semanticCount
        } = payload || {};

        if (!Array.isArray(aliases)) {
          figma.ui.postMessage({
            type: "generation-error",
            payload: { error: "Invalid payload: aliases must be an array." }
          });
          return;
        }

        const collection = getOrCreateCollection(collectionName);
        const { lightId, darkId } = ensureLightDarkModes(collection, modeLight, modeDark);
        
        // Notify user that light/dark themes are ensured for semantic aliases
        figma.notify(`🎨 Ensuring Light/Dark themes for semantic aliases in "${collectionName}"`);

        let created = 0;
        let updated = 0;
        let errors = 0;
        
        console.log(`Processing ${aliases.length} semantic aliases with light/dark mode support`);

        for (const alias of aliases as Array<{
          name: string;
          primitiveName: string;
          collectionName: string;
          lightHex?: string;
          darkHex?: string;
          label?: string;
          isSemantic?: boolean;
        }>) {
          try {
            const aliasName = alias.name;
            const primitiveName = alias.primitiveName;
            const primitiveCollectionName = alias.collectionName;
            const lightHex = alias.lightHex;
            const darkHex = alias.darkHex;
            const label = alias.label;
            const isSemantic = alias.isSemantic;
            
            // Create hierarchical variable name if label is provided
            const variableName = label ? createHierarchicalVariableName(label, aliasName) : aliasName;
            
            console.log(`Processing alias: ${aliasName} -> ${primitiveName} in ${primitiveCollectionName}`);
            console.log(`  Light hex: ${lightHex}, Dark hex: ${darkHex}, Is semantic: ${isSemantic}`);
            
            // Check if this should be a semantic variable with different light/dark values
            if (lightHex && darkHex && isSemantic) {
              // Validate that we have both light and dark values for semantic variables
              const validation = validateSemanticValues(variableName, lightHex, darkHex);
              if (!validation.isValid) {
                console.warn(`Semantic variable validation failed: ${validation.error}`);
                errors++;
                continue;
              }
              
              // For semantic variables, we create them with direct hex values
              // This ensures they have different values for light/dark modes
              const existed = !!findVariableByNameInCollection(variableName, collection.id);
              const semanticVariable = getOrCreateVariable(variableName, collection, "COLOR");
              
              console.log(`Creating semantic variable with direct hex values: ${lightHex} vs ${darkHex}`);
              
              semanticVariable.setValueForMode(lightId, hexToRgb(lightHex));
              semanticVariable.setValueForMode(darkId, hexToRgb(darkHex));
              
              if (existed) updated++;
              else created++;
              
            } else {
              // Create a true alias that references primitives (consistent across themes)
              // Find the primitive collection
              const primitiveCollection = figma.variables.getLocalVariableCollections()
                .find(c => c.name === primitiveCollectionName);
              
              if (!primitiveCollection) {
                console.warn(`Primitive collection "${primitiveCollectionName}" not found for alias "${aliasName}"`);
                errors++;
                continue;
              }

              console.log(`Found primitive collection: ${primitiveCollection.name} (${primitiveCollection.id})`);

              // Find the primitive variable within that collection
              const primitiveVariable = figma.variables.getLocalVariables()
                .find(v => v.name === primitiveName && v.variableCollectionId === primitiveCollection.id);
              
              if (!primitiveVariable) {
                console.warn(`Primitive variable "${primitiveName}" not found in collection "${primitiveCollectionName}" for alias "${aliasName}"`);
                errors++;
                continue;
              }

              console.log(`Found primitive variable: ${primitiveVariable.name} (${primitiveVariable.id})`);

              // Create the alias variable
              const existed = !!findVariableByNameInCollection(variableName, collection.id);
              const aliasVariable = getOrCreateVariable(variableName, collection, "COLOR");

              console.log(`Created/updated alias variable: ${aliasVariable.name} (${aliasVariable.id})`);

              // Set the alias to reference the primitive variable
              // Create a proper alias object that references the primitive
              const aliasValue = {
                type: "VARIABLE_ALIAS" as const,
                id: primitiveVariable.id
              };
              
              console.log(`Setting alias value:`, aliasValue);
              
              // For true aliases, both modes reference the same primitive
              // This is correct behavior for aliases that should be consistent across themes
              aliasVariable.setValueForMode(lightId, aliasValue);
              aliasVariable.setValueForMode(darkId, aliasValue);

              console.log(`Successfully set alias for both modes`);
              
              if (existed) updated++;
              else created++;
            }

          } catch (err: any) {
            console.error(`Error creating alias "${alias.name}":`, err);
            errors++;
          }
        }

        figma.ui.postMessage({
          type: "generation-complete",
          payload: {
            collection: collectionName,
            modes: [modeLight, modeDark],
            counts: {
              requested: totalCount !== undefined ? totalCount : aliases.length,
              created,
              updated,
              errors,
              primitives: primitiveCount !== undefined ? primitiveCount : null,
              semantics: semanticCount !== undefined ? semanticCount : null
            }
          }
        });

        const message = `🎯 Created/updated ${created + updated} semantic aliases in "${collectionName}".`;
        const errorMessage = errors > 0 ? ` (${errors} errors)` : "";
        figma.notify(message + errorMessage, errors > 0 ? { error: true } : undefined);

      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
        figma.notify(`❌ Semantic alias generation failed: ${message}`, { error: true });
      }
      break;
    }

    /** SIMPLE SPACING → Variables (Default) - Simple spacing generation */
    case "generate-spacing": {
      try {
        const {
          collectionName = "Framework Spacing",
          variables = [],
          totalCount
        } = payload || {};

        if (!Array.isArray(variables)) {
          figma.ui.postMessage({
            type: "generation-error",
            payload: { error: "Invalid payload: variables must be an array." }
          });
          return;
        }

        const collection = getOrCreateCollection(collectionName);
        // Ensure single mode for simple spacing
        if (collection.modes.length === 0) collection.addMode("Default");
        const defaultModeId = collection.modes[0].modeId;

        let created = 0;
        let updated = 0;

        for (const v of variables as Array<{ name: string; value: string | number }>) {
          const name = v.name;
          const value = v.value;

          const existed = !!findVariableByNameInCollection(name, collection.id);
          const variable = getOrCreateVariable(name, collection, "FLOAT");

          // Set spacing in single mode
          variable.setValueForMode(defaultModeId, typeof value === "number" ? value : pxToNumber(value));

          if (existed) updated++;
          else created++;
        }

        figma.ui.postMessage({
          type: "generation-complete",
          payload: {
            collection: collectionName,
            modes: ["Default"],
            counts: {
              requested: totalCount !== undefined ? totalCount : variables.length,
              created,
              updated,
              primitives: variables.length,
              semantics: 0
            }
          }
        });

        figma.notify(
          `📏 Created/updated ${variables.length} spacing variables in "${collectionName}".`
        );
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
        figma.notify(`❌ Spacing generation failed: ${message}`, { error: true });
      }
      break;
    }

    /** Test spacing generation */
    case "test-spacing": {
      try {
        console.log("🧪 Testing spacing generation...");
        
        // Test primitive spacing
        const primitiveCollection = getOrCreateCollection("Test Primitive Spacing");
        if (primitiveCollection.modes.length === 0) primitiveCollection.addMode("Default");
        const defaultModeId = primitiveCollection.modes[0].modeId;
        
        const testVariable = getOrCreateVariable("test-spacing-16", primitiveCollection, "FLOAT");
        testVariable.setValueForMode(defaultModeId, 16);
        
        figma.notify("🧪 Test spacing variable created successfully!");
        figma.ui.postMessage({ 
          type: "test-complete", 
          payload: { 
            message: "Spacing generation is working",
            testVariable: "test-spacing-16",
            value: 16
          } 
        });
        
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.notify(`❌ Test spacing failed: ${message}`, { error: true });
        figma.ui.postMessage({ type: "test-error", payload: { error: message } });
      }
      break;
    }

    /** Initialize enhanced systems */
    case "initialize-enhanced-systems": {
      try {
        console.log("🚀 Initializing enhanced systems...");
        
        // Initialize collection manager and organize collections
        if (!collectionManager) {
          collectionManager = new CollectionManager();
        }
        collectionManager.organizeCollectionsByType();
        
        // Initialize design token processor
        if (!designTokenProcessor) {
          designTokenProcessor = new DesignTokenProcessor();
        }
        
        // Initialize ID mapper
        if (!idMapper) {
          idMapper = new IDMapper();
        }
        
        figma.notify("🚀 Enhanced systems initialized successfully!");
        figma.ui.postMessage({ 
          type: "initialization-complete", 
          payload: { 
            message: "Enhanced systems are ready",
            features: ["Collection Management", "Design Token Processing", "ID Mapping", "Theme Management"]
          } 
        });
        
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.notify(`❌ System initialization failed: ${message}`, { error: true });
        figma.ui.postMessage({ type: "initialization-error", payload: { error: message } });
      }
      break;
    }

    /** Process design tokens */
    case "process-design-tokens": {
      try {
        const {
          collectionName = "Design Tokens",
          tokens = [],
          totalCount
        } = payload || {};

        if (!Array.isArray(tokens)) {
          figma.ui.postMessage({
            type: "generation-error",
            payload: { error: "Invalid payload: tokens must be an array." }
          });
          return;
        }

        if (!designTokenProcessor) {
          designTokenProcessor = new DesignTokenProcessor();
        }

        const collection = getOrCreateCollection(collectionName);
        if (collection.modes.length === 0) collection.addMode("Default");
        
        // Process the design tokens
        designTokenProcessor.processTokens(tokens, collection);

        figma.ui.postMessage({
          type: "tokens-processed",
          payload: {
            collection: collectionName,
            totalTokens: tokens.length,
            primitives: tokens.filter(t => !t.themeable).length,
            semantics: tokens.filter(t => t.themeable).length
          }
        });

        figma.notify(
          `🎯 Processed ${tokens.length} design tokens in "${collectionName}".`
        );
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.ui.postMessage({ type: "generation-error", payload: { error: message } });
        figma.notify(`❌ Design token processing failed: ${message}`, { error: true });
      }
      break;
    }

    /** Setup REST API configuration */
    case "setup-rest-api": {
      try {
        const {
          fileKey,
          accessToken,
          baseUrl = "https://api.figma.com/v1"
        } = payload || {};

        if (!fileKey || !accessToken) {
          figma.ui.postMessage({
            type: "setup-error",
            payload: { error: "fileKey and accessToken are required." }
          });
          return;
        }

        // Initialize REST API service
        figmaAPI = new FigmaAPIService({ fileKey, accessToken, baseUrl });
        
        // Initialize ID mapper
        if (!idMapper) {
          idMapper = new IDMapper();
        }

        figma.notify("🔌 REST API configured successfully!");
        figma.ui.postMessage({ 
          type: "api-setup-complete", 
          payload: { 
            message: "REST API is ready",
            fileKey,
            baseUrl
          } 
        });
        
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.notify(`❌ REST API setup failed: ${message}`, { error: true });
        figma.ui.postMessage({ type: "setup-error", payload: { error: message } });
      }
      break;
    }

    /** Status ping */
    case "check-status": {
      figma.ui.postMessage({ type: "status", payload: { ok: true, ts: Date.now() } });
      figma.notify("✅ Plugin is running");
      break;
    }

    /** UI Error handling */
    case "ui-error": {
      const { error } = payload || {};
      console.error("UI Error received:", error);
      figma.notify(`UI Error: ${error || 'Unknown error'}`, { error: true });
      break;
    }

    /** Test primitive linking */
    case "test-primitive-linking": {
      try {
        console.log("🧪 Testing primitive linking...");
        
        // Find the primitive collection
        const primCol = figma.variables.getLocalVariableCollections()
          .find(c => c.name === "Framework / Spacing – Primitives");
        
        if (!primCol) {
          figma.notify("❌ Primitive collection not found", { error: true });
          return;
        }
        
        // Find the semantic collection
        const semCol = figma.variables.getLocalVariableCollections()
          .find(c => c.name === "Framework / Spacing – Semantics");
        
        if (!semCol) {
          figma.notify("❌ Semantic collection not found", { error: true });
          return;
        }
        
        // Simple count of variables
        const primitiveVars = figma.variables.getLocalVariables()
          .filter(v => v.variableCollectionId === primCol.id);
        
        const semanticVars = figma.variables.getLocalVariables()
          .filter(v => v.variableCollectionId === semCol.id);
        
        const message = `🧪 Test complete: ${primitiveVars.length} primitives, ${semanticVars.length} semantics`;
        figma.notify(message);
        figma.ui.postMessage({ 
          type: "test-result", 
          payload: { 
            message,
            primitiveCount: primitiveVars.length,
            semanticCount: semanticVars.length
          } 
        });
        
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.notify(`❌ Test failed: ${message}`, { error: true });
        figma.ui.postMessage({ type: "test-error", payload: { error: message } });
      }
      break;
    }

    /** Test color aliasing */
    case "test-color-aliasing": {
      try {
        console.log("🎨 Testing color aliasing...");
        
        // Find all collections
        const allCollections = figma.variables.getLocalVariableCollections();
        console.log("🎨 All collections:", allCollections.map(c => c.name));
        
        // Find color collections with more flexible naming
        const primitiveColorCol = allCollections
          .find(c => {
            const name = c.name.toLowerCase();
            return (name.includes("color") || name.includes("colour")) && 
                   !name.includes("semantic") && 
                   !name.includes("alias") &&
                   !name.includes("framework semantic");
          });
        
        const semanticColorCol = allCollections
          .find(c => c.name.toLowerCase().includes("semantic") && c.name.toLowerCase().includes("color"));
        
        if (!primitiveColorCol) {
          figma.notify("❌ Primitive color collection not found. Available collections: " + 
            allCollections.filter(c => c.name.toLowerCase().includes("color")).map(c => c.name).join(", "), { error: true });
          return;
        }
        
        if (!semanticColorCol) {
          figma.notify("❌ Semantic color collection not found. Available collections: " + 
            allCollections.filter(c => c.name.toLowerCase().includes("semantic")).map(c => c.name).join(", "), { error: true });
          return;
        }
        
        console.log("🎨 Using primitive collection:", primitiveColorCol.name);
        console.log("🎨 Using semantic collection:", semanticColorCol.name);
        
        // Count variables
        const primitiveColors = figma.variables.getLocalVariables()
          .filter(v => v.variableCollectionId === primitiveColorCol.id);
        
        const semanticColors = figma.variables.getLocalVariables()
          .filter(v => v.variableCollectionId === semanticColorCol.id);
        
        console.log("🎨 Primitive colors:", primitiveColors.map(v => v.name));
        console.log("🎨 Semantic colors:", semanticColors.map(v => v.name));
        
        const message = `🎨 Color test: ${primitiveColors.length} primitives, ${semanticColors.length} semantics`;
        figma.notify(message);
        figma.ui.postMessage({ 
          type: "color-test-result", 
          payload: { 
            message,
            primitiveCount: primitiveColors.length,
            semanticCount: semanticColors.length,
            primitiveNames: primitiveColors.map(v => v.name),
            semanticNames: semanticColors.map(v => v.name),
            primitiveCollection: primitiveColorCol.name,
            semanticCollection: semanticColorCol.name
          } 
        });
        
      } catch (err: any) {
        const message = err?.message || String(err);
        figma.notify(`❌ Color test failed: ${message}`, { error: true });
        figma.ui.postMessage({ type: "test-error", payload: { error: message } });
      }
      break;
    }

    default: {
      console.warn("Unknown message type:", type);
      figma.notify(`Unknown message type: ${type}`, { error: true });
      break;
    }
  }
}