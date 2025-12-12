import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable source maps only in development
    sourcemap: mode === "development",
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Rollup options for better code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks - libraries that rarely change
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-popover",
          ],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-utils": ["date-fns", "clsx", "tailwind-merge", "zod"],
          // PostHog in its own chunk to keep it isolated
          "vendor-analytics": ["posthog-js"],
        },
        // Optimize chunk file names for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split("/").pop()?.replace(".tsx", "").replace(".ts", "")
            : "chunk";
          return `assets/${facadeModuleId}-[hash].js`;
        },
        // Asset file names
        assetFileNames: "assets/[name]-[hash][extname]",
        // Entry file name
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
    // Minification options
    minify: "terser",
    terserOptions: {
      compress: {
        // Remove console.log in production (keep console.warn and console.error)
        drop_console: mode === "production" ? ["log"] : false,
        drop_debugger: true,
      },
    },
    // Target modern browsers for smaller bundles
    target: "es2020",
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "posthog-js",
    ],
  },
}));
