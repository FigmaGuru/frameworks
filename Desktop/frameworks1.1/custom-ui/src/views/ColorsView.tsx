// src/views/ColorsView.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import tailwindColors from "../lib/tailwind-colors.json";
import Swatch from "../components/Swatch";
import Accordion from "../components/accordion";

// Static semantic groups with primitive aliases
const baseSemanticPresets: Record<string, Record<string, string>> = {
  Surface: {
    primary: "gray-50",
    secondary: "gray-100", 
    tertiary: "gray-200",
    quaternary: "gray-300",
  },
  Text: {
    primary: "gray-900",
    secondary: "gray-700",
    tertiary: "gray-500",
    quaternary: "gray-400",
  },
  Icon: {
    primary: "gray-900",
    secondary: "gray-600",
    tertiary: "gray-500",
    quaternary: "gray-400",
  },
  Border: {
    primary: "gray-300",
    secondary: "gray-200",
    tertiary: "gray-100",
    quaternary: "gray-50",
  },
  Alpha: {
    "white-5": "rgba(255,255,255,0.05)",
    "white-10": "rgba(255,255,255,0.1)",
    "white-20": "rgba(255,255,255,0.2)",
    "white-30": "rgba(255,255,255,0.3)",
    "white-40": "rgba(255,255,255,0.4)",
    "white-50": "rgba(255,255,255,0.5)",
    "white-60": "rgba(255,255,255,0.6)",
    "white-70": "rgba(255,255,255,0.7)",
    "white-80": "rgba(255,255,255,0.8)",
    "white-90": "rgba(255,255,255,0.9)",
    "black-5": "rgba(0,0,0,0.05)",
    "black-10": "rgba(0,0,0,0.1)",
    "black-20": "rgba(0,0,0,0.2)",
    "black-30": "rgba(0,0,0,0.3)",
    "black-40": "rgba(0,0,0,0.4)",
    "black-50": "rgba(0,0,0,0.5)",
    "black-60": "rgba(0,0,0,0.6)",
    "black-70": "rgba(0,0,0,0.7)",
    "black-80": "rgba(0,0,0,0.8)",
    "black-90": "rgba(0,0,0,0.9)",
  },
};

export default function ColorsView({ query = "" }: { query?: string }) {
  const [activeTab, setActiveTab] = useState<"primitives" | "semantics">(
    "primitives"
  );

  // State for editable semantic names
  const [semanticNames, setSemanticNames] = useState<Record<string, Record<string, string>>>({});

  // Build primitive groups
  const groupedPrimitives = useMemo(() => {
    const result: Record<string, Array<{ step: string; hex: string; alias: string; included: boolean; originalHex: string }>> = {};
    const seen = new Set<string>();
    Object.entries(tailwindColors).forEach(([family, ramp]) => {
      const items = Object.entries(ramp as Record<string, string>)
        .map(([step, hex]) => ({
          step,
          hex,
          originalHex: hex,
          alias: `${family}-${step}`,
          included: true,
        }))
        .filter(({ hex }) => /^#([0-9a-f]{6})$/i.test(hex) && !seen.has(hex) && seen.add(hex));
      if (items.length) result[family] = items;
    });
    return result;
  }, []);

  // Create a map of primitive aliases to hex values for semantic resolution
  const primitiveAliasMap = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(groupedPrimitives).forEach(([family, items]) => {
      items.forEach(({ alias, hex }) => {
        map[alias] = hex;
      });
    });
    return map;
  }, [groupedPrimitives]);

  // Generate comprehensive semantic presets that alias to primitives
  const generatedSemanticPresets = useMemo(() => {
    const semanticGroups: Record<string, Record<string, string>> = {
      // Brand colors - using primary brand colors
      Brand: {
        primary: "blue-600",
        secondary: "blue-500", 
        tertiary: "blue-400",
        accent: "blue-700",
      },
      // Status colors
      Status: {
        success: "green-600",
        warning: "yellow-500",
        error: "red-600",
        info: "blue-500",
      },
      // Interactive states
      Interactive: {
        hover: "gray-100",
        active: "gray-200",
        focus: "blue-100",
        disabled: "gray-100",
      },
      // Feedback colors
      Feedback: {
        positive: "green-500",
        negative: "red-500",
        neutral: "gray-500",
        attention: "yellow-500",
      },
      // Data visualization
      Data: {
        chart1: "blue-500",
        chart2: "green-500", 
        chart3: "yellow-500",
        chart4: "red-500",
        chart5: "purple-500",
        chart6: "pink-500",
      },
      // Elevation/shadows
      Elevation: {
        level1: "gray-50",
        level2: "gray-100",
        level3: "gray-200",
        level4: "gray-300",
      },
      // Semantic text variations
      TextSemantic: {
        link: "blue-600",
        success: "green-600",
        warning: "yellow-600",
        error: "red-600",
        muted: "gray-500",
      },
      // Background variations
      Background: {
        page: "gray-50",
        card: "white",
        overlay: "rgba(0,0,0,0.5)",
        modal: "white",
      },
    };

    // Add primitive family semantics (existing functionality)
    Object.entries(groupedPrimitives).forEach(([family, items]) => {
      semanticGroups[family] = items.reduce((map, { alias, hex }) => {
        map[alias] = hex;
        return map;
      }, {} as Record<string, string>);
    });

    return semanticGroups;
  }, [groupedPrimitives]);

  // Resolve semantic aliases to actual hex values
  const resolvedSemanticPresets = useMemo(() => {
    const resolved: Record<string, Record<string, string>> = {};
    
    // Resolve base semantic presets
    Object.entries(baseSemanticPresets).forEach(([group, colors]) => {
      resolved[group] = {};
      Object.entries(colors).forEach(([name, value]) => {
        // If it's a primitive alias, resolve it; otherwise keep as is (for rgba values)
        const resolvedValue = primitiveAliasMap[value] || value;
        resolved[group][name] = resolvedValue;
      });
    });

    // Resolve generated semantic presets
    Object.entries(generatedSemanticPresets).forEach(([group, colors]) => {
      resolved[group] = {};
      Object.entries(colors).forEach(([name, value]) => {
        // If it's a primitive alias, resolve it; otherwise keep as is
        const resolvedValue = primitiveAliasMap[value] || value;
        resolved[group][name] = resolvedValue;
      });
    });

    return resolved;
  }, [baseSemanticPresets, generatedSemanticPresets, primitiveAliasMap]);

  // Merge all semantic groups
  const semanticPresets = useMemo(
    () => resolvedSemanticPresets,
    [resolvedSemanticPresets]
  );

  // Initialize semantic names from presets
  useEffect(() => {
    const initialNames: Record<string, Record<string, string>> = {};
    
    // Initialize from base semantic presets
    Object.entries(baseSemanticPresets).forEach(([group, colors]) => {
      initialNames[group] = {};
      Object.keys(colors).forEach((name) => {
        initialNames[group][name] = name;
      });
    });

    // Initialize from generated semantic presets
    Object.entries(generatedSemanticPresets).forEach(([group, colors]) => {
      if (!initialNames[group]) {
        initialNames[group] = {};
      }
      Object.keys(colors).forEach((name) => {
        if (!initialNames[group][name]) {
          initialNames[group][name] = name;
        }
      });
    });

    setSemanticNames(initialNames);
  }, [generatedSemanticPresets]);

  // State for primitives and semantics
  const [primitives, setPrimitives] = useState(groupedPrimitives);
  const [openPrimitives, setOpenPrimitives] = useState<Record<string, boolean>>({});
  const primCheckboxRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [openSemantics, setOpenSemantics] = useState<Record<string, boolean>>({});

  // Indeterminate state for primitives
  useEffect(() => {
    Object.entries(primitives).forEach(([family, items]) => {
      const el = primCheckboxRefs.current[family];
      if (!el) return;
      const count = items.filter((i) => i.included).length;
      el.indeterminate = count > 0 && count < items.length;
    });
  }, [primitives]);

  // Handlers
  const togglePrimitive = (f: string) => setOpenPrimitives((p) => ({ ...p, [f]: !p[f] }));
  const changePrimitiveAlias = (f: string, i: number, v: string) => {
    const c = { ...primitives };
    c[f][i].alias = v;
    setPrimitives(c);
  };
  const changePrimitiveHex = (f: string, i: number, h: string) => {
    const c = { ...primitives };
    c[f][i].hex = h;
    setPrimitives(c);
  };
  const resetPrimitiveHex = (f: string, i: number) => changePrimitiveHex(f, i, primitives[f][i].originalHex);
  const togglePrimitiveInclude = (f: string, i: number) => {
    const c = { ...primitives };
    c[f][i].included = !c[f][i].included;
    setPrimitives(c);
  };
  const toggleFamilyInclude = (f: string) => {
    const c = { ...primitives };
    const all = c[f].every((item) => item.included);
    c[f].forEach((item) => (item.included = !all));
    setPrimitives(c);
  };
  const toggleSemantic = (g: string) => setOpenSemantics((p) => ({ ...p, [g]: !p[g] }));

  // Filter primitives by search
  const search = query.toLowerCase();
  const filteredPrimitives = useMemo(() => {
    const out: typeof primitives = {};
    Object.entries(primitives).forEach(([family, items]) => {
      const m = items.filter((c) => c.alias.toLowerCase().includes(search));
      if (m.length) out[family] = m;
    });
    return out;
  }, [primitives, search]);

  // Send to Figma
  const sendMessage = () => {
    const primitivePayload = Object.entries(primitives).flatMap(([family, items]) =>
      items.filter((c) => c.included).map((c) => ({ ...c, family }))
    );
    
    // Create semantic payload that references primitive hex values
    const semanticsPayload = Object.entries(semanticPresets).flatMap(([group, map]) =>
      Object.entries(map).map(([name, hex]) => {
        // Find the original primitive alias if this semantic color aliases to a primitive
        const originalAlias = Object.entries(baseSemanticPresets).find(([g, colors]) => 
          g === group && colors[name]
        )?.[1]?.[name] || 
        Object.entries(generatedSemanticPresets).find(([g, colors]) => 
          g === group && colors[name]
        )?.[1]?.[name];
        
        // If this semantic color aliases to a primitive, use the primitive's hex value
        // This ensures the Figma plugin can match it with the primitive
        const targetHex = originalAlias && primitiveAliasMap[originalAlias] ? primitiveAliasMap[originalAlias] : hex;
        
        // Use custom semantic name if available, otherwise use original name
        const customName = semanticNames[group]?.[name] || name;
        
        return { 
          alias: `${group.toLowerCase()}-${customName}`, 
          hex: targetHex, // Use the primitive hex value for matching
          semantic: true,
          primitiveAlias: originalAlias || null,
          group: group
        };
      })
    );
    
    const fullPayload = [...primitivePayload, ...semanticsPayload];
    
    // Debug logging
    console.log('=== PAYLOAD DEBUG ===');
    console.log('Primitives:', primitivePayload.length);
    console.log('Semantics:', semanticsPayload.length);
    console.log('Sample primitive:', primitivePayload[0]);
    console.log('Sample semantic:', semanticsPayload[0]);
    console.log('Total payload size:', fullPayload.length);
    
    parent.postMessage({ pluginMessage: { type: "generate-variables", payload: fullPayload } }, "*");
  };

  return (
    <div className="font-sans text-sm flex flex-col h-full overflow-hidden">
      {/* Tabs & Generate */}
      <div className="flex items-center mb-3 px-1">
        <button
          onClick={() => setActiveTab("primitives")}
          className={`px-4 py-1 font-semibold border-b-2 ${
            activeTab === "primitives"
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-black"
          }`}>
          Primitives
        </button>
        <button
          onClick={() => setActiveTab("semantics")}
          className={`px-4 py-1 font-semibold border-b-2 ${
            activeTab === "semantics"
              ? "border-black text-black"
              : "border-transparent text-gray-400 hover:text-black"
          }`}>
          Semantics
        </button>
        <div className="ml-auto">
          <button
            onClick={sendMessage}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
          >
            Generate Variables
          </button>
        </div>
      </div>

      {/* PRIMITIVES TAB */}
      {activeTab === "primitives" && (
        <div className="overflow-auto space-y-3 pr-1">
          {Object.entries(filteredPrimitives).map(([family, items]) => {
            const all = items.every((i) => i.included);
            return (
              <Accordion
                key={family}
                id={`prim-${family}`}
                title={family}
                count={items.length}
                isOpen={!!openPrimitives[family]}
                onToggle={() => togglePrimitive(family)}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
                  {items.map((item, idx) => (
                    <Swatch
                      key={`${family}-${idx}`}
                      hex={item.hex}
                      originalHex={item.originalHex}
                      alias={item.alias}
                      included={item.included}
                      onHexChange={(h) => changePrimitiveHex(family, idx, h)}
                      onAliasChange={(a) => changePrimitiveAlias(family, idx, a)}
                      onToggleIncluded={() => togglePrimitiveInclude(family, idx)}
                      onReset={() => resetPrimitiveHex(family, idx)}
                    />
                  ))}
                </div>
              </Accordion>
            );
          })}
        </div>
      )}

      {/* SEMANTICS TAB */}
      {activeTab === "semantics" && (
        <div className="overflow-auto space-y-3 pr-1">
          {Object.entries(semanticPresets).map(([group, map]) => (
            <Accordion
              key={group}
              id={`sem-presets-${group}`}
              title={group}
              count={Object.keys(map).length}
              isOpen={!!openSemantics[group]}
              onToggle={() => toggleSemantic(group)}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
                {Object.entries(map).map(([name, hex]) => {
                  const customName = semanticNames[group]?.[name] || name;
                  return (
                    <Swatch
                      key={`${group}-${name}`}
                      hex={hex}
                      originalHex={hex}
                      alias={customName}
                      included={true}
                      onHexChange={() => {}}
                      onAliasChange={(a) => {
                        const newSemanticNames = { ...semanticNames };
                        if (!newSemanticNames[group]) {
                          newSemanticNames[group] = {};
                        }
                        newSemanticNames[group][name] = a;
                        setSemanticNames(newSemanticNames);
                      }}
                      onToggleIncluded={() => {}}
                      onReset={() => {}}
                    />
                  );
                })}
              </div>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
}