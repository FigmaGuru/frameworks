import React, { useState, useMemo } from "react";
import SpacingToken from "../components/SpacingToken";
import Accordion from "../components/accordion";

// Primitive spacing scale - Tailwind CSS inspired
const primitiveSpacing = {
  // Base scale (0-96)
  "0": "0px",
  "px": "1px",
  "0.5": "2px",
  "1": "4px",
  "1.5": "6px",
  "2": "8px",
  "2.5": "10px",
  "3": "12px",
  "3.5": "14px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "7": "28px",
  "8": "32px",
  "9": "36px",
  "10": "40px",
  "11": "44px",
  "12": "48px",
  "14": "56px",
  "16": "64px",
  "20": "80px",
  "24": "96px",
  "28": "112px",
  "32": "128px",
  "36": "144px",
  "40": "160px",
  "44": "176px",
  "48": "192px",
  "52": "208px",
  "56": "224px",
  "60": "240px",
  "64": "256px",
  "72": "288px",
  "80": "320px",
  "96": "384px",
};

// Semantic spacing categories
const semanticSpacing = {
  "Padding": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px",
  },
  "Margin": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px",
  },
  "Gap": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
  },
  "Border Radius": {
    "none": "0px",
    "xs": "2px",
    "sm": "4px",
    "md": "6px",
    "lg": "8px",
    "xl": "12px",
    "2xl": "16px",
    "3xl": "24px",
    "full": "9999px",
  },
  "Component Spacing": {
    "button-padding-x": "16px",
    "button-padding-y": "8px",
    "input-padding-x": "12px",
    "input-padding-y": "8px",
    "card-padding": "24px",
    "section-margin": "48px",
    "container-padding": "16px",
  },
  "Layout": {
    "grid-gap": "24px",
    "section-gap": "64px",
    "content-gap": "32px",
    "item-gap": "16px",
    "text-gap": "8px",
  },
  "Frame Sizes": {
    "mobile": "320px",
    "mobile-lg": "375px",
    "mobile-xl": "414px",
    "tablet": "768px",
    "tablet-lg": "834px",
    "desktop-sm": "1024px",
    "desktop": "1280px",
    "desktop-lg": "1440px",
    "desktop-xl": "1536px",
    "desktop-2xl": "1920px",
  },
  "Border Width": {
    "none": "0px",
    "xs": "1px",
    "sm": "2px",
    "md": "3px",
    "lg": "4px",
    "xl": "6px",
    "2xl": "8px",
  },
  "Avatar Sizes": {
    "xs": "20px",
    "sm": "24px",
    "md": "32px",
    "lg": "40px",
    "xl": "48px",
    "2xl": "56px",
    "3xl": "64px",
    "4xl": "80px",
    "5xl": "96px",
  },
};

export default function SpacingView({ query = "" }: { query?: string }) {
  const [activeTab, setActiveTab] = useState<"primitives" | "semantics">("primitives");
  
  // State for primitives
  const [primitives, setPrimitives] = useState(() => {
    const initial: Record<string, { value: string; alias: string; included: boolean }[]> = {
      "Base Scale": Object.entries(primitiveSpacing)
        .sort(([a], [b]) => {
          // Handle special cases first
          if (a === "0") return -1;
          if (b === "0") return 1;
          if (a === "px") return -1;
          if (b === "px") return 1;
          
          // Convert to numbers for proper sorting
          const aNum = parseFloat(a);
          const bNum = parseFloat(b);
          
          // Handle NaN cases (like "px")
          if (isNaN(aNum) && isNaN(bNum)) return 0;
          if (isNaN(aNum)) return -1;
          if (isNaN(bNum)) return 1;
          
          return aNum - bNum;
        })
        .map(([key, value]) => ({
          value,
          alias: `space-${key}`,
          included: true,
        })),
    };
    return initial;
  });
  
  const [openPrimitives, setOpenPrimitives] = useState<Record<string, boolean>>({
    "Base Scale": false,
  });

  // State for semantics
  const [openSemantics, setOpenSemantics] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(semanticSpacing).forEach(category => {
      initial[category] = false;
    });
    return initial;
  });

  // Find semantic tokens that use primitive spacing values
  const semanticToPrimitiveMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    
    // Check each semantic token against primitives
    Object.entries(semanticSpacing).forEach(([category, tokens]) => {
      Object.entries(tokens).forEach(([name, value]) => {
        const semanticName = `${category.toLowerCase().replace(/\s+/g, '-')}-${name}`;
        const matchingPrimitives: string[] = [];
        
        // Find primitives that match this semantic value
        Object.entries(primitiveSpacing).forEach(([key, primitiveValue]) => {
          if (primitiveValue === value) {
            matchingPrimitives.push(`space-${key}`);
          }
        });
        
        if (matchingPrimitives.length > 0) {
          map[semanticName] = matchingPrimitives;
        }
      });
    });
    
    return map;
  }, []);

  // Filter primitives based on query
  const lower = query.toLowerCase();
  const filteredPrimitives = useMemo(() => {
    const out: Record<string, any[]> = {};
    Object.entries(primitives).forEach(([family, items]) => {
      const filtered = items.filter(item => 
        item.alias.toLowerCase().includes(lower) || 
        item.value.toLowerCase().includes(lower)
      );
      if (filtered.length) out[family] = filtered;
    });
    return out;
  }, [primitives, lower]);

  // Handlers
  const togglePrimitive = (family: string) => 
    setOpenPrimitives(prev => ({ ...prev, [family]: !prev[family] }));
  
  const togglePrimitiveInclude = (family: string, index: number) => {
    const updated = { ...primitives };
    updated[family][index].included = !updated[family][index].included;
    setPrimitives(updated);
  };

  const toggleSemantic = (category: string) => 
    setOpenSemantics(prev => ({ ...prev, [category]: !prev[category] }));

  // Generate spacing variables
  const generateVariables = () => {
    try {
      const variables: Array<{
        name: string;
        value: string;
        type: "primitive" | "semantic";
        category?: string;
        relatedPrimitives?: string[];
      }> = [];

      // Add included primitives
      Object.entries(primitives).forEach(([family, items]) => {
        items.forEach(item => {
          if (item.included) {
            variables.push({
              name: item.alias,
              value: item.value,
              type: "primitive"
            });
          }
        });
      });

      // Add all semantic tokens
      Object.entries(semanticSpacing).forEach(([category, tokens]) => {
        Object.entries(tokens).forEach(([name, value]) => {
          const semanticName = `${category.toLowerCase().replace(/\s+/g, '-')}-${name}`;
          variables.push({
            name: semanticName,
            value,
            type: "semantic",
            category,
            relatedPrimitives: semanticToPrimitiveMap[semanticName] || []
          });
        });
      });

      console.log("Generated spacing variables:", variables);

      // Notify parent about variable generation
      if (typeof window !== 'undefined' && window.parent) {
        window.parent.postMessage({
          pluginMessage: {
            type: "generate-spacing-variables",
            payload: {
              variables,
              totalCount: variables.length,
              primitiveCount: variables.filter(v => v.type === "primitive").length,
              semanticCount: variables.filter(v => v.type === "semantic").length
            },
          },
        }, "*");
      }
    } catch (error) {
      console.error("Error generating spacing variables:", error);
    }
  };

  return (
    <div className="font-sans text-sm flex flex-col h-full overflow-hidden">
      {/* ── TABS + GENERATE ── */}
      <div className="flex items-center mb-3 gap-1 pl-[2px] mt-1">
        <button
          onClick={() => setActiveTab("primitives")}
          className={`px-2 py-0.5 rounded text-xs transition-colors ${
            activeTab === "primitives" ? "text-black dark:text-white font-medium" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
          Primitives
        </button>

        <button
          onClick={() => setActiveTab("semantics")}
          className={`px-2 py-0.5 rounded text-xs transition-colors ${
            activeTab === "semantics" ? "text-black dark:text-white font-medium" : "text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
          }`}
        >
          Semantics
        </button>

        {/* Generate button */}
        <div className="ml-auto flex items-center gap-2">
          {(() => {
            const primitiveCount = Object.values(primitives).reduce((sum, items) => 
              sum + items.filter(item => item.included).length, 0
            );
            const semanticCount = Object.entries(semanticSpacing).reduce((sum, [_, tokens]) => 
              sum + Object.keys(tokens).length, 0
            );
            const totalCount = primitiveCount + semanticCount;
            
            return (
              <button
                onClick={generateVariables}
                className="px-4 py-1 bg-black dark:bg-white text-white dark:text-black rounded text-xs hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                title={`Generate ${totalCount} variables (${primitiveCount} primitives + ${semanticCount} semantics)`}
              >
                Generate {totalCount}
              </button>
            );
          })()}
        </div>
      </div>

      {/* ── PRIMITIVES PANEL ── */}
      {activeTab === "primitives" && (
        <div className="flex-1 overflow-auto space-y-3 pr-1">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-600 dark:text-gray-400" style={{fontSize: '12px'}}>
            {(() => {
              const totalTokens = Object.values(filteredPrimitives).reduce((sum, items) => sum + items.length, 0);
              return `Primitive spacing scale (${totalTokens} tokens available). Select which ones to include in your design system.`;
            })()}
          </div>
          
          {Object.entries(filteredPrimitives).map(([family, items]) => (
            <Accordion
              key={family}
              id={`prim-${family}`}
              title={family}
              count={items.length}
              isOpen={!!openPrimitives[family]}
              onToggle={() => togglePrimitive(family)}
            >
              <div className="flex flex-wrap gap-2 p-4">
                {items.map((item, idx) => (
                  <SpacingToken
                    key={`${family}-${idx}`}
                    value={item.value}
                    alias={item.alias}
                    included={item.included}
                    type="primitive"
                    onToggleIncluded={() => togglePrimitiveInclude(family, idx)}
                  />
                ))}
              </div>
            </Accordion>
          ))}
        </div>
      )}

      {/* ── SEMANTICS PANEL ── */}
      {activeTab === "semantics" && (
        <div className="flex-1 overflow-auto space-y-3 pr-1">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-gray-600 dark:text-gray-400" style={{fontSize: '12px'}}>
            Semantic spacing tokens organized by use case and context. These automatically align with primitive values.
          </div>

          {Object.entries(semanticSpacing).map(([category, tokens]) => (
            <Accordion
              key={category}
              id={`sem-${category}`}
              title={category}
              count={Object.keys(tokens).length}
              isOpen={!!openSemantics[category]}
              onToggle={() => toggleSemantic(category)}
            >
              <div className="flex flex-wrap gap-2 p-4">
                {Object.entries(tokens).map(([name, value]) => {
                  const semanticName = `${category.toLowerCase().replace(/\s+/g, '-')}-${name}`;
                  const relatedPrimitives = semanticToPrimitiveMap[semanticName] || [];
                  
                  return (
                    <div key={`${category}-${name}`} className="relative">
                      <SpacingToken
                        value={value}
                        alias={semanticName}
                        included={true}
                        type="semantic"
                        category={category}
                        onToggleIncluded={() => {}}
                      />
                    </div>
                  );
                })}
              </div>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
}