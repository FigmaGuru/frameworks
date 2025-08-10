// src/components/Swatch.tsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface SwatchProps {
  hex: string;
  originalHex: string;
  alias: string;
  included: boolean;
  themeMode?: "light" | "dark";
  lightHex?: string;
  darkHex?: string;
  primitiveLabel?: string;
  onToggleIncluded(): void;
}

/**
 * Minimal Swatch component displaying only the color.
 * Read-only display with rounded corners and shadow.
 */
const Swatch: React.FC<SwatchProps> = ({
  hex,
  originalHex,
  alias,
  included,
  themeMode,
  lightHex,
  darkHex,
  primitiveLabel,
  onToggleIncluded,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const swatchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovered && swatchRef.current) {
      const rect = swatchRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
  }, [isHovered]);

  const tooltip = isHovered && (
    <div 
      className="fixed z-[99999] px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md shadow-xl whitespace-nowrap border border-gray-700 dark:border-gray-300 pointer-events-none"
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
        transform: 'translateX(-50%) translateY(-100%)'
      }}
    >
      <div className="font-mono font-semibold">{alias}</div>
      <div className="font-mono text-sm mt-1">{hex.toUpperCase()}</div>
      {primitiveLabel && (
        <div className="text-xs text-gray-300 dark:text-gray-600 mt-1">{primitiveLabel}</div>
      )}
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
    </div>
  );

  // If we have both light and dark colors, show them side by side
  if (lightHex && darkHex && !themeMode) {
    return (
      <>
        <div 
          ref={swatchRef}
          className="group flex gap-1 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Light color */}
          <div className="w-6 h-6 relative rounded-[4px] shadow-md">
            <div className="absolute inset-0 rounded-[4px]" style={{ backgroundColor: lightHex }} />
          </div>
          {/* Dark color */}
          <div className="w-6 h-6 relative rounded-[4px] shadow-md">
            <div className="absolute inset-0 rounded-[4px]" style={{ backgroundColor: darkHex }} />
          </div>
        </div>
        
        {/* Portal tooltip to render outside overflow containers */}
        {tooltip && createPortal(tooltip, document.body)}
      </>
    );
  }

  // Single color display (for primitives, single-mode tokens, or when themeMode is specified)
  return (
    <>
      <div 
        ref={swatchRef}
        className="group w-8 h-8 relative rounded-[6px] shadow-md cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* dynamic color background */}
        <div className="absolute inset-0 rounded-[6px]" style={{ backgroundColor: hex }} />
      </div>
      
      {/* Portal tooltip to render outside overflow containers */}
      {tooltip && createPortal(tooltip, document.body)}
    </>
  );
};

export default Swatch;