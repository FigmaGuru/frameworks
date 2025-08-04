// src/components/Swatch.tsx
import React, { useState } from "react";
import { Undo2 } from "lucide-react";

export interface SwatchProps {
  hex: string;
  originalHex: string;
  alias: string;
  included: boolean;
  onHexChange(hex: string): void;
  onAliasChange(alias: string): void;
  onToggleIncluded(): void;
  onReset(): void;
}

/**
 * Master Swatch component with hover‐editable alias and revert button
 */
function Swatch({
  hex,
  originalHex,
  alias,
  included,
  onHexChange,
  onAliasChange,
  onToggleIncluded,
  onReset,
}: SwatchProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isEdited = hex.toLowerCase() !== originalHex.toLowerCase();

  return (
    <label className="group w-32 h-28 relative overflow-hidden rounded-2xl shadow-md cursor-pointer">
      {/* Color background */}
      <div className="absolute inset-0" style={{ backgroundColor: hex }} />

      {/* Top-right: revert, visible on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {isEdited && (
          <button
            onClick={onReset}
            className="p-1 bg-white rounded-full shadow hover:bg-gray-100"
            title="Revert to original hex"
          >
            <Undo2 size={16} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Bottom: hex badge + alias input */}
      <div className="absolute inset-x-2 bottom-2 flex flex-col items-center space-y-1">
        {/* Hex badge */}
        <div className="bg-white text-black text-[10px] font-mono rounded-full px-2 py-0.5">
          {hex.toUpperCase()}
        </div>

        {/* Alias input always visible */}
        <input
          type="text"
          value={alias}
          onChange={e => onAliasChange(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          className="w-full text-center font-semibold text-sm bg-white bg-opacity-80 rounded border border-transparent focus:outline-none focus:border-gray-300 transition truncate"
        />
      </div>

      {/* Native color picker (click anywhere) */}
      <input
        type="color"
        value={hex}
        onChange={e => onHexChange(e.target.value)}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </label>
  );
}

export default Swatch;