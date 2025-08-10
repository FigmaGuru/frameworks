import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import { useState } from "react";
import ColorsView from "./views/ColorsView";
import SpacingView from "./views/SpacingView";
import TypographyView from "./views/TypographyView";
const AboutView = () => (_jsxs("div", { className: "p-6 text-gray-700 dark:text-gray-200 text-sm space-y-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900 dark:text-white mb-2", children: "Design Tokens" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Generate CSS variables from Figma designs" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [_jsx("h3", { className: "font-medium text-gray-900 dark:text-white mb-2", children: "\uD83C\uDFA8 Colors" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Extract color palettes with semantic naming" })] }), _jsxs("div", { className: "p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [_jsx("h3", { className: "font-medium text-gray-900 dark:text-white mb-2", children: "\uD83D\uDCCF Spacing" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Generate consistent spacing scales" })] }), _jsxs("div", { className: "p-4 bg-gray-50 dark:bg-gray-800 rounded-lg", children: [_jsx("h3", { className: "font-medium text-gray-900 dark:text-white mb-2", children: "\uD83D\uDD24 Typography" }), _jsx("p", { className: "text-gray-600 dark:text-gray-400", children: "Create font systems with size, weight, and line-height" })] })] }), _jsx("div", { className: "text-center text-xs text-gray-500 dark:text-gray-500 pt-4", children: "Copy tokens to clipboard and paste into your code" })] }));
const SettingsView = () => (_jsx("div", { className: "p-6 text-gray-700 dark:text-gray-200 text-sm", children: "\u2699\uFE0F Settings and configuration options." }));
export default function App() {
    const [mainView, setMainView] = useState("variables");
    const [activeSubView, setActiveSubView] = useState("colors");
    const [searchQuery, setSearchQuery] = useState("");
    const renderSubView = () => {
        switch (activeSubView) {
            case "colors":
                return _jsx(ColorsView, { query: searchQuery });
            case "spacing":
                return _jsx(SpacingView, { query: searchQuery });
            case "typography":
                return _jsx(TypographyView, { query: searchQuery });
        }
    };
    return (_jsxs("div", { className: "w-full max-w-[600px] min-h-[700px] max-h-[100vh] font-sans text-sm overflow-hidden flex flex-col", children: [_jsxs("nav", { className: "flex items-center gap-1 border-b pl-[2px] pr-4 bg-white dark:bg-gray-800 shadow-sm", style: { height: '48px', minHeight: '48px', maxHeight: '48px' }, children: [_jsx("button", { onClick: () => {
                            setMainView("variables");
                            setActiveSubView("colors");
                            setSearchQuery("");
                        }, className: `px-3 py-1 rounded text-xs transition-colors ${mainView === "variables"
                            ? "text-black dark:text-white font-medium"
                            : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"}`, children: "Variables" }), _jsx("button", { onClick: () => {
                            setMainView("about");
                            setSearchQuery("");
                        }, className: `px-3 py-1 rounded text-xs transition-colors ${mainView === "about"
                            ? "text-black dark:text-white font-medium"
                            : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"}`, children: "About" }), _jsx("button", { onClick: () => {
                            setMainView("settings");
                            setSearchQuery("");
                        }, className: `px-3 py-1 rounded text-xs transition-colors ${mainView === "settings"
                            ? "text-black dark:text-white font-medium"
                            : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"}`, children: "Settings" })] }), _jsxs("div", { className: "flex-1 flex overflow-hidden", children: [mainView === "variables" && (_jsxs("div", { className: "w-32 shrink-0 bg-gray-100 dark:bg-gray-900 border-r dark:border-gray-700 p-2 flex flex-col gap-2", children: [_jsx("button", { onClick: () => {
                                    setActiveSubView("colors");
                                    setSearchQuery("");
                                }, className: `text-left px-1.5 py-1.5 rounded text-xs transition-colors ${activeSubView === "colors"
                                    ? "text-black dark:text-white font-medium"
                                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"}`, children: "Colors" }), _jsx("button", { onClick: () => {
                                    setActiveSubView("spacing");
                                    setSearchQuery("");
                                }, className: `text-left px-1.5 py-1.5 rounded text-xs transition-colors ${activeSubView === "spacing"
                                    ? "text-black dark:text-white font-medium"
                                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"}`, children: "Spacing" }), _jsx("button", { onClick: () => {
                                    setActiveSubView("typography");
                                    setSearchQuery("");
                                }, className: `text-left px-1.5 py-1.5 rounded text-xs transition-colors ${activeSubView === "typography"
                                    ? "text-black dark:text-white font-medium"
                                    : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"}`, children: "Typography" })] })), _jsx("div", { className: "flex-1 flex flex-col overflow-hidden", children: mainView === "variables" ? (_jsx("div", { className: "flex-1 overflow-y-auto px-2 pt-2", children: renderSubView() })) : mainView === "about" ? (_jsx("div", { className: "flex-1 overflow-auto", children: _jsx(AboutView, {}) })) : (_jsx("div", { className: "flex-1 overflow-auto", children: _jsx(SettingsView, {}) })) })] })] }));
}
