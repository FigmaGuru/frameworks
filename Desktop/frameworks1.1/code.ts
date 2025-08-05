// src/code.ts
// This file runs in Figma’s main thread

// 1. Show the React UI
figma.showUI(__html__, { width: 800, height: 600 });

// 2. Helper: convert "#rrggbb" → { r, g, b } with values in [0,1]
function hexToRgb(hex: string): RGB {
  const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!parsed) return { r: 0, g: 0, b: 0 };
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
      for (const { family, alias, hex } of payload as Array<{
        family: string;
        alias: string;
        hex: string;
      }>) {
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
      const presets = payload as Record<string, Record<string, string>>;
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

    // ─── FALLBACK ─────────────────────────────────────────────────
    default: {
      console.warn("Unknown message type:", type);
      break;
    }
  }
};