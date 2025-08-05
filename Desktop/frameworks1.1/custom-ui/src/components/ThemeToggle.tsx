// src/components/ThemeToggle.tsx
import React from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  setTheme(theme: "light" | "dark"): void;
}

export default function ThemeToggle({ theme, setTheme }: ThemeToggleProps) {
  const isDark = theme === "dark";

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  );
}