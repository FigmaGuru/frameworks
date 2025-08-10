// src/views/ColorsView.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import tailwindColors from "../lib/tailwind-colors.json";
import { 
  resolveSemanticColor, 
  validateSemanticColors, 
  getPrimitiveColors,
  findMatchingPrimitives,
  type SemanticPreset 
} from "../lib/colorUtils";
import Swatch from "../components/Swatch";
import Accordion from "../components/accordion";

const semanticPresets: SemanticPreset = {
  Surface: { 
    primary: { light: "slate-50", dark: "slate-900" }, // white, slate-900
    secondary: { light: "slate-100", dark: "slate-800" }, // slate-100, slate-800
    tertiary: { light: "slate-200", dark: "slate-700" }, // slate-200, slate-700
    quaternary: { light: "slate-300", dark: "slate-600" } // slate-300, slate-600
  },
  Text: { 
    primary: { light: "slate-950", dark: "slate-50" }, // slate-950, slate-50
    secondary: { light: "slate-700", dark: "slate-300" }, // slate-700, slate-300
    tertiary: { light: "slate-500", dark: "slate-400" }, // slate-500, slate-400
    quaternary: { light: "slate-400", dark: "slate-500" } // slate-400, slate-500
  },
  Icon: { 
    primary: { light: "slate-950", dark: "slate-50" }, // slate-950, slate-50
    secondary: { light: "slate-600", dark: "slate-400" }, // slate-600, slate-400
    tertiary: { light: "slate-500", dark: "slate-500" }, // slate-500, slate-500
    quaternary: { light: "slate-400", dark: "slate-600" } // slate-400, slate-600
  },
  Border: { 
    primary: { light: "slate-300", dark: "slate-600" }, // slate-300, slate-600
    secondary: { light: "slate-200", dark: "slate-700" }, // slate-200, slate-700
    tertiary: { light: "slate-100", dark: "slate-800" }, // slate-100, slate-800
    quaternary: { light: "slate-50", dark: "slate-900" } // slate-50, slate-900
  },
  Brand: {
    primary: { light: "blue-600", dark: "blue-400" },
    secondary: { light: "indigo-600", dark: "indigo-400" },
    accent: { light: "violet-600", dark: "violet-400" }
  },
  Elevation: {
    low: { light: "slate-100", dark: "slate-800" },
    medium: { light: "slate-200", dark: "slate-700" },
    high: { light: "slate-300", dark: "slate-600" },
    overlay: { light: "slate-900", dark: "slate-200" }
  },
  Alpha: { 
    "white-5": { light: "slate-50", dark: "slate-900" }, // slate-50, slate-900
    "white-10": { light: "slate-100", dark: "slate-800" }, // slate-100, slate-800
    "white-20": { light: "slate-200", dark: "slate-700" }, // slate-200, slate-700
    "black-5": { light: "slate-500", dark: "slate-400" }, // slate-500, slate-400
    "black-10": { light: "slate-600", dark: "slate-300" }, // slate-600, slate-300
    "black-20": { light: "slate-700", dark: "slate-200" }, // slate-700, slate-200
    "black-90": { light: "slate-950", dark: "slate-50" } // slate-950, slate-50
  },
  "States & Interaction": {
    "hover": { light: "slate-100", dark: "slate-700" }, // slate-100, slate-700
    "focus": { light: "blue-200", dark: "blue-800" }, // blue-200, blue-800
    "active": { light: "slate-200", dark: "slate-600" }, // slate-200, slate-600
    "selected": { light: "blue-200", dark: "blue-800" }, // blue-200, blue-800
    "disabled": { light: "slate-50", dark: "slate-800" } // slate-50, slate-800
  },
  "Status / Feedback": {
    "success": { light: "green-100", dark: "green-900" }, // green-100, green-900
    "warning": { light: "amber-100", dark: "amber-900" }, // amber-100, amber-900
    "error": { light: "red-100", dark: "red-900" }, // red-100, red-900
    "info": { light: "blue-100", dark: "blue-900" } // blue-100, blue-900
  },
  // NEW: All utility color families as semantic collections
  Slate: {
    "50": { light: "slate-50", dark: "slate-50" },
    "100": { light: "slate-100", dark: "slate-100" },
    "200": { light: "slate-200", dark: "slate-200" },
    "300": { light: "slate-300", dark: "slate-300" },
    "400": { light: "slate-400", dark: "slate-400" },
    "500": { light: "slate-500", dark: "slate-500" },
    "600": { light: "slate-600", dark: "slate-600" },
    "700": { light: "slate-700", dark: "slate-700" },
    "800": { light: "slate-800", dark: "slate-800" },
    "900": { light: "slate-900", dark: "slate-900" },
    "950": { light: "slate-950", dark: "slate-950" }
  },
  Gray: {
    "50": { light: "gray-50", dark: "gray-50" },
    "100": { light: "gray-100", dark: "gray-100" },
    "200": { light: "gray-200", dark: "gray-200" },
    "300": { light: "gray-300", dark: "gray-300" },
    "400": { light: "gray-400", dark: "gray-400" },
    "500": { light: "gray-500", dark: "gray-500" },
    "600": { light: "gray-600", dark: "gray-600" },
    "700": { light: "gray-700", dark: "gray-700" },
    "800": { light: "gray-800", dark: "gray-800" },
    "900": { light: "gray-900", dark: "gray-900" },
    "950": { light: "gray-950", dark: "gray-950" }
  },
  Zinc: {
    "50": { light: "zinc-50", dark: "zinc-50" },
    "100": { light: "zinc-100", dark: "zinc-100" },
    "200": { light: "zinc-200", dark: "zinc-200" },
    "300": { light: "zinc-300", dark: "zinc-300" },
    "400": { light: "zinc-400", dark: "zinc-400" },
    "500": { light: "zinc-500", dark: "zinc-500" },
    "600": { light: "zinc-600", dark: "zinc-600" },
    "700": { light: "zinc-700", dark: "zinc-700" },
    "800": { light: "zinc-800", dark: "zinc-800" },
    "900": { light: "zinc-900", dark: "zinc-900" },
    "950": { light: "zinc-950", dark: "zinc-950" }
  },
  Neutral: {
    "50": { light: "neutral-50", dark: "neutral-50" },
    "100": { light: "neutral-100", dark: "neutral-100" },
    "200": { light: "neutral-200", dark: "neutral-200" },
    "300": { light: "neutral-300", dark: "neutral-300" },
    "400": { light: "neutral-400", dark: "neutral-400" },
    "500": { light: "neutral-500", dark: "neutral-500" },
    "600": { light: "neutral-600", dark: "neutral-600" },
    "700": { light: "neutral-700", dark: "neutral-700" },
    "800": { light: "neutral-800", dark: "neutral-800" },
    "900": { light: "neutral-900", dark: "neutral-900" },
    "950": { light: "neutral-950", dark: "neutral-950" }
  },
  Stone: {
    "50": { light: "stone-50", dark: "stone-50" },
    "100": { light: "stone-100", dark: "stone-100" },
    "200": { light: "stone-200", dark: "stone-200" },
    "300": { light: "stone-300", dark: "stone-300" },
    "400": { light: "stone-400", dark: "stone-400" },
    "500": { light: "stone-500", dark: "stone-500" },
    "600": { light: "stone-600", dark: "stone-600" },
    "700": { light: "stone-700", dark: "stone-700" },
    "800": { light: "stone-800", dark: "stone-800" },
    "900": { light: "stone-900", dark: "stone-900" },
    "950": { light: "stone-950", dark: "stone-950" }
  },
  Red: {
    "50": { light: "red-50", dark: "red-50" },
    "100": { light: "red-100", dark: "red-100" },
    "200": { light: "red-200", dark: "red-200" },
    "300": { light: "red-300", dark: "red-300" },
    "400": { light: "red-400", dark: "red-400" },
    "500": { light: "red-500", dark: "red-500" },
    "600": { light: "red-600", dark: "red-600" },
    "700": { light: "red-700", dark: "red-700" },
    "800": { light: "red-800", dark: "red-800" },
    "900": { light: "red-900", dark: "red-900" },
    "950": { light: "red-950", dark: "red-950" }
  },
  Orange: {
    "50": { light: "orange-50", dark: "orange-50" },
    "100": { light: "orange-100", dark: "orange-100" },
    "200": { light: "orange-200", dark: "orange-200" },
    "300": { light: "orange-300", dark: "orange-300" },
    "400": { light: "orange-400", dark: "orange-400" },
    "500": { light: "orange-500", dark: "orange-500" },
    "600": { light: "orange-600", dark: "orange-600" },
    "700": { light: "orange-700", dark: "orange-700" },
    "800": { light: "orange-800", dark: "orange-800" },
    "900": { light: "orange-900", dark: "orange-900" },
    "950": { light: "orange-950", dark: "orange-950" }
  },
  Amber: {
    "50": { light: "amber-50", dark: "amber-50" },
    "100": { light: "amber-100", dark: "amber-100" },
    "200": { light: "amber-200", dark: "amber-200" },
    "300": { light: "amber-300", dark: "amber-300" },
    "400": { light: "amber-400", dark: "amber-400" },
    "500": { light: "amber-500", dark: "amber-500" },
    "600": { light: "amber-600", dark: "amber-600" },
    "700": { light: "amber-700", dark: "amber-700" },
    "800": { light: "amber-800", dark: "amber-800" },
    "900": { light: "amber-900", dark: "amber-900" },
    "950": { light: "amber-950", dark: "amber-950" }
  },
  Yellow: {
    "50": { light: "yellow-50", dark: "yellow-50" },
    "100": { light: "yellow-100", dark: "yellow-100" },
    "200": { light: "yellow-200", dark: "yellow-200" },
    "300": { light: "yellow-300", dark: "yellow-300" },
    "400": { light: "yellow-400", dark: "yellow-400" },
    "500": { light: "yellow-500", dark: "yellow-500" },
    "600": { light: "yellow-600", dark: "yellow-600" },
    "700": { light: "yellow-700", dark: "yellow-700" },
    "800": { light: "yellow-800", dark: "yellow-800" },
    "900": { light: "yellow-900", dark: "yellow-900" },
    "950": { light: "yellow-950", dark: "yellow-950" }
  },
  Lime: {
    "50": { light: "lime-50", dark: "lime-50" },
    "100": { light: "lime-100", dark: "lime-100" },
    "200": { light: "lime-200", dark: "lime-200" },
    "300": { light: "lime-300", dark: "lime-300" },
    "400": { light: "lime-400", dark: "lime-400" },
    "500": { light: "lime-500", dark: "lime-500" },
    "600": { light: "lime-600", dark: "lime-600" },
    "700": { light: "lime-700", dark: "lime-700" },
    "800": { light: "lime-800", dark: "lime-800" },
    "900": { light: "lime-900", dark: "lime-900" },
    "950": { light: "lime-950", dark: "lime-950" }
  },
  Green: {
    "50": { light: "green-50", dark: "green-50" },
    "100": { light: "green-100", dark: "green-100" },
    "200": { light: "green-200", dark: "green-200" },
    "300": { light: "green-300", dark: "green-300" },
    "400": { light: "green-400", dark: "green-400" },
    "500": { light: "green-500", dark: "green-500" },
    "600": { light: "green-600", dark: "green-600" },
    "700": { light: "green-700", dark: "green-700" },
    "800": { light: "green-800", dark: "green-800" },
    "900": { light: "green-900", dark: "green-900" },
    "950": { light: "green-950", dark: "green-950" }
  },
  Emerald: {
    "50": { light: "emerald-50", dark: "emerald-50" },
    "100": { light: "emerald-100", dark: "emerald-100" },
    "200": { light: "emerald-200", dark: "emerald-200" },
    "300": { light: "emerald-300", dark: "emerald-300" },
    "400": { light: "emerald-400", dark: "emerald-400" },
    "500": { light: "emerald-500", dark: "emerald-500" },
    "600": { light: "emerald-600", dark: "emerald-600" },
    "700": { light: "emerald-700", dark: "emerald-700" },
    "800": { light: "emerald-800", dark: "emerald-800" },
    "900": { light: "emerald-900", dark: "emerald-900" },
    "950": { light: "emerald-950", dark: "emerald-950" }
  },
  Teal: {
    "50": { light: "teal-50", dark: "teal-50" },
    "100": { light: "teal-100", dark: "teal-100" },
    "200": { light: "teal-200", dark: "teal-200" },
    "300": { light: "teal-300", dark: "teal-300" },
    "400": { light: "teal-400", dark: "teal-400" },
    "500": { light: "teal-500", dark: "teal-500" },
    "600": { light: "teal-600", dark: "teal-600" },
    "700": { light: "teal-700", dark: "teal-700" },
    "800": { light: "teal-800", dark: "teal-800" },
    "900": { light: "teal-900", dark: "teal-900" },
    "950": { light: "teal-950", dark: "teal-950" }
  },
  Cyan: {
    "50": { light: "cyan-50", dark: "cyan-50" },
    "100": { light: "cyan-100", dark: "cyan-100" },
    "200": { light: "cyan-200", dark: "cyan-200" },
    "300": { light: "cyan-300", dark: "cyan-300" },
    "400": { light: "cyan-400", dark: "cyan-400" },
    "500": { light: "cyan-500", dark: "cyan-500" },
    "600": { light: "cyan-600", dark: "cyan-600" },
    "700": { light: "cyan-700", dark: "cyan-700" },
    "800": { light: "cyan-800", dark: "cyan-800" },
    "900": { light: "cyan-900", dark: "cyan-900" },
    "950": { light: "cyan-950", dark: "cyan-950" }
  },
  Sky: {
    "50": { light: "sky-50", dark: "sky-50" },
    "100": { light: "sky-100", dark: "sky-100" },
    "200": { light: "sky-200", dark: "sky-200" },
    "300": { light: "sky-300", dark: "sky-300" },
    "400": { light: "sky-400", dark: "sky-400" },
    "500": { light: "sky-500", dark: "sky-500" },
    "600": { light: "sky-600", dark: "sky-600" },
    "700": { light: "sky-700", dark: "sky-700" },
    "800": { light: "sky-800", dark: "sky-800" },
    "900": { light: "sky-900", dark: "sky-900" },
    "950": { light: "sky-950", dark: "sky-950" }
  },
  Blue: {
    "50": { light: "blue-50", dark: "blue-50" },
    "100": { light: "blue-100", dark: "blue-100" },
    "200": { light: "blue-200", dark: "blue-200" },
    "300": { light: "blue-300", dark: "blue-300" },
    "400": { light: "blue-400", dark: "blue-400" },
    "500": { light: "blue-500", dark: "blue-500" },
    "600": { light: "blue-600", dark: "blue-600" },
    "700": { light: "blue-700", dark: "blue-700" },
    "800": { light: "blue-800", dark: "blue-800" },
    "900": { light: "blue-900", dark: "blue-900" },
    "950": { light: "blue-950", dark: "blue-950" }
  },
  Indigo: {
    "50": { light: "indigo-50", dark: "indigo-50" },
    "100": { light: "indigo-100", dark: "indigo-100" },
    "200": { light: "indigo-200", dark: "indigo-200" },
    "300": { light: "indigo-300", dark: "indigo-300" },
    "400": { light: "indigo-400", dark: "indigo-400" },
    "500": { light: "indigo-500", dark: "indigo-500" },
    "600": { light: "indigo-600", dark: "indigo-600" },
    "700": { light: "indigo-700", dark: "indigo-700" },
    "800": { light: "indigo-800", dark: "indigo-800" },
    "900": { light: "indigo-900", dark: "indigo-900" },
    "950": { light: "indigo-950", dark: "indigo-950" }
  },
  Violet: {
    "50": { light: "violet-50", dark: "violet-50" },
    "100": { light: "violet-100", dark: "violet-100" },
    "200": { light: "violet-200", dark: "violet-200" },
    "300": { light: "violet-300", dark: "violet-300" },
    "400": { light: "violet-400", dark: "violet-400" },
    "500": { light: "violet-500", dark: "violet-500" },
    "600": { light: "violet-600", dark: "violet-600" },
    "700": { light: "violet-700", dark: "violet-700" },
    "800": { light: "violet-800", dark: "violet-800" },
    "900": { light: "violet-900", dark: "violet-900" },
    "950": { light: "violet-950", dark: "violet-950" }
  },
  Purple: {
    "50": { light: "purple-50", dark: "purple-50" },
    "100": { light: "purple-100", dark: "purple-100" },
    "200": { light: "purple-200", dark: "purple-200" },
    "300": { light: "purple-300", dark: "purple-300" },
    "400": { light: "purple-400", dark: "purple-400" },
    "500": { light: "purple-500", dark: "purple-500" },
    "600": { light: "purple-600", dark: "purple-600" },
    "700": { light: "purple-700", dark: "purple-700" },
    "800": { light: "purple-800", dark: "purple-800" },
    "900": { light: "purple-900", dark: "purple-900" },
    "950": { light: "purple-950", dark: "purple-950" }
  },
  Fuchsia: {
    "50": { light: "fuchsia-50", dark: "fuchsia-50" },
    "100": { light: "fuchsia-100", dark: "fuchsia-100" },
    "200": { light: "fuchsia-200", dark: "fuchsia-200" },
    "300": { light: "fuchsia-300", dark: "fuchsia-300" },
    "400": { light: "fuchsia-400", dark: "fuchsia-400" },
    "500": { light: "fuchsia-500", dark: "fuchsia-500" },
    "600": { light: "fuchsia-600", dark: "fuchsia-600" },
    "700": { light: "fuchsia-700", dark: "fuchsia-700" },
    "800": { light: "fuchsia-800", dark: "fuchsia-800" },
    "900": { light: "fuchsia-900", dark: "fuchsia-900" },
    "950": { light: "fuchsia-950", dark: "fuchsia-950" }
  },
  Pink: {
    "50": { light: "pink-50", dark: "pink-50" },
    "100": { light: "pink-100", dark: "pink-100" },
    "200": { light: "pink-200", dark: "pink-200" },
    "300": { light: "pink-300", dark: "pink-300" },
    "400": { light: "pink-400", dark: "pink-400" },
    "500": { light: "pink-500", dark: "pink-500" },
    "600": { light: "pink-600", dark: "pink-600" },
    "700": { light: "pink-700", dark: "pink-700" },
    "800": { light: "pink-800", dark: "pink-800" },
    "900": { light: "pink-900", dark: "pink-900" },
    "950": { light: "pink-950", dark: "pink-950" }
  },
  Rose: {
    "50": { light: "rose-50", dark: "rose-50" },
    "100": { light: "rose-100", dark: "rose-100" },
    "200": { light: "rose-200", dark: "rose-200" },
    "300": { light: "rose-300", dark: "rose-300" },
    "400": { light: "rose-400", dark: "rose-400" },
    "500": { light: "rose-500", dark: "rose-500" },
    "600": { light: "rose-600", dark: "rose-600" },
    "700": { light: "rose-700", dark: "rose-700" },
    "800": { light: "rose-800", dark: "rose-800" },
    "900": { light: "rose-900", dark: "rose-900" },
    "950": { light: "rose-950", dark: "rose-950" }
  }
};

export default function ColorsView({ query = "" }: { query?: string }) {
  const [activeTab, setActiveTab] = useState<"primitives" | "semantics">("primitives");
  // Remove themeMode state since we're showing both themes
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Array<{name: string; type: string; lightHex?: string; darkHex?: string}>>([]);

  // Validate semantic colors and show any errors
  const validationErrors = useMemo(() => {
    return validateSemanticColors(semanticPresets);
  }, []);

  // 1) Build primitives once using utility function
  const groupedPrimitives = useMemo(() => {
    const primitives = getPrimitiveColors();
    const out: Record<string, any[]> = {};
    
    // Convert to the format expected by the component
    Object.entries(primitives).forEach(([family, items]) => {
      out[family] = items.map(item => ({
        step: item.step,
        hex: item.hex,
        originalHex: item.hex,
        alias: item.alias,
        included: true,
      }));
    });
    
    return out;
  }, []);

  // 2) State & refs
  const [primitives, setPrimitives] = useState(groupedPrimitives);
  const [openPrimitives, setOpenPrimitives] = useState<Record<string, boolean>>({});
  const primCheckboxRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [openSemantics, setOpenSemantics] = useState<Record<string, boolean>>(() => {
    const o: Record<string, boolean> = {};
    Object.keys(semanticPresets).forEach(g => (o[g] = true));
    Object.keys(groupedPrimitives).forEach(f => (o[f] = true));
    return o;
  });

  // 3) Find semantic tokens that use primitive colors using utility function
  const semanticToPrimitiveMap = useMemo(() => {
    const primitives = getPrimitiveColors();
    return findMatchingPrimitives(semanticPresets, primitives);
  }, []);

  // 4) Indeterminate checkboxes
  useEffect(() => {
    Object.entries(primitives).forEach(([f, items]) => {
      const el = primCheckboxRefs.current[f];
      if (!el) return;
      const count = items.filter(i => i.included).length;
      el.indeterminate = count > 0 && count < items.length;
    });
  }, [primitives]);

  // 5) Primitive handlers
  const togglePrimitive        = (f: string) => setOpenPrimitives(p => ({ ...p, [f]: !p[f] }));
  const togglePrimitiveInclude = (f: string, i: number) => { const c = { ...primitives }; c[f][i].included = !c[f][i].included; setPrimitives(c); };
  const toggleFamilyInclude    = (f: string) => { const c = { ...primitives }; const all = c[f].every(i => i.included); c[f].forEach(i => i.included = !all); setPrimitives(c); };

  // 6) Semantics handler
  const toggleSemantic = (g: string) => setOpenSemantics(p => ({ ...p, [g]: !p[g] }));

  // 7) Filter primitives
  const lower = query.toLowerCase();
  const filteredPrimitives = useMemo(() => {
    const out: Record<string, any[]> = {};
    Object.entries(primitives).forEach(([f, items]) => {
      const m = items.filter(c => c.alias.toLowerCase().includes(lower));
      if (m.length) out[f] = m;
    });
    return out;
  }, [primitives, lower]);

  // 8) Generate function for both primitives and semantics
  const generateVariables = () => {
    try {
      const variables: Array<{
        name: string;
        hex: string;
        type: "primitive" | "semantic";
        lightHex?: string;
        darkHex?: string;
        relatedPrimitives?: string[];
      }> = [];

      // Add included primitives
      Object.entries(primitives).forEach(([family, items]) => {
        if (Array.isArray(items)) {
          items.forEach(item => {
            if (item && item.included && item.alias && item.hex) {
              variables.push({
                name: item.alias,
                hex: item.hex,
                type: "primitive"
              });
            }
          });
        }
      });

      // Add semantic tokens (all of them)
      Object.entries(semanticPresets).forEach(([group, colors]) => {
        if (colors && typeof colors === 'object') {
          Object.entries(colors).forEach(([name, colorObj]) => {
            if (colorObj && typeof colorObj === 'object' && 'light' in colorObj && 'dark' in colorObj) {
              const semanticName = `${group.toLowerCase()}-${name}`;
              const lightHex = resolveSemanticColor(colorObj.light);
              const darkHex = resolveSemanticColor(colorObj.dark);
              variables.push({
                name: semanticName,
                hex: lightHex, // Default to light hex for display
                lightHex: lightHex,
                darkHex: darkHex,
                type: "semantic",
                relatedPrimitives: semanticToPrimitiveMap[semanticName] || []
              });
            }
          });
        }
      });

      console.log("Generated variables:", variables);
      console.log("Variables array type:", typeof variables);
      console.log("Variables array length:", variables.length);
      console.log("First few variables:", variables.slice(0, 3));
      
      // Log detailed structure of first variable
      if (variables.length > 0) {
        console.log("First variable detailed:", JSON.stringify(variables[0], null, 2));
        console.log("First variable keys:", Object.keys(variables[0]));
      }

      // Show loading state - find button by looking for text content
      const allButtons = document.querySelectorAll('button');
      const generateButton = Array.from(allButtons).find(btn => 
        btn.textContent && btn.textContent.includes('Generate')
      ) as HTMLButtonElement;
      
      if (generateButton) {
        const originalText = generateButton.textContent;
        generateButton.textContent = "Generating...";
        generateButton.disabled = true;
        
        // Reset button after a delay
        setTimeout(() => {
          generateButton.textContent = originalText;
          generateButton.disabled = false;
        }, 2000);
      }

      // Validate data structure before sending
      console.log("About to send message to parent...");
      console.log("Window parent exists:", !!window.parent);
      
      // Ensure variables is a proper array
      if (!Array.isArray(variables)) {
        throw new Error(`Variables is not an array, got: ${typeof variables}`);
      }
      
      // Validate each variable has required properties
      variables.forEach((variable, index) => {
        if (!variable || typeof variable !== 'object') {
          throw new Error(`Variable at index ${index} is invalid: ${variable}`);
        }
        if (!variable.name || !variable.hex || !variable.type) {
          throw new Error(`Variable at index ${index} missing required properties: ${JSON.stringify(variable)}`);
        }
      });

                      // Notify parent about variable generation
        console.log("Checking environment...");
        console.log("Window exists:", typeof window !== 'undefined');
        console.log("Window parent exists:", !!window.parent);
        console.log("Is in Figma plugin:", !!(window as any).figma);
        
        if (typeof window !== 'undefined' && window.parent) {
          // Create a clean, serializable version of the variables
          const cleanVariables = variables.map(v => ({
            name: v.name,
            hex: v.hex,
            type: v.type,
            lightHex: v.lightHex || v.hex,
            darkHex: v.darkHex || v.hex,
            relatedPrimitives: Array.isArray(v.relatedPrimitives) ? v.relatedPrimitives : []
          }));
          
          // Ensure all variables have proper light/dark values
          cleanVariables.forEach(v => {
            if (v.type === 'semantic') {
              // For semantic tokens, ensure both light and dark are set
              if (!v.lightHex) v.lightHex = v.hex;
              if (!v.darkHex) v.darkHex = v.hex;
            } else {
              // For primitive tokens, use the same hex for both modes
              v.lightHex = v.hex;
              v.darkHex = v.hex;
            }
          });
          
          // Step 1: Create primitive colors first
          const primitiveVariables = cleanVariables.filter(v => v.type === "primitive");
          if (primitiveVariables.length > 0) {
            const primitiveMessage = {
              type: "generate-primitive-colors",
              payload: {
                variables: primitiveVariables.map(v => ({
                  name: v.name,
                  hex: v.hex
                }))
              }
            };
            
            console.log("Sending primitive colors:", primitiveMessage);
            (window.parent as any).postMessage({
              pluginMessage: primitiveMessage
            }, "*");
          }
          
          // Step 2: Create semantic aliases that reference primitives but with different light/dark values
          const semanticVariables = cleanVariables.filter(v => v.type === "semantic");
          if (semanticVariables.length > 0) {
            const aliasMessage = {
              type: "generate-semantic-aliases",
              payload: {
                aliases: semanticVariables.map(v => ({
                  name: v.name,
                  primitiveName: v.relatedPrimitives?.[0] || v.name, // Reference a primitive
                  collectionName: "Framework Primitive Colors",
                  lightHex: v.lightHex, // Include light hex value for validation
                  darkHex: v.darkHex,   // Include dark hex value for validation
                  isSemantic: true       // Flag to indicate this should create semantic variables
                }))
              }
            };
            
            console.log("Sending semantic aliases:", aliasMessage);
            (window.parent as any).postMessage({
              pluginMessage: aliasMessage
            }, "*");
          }
          
          console.log("Clean variables sample:", cleanVariables.slice(0, 2));
          
          // Log the actual hex values being sent
          console.log("First 5 variables hex values:");
          cleanVariables.slice(0, 5).forEach((v, i) => {
            console.log(`  ${i}: ${v.name} = ${v.hex} (type: ${v.type})`);
            if (v.type === 'semantic') {
              console.log(`    Light: ${v.lightHex}, Dark: ${v.darkHex}`);
            }
          });
          
          // Use Figma's plugin API to send message
          if (window.parent && (window.parent as any).postMessage) {
            console.log("Sending messages via postMessage...");
            
            try {
              // Wait a moment and check if messages were received
              setTimeout(() => {
                console.log("Messages sent, checking if variables were created...");
                // Try to trigger a refresh or check status
                (window.parent as any).postMessage({
                  pluginMessage: { type: "check-status" }
                }, "*");
              }, 1000);
            } catch (error) {
              console.error("Error sending message:", error);
            }
          } else {
            console.error("Figma parent API not available");
          }
          console.log("Messages sent successfully");
        } else {
          console.warn("Window or window.parent not available");
        }

      // Show success message in UI
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successMessage.textContent = `✨ Generated ${variables.length} variables!`;
      document.body.appendChild(successMessage);
      
      // Remove message after 3 seconds
      setTimeout(() => {
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
      }, 3000);

    } catch (error) {
      console.error("Error generating variables:", error);
      
      // Show error message in UI
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      errorMessage.textContent = `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      document.body.appendChild(errorMessage);
      
      // Remove message after 5 seconds
      setTimeout(() => {
        if (errorMessage.parentNode) {
          errorMessage.parentNode.removeChild(errorMessage);
        }
      }, 5000);
      
      // Notify parent about the error
      if (typeof window !== 'undefined' && window.parent) {
        // Use Figma's parent API to send error message
        if ((window.parent as any).postMessage) {
          (window.parent as any).postMessage({
            pluginMessage: {
              type: "generation-error",
              payload: {
                error: error instanceof Error ? error.message : "Unknown error occurred"
              },
            },
          }, "*");
        } else {
          console.error("Figma parent API not available for error reporting");
        }
      }
    }
  };

  return (
    <div className="font-sans text-sm flex flex-col h-full overflow-hidden">
      {/* ── VALIDATION ERRORS ── */}
      {validationErrors.length > 0 && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">Semantic Color Validation Errors</span>
          </div>
          <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {validationErrors.map((error, index) => (
              <div key={index} className="font-mono text-xs">• {error}</div>
            ))}
          </div>
        </div>
      )}

      {/* ── TABS + GENERATE ── */}
      <div className="flex items-center mb-3 gap-1 pl-[2px] mt-1">
        <button
          onClick={() => setActiveTab("primitives")}
          className={`px-2 py-0.5 rounded text-xs transition-colors ${
            activeTab === "primitives" ? "text-black dark:text-white font-medium" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
          Primitives
        </button>

        <button
          onClick={() => setActiveTab("semantics")}
          className={`px-2 py-0.5 rounded text-xs transition-colors ${
            activeTab === "semantics" ? "text-black dark:text-white font-medium" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
          Semantics
        </button>

        {/* Remove theme toggle - no longer needed */}

        {/* Generate button with count - show in both tabs */}
        <div className="ml-auto flex items-center gap-2">
          {(() => {
            const primitiveCount = Object.values(primitives).reduce((sum, items) => 
              sum + (Array.isArray(items) ? items.filter(item => item && item.included).length : 0), 0
            );
            const semanticCount = Object.entries(semanticPresets).reduce((sum, [_, colors]) => 
              sum + Object.keys(colors || {}).length, 0
            );
            const totalCount = primitiveCount + semanticCount;
            
            return (
              <>
                <button
                  onClick={() => {
                    // Preview what will be generated
                    const variables: Array<{name: string; type: string; lightHex?: string; darkHex?: string}> = [];
                    
                    // Add included primitives
                    Object.entries(primitives).forEach(([family, items]) => {
                      if (Array.isArray(items)) {
                        items.forEach(item => {
                          if (item && item.included && item.alias && item.hex) {
                            variables.push({
                              name: item.alias,
                              type: "primitive"
                            });
                          }
                        });
                      }
                    });

                    // Add semantic tokens
                    Object.entries(semanticPresets).forEach(([group, colors]) => {
                      if (colors && typeof colors === 'object') {
                        Object.entries(colors).forEach(([name, colorObj]) => {
                          if (colorObj && typeof colorObj === 'object' && 'light' in colorObj && 'dark' in colorObj) {
                            const semanticName = `${group.toLowerCase()}-${name}`;
                            const lightHex = resolveSemanticColor(colorObj.light);
                            const darkHex = resolveSemanticColor(colorObj.dark);
                            variables.push({
                              name: semanticName,
                              type: "semantic",
                              lightHex: lightHex,
                              darkHex: darkHex
                            });
                          }
                        });
                      }
                    });

                    // Show preview modal
                    setPreviewData(variables);
                    setShowPreview(true);
                  }}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Preview variables to be generated"
                >
                  Preview
                </button>
                <button
                  onClick={generateVariables}
                  className="px-4 py-1 bg-black dark:bg-white text-white dark:text-black rounded text-xs hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  title={`Generate ${totalCount} variables (${primitiveCount} primitives + ${semanticCount} semantics)`}
                >
                  Generate {totalCount}
                </button>
              </>
            );
          })()}
        </div>
      </div>

      {/* ── PRIMITIVES PANEL ── */}
      {activeTab === "primitives" && (
        <div className="flex-1 overflow-auto space-y-3 pr-1">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-600 dark:text-gray-400 flex items-center gap-2" style={{fontSize: '12px'}}>
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
              <path d="M12 16v-4" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 8h.01" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {(() => {
              const totalColors = Object.values(filteredPrimitives).reduce((sum, items) => sum + items.length, 0);
              return `Tailwind CSS color primitives (${totalColors} colors available). Select which ones to include in your design system.`;
            })()}
          </div>
          {Object.entries(filteredPrimitives).map(([family, items]) => {
            const all = items.every(i => i.included);
            return (
              <Accordion
                key={family}
                id={`prim-${family}`}
                title={family}
                count={items.length}
                isOpen={!!openPrimitives[family]}
                onToggle={() => togglePrimitive(family)}
              >
                <div className="flex flex-wrap gap-1.5 p-4">
                  {items.map((item, idx) => (
                    <Swatch
                      key={`${family}-${idx}`}
                      hex={item.hex}
                      originalHex={item.originalHex}
                      alias={item.alias}
                      included={item.included}
                      onToggleIncluded={() => togglePrimitiveInclude(family, idx)}
                    />
                  ))}
                </div>
              </Accordion>
            );
          })}
        </div>
      )}

      {/* ── SEMANTICS PANEL ── */}
      {activeTab === "semantics" && (
        <div className="flex-1 overflow-auto flex flex-col space-y-3 pr-1">
          {/* Updated info text */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-600 dark:text-gray-400 flex items-center gap-2" style={{fontSize: '12px'}}>
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
              <path d="M12 16v-4" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 8h.01" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Semantic color tokens with both light and dark theme variants. Each group shows both themes for easy comparison.
          </div>

          {/* semantic presets */}
          {Object.entries(semanticPresets).map(([group, map]) => {
            // Skip utility color groups that are already shown in primitives
            const utilityGroups = ['Slate', 'Gray', 'Zinc', 'Neutral', 'Stone', 'Red', 'Orange', 'Amber', 'Yellow', 'Lime', 'Green', 'Emerald', 'Teal', 'Cyan', 'Sky', 'Blue', 'Indigo', 'Violet', 'Purple', 'Fuchsia', 'Pink', 'Rose'];
            if (utilityGroups.includes(group)) {
              return null;
            }
            
            return (
              <Accordion
                key={group}
                id={`sem-presets-${group}`}
                title={group}
                count={Object.keys(map).length}
                isOpen={!!openSemantics[group]}
                onToggle={() => toggleSemantic(group)}
              >
                <div className="p-4 space-y-3">
                  {/* Light theme row - all light swatches */}
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center min-w-[2.5rem] h-7 px-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                      Light
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(map).map(([name, colorObj]) => {
                        if (!colorObj || typeof colorObj !== 'object' || !('light' in colorObj) || !('dark' in colorObj)) {
                          return null;
                        }
                        
                        const lightHex = resolveSemanticColor(colorObj.light);
                        const semanticName = `${group.toLowerCase()}-${name}`;
                        
                        return (
                          <Swatch
                            key={`${group}-${name}-light`}
                            hex={lightHex}
                            originalHex={lightHex}
                            alias={semanticName}
                            included={true}
                            onToggleIncluded={() => {}}
                          />
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Dark theme row - all dark swatches */}
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center min-w-[2.5rem] h-7 px-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                      Dark
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(map).map(([name, colorObj]) => {
                        if (!colorObj || typeof colorObj !== 'object' || !('light' in colorObj) || !('dark' in colorObj)) {
                          return null;
                        }
                        
                        const darkHex = resolveSemanticColor(colorObj.dark);
                        const semanticName = `${group.toLowerCase()}-${name}`;
                        
                        return (
                          <Swatch
                            key={`${group}-${name}-dark`}
                            hex={darkHex}
                            originalHex={darkHex}
                            alias={semanticName}
                            included={true}
                            onToggleIncluded={() => {}}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Accordion>
            );
          })}

          {/* plus every primitive family, too */}
          {Object.entries(groupedPrimitives).map(([family, items]) => (
            <Accordion
              key={`sem-prim-${family}`}
              id={`sem-prim-${family}`}
              title={family}
              count={items.length}
              isOpen={!!openSemantics[family]}
              onToggle={() => toggleSemantic(family)}
            >
              <div className="flex flex-wrap gap-1.5 p-4">
                {items.map((item, idx) => (
                  <Swatch
                    key={`sem-prim-${family}-${idx}`}
                    hex={item.hex}
                    originalHex={item.originalHex}
                    alias={item.alias}
                    included={item.included}
                    onToggleIncluded={() => togglePrimitiveInclude(family, idx)}
                  />
                ))}
              </div>
            </Accordion>
          ))}
        </div>
      )}
      
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Variables Preview
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <div className="p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {previewData.length} variables will be generated:
                </div>
                
                {/* Scrollable list */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {previewData.map((variable, index) => (
                      <div key={index} className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                              {variable.name}
                            </span>
                            {variable.type === 'semantic' && variable.lightHex && variable.darkHex && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Light: {variable.lightHex} | Dark: {variable.darkHex}
                              </span>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            variable.type === 'primitive' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {variable.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total: {previewData.length} variables
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    generateVariables();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white dark:text-black bg-black dark:bg-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Generate Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}