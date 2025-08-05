// src/views/ColorsView.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import tailwindColors from "../lib/tailwind-colors.json";
import Swatch from "../components/Swatch";
import Accordion from "../components/Accordion";
import Alert from "../components/alert";

const semanticPresets = {
  Surface: {
    primary: "#ffffff",
    secondary: "#f9fafb",
    tertiary: "#f3f4f6",
    quaternary: "#e5e7eb",
  },
  Text: {
    primary: "#111827",
    secondary: "#374151",
    tertiary: "#6b7280",
    quaternary: "#9ca3af",
  },
  Icon: {
    primary: "#111827",
    secondary: "#4b5563",
    tertiary: "#6b7280",
    quaternary: "#9ca3af",
  },
  Border: {
    primary: "#d1d5db",
    secondary: "#e5e7eb",
    tertiary: "#f3f4f6",
    quaternary: "#f9fafb",
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
  const [activeTab, setActiveTab] = useState<"primitives" | "semantics">("primitives");

  // Build primitive groups
  const groupedPrimitives = useMemo(() => {
    const result: Record<
      string,
      Array<{ step: string; hex: string; alias: string; included: boolean; originalHex: string }>
    > = {};
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

      if (items.length) {
        result[family] = items;
      }
    }

    return result;
  }, []);

  // Primitives state
  const [primitives, setPrimitives] = useState(groupedPrimitives);
  const [openPrimitives, setOpenPrimitives] = useState<Record<string, boolean>>({});
  const primCheckboxRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Semantics state
  const [openSemantics, setOpenSemantics] = useState<Record<string, boolean>>({});

  // Sync indeterminate state on primitives’ headers
  useEffect(() => {
    Object.entries(primitives).forEach(([family, items]) => {
      const el = primCheckboxRefs.current[family];
      if (!el) return;
      const count = items.filter(i => i.included).length;
      el.indeterminate = count > 0 && count < items.length;
    });
  }, [primitives]);

  // PRIMITIVE handlers
  const togglePrimitive = (family: string) => setOpenPrimitives(p => ({ ...p, [family]: !p[family] }));
  const changePrimitiveAlias = (family: string, index: number, alias: string) => {
    const c = { ...primitives };
    c[family][index].alias = alias;
    setPrimitives(c);
  };
  const changePrimitiveHex = (family: string, index: number, hex: string) => {
    const c = { ...primitives };
    c[family][index].hex = hex;
    setPrimitives(c);
  };
  const resetPrimitiveHex = (family: string, index: number) =>
    changePrimitiveHex(family, index, primitives[family][index].originalHex);
  const togglePrimitiveInclude = (family: string, index: number) => {
    const c = { ...primitives };
    c[family][index].included = !c[family][index].included;
    setPrimitives(c);
  };
  const toggleFamilyInclude = (family: string) => {
    const c = { ...primitives };
    const all = c[family].every(item => item.included);
    c[family].forEach(item => (item.included = !all));
    setPrimitives(c);
  };

  // SEMANTIC handler
  const toggleSemantic = (group: string) => setOpenSemantics(p => ({ ...p, [group]: !p[group] }));

  // Filter primitives by alias
  const lower = query.toLowerCase();
  const filteredPrimitives = useMemo(() => {
    const out: typeof primitives = {};
    for (const [family, items] of Object.entries(primitives)) {
      const m = items.filter(c => c.alias.toLowerCase().includes(lower));
      if (m.length) out[family] = m;
    }
    return out;
  }, [primitives, lower]);

  // Send selected colors to Figma
  const sendMessage = () => {
    const payload = Object.entries(primitives)
      .flatMap(([family, items]) =>
        items.filter(c => c.included).map(c => ({ ...c, family }))
      );
    parent.postMessage({ pluginMessage: { type: "generate-variables", payload } }, "*");
  };

  return (
    <div className="font-sans text-sm flex flex-col h-full overflow-hidden">
      {/* Tabs + Generate button */}
      <div className="flex items-center mb-3 px-1">
        <button
          onClick={() => setActiveTab("primitives")}
          className={`px-4 py-1 font-semibold ${
            activeTab === "primitives"
              ? "text-black dark:text-white"
              : "text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
          Primitives
        </button>
        <button
          onClick={() => setActiveTab("semantics")}
          className={`px-4 py-1 font-semibold ${
            activeTab === "semantics"
              ? "text-black dark:text-white"
              : "text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
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
          {/* Instruction Alert */}
          <Alert>
            Click a swatch to edit its color or change the alias below. Click ↺ to revert.
          </Alert>

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
                headerControls={
                  <input
                    type="checkbox"
                    checked={all}
                    ref={el => (primCheckboxRefs.current[family] = el)}
                    onChange={() => toggleFamilyInclude(family)}
                  />
                }
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
                  {items.map((item, idx) => (
                    <Swatch
                      key={`${family}-${idx}`}
                      hex={item.hex}
                      originalHex={item.originalHex}
                      alias={item.alias}
                      included={item.included}
                      onHexChange={h => changePrimitiveHex(family, idx, h)}
                      onAliasChange={a => changePrimitiveAlias(family, idx, a)}
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
          {/* Semantic presets */}
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
                {Object.entries(map).map(([name, hex]) => (
                  <Swatch
                    key={`${group}-${name}`}
                    hex={hex}
                    originalHex={hex}
                    alias={`${group.toLowerCase()}-${name}`}
                    included={true}
                    onHexChange={() => {}}
                    onAliasChange={() => {}}
                    onToggleIncluded={() => {}}
                    onReset={() => {}}
                  />
                ))}
              </div>
            </Accordion>
          ))}

          {/* Then list all primitive families as extra semantics */}
          {Object.entries(groupedPrimitives).map(([family, items]) => (
            <Accordion
              key={`sem-prim-${family}`}
              id={`sem-prim-${family}`}
              title={family}
              count={items.length}
              isOpen={!!openSemantics[family]}
              onToggle={() => toggleSemantic(family)}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
                {items.map((item, idx) => (
                  <Swatch
                    key={`sem-prim-${family}-${idx}`}
                    hex={item.hex}
                    originalHex={item.originalHex}
                    alias={item.alias}
                    included={item.included}
                    onHexChange={h => changePrimitiveHex(family, idx, h)}
                    onAliasChange={a => changePrimitiveAlias(family, idx, a)}
                    onToggleIncluded={() => togglePrimitiveInclude(family, idx)}
                    onReset={() => resetPrimitiveHex(family, idx)}
                  />
                ))}
              </div>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
}