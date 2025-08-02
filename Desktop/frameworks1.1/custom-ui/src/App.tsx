import React, { useState } from "react";
import ColorsView from "./views/ColorsView";
import SpacingView from "./views/SpacingView";
import TypographyView from "./views/TypographyView";

const AboutView = () => (
  <div className="p-6 text-gray-700 text-sm">
    ℹ️ Framework plugin to generate design tokens and system views.
  </div>
);

type MainView = "collections" | "about";
type SubView = "colors" | "spacing" | "typography";

export default function App() {
  const [mainView, setMainView] = useState<MainView>("collections");
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
      default:
        return null;
    }
  };

  return (
    <div className="min-w-[1000px] min-h-[700px] max-w-[100vw] max-h-[100vh] font-sans text-sm overflow-hidden flex flex-col">
      {/* Global Navigation */}
      <div className="flex gap-2 border-b p-2 bg-white shadow-sm">
        <button
          onClick={() => {
            setMainView("collections");
            setActiveSubView("colors");
            setSearchQuery("");
          }}
          className={`px-3 py-1 rounded text-sm ${
            mainView === "collections"
              ? "bg-black text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
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
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          About
        </button>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {mainView === "collections" && (
          <div className="w-48 shrink-0 bg-gray-100 border-r p-4 flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveSubView("colors");
                setSearchQuery("");
              }}
              className={`text-left px-2 py-1 rounded ${
                activeSubView === "colors"
                  ? "bg-white font-medium border border-gray-300"
                  : "hover:bg-gray-200"
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
                  ? "bg-white font-medium border border-gray-300"
                  : "hover:bg-gray-200"
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
                  ? "bg-white font-medium border border-gray-300"
                  : "hover:bg-gray-200"
              }`}
            >
              🔠 Typography
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mainView === "collections" ? (
            <>
              {/* Sticky Search Bar */}
              <div className="sticky top-0 z-10 bg-white border-b p-4">
                <input
                  type="text"
                  placeholder={`Search ${activeSubView}`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>

              {/* Scrollable Subview */}
              <div className="flex-1 overflow-y-auto p-4">
                {renderSubView()}
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-auto">{<AboutView />}</div>
          )}
        </div>
      </div>
    </div>
  );
}