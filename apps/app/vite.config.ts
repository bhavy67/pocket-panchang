import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as { version: string };

export default defineConfig({
  define: { __APP_VERSION__: JSON.stringify(version) },
  plugins: [
    react(),
    tailwindcss(),
    // Full offline (§9, Phase 10): precache the app, worker, Gujarati fonts and the city list
    // (offline onboarding and city changes). "prompt": a new version waits for the user's tap.
    VitePWA({
      registerType: "prompt",
      injectRegister: false,
      includeAssets: ["icons/apple-touch-icon.png", "icons/icon.svg"],
      manifest: {
        id: "/",
        name: "Parivar Panchang",
        short_name: "Parivar",
        description:
          "A private, offline Hindu panchang with your family's tithi dates.",
        lang: "gu",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        // Calm palette accent and background (tokens.css); the manifest can't read CSS variables.
        theme_color: "#0B6E79",
        background_color: "#F7F6F2",
        categories: ["lifestyle", "utilities"],
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,woff2,png,svg,json}"],
        // Devanagari (v2 Hindi) is cached on first use instead; analyzer output never ships.
        globIgnores: ["**/noto-sans-devanagari-*", "stats.*", "vercel.json"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /noto-sans-devanagari-.*\.woff2$/,
            handler: "CacheFirst",
            options: { cacheName: "fonts-devanagari" },
          },
        ],
      },
    }),
    // `pnpm --filter @panchang/app analyze` writes dist/stats.{html,json}.
    !!process.env.ANALYZE &&
      visualizer({
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
    !!process.env.ANALYZE &&
      visualizer({
        filename: "dist/stats.json",
        template: "raw-data",
        gzipSize: true,
      }),
  ],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  worker: { format: "es" },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
