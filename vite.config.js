import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Stokify",
        short_name: "App",
        description: "Aplikasi Inventaris UMKM",
        display: "standalone",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,webp}"],

        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "document" || request.destination === "script" || request.destination === "style" || request.destination === "image" || request.destination === "font",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "app-cache",
            },
          },
        ],
      },
    }),
  ],
});
