import { useMemo } from "react";
import tailwindColors from "../lib/tailwind-colors.json";
export function useGroupedTailwindColors() {
    return useMemo(() => {
        const ramps = [];
        for (const [family, steps] of Object.entries(tailwindColors)) {
            const seen = new Set();
            const colors = Object.entries(steps)
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
