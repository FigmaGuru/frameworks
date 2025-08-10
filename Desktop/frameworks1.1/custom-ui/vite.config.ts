// vite.config.ts (inside custom-ui/)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";

export default defineConfig({
  root: "src", // 👈 Tells Vite to treat /src as root
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: path.resolve(__dirname, "dist"), // 👈 Absolute path to /custom-ui/dist
    assetsDir: "",           // 👈 Avoid nested assets folder
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    emptyOutDir: true,
    minify: true,
    target: "esnext",
    cssCodeSplit: false,
    inlineDynamicImports: true,
  },
});