import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    federation({
      name: "policy",
      filename: "remoteEntry.js",
      bundleAllCSS: true,
      exposes: {
        "./PolicyDetail": "./src/routes/policy-detail",
        "./PolicyWidget": "./src/routes/policy-widget",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        "react-router-dom": { singleton: true },
      },
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@repo/types": resolve(__dirname, "../shell/src/shared/types"),
      "@repo/ui": resolve(__dirname, "../shell/src/shared/ui"),
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 4001,
    origin: "http://localhost:4001",
  },
  preview: {
    port: 4001,
    cors: true,
  },
  build: {
    target: "es2022",
  },
  base: "http://localhost:4001",
});
