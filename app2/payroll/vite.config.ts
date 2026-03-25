import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    federation({
      name: "payroll",
      filename: "remoteEntry.js",
      bundleAllCSS: true,
      exposes: {
        "./PayrollDetail": "./src/routes/payroll-detail",
        "./PayrollWidget": "./src/routes/payroll-widget",
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
    port: 4002,
    origin: "http://localhost:4002",
  },
  preview: {
    port: 4002,
    cors: true,
  },
  build: {
    target: "es2022",
  },
  base: "http://localhost:4002",
});
