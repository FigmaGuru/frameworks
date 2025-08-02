import React, { useState, useMemo } from "react";
import tailwindColors from "../lib/tailwind-colors.json";

type ColorItem = {
  hex: string;
  alias: string;
};

type Props = {
  query: string;
};

export default function ColorsView({ query }: Props) {
  const initialColors = useMemo(() => {
    const seen = new Set<string>();
    return Object.entries(tailwindColors).flatMap(([family, ramp]) =>
      Object.entries(ramp as Record<string, string>)
        .map(([step, hex]) => ({
          hex,
          alias: `${family}/${step}`,
        }))
        .filter(({ hex }) => {
          const isValid = /^#([0-9a-f]{6})$/i.test(hex);
          const isNew = !seen.has(hex);
          if (isValid && isNew) {
            seen.add(hex);
            return true;
          }
          return false;
        })
    );
  }, []);

  const [colors, setColors] = useState<ColorItem[]>(initialColors);

  const handleAliasChange = (index: number, value: string) => {
    const updated = [...colors];
    updated[index].alias = value;
    setColors(updated);
  };

  const sendMessage = () => {
    console.log("\ud83d\udce6 Sending colors to Figma:", colors.length, "items");
    parent.postMessage(
      {
        pluginMessage: {
          type: "generate-variables",
          payload: colors,
        },
      },
      "*"
    );
  };

  const filteredColors = useMemo(() => {
    return colors.filter((c) =>
      c.alias.toLowerCase().includes(query.toLowerCase())
    );
  }, [colors, query]);

  return (
    <div className="font-sans text-sm flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-3 pr-1">
        <h1 className="text-lg font-bold">Color Primitives</h1>
        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
          aria-label="Generate Variables"
        >
          Generate Variables
        </button>
      </div>

      <div className="overflow-auto border border-gray-200 rounded">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-white z-10 border-b border-gray-300">
            <tr>
              <th className="p-2">Color</th>
              <th className="p-2">Hex</th>
              <th className="p-2">Alias</th>
            </tr>
          </thead>
          <tbody>
            {filteredColors.map((c, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="p-2">
                  <div
                    className="w-5 h-5 rounded border"
                    style={{ backgroundColor: c.hex }}
                    aria-label={`Color swatch ${c.hex}`}
                  />
                </td>
                <td className="p-2 font-mono text-xs text-gray-700">{c.hex}</td>
                <td className="p-2">
                  <input
                    value={c.alias}
                    onChange={(e) => handleAliasChange(i, e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}