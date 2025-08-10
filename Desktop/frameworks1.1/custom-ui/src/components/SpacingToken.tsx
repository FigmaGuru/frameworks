// src/components/SpacingToken.tsx
import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface SpacingTokenProps {
  value: string; // e.g., "4px", "1rem", "0.25rem"
  alias: string; // e.g., "space-1", "padding-sm"
  included: boolean;
  type?: "primitive" | "semantic";
  category?: string; // For semantics: "padding", "margin", "gap", etc.
  onToggleIncluded(): void;
}

/**
 * Tag-style component displaying spacing values.
 * Shows the numeric value with hover tooltips for details.
 */
const SpacingToken: React.FC<SpacingTokenProps> = ({
  value,
  alias,
  included,
  type = "primitive",
  category,
  onToggleIncluded,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tokenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovered && tokenRef.current) {
      const rect = tokenRef.current.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
  }, [isHovered]);

  // Extract numeric value for display
  const displayValue = value.replace(/px|rem|em|%/g, '');
  const unit = value.replace(/[0-9.]/g, '') || 'px';

  const tooltip = isHovered && (
    <div 
      className="fixed z-[99999] px-3 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-md shadow-xl whitespace-nowrap border border-gray-700 dark:border-gray-300 pointer-events-none"
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y,
        transform: 'translateX(-50%) translateY(-100%)'
      }}
    >
      <div className="font-mono font-semibold">{value}</div>
      <div className="font-medium text-gray-200 dark:text-gray-700">{alias}</div>
      {category && (
        <div className="text-xs text-gray-300 dark:text-gray-600 mt-1">
          📏 {category}
        </div>
      )}
      {type === "semantic" && (
        <div className="text-xs text-gray-300 dark:text-gray-600">
          ✨ Semantic token
        </div>
      )}
      {/* Tooltip arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-100"></div>
    </div>
  );

  return (
    <>
      <div 
        ref={tokenRef}
        className={`
          group inline-flex items-center justify-center min-w-[2.5rem] h-7 px-2.5 
          bg-gray-100 dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600 
          rounded-full cursor-pointer transition-all duration-200
          hover:bg-gray-200 dark:hover:bg-gray-700
          hover:border-gray-400 dark:hover:border-gray-500
          ${!included ? 'opacity-50' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onToggleIncluded}
      >
        <span className="text-xs font-mono font-medium text-gray-700 dark:text-gray-300">
          {displayValue}
        </span>
        {unit !== 'px' && (
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400 ml-0.5">
            {unit}
          </span>
        )}
        
        {/* Visual spacing indicator - small bar showing relative size */}
        <div className="ml-1.5 flex items-center">
          <div 
            className="bg-blue-400 dark:bg-blue-500 rounded-sm"
            style={{
              width: Math.min(Math.max(parseFloat(displayValue) / 4, 1), 12) + 'px',
              height: '2px'
            }}
          />
        </div>
      </div>
      
      {/* Portal tooltip to render outside overflow containers */}
      {tooltip && createPortal(tooltip, document.body)}
    </>
  );
};

export default SpacingToken;
