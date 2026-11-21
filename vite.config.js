import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_BASE_PATH || '/backend_guide',
  build: {
    rollupOptions: {
      output: {
        // Keep the big third-party libraries in their own chunks so no single
        // bundle crosses the 500 kB warning line, and so a data edit does not
        // invalidate React, Motion or Prism in the browser cache.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("prism")) return "syntax";
          if (
            id.includes("framer-motion") ||
            id.includes("motion-dom") ||
            id.includes("motion-utils")
          ) {
            return "motion";
          }
          if (id.includes("react") || id.includes("scheduler")) return "react";
          return "vendor";
        },
      },
    },
  },
});
