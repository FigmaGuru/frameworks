import { useMemo } from "react";
import tailwindColors from "../lib/tailwind-colors.json";

type ColorRamp = {
  family: string;
  colors: {
    step: string;
    hex: string;
    alias: string;
  }[];
};

export function useGroupedTailwindColors(): ColorRamp[] {
  return useMemo(() => {
    const ramps: ColorRamp[] = [];

    for (const [family, steps] of Object.entries(tailwindColors)) {
      const seen = new Set<string>();

      const colors = Object.entries(steps as Record<string, string>)
        .filter(([_, hex]) => {
          const isValid = /^#([0-9a-f]{6})$/i.test(hex);
          const isNew = !seen.has(hex);
          if (isValid && isNew) {
            seen.add(hex);
            return true;
          }
          return false;
        })
        .map(([step, hex]) => ({
          step,
          hex,
          alias: `${family}/${step}`,
        }));

      if (colors.length > 0) {
        ramps.push({ family, colors });
      }
    }

    return ramps;
  }, []);
}