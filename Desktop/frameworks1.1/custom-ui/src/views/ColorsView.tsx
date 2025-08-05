// src/views/ColorsView.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import tailwindColors from "../lib/tailwind-colors.json";
import Swatch from "../components/Swatch";
import Accordion from "../components/Accordion";
import Alert from "../components/Alert";
import { Check } from "lucide-react";

const semanticPresets: Record<string, Record<string, string>> = {
  Surface: { primary: "#ffffff", secondary: "#f9fafb", tertiary: "#f3f4f6", quaternary: "#e5e7eb" },
  Text:    { primary: "#111827", secondary: "#374151", tertiary: "#6b7280", quaternary: "#9ca3af" },
  Icon:    { primary: "#111827", secondary: "#4b5563", tertiary: "#6b7280", quaternary: "#9ca3af" },
  Border:  { primary: "#d1d5db", secondary: "#e5e7eb", tertiary: "#f3f4f6", quaternary: "#f9fafb" },
  Alpha:   { "white-5": "rgba(255,255,255,0.05)", /* …etc… */ "black-90": "rgba(0,0,0,0.9)" },
};

export default function ColorsView({ query = "" }: { query?: string }) {
  const [activeTab, setActiveTab] = useState<"primitives" | "semantics">("primitives");
  const [primitivesGenerated, setPrimitivesGenerated] = useState(false);

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
  const changePrimitiveAlias   = (f: string, i: number, a: string) => { const c = { ...primitives }; c[f][i].alias = a; setPrimitives(c); };
  const changePrimitiveHex     = (f: string, i: number, h: string) => { const c = { ...primitives }; c[f][i].hex = h; setPrimitives(c); };
  const resetPrimitiveHex      = (f: string, i: number) => changePrimitiveHex(f, i, primitives[f][i].originalHex);
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

  // 7) Generate
  const sendPrimitives = () => {
    const payload = Object.entries(primitives).flatMap(([family, items]) =>
      items.filter(c => c.included).map(c => ({ family, alias: c.alias, hex: c.hex }))
    );
    parent.postMessage({ pluginMessage: { type: "generate-primitives", payload } }, "*");
    setPrimitivesGenerated(true);
  };
  const sendSemantics = () => {
    parent.postMessage({ pluginMessage: { type: "generate-semantics", payload: semanticPresets } }, "*");
  };

  return (
    <div className="font-sans text-sm flex flex-col h-full overflow-hidden">
      {/* ── TABS + GENERATE ── */}
      <div className="flex items-center mb-3 px-1">
        <button
          onClick={() => setActiveTab("primitives")}
          className={`px-4 py-1 font-semibold ${
            activeTab === "primitives" ? "text-black dark:text-white" : "text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
          Primitives
        </button>

        <button
          onClick={() => setActiveTab("semantics")}
          className={`px-4 py-1 font-semibold ${
            activeTab === "semantics" ? "text-black dark:text-white" : "text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
          Semantics
        </button>

        <div className="ml-auto">
          <button
            onClick={sendPrimitives}
            className="flex items-center space-x-1 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
          >
            {primitivesGenerated ? <Check className="w-5 h-5" /> : "Generate Primitives"}
          </button>
        </div>
      </div>

      {/* ── PRIMITIVES PANEL ── */}
      {activeTab === "primitives" && (
        <div className="flex-1 overflow-auto space-y-3 pr-1">
          <Alert
            description="Edit alias or color, then click &quot;Generate Primitives,&quot; then switch to Semantics."
          />
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
                {Object.entries(map).map(([name, hex]) => (
                  <Swatch
                    key={`${group}-${name}`}
                    hex={hex}
                    originalHex={hex}
                    alias={`${group.toLowerCase()}-${name}`}
                    included
                    onHexChange={() => {}}
                    onAliasChange={() => {}}
                    onToggleIncluded={() => {}}
                    onReset={() => {}}
                  />
                ))}
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

          <button
            onClick={sendSemantics}
            disabled={!primitivesGenerated}
            title={!primitivesGenerated ? "Generate Primitives first" : ""}
            className={`mt-4 w-full px-4 py-2 rounded text-sm ${
              primitivesGenerated
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            {primitivesGenerated ? <Check className="w-5 h-5" /> : "Generate Semantics"}
          </button>
        </div>
      )}
    </div>
  );
}