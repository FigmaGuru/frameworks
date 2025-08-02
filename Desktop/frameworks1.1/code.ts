figma.showUI(__html__, { width: 1000, height: 700 });
// Store created primitives
const primitiveMap = new Map<string, Variable>();

figma.ui.onmessage = async (msg) => {
  if (msg.type === "preview-aliases") {
    const colors: { hex: string; name: string }[] = msg.payload;

    console.log("📥 Received preview request for", colors.length, "colors");

    // 1. Create primitive collection
    const collection = figma.variables.createVariableCollection("Primitives ●");
    const mode = collection.modes[0];
    primitiveMap.clear();

    for (const { name, hex } of colors) {
      const variable = figma.variables.createVariable(name, collection, "COLOR");
      variable.setValueForMode(mode.modeId, hexToRgb(hex));
      primitiveMap.set(name, variable);
    }

    // 2. Generate alias suggestions
    const aliases = generateDefaultAliases(Array.from(primitiveMap.keys()));

    // 3. Send to UI
    figma.ui.postMessage({
      type: "preview-ready",
      payload: aliases,
    });
  }

  if (msg.type === "confirm-aliases") {
    const mappings: { alias: string; primitiveName: string }[] = msg.payload;
    console.log("✅ Creating aliases:", mappings.length);

    const semanticCollection = figma.variables.createVariableCollection("Semantic ●");
    const mode = semanticCollection.modes[0];

    for (const { alias, primitiveName } of mappings) {
      const primitiveVar = primitiveMap.get(primitiveName);
      if (!primitiveVar) continue;

      const aliasVar = figma.variables.createVariable(alias, semanticCollection, "COLOR");
      aliasVar.setValueForMode(mode.modeId, {
        type: "VARIABLE_ALIAS",
        id: primitiveVar.id,
      });
    }

    figma.notify("🎉 Aliases created.");
    figma.closePlugin();
  }
};

// --- Utility: Convert hex to RGB ---
function hexToRgb(hex: string): RGB {
  const value = hex.replace("#", "");
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r: r / 255, g: g / 255, b: b / 255 };
}

// --- Utility: Generate default alias set ---
function generateDefaultAliases(primitiveNames: string[]) {
  // You can replace this with a smarter generator later
  return [
    { alias: "text-primary", primitiveName: "gray-900" },
    { alias: "text-muted", primitiveName: "gray-700" },
    { alias: "bg-primary", primitiveName: "white-100" },
    { alias: "border-subtle", primitiveName: "gray-300" },
    { alias: "icon-primary", primitiveName: "gray-800" },
  ];
}