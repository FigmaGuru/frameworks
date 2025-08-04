import React from "react";

interface AccordionProps {
  /** Unique id for aria-controls */
  id: string;
  /** Header title */
  title: string;
  /** Number badge */
  count: number;
  /** Is panel open */
  isOpen: boolean;
  /** Toggle handler */
  onToggle: () => void;
  /** Optional controls (e.g., checkboxes) */
  headerControls?: React.ReactNode;
  /** Panel content */
  children: React.ReactNode;
}

export default function Accordion({
  id,
  title,
  count,
  isOpen,
  onToggle,
  headerControls,
  children,
}: AccordionProps) {
  return (
    <div className="border border-gray-200 rounded overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 border-b"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <div className="flex items-center space-x-2">
          {headerControls}
          <svg
            className={`w-4 h-4 transform transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="font-medium">{title}</span>
        </div>
        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
          {count}
        </span>
      </button>

      <div
        id={id}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[2000px]" : "max-h-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
