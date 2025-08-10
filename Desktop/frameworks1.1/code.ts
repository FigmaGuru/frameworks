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

function getOrCreateCollection(name: string): VariableCollection {
  const existing = figma.variables.getLocalVariableCollections().find(c => c.name === name);
  return existing || figma.variables.createVariableCollection(name);
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

/** Search by name *within* a collection (names can repeat across collections) */
function findVariableByNameInCollection(name: string, collectionId: string): Variable | null {
  return figma.variables.getLocalVariables().find(
    v => v.name === name && v.variableCollectionId === collectionId
  ) || null;
}

function getOrCreateVariable(
  name: string,
  collection: VariableCollection,
  variableType: VariableResolvedDataType
): Variable {
  const existing = findVariableByNameInCollection(name, collection.id);
  if (existing) return existing;
  
  const v = figma.variables.createVariable(name, collection, variableType);
  
  // Note: Variable scopes are set to default in API 1.0.0
  // Users can manually adjust scopes in Figma if needed
  
  return v;
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
): { isValid: boolean; error?: string } {
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
    return {
      isValid: false,
      error: `Semantic variable "${name}" should have different values for light and dark themes. Current: ${lightHex} for both.`
    };
  }
  
  return { isValid: true };
}

/** ---------- Message Router ---------- **/
figma.ui.onmessage = (msg: any) => {
  // NOTE: UI posts with { pluginMessage: { type, payload } }.
  // Figma delivers the *inner* object here, so msg = { type, payload }.
  const { type, payload } = msg || {};
  
  console.log("Received message:", { type, payload });

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

            const existed = !!findVariableByNameInCollection(variableName, collection.id);
            const variable = getOrCreateVariable(variableName, collection, "COLOR");

            // Set semantic colors with different values for light/dark
            variable.setValueForMode(lightId, hexToRgb(lightHex));
            variable.setValueForMode(darkId, hexToRgb(darkHex));

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

    /** SPACING → Variables (Default) */
    case "generate-spacing-variables": {
      try {
        const {
          collectionName = "Framework Spacing",
          variables = [],
          totalCount,
          primitiveCount,
          semanticCount
        } = payload || {};

        const collection = getOrCreateCollection(collectionName);
        // Ensure at least one mode; keep default name
        if (collection.modes.length === 0) collection.addMode("Default");
        const defaultModeId = collection.modes[0].modeId;

        let created = 0;
        let updated = 0;

        for (const v of variables as Array<{ name: string; value: string | number }>) {
          const existed = !!findVariableByNameInCollection(v.name, collection.id);
          const variable = getOrCreateVariable(v.name, collection, "FLOAT");
          variable.setValueForMode(defaultModeId, typeof v.value === "number" ? v.value : pxToNumber(v.value));
          if (existed) updated++; else created++;
        }

        figma.notify(`📏 Spacing: ${created + updated} variables processed.`);
        figma.ui.postMessage({
          type: "generation-complete",
          payload: {
            collection: collectionName,
            counts: {
              requested: totalCount !== undefined ? totalCount : variables.length,
              created,
              updated,
              primitives: primitiveCount !== undefined ? primitiveCount : null,
              semantics: semanticCount !== undefined ? semanticCount : null
            }
          }
        });
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

    /** Status ping */
    case "check-status": {
      figma.ui.postMessage({ type: "status", payload: { ok: true, ts: Date.now() } });
      figma.notify("✅ Plugin is running");
      break;
    }

    default: {
      console.warn("Unknown message type:", type);
      break;
    }
  }
};