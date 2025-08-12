// src/App.tsx
import React, { useState, useEffect } from "react";
import ColorsView from "./views/ColorsView";
import SpacingView from "./views/SpacingView";
import TypographyView from "./views/TypographyView";
import ErrorBoundary from "./components/ErrorBoundary";

const AboutView = () => (
  <div className="p-6 text-gray-700 dark:text-gray-200 text-sm space-y-4">
    <div className="text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Design Tokens</h1>
      <p className="text-gray-600 dark:text-gray-400">Generate CSS variables from Figma designs</p>
    </div>
    
    <div className="space-y-3">
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">🎨 Colors</h3>
        <p className="text-gray-600 dark:text-gray-400">Extract color palettes with semantic naming</p>
      </div>
      
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">📏 Spacing</h3>
        <p className="text-gray-600 dark:text-gray-400">Generate consistent spacing scales</p>
      </div>
      
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="font-medium text-gray-900 dark:text-white mb-2">🔤 Typography</h3>
        <p className="text-gray-600 dark:text-gray-400">Create font systems with size, weight, and line-height</p>
      </div>
    </div>
    
    <div className="text-center text-xs text-gray-500 dark:text-gray-500 pt-4">
      Copy tokens to clipboard and paste into your code
    </div>
  </div>
);

const SettingsView = () => (
  <div className="p-6 text-gray-700 dark:text-gray-200 text-sm">
    ⚙️ Settings and configuration options.
  </div>
);

type MainView = "variables" | "about" | "settings";
type SubView = "colors" | "spacing" | "typography";

export default function App() {
  const [mainView, setMainView] = useState<MainView>("variables");
  const [activeSubView, setActiveSubView] = useState<SubView>("colors");
  const [searchQuery, setSearchQuery] = useState("");


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
    <ErrorBoundary>
      <div className="w-full max-w-[600px] min-h-[700px] max-h-[100vh] font-sans text-sm overflow-hidden flex flex-col">
        {/* Top Navigation */}
        <nav className="flex items-center gap-1 border-b pl-[2px] pr-4 bg-white dark:bg-gray-800 shadow-sm" style={{height: '48px', minHeight: '48px', maxHeight: '48px'}}>
        <button
          onClick={() => {
            setMainView("variables");
            setActiveSubView("colors");
            setSearchQuery("");
          }}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            mainView === "variables"
              ? "text-black dark:text-white font-medium"
              : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
          Variables
        </button>
        <button
          onClick={() => {
            setMainView("about");
            setSearchQuery("");
          }}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            mainView === "about"
              ? "text-black dark:text-white font-medium"
              : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
          About
        </button>
        <button
          onClick={() => {
            setMainView("settings");
            setSearchQuery("");
          }}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            mainView === "settings"
              ? "text-black dark:text-white font-medium"
              : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
          Settings
        </button>
      </nav>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {mainView === "variables" && (
          <div className="w-32 shrink-0 bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-700 p-2 flex flex-col gap-2">
            {/* Sub-nav */}
            <button
              onClick={() => {
                setActiveSubView("colors");
                setSearchQuery("");
              }}
              className={`text-left px-1.5 py-1.5 rounded text-xs transition-colors ${
                activeSubView === "colors"
                  ? "text-black dark:text-white font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Colors
            </button>
            <button
              onClick={() => {
                setActiveSubView("spacing");
                setSearchQuery("");
              }}
              className={`text-left px-1.5 py-1.5 rounded text-xs transition-colors ${
                activeSubView === "spacing"
                  ? "text-black dark:text-white font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Spacing
            </button>
            <button
              onClick={() => {
                setActiveSubView("typography");
                setSearchQuery("");
              }}
              className={`text-left px-1.5 py-1.5 rounded text-xs transition-colors ${
                activeSubView === "typography"
                  ? "text-black dark:text-white font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Typography
            </button>
          </div>
        )}

        {/* Content Pane */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mainView === "variables" ? (
            <div className="flex-1 overflow-y-auto px-2 pt-2">
              {renderSubView()}
            </div>
          ) : mainView === "about" ? (
            <div className="flex-1 overflow-auto">
              <AboutView />
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <SettingsView />
            </div>
          )}
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
}