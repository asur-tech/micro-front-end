import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    federation({
      name: "shell",
      remotes: {
        policy: {
          type: "module",
          name: "policy",
          entry: "http://localhost:4001/remoteEntry.js",
        },
        payroll: {
          type: "module",
          name: "payroll",
          entry: "http://localhost:4002/remoteEntry.js",
        },
        billing: {
          type: "module",
          name: "billing",
          entry: "http://localhost:4003/remoteEntry.js",
        },
        claims: {
          type: "module",
          name: "claims",
          entry: "http://localhost:4004/remoteEntry.js",
        },
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
      "@repo/types": resolve(__dirname, "src/shared/types"),
      "@repo/ui": resolve(__dirname, "src/shared/ui"),
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: 4000,
    origin: "http://localhost:4000",
  },
  build: {
    target: "es2022",
  },
});
