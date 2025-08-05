// src/components/Accordion.tsx
import React from "react";

interface AccordionProps {
  id: string;
  title: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function Accordion({
  id,
  title,
  count,
  isOpen,
  onToggle,
  children,
}: AccordionProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-visible">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-b-gray-600"
        aria-expanded={isOpen}
        aria-controls={id}
      >
        <div className="flex items-center space-x-2">
          <svg
            className={`w-4 h-4 transform transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            } text-gray-600 dark:text-gray-300`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span className="font-medium text-gray-800 dark:text-gray-100">
            {title}
          </span>
        </div>
        <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
          {count}
        </span>
      </button>

      <div
        id={id}
        className={`transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-[2000px] overflow-visible"
            : "max-h-0 overflow-hidden"
        }`}
      >
        {children}
      </div>
    </div>
  );
}