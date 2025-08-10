export function hexToRgb(hex) {
    const parsed = hex.replace("#", "");
    if (parsed.length !== 6)
        return null;
    const bigint = parseInt(parsed, 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}
