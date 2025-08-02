import React, { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

type Mapping = {
  alias: string;
  primitiveName: string;
};

export default function AliasPreviewUI() {
  const [aliasMappings, setAliasMappings] = useState<Mapping[]>([]);
  const [defaultMappings, setDefaultMappings] = useState<Mapping[]>([]);
  const [primitiveNames, setPrimitiveNames] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const primitiveColorMap: Record<string, string> = {
    "white-100": "#ffffff",
    "black-100": "#000000",
    "gray-50": "#f9fafb",
    "gray-100": "#f3f4f6",
    "gray-900": "#111827",
    "blue-700": "#1d4ed8",
    "blue-600": "#2563eb",
    // 👇 Add more Tailwind primitives and hex values here
  };

  useEffect(() => {
    window.onmessage = (event) => {
      const msg = event.data.pluginMessage;

      if (msg.type === "preview-ready") {
        setAliasMappings(msg.payload);
        setDefaultMappings(msg.payload);
        setPrimitiveNames(
          Array.from(
            new Set(msg.payload.map((d: Mapping) => d.primitiveName))
          )
        );
      }
    };
  }, []);

  const updatePrimitive = (idx: number, value: string) => {
    const updated = [...aliasMappings];
    updated[idx].primitiveName = value;
    setAliasMappings(updated);
  };

  const resetRow = (idx: number) => {
    const updated = [...aliasMappings];
    updated[idx].primitiveName = defaultMappings[idx].primitiveName;
    setAliasMappings(updated);
  };

  const grouped = {
    text: aliasMappings.filter((m) => m.alias.startsWith("text-")),
    bg: aliasMappings.filter((m) => m.alias.startsWith("bg-")),
    border: aliasMappings.filter((m) => m.alias.startsWith("border-")),
    icon: aliasMappings.filter((m) => m.alias.startsWith("icon-")),
    foreground: aliasMappings.filter((m) => m.alias.startsWith("foreground-")),
  };

  return (
    <div className="p-4 font-sans">
      <h2 className="text-lg font-bold mb-2">🎨 Semantic Alias Preview</h2>

      <input
        placeholder="🔍 Search primitives..."
        className="w-full border p-2 rounded mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value.toLowerCase())}
      />

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="mb-6">
          <h3 className="uppercase text-xs font-bold text-gray-500 mb-2">
            {group}
          </h3>

          {items.map((item, idx) => (
            <div
              key={item.alias}
              className="flex items-center gap-2 mb-2 text-sm"
            >
              <div className="w-1/3 font-mono">{item.alias}</div>

              <div className="relative w-2/3 flex items-center gap-2">
                {/* Color swatch */}
                <div
                  className="w-4 h-4 rounded border"
                  style={{
                    backgroundColor:
                      primitiveColorMap[item.primitiveName] || "#eee",
                  }}
                ></div>

                {/* Dropdown */}
                <select
                  className="flex-1 border px-2 py-1 rounded text-sm"
                  value={item.primitiveName}
                  onChange={(e) => updatePrimitive(idx, e.target.value)}
                >
                  {primitiveNames
                    .filter((p) => p.toLowerCase().includes(search))
                    .map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                </select>

                {/* Reset icon */}
                <button
                  title="Reset"
                  onClick={() => resetRow(idx)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      <button
        onClick={() =>
          parent.postMessage(
            {
              pluginMessage: {
                type: "confirm-aliases",
                payload: aliasMappings,
              },
            },
            "*"
          )
        }
        className="w-full bg-black text-white py-2 rounded mt-6 hover:bg-gray-900"
      >
        ✅ Generate Aliases
      </button>
    </div>
  );
}
useEffect(() => {
  // Test payload: simulate clicking "preview" from UI
  parent.postMessage(
    {
      pluginMessage: {
        type: "preview-aliases",
        payload: [
          { name: "white-100", hex: "#ffffff" },
          { name: "black-100", hex: "#000000" },
          { name: "gray-900", hex: "#111827" },
          { name: "gray-700", hex: "#374151" },
          { name: "gray-300", hex: "#d1d5db" },
          { name: "gray-800", hex: "#1f2937" },
        ],
      },
    },
    "*"
  );
}, []);