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
 * Master Swatch component with hover-editable alias, revert, theming support,
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
  const isEdited = hex.toLowerCase() !== originalHex.toLowerCase();

  return (
    <label className="group w-32 h-32 relative overflow-hidden rounded-[16px] shadow-md cursor-pointer">
      {/* dynamic color background */}
      <div className="absolute inset-0" style={{ backgroundColor: hex }} />

      {/* color picker covers entire card */}
      <input
        type="color"
        value={hex}
        onChange={e => onHexChange(e.target.value)}
        className="absolute inset-0 opacity-0 z-10"
      />

      {/* Top-right revert button, shown only when edited */}
      {isEdited && (
        <button
          onClick={e => {
            e.stopPropagation();
            onReset();
          }}
          className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-800 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 z-20"
          title="Revert to original"
        >
          <Undo2 size={16} className="text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {/* Bottom area: hex badge and alias input */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-col items-center space-y-1 z-20">
        {/* Hex badge */}
        <div className="bg-white dark:bg-gray-800 text-black dark:text-white text-[10px] font-mono rounded-full px-2 py-0.5">
          {hex.toUpperCase()}
        </div>

        {/* Alias input (always visible) */}
        <input
          type="text"
          value={alias}
          onChange={e => onAliasChange(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          className={`w-full text-center font-semibold text-sm 
            bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-60 
            rounded transition-border outline-none truncate
            ${isEditing
              ? "border border-gray-300 dark:border-gray-600"
              : "border-transparent"}`}
        />
      </div>
    </label>
  );
};

export default Swatch;