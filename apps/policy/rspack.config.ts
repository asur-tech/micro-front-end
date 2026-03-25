import { defineConfig } from "@rspack/cli";
import { ModuleFederationPlugin } from "@module-federation/enhanced/rspack";
import { resolve } from "path";

export default defineConfig({
  entry: "./src/entry.ts",
  mode: "development",
  devtool: "source-map",
  devServer: {
    port: 3001,
    hot: true,
    historyApiFallback: true,
    headers: { "Access-Control-Allow-Origin": "*" },
    watchFiles: [resolve(__dirname, "../libs/shared/**/*")],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@org/shared-types": resolve(__dirname, "../libs/shared/types/src"),
      "@org/shared-design-system": resolve(__dirname, "../libs/shared/design-system/src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "builtin:swc-loader",
          options: {
            jsc: {
              parser: { syntax: "typescript", tsx: true },
              transform: { react: { runtime: "automatic" } },
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
        type: "javascript/auto",
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "policy",
      filename: "remoteEntry.js",
      exposes: {
        "./PolicyRoutes": "./src/app/PolicyRoutes",
        "./PolicySummaryWidget": "./src/app/PolicySummaryWidget",
      },
      shared: {
        react: { singleton: true, requiredVersion: false, eager: false },
        "react-dom": { singleton: true, requiredVersion: false, eager: false },
        "react-router-dom": { singleton: true, requiredVersion: false, eager: false },
      },
    }),
  ],
  output: {
    publicPath: "auto",
    uniqueName: "policy",
  },
});
