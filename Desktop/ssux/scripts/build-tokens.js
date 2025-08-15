import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the variables.json file
const variablesPath = path.join(__dirname, '../src/design/variables.json');
const variables = JSON.parse(fs.readFileSync(variablesPath, 'utf8'));

// Create output directories
const stylesDir = path.join(__dirname, '../src/styles');
if (!fs.existsSync(stylesDir)) {
  fs.mkdirSync(stylesDir, { recursive: true });
}

// Function to convert token names to valid CSS variable names
function toCssVarName(str) {
  // Replace forward slashes and spaces with hyphens and convert to kebab-case
  return str.replace(/[\/\s]/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// Function to extract color values from aliases
function resolveColorValue(variable, allVariables) {
  if (variable.isAlias && variable.value) {
    const { collection, name } = variable.value;
    const collectionData = allVariables.collections.find(c => c.name === collection);
    if (collectionData) {
      const mode = collectionData.modes?.[0]; // Get first mode for primitives
      if (mode) {
        const primitiveVar = mode.variables.find(v => v.name === name);
        if (primitiveVar && primitiveVar.value) {
          return primitiveVar.value;
        }
      }
    }
  }
  return variable.value;
}

// Generate color semantic CSS (light/dark themes)
function generateColorSemanticCSS() {
  const colorCollection = variables.collections.find(c => c.name === 'Color Semantic');
  if (!colorCollection) return '';

  let css = ':root {\n';
  
  colorCollection.modes.forEach(mode => {
    const themeName = mode.name === 'Light Mode' ? 'light' : 'dark';
    css += `\n  /* ${mode.name} */\n`;
    
    mode.variables.forEach(variable => {
      const colorValue = resolveColorValue(variable, variables);
      if (colorValue) {
        const cssVarName = `--${toCssVarName(variable.name)}`;
        css += `  ${cssVarName}: ${colorValue};\n`;
      }
    });
  });
  
  css += '}\n\n';
  
  // Add theme-specific overrides
  colorCollection.modes.forEach(mode => {
    const themeName = mode.name === 'Light Mode' ? 'light' : 'dark';
    css += `[data-theme="${themeName}"] {\n`;
    
    mode.variables.forEach(variable => {
      const colorValue = resolveColorValue(variable, variables);
      if (colorValue) {
        const cssVarName = `--${toCssVarName(variable.name)}`;
        css += `  ${cssVarName}: ${colorValue};\n`;
      }
    });
    
    css += '}\n\n';
  });
  
  return css;
}

// Generate product theme CSS
function generateProductThemeCSS() {
  const productCollection = variables.collections.find(c => c.name === 'SSDS Product Themes');
  if (!productCollection) return '';

  let css = '';
  
  productCollection.modes.forEach(mode => {
    const productName = mode.name.toLowerCase();
    css += `[data-product="${mode.name}"] {\n`;
    
    mode.variables.forEach(variable => {
      const value = resolveColorValue(variable, variables);
      if (value) {
        const cssVarName = `--${toCssVarName(variable.name)}`;
        css += `  ${cssVarName}: ${value};\n`;
      }
    });
    
    css += '}\n\n';
  });
  
  return css;
}

// Generate sizing and spacing CSS
function generateSizingCSS() {
  const sizingCollections = variables.collections.filter(c => 
    c.name.includes('Spacing') || c.name.includes('Sizing') || c.name.includes('Typography')
  );
  
  let css = ':root {\n';
  
  sizingCollections.forEach(collection => {
    css += `\n  /* ${collection.name} */\n`;
    
    collection.modes.forEach(mode => {
      mode.variables.forEach(variable => {
        if (variable.value && typeof variable.value === 'string') {
          const cssVarName = `--${toCssVarName(variable.name)}`;
          css += `  ${cssVarName}: ${variable.value};\n`;
        }
      });
    });
  });
  
  css += '}\n';
  return css;
}

// Generate the CSS files
const colorCSS = generateColorSemanticCSS();
const productCSS = generateProductThemeCSS();
const sizingCSS = generateSizingCSS();

// Write color semantic CSS
fs.writeFileSync(
  path.join(stylesDir, 'tokens.color.css'),
  colorCSS
);

// Write product theme CSS
fs.writeFileSync(
  path.join(stylesDir, 'tokens.product.css'),
  productCSS
);

// Write sizing CSS
fs.writeFileSync(
  path.join(stylesDir, 'tokens.sizing.css'),
  sizingCSS
);

console.log('✅ Token CSS files generated successfully!');
console.log('📁 Generated files:');
console.log('  - src/styles/tokens.color.css');
console.log('  - src/styles/tokens.product.css');
console.log('  - src/styles/tokens.sizing.css');
