"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

// code.ts
figma.showUI(__html__, { width: 1000, height: 700 });

figma.ui.onmessage = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    if (msg.type === "generate-variables") {
        const colors = msg.payload;

        // Create primitive collection
        const collection = figma.variables.createVariableCollection("Primitives");
        const mode = collection.modes[0];
        const primitiveMap = new Map();

        for (const item of colors) {
            const primitiveName = `${item.family}-${item.step}`;
            const variable = figma.variables.createVariable(primitiveName, collection, "COLOR");
            variable.setValueForMode(mode.modeId, hexToRgb(item.hex));
            primitiveMap.set(item.hex, variable);
        }

        // Create semantic collection
        const semanticCollection = figma.variables.createVariableCollection("Semantic");
        const semanticMode = semanticCollection.modes[0];

        for (const item of colors) {
            const target = primitiveMap.get(item.hex);
            if (!target) continue;
            const semantic = figma.variables.createVariable(item.alias, semanticCollection, "COLOR");
            semantic.setValueForMode(semanticMode.modeId, {
                type: "VARIABLE_ALIAS",
                id: target.id,
            });
        }

        figma.notify(`✅ Created ${colors.length} semantic colors.`);
        figma.closePlugin();
    }
});

// Convert hex to RGB
function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r / 255, g: g / 255, b: b / 255 };
}