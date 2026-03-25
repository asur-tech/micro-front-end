/**
 * SHELL (HOST) RSPACK CONFIG — The main container application.
 *
 * This is the app users open in their browser (http://localhost:3000).
 * It loads remote micro-frontends at RUNTIME via Module Federation.
 *
 * KEY CONCEPTS:
 *   - "Host" = the shell. It CONSUMES modules from remotes.
 *   - "Remotes" = the vertical apps (policy, payroll, billing, claims).
 *     They each run on their own port and EXPOSE modules.
 *   - "Shared" = libraries like React that must exist only ONCE in the browser.
 *     Without singleton sharing, React hooks break across module boundaries
 *     because each app would have its own React instance.
 *
 * Rspack is a Webpack-compatible bundler written in Rust (5-10x faster builds).
 * Same config format as Webpack 5, but with native Module Federation support.
 */
import { defineConfig } from '@rspack/cli';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { HtmlRspackPlugin } from '@rspack/core';
import { resolve } from 'path';

export default defineConfig({
  // entry.ts is the async boundary — see entry.ts comments for why
  entry: './src/entry.ts',
  mode: 'development',
  devtool: 'source-map',

  devServer: {
    port: 3000, // Shell always runs on port 3000
    hot: true, // Hot Module Replacement for fast dev
    // historyApiFallback: tells the dev server to serve index.html for all routes.
    // Without this, refreshing on /policy/POL-001 would return a 404
    // because there's no actual file at that path — React Router handles it client-side.
    historyApiFallback: true,
    // Allow remotes (on different ports) to fetch chunks from this server
    headers: { 'Access-Control-Allow-Origin': '*' },
    watchFiles: [resolve(__dirname, '../libs/shared/**/*')],
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    // Path aliases so shared libs can be imported cleanly.
    // These map to the same paths defined in tsconfig.base.json.
    alias: {
      '@org/shared-types': resolve(__dirname, '../libs/shared/types/src'),
      '@org/shared-design-system': resolve(
        __dirname,
        '../libs/shared/design-system/src'
      ),
    },
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          // Rspack's built-in SWC loader — compiles TypeScript + JSX to JavaScript.
          // SWC is a Rust-based compiler (much faster than Babel).
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              // 'automatic' runtime = no need to import React in every file.
              // The compiler auto-inserts jsx() calls instead of React.createElement().
              transform: { react: { runtime: 'automatic' } },
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        // CSS processing pipeline (runs right-to-left):
        //   1. postcss-loader: processes Tailwind CSS directives (@import "tailwindcss")
        //   2. css-loader: resolves @import and url() in CSS
        //   3. style-loader: injects the CSS into the page via <style> tags
        use: ['style-loader', 'css-loader', 'postcss-loader'],
        type: 'javascript/auto',
      },
    ],
  },

  plugins: [
    // Generates the HTML file that loads our JavaScript bundle
    new HtmlRspackPlugin({
      template: './public/index.html',
    }),

    new ModuleFederationPlugin({
      // Unique name for this app in the Module Federation system
      name: 'shell',

      // REMOTES: tells the shell where to find each micro-frontend.
      // Format: 'remoteName@http://host:port/remoteEntry.js'
      //
      // When our code does: import('policy/PolicyRoutes')
      // Module Federation translates this to:
      //   1. Fetch http://localhost:3001/remoteEntry.js
      //   2. From that manifest, find the './PolicyRoutes' module
      //   3. Download and execute the code chunk for that module
      //   4. Return it as the import result
      //
      // In production, these URLs would point to a CDN (Azure Blob Storage)
      // and would be read from a remotes-manifest.json for independent deploys.
      remotes: {
        policy: 'policy@http://localhost:3001/remoteEntry.js',
        payroll: 'payroll@http://localhost:3002/remoteEntry.js',
        billing: 'billing@http://localhost:3003/remoteEntry.js',
        claims: 'claims@http://localhost:3004/remoteEntry.js',
      },

      // SHARED DEPENDENCIES: these libraries are shared between shell and all remotes.
      //
      // singleton: true → only ONE copy exists in the browser. Critical for React
      //   because hooks (useState, useContext) break if multiple React instances exist.
      //   When the shell loads React, all remotes reuse that same instance.
      //
      // eager: false → React is NOT bundled into the main chunk. Instead, it's loaded
      //   during the async boundary (entry.ts → bootstrap.tsx). This is the correct
      //   setting for the host when using the async boundary pattern.
      //
      // requiredVersion: false → don't enforce version matching. All apps in this
      //   monorepo use the same React version, so strict matching is unnecessary.
      shared: {
        react: { singleton: true, requiredVersion: false, eager: false },
        'react-dom': { singleton: true, requiredVersion: false, eager: false },
        'react-router-dom': {
          singleton: true,
          requiredVersion: false,
          eager: false,
        },
      },
    }),
  ],

  output: {
    // 'auto' means: figure out the public path from the script's URL at runtime.
    // This is essential for Module Federation because remotes are on different origins.
    publicPath: 'auto',
    // Prevents chunk naming collisions between apps
    uniqueName: 'shell',
  },
});
