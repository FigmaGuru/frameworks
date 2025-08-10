"use strict";
// src/code.ts
// This file runs in Figma’s main thread
// 1. Show the React UI
figma.showUI(__html__, { width: 600, height: 700 });
// 2. Helper: convert "#rrggbb" → { r, g, b } with values in [0,1]
function hexToRgb(hex) {
    const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!parsed)
        return { r: 0, g: 0, b: 0 };
    const [, rr, gg, bb] = parsed;
    return {
        r: parseInt(rr, 16) / 255,
        g: parseInt(gg, 16) / 255,
        b: parseInt(bb, 16) / 255,
    };
}
// 3. Listen for messages from the UI
figma.ui.onmessage = (msg) => {
    const { type, payload } = msg.pluginMessage;
    switch (type) {
        // ─── PRIMITIVES ───────────────────────────────────────────────
        case "generate-primitives": {
            // payload: Array<{ family: string; alias: string; hex: string }>
            for (const { family, alias, hex } of payload) {
                const style = figma.createPaintStyle();
                style.name = `${family}/${alias}`;
                style.paints = [
                    {
                        type: "SOLID",
                        color: hexToRgb(hex),
                    },
                ];
            }
            figma.notify("✨ Primitives generated");
            break;
        }
        // ─── SEMANTICS ────────────────────────────────────────────────
        case "generate-semantics": {
            // payload: Record<string, Record<string, string>>
            const presets = payload;
            for (const [group, map] of Object.entries(presets)) {
                for (const [alias, hex] of Object.entries(map)) {
                    const style = figma.createPaintStyle();
                    style.name = `Semantic/${group}/${alias}`;
                    style.paints = [
                        {
                            type: "SOLID",
                            color: hexToRgb(hex),
                        },
                    ];
                }
            }
            figma.notify("🔑 Semantics generated");
            break;
        }
        // ─── LOCAL VARIABLES ──────────────────────────────────────────
        case "generate-local-variables": {
            try {
                const { variables, totalCount, primitiveCount, semanticCount } = payload;
                console.log(`Generating ${totalCount} local variables (${primitiveCount} primitives, ${semanticCount} semantics)`);
                // Create or get the main collection
                let collection = figma.variables.getLocalVariableCollections().find(c => c.name === "Framework Colors");
                if (!collection) {
                    collection = figma.variables.createVariableCollection("Framework Colors");
                }
                // Create light and dark modes for semantics
                const lightMode = collection.modes.find(m => m.name === "Light") || collection.modes[0];
                let darkMode = collection.modes.find(m => m.name === "Dark");
                if (!darkMode && semanticCount > 0) {
                    darkMode = collection.addMode("Dark");
                }
                // Update mode names
                if (lightMode) {
                    collection.renameMode(lightMode.modeId, "Light");
                }
                let createdCount = 0;
                for (const variable of variables) {
                    try {
                        // Check if variable already exists
                        const existingVariable = figma.variables.getLocalVariables().find(v => v.name === variable.name);
                        let figmaVariable = existingVariable;
                        if (!figmaVariable) {
                            figmaVariable = figma.variables.createVariable(variable.name, collection, "COLOR");
                            createdCount++;
                        }
                        // Set the color values
                        const lightColor = hexToRgb(variable.lightHex || variable.hex);
                        figmaVariable.setValueForMode(lightMode.modeId, lightColor);
                        // Set dark mode value for semantics
                        if (variable.type === "semantic" && variable.darkHex && darkMode) {
                            const darkColor = hexToRgb(variable.darkHex);
                            figmaVariable.setValueForMode(darkMode.modeId, darkColor);
                        }
                    }
                    catch (varError) {
                        console.error(`Error creating variable ${variable.name}:`, varError);
                    }
                }
                figma.notify(`✨ Generated ${createdCount} local variables (${primitiveCount} primitives, ${semanticCount} semantics)`);
            }
            catch (error) {
                console.error("Error generating local variables:", error);
                figma.notify("❌ Error generating variables. Check console for details.");
            }
            break;
        }
        // ─── FALLBACK ─────────────────────────────────────────────────
        default: {
            console.warn("Unknown message type:", type);
            break;
        }
    }
};
