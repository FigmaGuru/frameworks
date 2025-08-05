// src/App.tsx
import React, { useState, useEffect } from "react";
import ColorsView from "./views/ColorsView";
import SpacingView from "./views/SpacingView";
import TypographyView from "./views/TypographyView";
import ThemeToggle from "./components/ThemeToggle";

const AboutView = () => (
  <div className="p-6 text-gray-700 dark:text-gray-200 text-sm">
    ℹ️ Framework plugin to generate design tokens and system views.
  </div>
);

type MainView = "collections" | "about";
type SubView = "colors" | "spacing" | "typography";

export default function App() {
  const [mainView, setMainView] = useState<MainView>("collections");
  const [activeSubView, setActiveSubView] = useState<SubView>("colors");
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Hydrate initial theme from localStorage (if available)
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("theme");
      if (stored === "dark") setTheme("dark");
    } catch (e) {
      // ignore
    }
  }, []);

  // Toggle `dark` class on <html> and persist
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");

    try {
      window.localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const renderSubView = () => {
    switch (activeSubView) {
      case "colors":
        return <ColorsView query={searchQuery} />;
      case "spacing":
        return <SpacingView query={searchQuery} />;
      case "typography":
        return <TypographyView query={searchQuery} />;
    }
  };

  return (
    <div className="min-w-[1000px] min-h-[700px] max-w-[100vw] max-h-[100vh] font-sans text-sm overflow-hidden flex flex-col">
      {/* Global Navigation + Theme Toggle */}
      <div className="flex items-center gap-2 border-b p-2 bg-white dark:bg-gray-800 shadow-sm">
        <button
          onClick={() => {
            setMainView("collections");
            setActiveSubView("colors");
            setSearchQuery("");
          }}
          className={`px-3 py-1 rounded text-sm ${
            mainView === "collections"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          Collections
        </button>
        <button
          onClick={() => {
            setMainView("about");
            setSearchQuery("");
          }}
          className={`px-3 py-1 rounded text-sm ${
            mainView === "about"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          About
        </button>
        <div className="ml-auto">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {mainView === "collections" && (
          <div className="w-72 shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 flex flex-col gap-2">
            {/* Sub-nav */}
            <button
              onClick={() => {
                setActiveSubView("colors");
                setSearchQuery("");
              }}
              className={`text-left px-2 py-1 rounded ${
                activeSubView === "colors"
                  ? "bg-white font-medium border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              🎨 Colors
            </button>
            <button
              onClick={() => {
                setActiveSubView("spacing");
                setSearchQuery("");
              }}
              className={`text-left px-2 py-1 rounded ${
                activeSubView === "spacing"
                  ? "bg-white font-medium border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              📏 Spacing
            </button>
            <button
              onClick={() => {
                setActiveSubView("typography");
                setSearchQuery("");
              }}
              className={`text-left px-2 py-1 rounded ${
                activeSubView === "typography"
                  ? "bg-white font-medium border border-gray-300 dark:bg-gray-800 dark:border-gray-600"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              🔠 Typography
            </button>
          </div>
        )}

        {/* Content Pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mainView === "collections" ? (
            <>
              {/* Search */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
                <input
                  type="text"
                  placeholder={`Search ${activeSubView}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                />
              </div>
              {/* Subview */}
              <div className="flex-1 overflow-y-auto p-4">
                {renderSubView()}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-auto">
              <AboutView />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}