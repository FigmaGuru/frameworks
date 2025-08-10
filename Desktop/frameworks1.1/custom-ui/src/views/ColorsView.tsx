// src/views/ColorsView.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import tailwindColors from "../lib/tailwind-colors.json";
import Swatch from "../components/Swatch";
import Accordion from "../components/accordion";



const semanticPresets: Record<string, Record<string, { light: string; dark: string }>> = {
  Surface: { 
    primary: { light: "#ffffff", dark: "#0f1419" },
    secondary: { light: "#f9fafb", dark: "#1a1f2e" },
    tertiary: { light: "#f3f4f6", dark: "#252b3d" },
    quaternary: { light: "#e5e7eb", dark: "#2f374a" }
  },
  Text: { 
    primary: { light: "#111827", dark: "#f9fafb" },
    secondary: { light: "#374151", dark: "#d1d5db" },
    tertiary: { light: "#6b7280", dark: "#9ca3af" },
    quaternary: { light: "#9ca3af", dark: "#6b7280" }
  },
  Icon: { 
    primary: { light: "#111827", dark: "#f3f4f6" },
    secondary: { light: "#4b5563", dark: "#d1d5db" },
    tertiary: { light: "#6b7280", dark: "#9ca3af" },
    quaternary: { light: "#9ca3af", dark: "#6b7280" }
  },
  Border: { 
    primary: { light: "#d1d5db", dark: "#374151" },
    secondary: { light: "#e5e7eb", dark: "#2f374a" },
    tertiary: { light: "#f3f4f6", dark: "#252b3d" },
    quaternary: { light: "#f9fafb", dark: "#1a1f2e" }
  },
  Alpha: { 
    "white-5": { light: "rgba(255,255,255,0.05)", dark: "rgba(255,255,255,0.05)" },
    "white-10": { light: "rgba(255,255,255,0.1)", dark: "rgba(255,255,255,0.1)" },
    "white-20": { light: "rgba(255,255,255,0.2)", dark: "rgba(255,255,255,0.2)" },
    "black-5": { light: "rgba(0,0,0,0.05)", dark: "rgba(0,0,0,0.05)" },
    "black-10": { light: "rgba(0,0,0,0.1)", dark: "rgba(0,0,0,0.1)" },
    "black-20": { light: "rgba(0,0,0,0.2)", dark: "rgba(0,0,0,0.2)" },
    "black-90": { light: "rgba(0,0,0,0.9)", dark: "rgba(0,0,0,0.9)" }
  },
  "States & Interaction": {
    "hover": { light: "#f3f4f6", dark: "#374151" },
    "focus": { light: "#dbeafe", dark: "#1e40af" },
    "active": { light: "#e5e7eb", dark: "#4b5563" },
    "selected": { light: "#dbeafe", dark: "#1e40af" },
    "disabled": { light: "#f9fafb", dark: "#374151" }
  },
  "Status / Feedback": {
    "success": { light: "#dcfce7", dark: "#166534" },
    "warning": { light: "#fef3c7", dark: "#92400e" },
    "error": { light: "#fee2e2", dark: "#991b1b" },
    "info": { light: "#dbeafe", dark: "#1e40af" }
  },
};

export default function ColorsView({ query = "" }: { query?: string }) {
  const [activeTab, setActiveTab] = useState<"primitives" | "semantics">("primitives");
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");


  // 1) Build primitives once
  const groupedPrimitives = useMemo(() => {
    const out: Record<string, any[]> = {};
    const seen = new Set<string>();
    for (const [family, ramp] of Object.entries(tailwindColors)) {
      const items = Object.entries(ramp as Record<string, string>)
        .map(([step, hex]) => ({
          step,
          hex,
          originalHex: hex,
          alias: `${family}-${step}`,
          included: true,
        }))
        .filter(({ hex }) => /^#([0-9a-f]{6})$/i.test(hex) && !seen.has(hex) && seen.add(hex));
      if (items.length) out[family] = items;
    }
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

  // 3) Indeterminate checkboxes
  useEffect(() => {
    Object.entries(primitives).forEach(([f, items]) => {
      const el = primCheckboxRefs.current[f];
      if (!el) return;
      const count = items.filter(i => i.included).length;
      el.indeterminate = count > 0 && count < items.length;
    });
  }, [primitives]);

  // 4) Primitive handlers
  const togglePrimitive        = (f: string) => setOpenPrimitives(p => ({ ...p, [f]: !p[f] }));
  const togglePrimitiveInclude = (f: string, i: number) => { const c = { ...primitives }; c[f][i].included = !c[f][i].included; setPrimitives(c); };
  const toggleFamilyInclude    = (f: string) => { const c = { ...primitives }; const all = c[f].every(i => i.included); c[f].forEach(i => i.included = !all); setPrimitives(c); };

  // 5) Semantics handler
  const toggleSemantic = (g: string) => setOpenSemantics(p => ({ ...p, [g]: !p[g] }));

  // 6) Filter primitives
  const lower = query.toLowerCase();
  const filteredPrimitives = useMemo(() => {
    const out: Record<string, any[]> = {};
    Object.entries(primitives).forEach(([f, items]) => {
      const m = items.filter(c => c.alias.toLowerCase().includes(lower));
      if (m.length) out[f] = m;
    });
    return out;
  }, [primitives, lower]);

  // 7) Generate function for both primitives and semantics
  const generateVariables = () => {
    try {
      const variables: Array<{
        name: string;
        hex: string;
        type: "primitive" | "semantic";
        lightHex?: string;
        darkHex?: string;
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
              variables.push({
                name: `${group.toLowerCase()}-${name}`,
                hex: colorObj.light, // Default to light for single hex
                lightHex: colorObj.light,
                darkHex: colorObj.dark,
                type: "semantic"
              });
            }
          });
        }
      });

      console.log("Generated variables:", variables);

      // Notify parent about variable generation
      if (typeof window !== 'undefined' && window.parent) {
        window.parent.postMessage({
          pluginMessage: {
            type: "generate-local-variables",
            payload: {
              variables,
              totalCount: variables.length,
              primitiveCount: variables.filter(v => v.type === "primitive").length,
              semanticCount: variables.filter(v => v.type === "semantic").length
            },
          },
        }, "*");
      }
    } catch (error) {
      console.error("Error generating variables:", error);
      // Notify parent about the error
      if (typeof window !== 'undefined' && window.parent) {
        window.parent.postMessage({
          pluginMessage: {
            type: "generation-error",
            payload: {
              error: error instanceof Error ? error.message : "Unknown error occurred"
            },
          },
        }, "*");
      }
    }
  };



  return (
    <div className="font-sans text-sm flex flex-col h-full overflow-hidden">
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

        {/* Theme toggle - only show in semantics tab */}
        {activeTab === "semantics" && (
          <button
            onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
            className="ml-2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={`Switch to ${themeMode === "light" ? "dark" : "light"} mode`}
          >
            {themeMode === "light" ? (
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            )}
          </button>
        )}

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
                  onClick={generateVariables}
                  className="px-4 py-1 bg-black dark:bg-white text-white dark:text-black rounded text-xs hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  Generate
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
              return `Tailwind CSS color primitives (${totalColors} colors available).`;
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
          {/* semantic presets */}
          {Object.entries(semanticPresets).map(([group, map]) => (
            <Accordion
              key={group}
              id={`sem-presets-${group}`}
              title={group}
              count={Object.keys(map).length}
              isOpen={!!openSemantics[group]}
              onToggle={() => toggleSemantic(group)}
            >
              <div className="flex flex-wrap gap-1.5 p-4">
                {Object.entries(map).map(([name, colorObj]) => {
                  // Type safety check
                  if (!colorObj || typeof colorObj !== 'object' || !('light' in colorObj) || !('dark' in colorObj)) {
                    return null;
                  }
                  
                  const currentHex = themeMode === 'light' ? colorObj.light : colorObj.dark;
                  
                  return (
                    <Swatch
                      key={`${group}-${name}`}
                      hex={currentHex}
                      originalHex={currentHex}
                      alias={`${group.toLowerCase()}-${name}`}
                      themeMode={themeMode}
                      included
                      onToggleIncluded={() => {}}
                    />
                  );
                })}
              </div>
            </Accordion>
          ))}

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

``
        </div>
      )}
    </div>
  );
}