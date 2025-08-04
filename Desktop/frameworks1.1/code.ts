figma.showUI(__html__, { width: 1000, height: 700 });

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === "generate-variables") {
    const colors: { hex: string; alias: string; family: string; included: boolean }[] = msg.payload;

    console.log("📥 Received", colors.length, "colors from UI");

    // ✅ Only use checked colors
    const includedColors = colors.filter((c) => c.included);

    console.log("🎯 Creating variables for", includedColors.length, "included colors");
    console.table(
      includedColors.map((c) => ({
        primitive: `${c.family}-${c.alias}`,
        alias: c.alias,
        hex: c.hex,
        included: c.included,
      }))
    );

    // --- Step 1: Create Primitives ---
    const primitiveCollection = figma.variables.createVariableCollection("Primitives");
    const primitiveMode = primitiveCollection.modes[0];
    const primitiveMap = new Map<string, Variable>();

    for (const { hex, alias, family } of includedColors) {
      const primitiveName = `${family}-${alias}`;
      const variable = figma.variables.createVariable(primitiveName, primitiveCollection, "COLOR");
      variable.setValueForMode(primitiveMode.modeId, hexToRgb(hex));
      primitiveMap.set(primitiveName, variable);
    }

    // --- Step 2: Create Semantic Aliases ---
    const semanticCollection = figma.variables.createVariableCollection("Semantic");
    const semanticMode = semanticCollection.modes[0];

    for (const { alias, family } of includedColors) {
      const primitiveName = `${family}-${alias}`;
      const primitiveVar = primitiveMap.get(primitiveName);
      if (!primitiveVar) {
        console.warn("⚠️ Skipped: No primitive found for", primitiveName);
        continue;
      }

      const semanticVar = figma.variables.createVariable(alias, semanticCollection, "COLOR");
      semanticVar.setValueForMode(semanticMode.modeId, {
        type: "VARIABLE_ALIAS",
        id: primitiveVar.id,
      });
    }

    figma.notify("✅ Created primitives and semantic aliases.");
    figma.closePlugin();
  }
};

// --- Convert hex string to Figma RGB object ---
function hexToRgb(hex: string): RGB {
  const value = hex.replace("#", "");
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return {
    r: r / 255,
    g: g / 255,
    b: b / 255,
  };
}