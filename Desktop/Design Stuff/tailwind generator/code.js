/**
 * Interlink - Figma Plugin (Fixed Version)
 * 
 * This plugin extracts color styles from Figma and generates
 * Interlink color tokens (primitives and semantics).
 * 
 * FIXED: All async API calls now use proper async/await pattern
 */

// Plugin entry point - this is what runs when the plugin is launched
figma.on('run', () => {
  console.log('Plugin started');
  // Show the plugin UI
  figma.showUI(__html__, { width: 400, height: 700 });
});

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  console.log('Plugin received message:', msg.type);
  
  if (msg.type === 'generate-colors') {
    console.log('Starting color generation...');
    try {
      await generateColorTokens();
      console.log('Color generation completed successfully');
      // Send success message to UI
      figma.ui.postMessage({ type: 'success', message: 'Design tokens generated successfully!' });
    } catch (error) {
      console.error('Error in generateColorTokens:', error);
      figma.ui.postMessage({ type: 'error', message: 'Failed to generate tokens: ' + error.message });
    }
  } else if (msg.type === 'create-modes-and-variables') {
    await createLightDarkModesWithVariables();
  } else if (msg.type === 'resize') {
    console.log('Resizing UI to:', msg.width, 'x', msg.height);
    figma.ui.resize(msg.width, msg.height);
  } else if (msg.type === 'close-plugin') {
    console.log('Closing plugin after successful generation');
    figma.closePlugin('Design tokens generated successfully!');
  } else {
    console.log('Unknown message type:', msg.type);
  }
};

/**
 * Generate Interlink color tokens from Figma styles (FIXED VERSION)
 */
async function generateColorTokens() {
  try {
    console.log('Starting generateColorTokens function');
    
    // Remove existing collections using async API
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    for (const col of collections) {
      if (col.name === 'Primitives' || col.name === 'Semantics' || col.name === 'Effects') {
        console.log(`Removing existing collection: ${col.name}`);
        await figma.variables.deleteVariableCollection(col.id);
      }
    }

    // Create Primitives collection
    const primitivesCollection = figma.variables.createVariableCollection('🔴 Primitives');
    const modeId = primitivesCollection.modes[0].modeId;
    
    // Create basic color primitives
    const basicColors = {
      'color/blue/500': { r: 0.149, g: 0.388, b: 0.965, a: 1 },
      'color/blue/600': { r: 0.145, g: 0.388, b: 0.922, a: 1 },
      'color/gray/50': { r: 0.976, g: 0.98, b: 0.984, a: 1 },
      'color/gray/100': { r: 0.953, g: 0.957, b: 0.965, a: 1 },
      'color/gray/200': { r: 0.898, g: 0.906, b: 0.922, a: 1 },
      'color/gray/300': { r: 0.82, g: 0.843, b: 0.859, a: 1 },
      'color/gray/400': { r: 0.612, g: 0.639, b: 0.686, a: 1 },
      'color/gray/500': { r: 0.42, g: 0.435, b: 0.388, a: 1 },
      'color/gray/600': { r: 0.294, g: 0.333, b: 0.388, a: 1 },
      'color/gray/700': { r: 0.216, g: 0.255, b: 0.318, a: 1 },
      'color/gray/800': { r: 0.122, g: 0.137, b: 0.216, a: 1 },
      'color/gray/900': { r: 0.067, g: 0.094, b: 0.153, a: 1 },
      'color/white': { r: 1, g: 1, b: 1, a: 1 }
    };

    // Create primitive color variables
    for (const [name, color] of Object.entries(basicColors)) {
      const v = figma.variables.createVariable(
        name,
        primitivesCollection,
        'COLOR',
        { description: `Primitive color ${name}` }
      );
      v.setValueForMode(modeId, color);
    }

    // Create Semantics collection with Light/Dark modes
    const semanticsCollection = figma.variables.createVariableCollection('🎨 Colors');
    let lightMode = semanticsCollection.modes.find(m => m.name === 'Light');
    let darkMode = semanticsCollection.modes.find(m => m.name === 'Dark');
    
    let lightModeId = null;
    if (!lightMode) {
      lightModeId = semanticsCollection.modes[0].modeId;
      semanticsCollection.renameMode(lightModeId, 'Light');
    } else {
      lightModeId = lightMode.modeId;
    }
    
    var darkModeId;
    if (!darkMode) {
      darkModeId = semanticsCollection.addMode('Dark');
    } else {
      darkModeId = darkMode.modeId;
    }

    // Get all variables for efficient lookup
    const allVariables = await figma.variables.getLocalVariablesAsync();
    const primitiveVarMap = {};
    for (const v of allVariables) {
      primitiveVarMap[v.name] = v;
    }

    // Create semantic variables
    const semanticMappings = {
      'primary': { light: 'color/blue/500', dark: 'color/blue/300' },
      'secondary': { light: 'color/gray/500', dark: 'color/gray/300' },
      'background': { light: 'color/gray/50', dark: 'color/gray/900' },
      'surface': { light: 'color/white', dark: 'color/gray/800' },
      'text': { light: 'color/gray/900', dark: 'color/gray/50' },
      'border': { light: 'color/gray/300', dark: 'color/gray/600' }
    };

    for (const [semanticName, mapping] of Object.entries(semanticMappings)) {
      let v = allVariables.find(
        x => x.name === semanticName && x.variableCollectionId === semanticsCollection.id
      );
      
      if (!v) {
        v = await figma.variables.createVariable(
          semanticName,
          semanticsCollection,
          'COLOR',
          { description: `Semantic color ${semanticName}` }
        );
      }

      // Alias to primitive for Light mode
      const lightPrimitive = primitiveVarMap[mapping.light];
      if (lightPrimitive && lightPrimitive.id) {
        v.setValueForMode(lightModeId, { type: 'VARIABLE_ALIAS', id: lightPrimitive.id });
      }
      
      // Alias to primitive for Dark mode
      const darkPrimitive = primitiveVarMap[mapping.dark];
      if (darkPrimitive && darkPrimitive.id) {
        v.setValueForMode(darkModeId, { type: 'VARIABLE_ALIAS', id: darkPrimitive.id });
      }
    }

    // Tokens generated successfully
    console.log('All design tokens generated successfully!');

    // Show Figma native notification
    figma.notify('✅ Design tokens generated successfully!', { timeout: 3000 });

  } catch (error) {
    console.error('Error generating color tokens:', error);
    figma.notify('Failed to generate tokens: ' + error.message);
    throw error;
  }
}

/**
 * Create a variable collection with Light and Dark modes (FIXED VERSION)
 */
async function createLightDarkModesWithVariables() {
  try {
    // 1. Find or create the variable collection using async API
    const themeCollections = await figma.variables.getLocalVariableCollectionsAsync();
    let collection = themeCollections.find(c => c.name === "Theme Colors");
    if (!collection) {
      collection = figma.variables.createVariableCollection("Theme Colors");
    }

    // 2. Find or add Light and Dark modes
    let lightMode = collection.modes.find(m => m.name === "Light");
    let darkMode = collection.modes.find(m => m.name === "Dark");

    let lightModeId = null, darkModeId = null;
    if (!lightMode && collection.modes[0]) {
      lightModeId = collection.modes[0].modeId;
      collection.renameMode(lightModeId, "Light");
    } else if (lightMode) {
      lightModeId = lightMode.modeId;
    }
    if (!darkMode) {
      const newMode = collection.addMode("Dark");
      if (newMode) {
        darkModeId = newMode;
      }
    } else {
      darkModeId = darkMode.modeId;
    }
    if (!lightModeId || !darkModeId) {
      throw new Error('Light or Dark mode ID not initialized');
    }

    // 3. Define color values for each variable in both modes
    const colorVars = [
      {
        name: "background",
        light: { r: 0.976, g: 0.98, b: 0.984, a: 1 }, // gray-50
        dark:  { r: 0.067, g: 0.094, b: 0.153, a: 1 } // gray-900
      },
      {
        name: "surface",
        light: { r: 0.953, g: 0.957, b: 0.965, a: 1 }, // gray-100
        dark:  { r: 0.122, g: 0.137, b: 0.216, a: 1 } // gray-800
      },
      {
        name: "primary",
        light: { r: 0.149, g: 0.388, b: 0.965, a: 1 }, // blue-600
        dark:  { r: 0.255, g: 0.522, b: 0.961, a: 1 } // blue-400
      }
    ];

    // 4. Create or update variables using async API
    const allVariables = await figma.variables.getLocalVariablesAsync();
    for (const v of colorVars) {
      let variable = allVariables.find(
        x => x.name === v.name && x.variableCollectionId === collection.id
      );
      if (!variable) {
        variable = await figma.variables.createVariable(v.name, collection, "COLOR");
      }
      variable.setValueForMode(lightModeId, v.light);
      variable.setValueForMode(darkModeId, v.dark);
    }

    figma.closePlugin("Created Light and Dark theme variables successfully!");
  } catch (error) {
    console.error('Error in createLightDarkModesWithVariables:', error);
    figma.notify('Failed to create theme variables: ' + error.message);
    throw error;
  }
} 