import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.ico", "pwa-192x192.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/, /^\/auth\/callback/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        skipWaiting: false,
        clientsClaim: false,
      },
      manifest: {
        name: "TradeBook – Trading Journal",
        short_name: "TradeBook",
        description: "A structured trading journal and analytics platform for Indian markets.",
        theme_color: "#0a0f1c",
        background_color: "#0a0f1c",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        categories: ["finance", "productivity"],
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-192x192.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/favicon.ico",
            sizes: "64x64",
            type: "image/x-icon",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-motion": ["framer-motion"],
          "vendor-charts": ["recharts"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-canvas": ["konva", "react-konva"],
          "vendor-date": ["date-fns"],
          "vendor-dnd": ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
        },
        chunkFileNames: (chunkInfo) => {
          // Group docs mockup modules into a dedicated chunk
          if (chunkInfo.facadeModuleId?.includes("/docs/Docs")) {
            return "assets/docs-mockups-[hash].js";
          }
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
}));
