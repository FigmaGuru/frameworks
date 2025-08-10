// src/components/Accordion.tsx
import React from "react";

interface AccordionProps {
  id: string;
  title: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  headerControls?: React.ReactNode;
}

export default function Accordion({
  id,
  title,
  count,
  isOpen,
  onToggle,
  children,
  headerControls,
}: AccordionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 text-left hover:opacity-70 transition-opacity duration-200"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <div className="flex items-center space-x-2">
          <span className="text-gray-900 dark:text-gray-100" style={{fontSize: '12px'}}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500 border border-gray-300 dark:border-gray-600 px-2 py-0.5 rounded">
            {count}
          </span>
          {headerControls}
        </div>
      </button>

      <div
        id={id}
        className={`transition-all duration-200 ease-out ${
          isOpen
            ? "max-h-[2000px] opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}