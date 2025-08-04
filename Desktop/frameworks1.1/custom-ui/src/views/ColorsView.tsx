// src/views/ColorsView.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import tailwindColors from "../lib/tailwind-colors.json";
import Swatch from "../components/Swatch";
import Accordion from "../components/Accordion";

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

  const groupedColors = useMemo(() => {
    const result: Record<string, Array<{ step: string; hex: string; alias: string; included: boolean; originalHex: string }>> = {};
    const seen = new Set<string>();

    Object.entries(tailwindColors).forEach(([family, ramp]) => {
      const items = Object.entries(ramp as Record<string, string>)
        .map(([step, hex]) => {
          return {
            step,
            hex,
            originalHex: hex,
            alias: family + "-" + step,
            included: true,
          };
        })
        .filter(({ hex }) => /^#([0-9a-f]{6})$/i.test(hex) && !seen.has(hex) && seen.add(hex));
      if (items.length) result[family] = items;
    });

    return result;
  }, []);

  const [colors, setColors] = useState(groupedColors);
  const [openFamilies, setOpenFamilies] = useState<Record<string, boolean>>({});
  const checkboxRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    Object.entries(colors).forEach(([family, items]) => {
      const el = checkboxRefs.current[family];
      if (!el) return;
      const count = items.filter(i => i.included).length;
      el.indeterminate = count > 0 && count < items.length;
    });
  }, [colors]);

  const toggleAccordion = (key: string) => setOpenFamilies(p => ({ ...p, [key]: !p[key] }));
  const handleAliasChange = (f: string, i: number, v: string) => {
    const c = { ...colors }; c[f][i].alias = v; setColors(c);
  };
  const handleHexChange = (f: string, i: number, h: string) => {
    const c = { ...colors }; c[f][i].hex = h; setColors(c);
  };
  const resetHex = (f: string, i: number) => handleHexChange(f, i, colors[f][i].originalHex);
  const toggleInclude = (f: string, i: number) => {
    const c = { ...colors }; c[f][i].included = !c[f][i].included; setColors(c);
  };
  const toggleFamily = (f: string) => {
    const c = { ...colors };
    const all = c[f].every(item => item.included);
    c[f].forEach(item => item.included = !all);
    setColors(c);
  };

  const search = query.toLowerCase();
  const filtered = useMemo(() => {
    const result: typeof colors = {};
    Object.entries(colors).forEach(([family, items]) => {
      const matched = items.filter(ca => ca.alias.toLowerCase().includes(search));
      if (matched.length) result[family] = matched;
    });
    return result;
  }, [colors, search]);

  const sendMessage = () => {
    const payload = Object.entries(colors).flatMap(([family, items]) =>
      items.filter(ca => ca.included).map(ca => ({ ...ca, family }))
    );
    parent.postMessage({ pluginMessage: { type: "generate-variables", payload } }, "*");
  };

  return (
    <div className="font-sans text-sm flex flex-col h-full overflow-hidden">
      <div className="flex items-center mb-3 px-1">
        <button
          onClick={() => setActiveTab("primitives")}
          className={`px-4 py-1 font-semibold border-b-2 ${activeTab === "primitives" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"}`}
        >
          Primitives
        </button>
        <button
          onClick={() => setActiveTab("semantics")}
          className={`px-4 py-1 font-semibold border-b-2 ${activeTab === "semantics" ? "border-black text-black" : "border-transparent text-gray-400 hover:text-black"}`}
        >
          Semantics
        </button>
        <div className="ml-auto">
          <button onClick={sendMessage} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm">
            Generate Variables
          </button>
        </div>
      </div>

      {activeTab === "primitives" && (
        <div className="overflow-auto space-y-3 pr-1">
          {Object.entries(filtered).map(([family, items]) => {
            const all = items.every(i => i.included);
            return (
              <Accordion
                key={family}
                id={`acc-${family}`}
                title={family}
                count={items.length}
                isOpen={!!openFamilies[family]}
                onToggle={() => toggleAccordion(family)}
                headerControls={
                  <input
                    type="checkbox"
                    checked={all}
                    ref={el => (checkboxRefs.current[family] = el)}
                    onChange={() => toggleFamily(family)}
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
                      onHexChange={h => handleHexChange(family, idx, h)}
                      onAliasChange={a => handleAliasChange(family, idx, a)}
                      onToggleIncluded={() => toggleInclude(family, idx)}
                      onReset={() => resetHex(family, idx)}
                    />
                  ))}
                </div>
              </Accordion>
            );
          })}
        </div>
      )}

      {activeTab === "semantics" && (
        <div className="overflow-auto space-y-3 pr-1">
          {Object.entries(semanticPresets).map(([group, map]) => (
            <Accordion
              key={group}
              id={`acc-${group}`}
              title={group}
              count={Object.keys(map).length}
              isOpen={!!openFamilies[group]}
              onToggle={() => toggleAccordion(group)}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
                {Object.entries(map).map(([name, hex]) => (
                  <Swatch
                    key={`${group}-${name}`}
                    hex={hex}
                    originalHex={hex}
                    alias={group.toLowerCase() + "-" + name}
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
        </div>
      )}
    </div>
  );
}