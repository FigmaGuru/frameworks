import React, { useState, useMemo } from "react";
import Accordion from "../components/accordion";

// Three font families with comprehensive type scales
const typographyPrimitives = {
  "Inter": {
    "xs": { size: "12px", weight: "400", lineHeight: "16px" },
    "sm": { size: "14px", weight: "400", lineHeight: "20px" },
    "base": { size: "16px", weight: "400", lineHeight: "24px" },
    "lg": { size: "18px", weight: "400", lineHeight: "28px" },
    "xl": { size: "20px", weight: "500", lineHeight: "28px" },
    "2xl": { size: "24px", weight: "500", lineHeight: "32px" },
    "3xl": { size: "30px", weight: "600", lineHeight: "36px" },
    "4xl": { size: "36px", weight: "600", lineHeight: "40px" },
    "5xl": { size: "48px", weight: "700", lineHeight: "48px" },
    "6xl": { size: "60px", weight: "700", lineHeight: "60px" },
    "7xl": { size: "72px", weight: "800", lineHeight: "72px" },
    "8xl": { size: "96px", weight: "800", lineHeight: "96px" },
    "9xl": { size: "128px", weight: "900", lineHeight: "128px" },
  },
  "Roboto": {
    "xs": { size: "12px", weight: "400", lineHeight: "16px" },
    "sm": { size: "14px", weight: "400", lineHeight: "20px" },
    "base": { size: "16px", weight: "400", lineHeight: "24px" },
    "lg": { size: "18px", weight: "400", lineHeight: "28px" },
    "xl": { size: "20px", weight: "500", lineHeight: "28px" },
    "2xl": { size: "24px", weight: "500", lineHeight: "32px" },
    "3xl": { size: "30px", weight: "600", lineHeight: "36px" },
    "4xl": { size: "36px", weight: "600", lineHeight: "40px" },
    "5xl": { size: "48px", weight: "700", lineHeight: "48px" },
    "6xl": { size: "60px", weight: "700", lineHeight: "64px" },
    "7xl": { size: "72px", weight: "800", lineHeight: "76px" },
    "8xl": { size: "96px", weight: "800", lineHeight: "100px" },
    "9xl": { size: "128px", weight: "900", lineHeight: "132px" },
  },
  "Merriweather": {
    "xs": { size: "12px", weight: "400", lineHeight: "18px" },
    "sm": { size: "14px", weight: "400", lineHeight: "22px" },
    "base": { size: "16px", weight: "400", lineHeight: "26px" },
    "lg": { size: "18px", weight: "400", lineHeight: "30px" },
    "xl": { size: "20px", weight: "500", lineHeight: "32px" },
    "2xl": { size: "24px", weight: "500", lineHeight: "36px" },
    "3xl": { size: "30px", weight: "600", lineHeight: "40px" },
    "4xl": { size: "36px", weight: "600", lineHeight: "44px" },
    "5xl": { size: "48px", weight: "700", lineHeight: "52px" },
    "6xl": { size: "60px", weight: "700", lineHeight: "64px" },
    "7xl": { size: "72px", weight: "800", lineHeight: "76px" },
    "8xl": { size: "96px", weight: "800", lineHeight: "100px" },
    "9xl": { size: "128px", weight: "900", lineHeight: "132px" },
  },
};

// Semantic typography categories
const semanticTypography = {
  "Headings": {
    "h1": { size: "48px", weight: "700", lineHeight: "56px", font: "Inter" },
    "h2": { size: "36px", weight: "600", lineHeight: "44px", font: "Inter" },
    "h3": { size: "30px", weight: "600", lineHeight: "38px", font: "Inter" },
    "h4": { size: "24px", weight: "500", lineHeight: "32px", font: "Inter" },
    "h5": { size: "20px", weight: "500", lineHeight: "28px", font: "Inter" },
    "h6": { size: "18px", weight: "500", lineHeight: "26px", font: "Inter" },
  },
  "Body Text": {
    "body-large": { size: "18px", weight: "400", lineHeight: "28px", font: "Roboto" },
    "body": { size: "16px", weight: "400", lineHeight: "24px", font: "Roboto" },
    "body-small": { size: "14px", weight: "400", lineHeight: "20px", font: "Roboto" },
    "body-xs": { size: "12px", weight: "400", lineHeight: "16px", font: "Roboto" },
  },
  "Display Text": {
    "display-large": { size: "72px", weight: "800", lineHeight: "80px", font: "Merriweather" },
    "display": { size: "60px", weight: "700", lineHeight: "68px", font: "Merriweather" },
    "display-small": { size: "48px", weight: "700", lineHeight: "56px", font: "Merriweather" },
  },
  "UI Elements": {
    "button-large": { size: "18px", weight: "500", lineHeight: "24px", font: "Inter" },
    "button": { size: "16px", weight: "500", lineHeight: "20px", font: "Inter" },
    "button-small": { size: "14px", weight: "500", lineHeight: "18px", font: "Inter" },
    "input": { size: "16px", weight: "400", lineHeight: "24px", font: "Roboto" },
    "label": { size: "14px", weight: "500", lineHeight: "20px", font: "Inter" },
    "caption": { size: "12px", weight: "400", lineHeight: "16px", font: "Roboto" },
  },
  "Navigation": {
    "nav-large": { size: "18px", weight: "500", lineHeight: "24px", font: "Inter" },
    "nav": { size: "16px", weight: "500", lineHeight: "20px", font: "Inter" },
    "nav-small": { size: "14px", weight: "500", lineHeight: "18px", font: "Inter" },
  },
  "Code": {
    "code-large": { size: "16px", weight: "400", lineHeight: "24px", font: "Roboto" },
    "code": { size: "14px", weight: "400", lineHeight: "20px", font: "Roboto" },
    "code-small": { size: "12px", weight: "400", lineHeight: "16px", font: "Roboto" },
  },
};

// Typography Token Component
const TypographyToken = ({ 
  size, 
  weight, 
  lineHeight, 
  font, 
  alias, 
  included, 
  type, 
  category,
  onToggleIncluded,
  relatedPrimitives = []
}: {
  size: string;
  weight: string;
  lineHeight: string;
  font: string;
  alias: string;
  included: boolean;
  type: "primitive" | "semantic";
  category?: string;
  onToggleIncluded: () => void;
  relatedPrimitives?: string[];
}) => {
  return (
    <div className="group relative">
      <div className={`
        relative bg-white dark:bg-gray-900 border rounded-lg p-4 min-w-[160px] transition-all duration-150
        ${included 
          ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900' 
          : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
        }
        ${type === 'semantic' ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800' : ''}
      `}>
        {/* Font Preview */}
        <div 
          className="mb-3 text-gray-900 dark:text-gray-100"
          style={{
            fontSize: size,
            fontWeight: weight as any,
            lineHeight: lineHeight,
            fontFamily: font === "Inter" ? "Inter, system-ui, sans-serif" : 
                        font === "Roboto" ? "Roboto, system-ui, sans-serif" : 
                        "Merriweather, Georgia, serif"
          }}
        >
          Aa
        </div>
        
        {/* Token Info */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {alias}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono">{size}</span>
              <span className="text-gray-400">/</span>
              <span className="font-mono">{lineHeight}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Weight {weight}</span>
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md font-medium">
                {font}
              </span>
            </div>
          </div>
        </div>

        {/* Semantic Badge */}
        {type === 'semantic' && (
          <div className="absolute top-3 right-3">
            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-md font-medium">
              {category}
            </span>
          </div>
        )}
      </div>
      
      {/* Show related primitives for semantic tokens */}
      {type === 'semantic' && relatedPrimitives.length > 0 && (
        <div className="absolute -bottom-1 left-0 right-0 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-b-lg p-1 text-xs text-orange-700 dark:text-orange-300">
          <div className="font-medium mb-1">Uses:</div>
          <div className="flex flex-wrap gap-1">
            {relatedPrimitives.slice(0, 3).map(prim => (
              <span key={prim} className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900 rounded text-xs">
                {prim}
              </span>
            ))}
            {relatedPrimitives.length > 3 && (
              <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900 rounded text-xs">
                +{relatedPrimitives.length - 3}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function TypographyView({ query = "" }: { query?: string }) {
  const [activeTab, setActiveTab] = useState<"primitives" | "semantics">("primitives");
  
  // State for primitives
  const [primitives, setPrimitives] = useState(() => {
    const initial: Record<string, { size: string; weight: string; lineHeight: string; font: string; alias: string; included: boolean }[]> = {};
    
    Object.entries(typographyPrimitives).forEach(([fontFamily, scales]) => {
      initial[fontFamily] = Object.entries(scales).map(([scale, styles]) => ({
        ...styles,
        font: fontFamily,
        alias: `${fontFamily.toLowerCase()}-${scale}`,
        included: true,
      }));
    });
    
    return initial;
  });
  
  const [openPrimitives, setOpenPrimitives] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(typographyPrimitives).forEach(font => {
      initial[font] = false;
    });
    return initial;
  });

  // State for semantics
  const [openSemantics, setOpenSemantics] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    Object.keys(semanticTypography).forEach(category => {
      initial[category] = false;
    });
    return initial;
  });

  // Find semantic tokens that use primitive typography values
  const semanticToPrimitiveMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    
    // Check each semantic token against primitives
    Object.entries(semanticTypography).forEach(([category, tokens]) => {
      Object.entries(tokens).forEach(([name, styles]) => {
        const semanticName = `${category.toLowerCase().replace(/\s+/g, '-')}-${name}`;
        const matchingPrimitives: string[] = [];
        
        // Find primitives that match this semantic token's properties
        Object.entries(typographyPrimitives).forEach(([fontFamily, fontScales]) => {
          Object.entries(fontScales).forEach(([scale, primitiveStyles]) => {
            if (primitiveStyles.size === styles.size && 
                primitiveStyles.weight === styles.weight && 
                primitiveStyles.lineHeight === styles.lineHeight &&
                primitiveStyles.font === styles.font) {
              matchingPrimitives.push(`${fontFamily.toLowerCase()}-${scale}`);
            }
          });
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
        item.size.toLowerCase().includes(lower) ||
        item.weight.toLowerCase().includes(lower) ||
        item.font.toLowerCase().includes(lower)
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

  // Generate typography variables
  const generateVariables = () => {
    try {
      const variables: Array<{
        name: string;
        size: string;
        weight: string;
        lineHeight: string;
        font: string;
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
              size: item.size,
              weight: item.weight,
              lineHeight: item.lineHeight,
              font: item.font,
              type: "primitive"
            });
          }
        });
      });

      // Add all semantic tokens
      Object.entries(semanticTypography).forEach(([category, tokens]) => {
        Object.entries(tokens).forEach(([name, styles]) => {
          const semanticName = `${category.toLowerCase().replace(/\s+/g, '-')}-${name}`;
          variables.push({
            name: semanticName,
            size: styles.size,
            weight: styles.weight,
            lineHeight: styles.lineHeight,
            font: styles.font,
            type: "semantic",
            category,
            relatedPrimitives: semanticToPrimitiveMap[semanticName] || []
          });
        });
      });

      console.log("Generated typography variables:", variables);

      // Notify parent about variable generation
      if (typeof window !== 'undefined' && window.parent) {
        window.parent.postMessage({
          pluginMessage: {
            type: "generate-typography-variables",
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
      console.error("Error generating typography variables:", error);
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
            const semanticCount = Object.entries(semanticTypography).reduce((sum, [_, tokens]) => 
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
              return `Typography primitives across three font families: Inter, Roboto, and Merriweather (${totalTokens} tokens available). Select which ones to include in your design system.`;
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
              <div className="flex flex-wrap gap-3 p-4">
                {items.map((item, idx) => (
                  <TypographyToken
                    key={`${family}-${idx}`}
                    size={item.size}
                    weight={item.weight}
                    lineHeight={item.lineHeight}
                    font={item.font}
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
            Semantic typography tokens organized by use case and context. These automatically align with primitive values.
          </div>

          {Object.entries(semanticTypography).map(([category, tokens]) => (
            <Accordion
              key={category}
              id={`sem-${category}`}
              title={category}
              count={Object.keys(tokens).length}
              isOpen={!!openSemantics[category]}
              onToggle={() => toggleSemantic(category)}
            >
              <div className="flex flex-wrap gap-3 p-4">
                {Object.entries(tokens).map(([name, styles]) => {
                  const semanticName = `${category.toLowerCase().replace(/\s+/g, '-')}-${name}`;
                  const relatedPrimitives = semanticToPrimitiveMap[semanticName] || [];
                  
                  return (
                    <TypographyToken
                      key={`${category}-${name}`}
                      size={styles.size}
                      weight={styles.weight}
                      lineHeight={styles.lineHeight}
                      font={styles.font}
                      alias={semanticName}
                      included={true}
                      type="semantic"
                      category={category}
                      onToggleIncluded={() => {}}
                      relatedPrimitives={relatedPrimitives}
                    />
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