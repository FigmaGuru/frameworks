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
 * Master Swatch component with hover-editable alias, revert, info tooltip removed,
 * rounded corners, increased height, no internal checkbox (handled in Accordion).
 */
const Swatch: React.FC<SwatchProps> = ({
  hex,
  originalHex,
  alias,
  included,
  onHexChange,
  onAliasChange,
  onToggleIncluded,
  onReset,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  // only show revert when edited
  const isEdited = hex.toLowerCase() !== originalHex.toLowerCase();

  return (
    <label className="group w-32 h-32 relative overflow-hidden rounded-[16px] shadow-md cursor-pointer">
      {/* color background */}
      <div className="absolute inset-0" style={{ backgroundColor: hex }} />

      {/* click opens color picker */}
      <input
        type="color"
        value={hex}
        onChange={e => onHexChange(e.target.value)}
        className="absolute inset-0 opacity-0 z-10"
      />

      {/* Top-right revert */}
      {isEdited && (
        <button
          onClick={e => {
            e.stopPropagation();
            onReset();
          }}
          className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100 z-20"
          title="Revert to original"
        >
          <Undo2 size={16} className="text-gray-600" />
        </button>
      )}

      {/* Bottom: hex badge and alias input */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-col items-center space-y-1 z-20">
        {/* hex badge */}
        <div className="bg-white text-black text-[10px] font-mono rounded-full px-2 py-0.5">
          {hex.toUpperCase()}
        </div>
        {/* alias input always visible, truncated */}
        <input
          type="text"
          value={alias}
          onChange={e => onAliasChange(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          className={`w-full text-center font-semibold text-sm bg-white bg-opacity-80 rounded transition-border outline-none
            ${isEditing ? "border border-gray-300" : "border-transparent"} truncate`}
        />
      </div>
    </label>
  );
};

export default Swatch;