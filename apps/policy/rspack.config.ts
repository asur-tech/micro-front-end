/**
 * POLICY REMOTE RSPACK CONFIG — An independently deployable micro-frontend.
 *
 * This is a REMOTE in Module Federation terms. It:
 *   1. EXPOSES modules that the shell (host) can import at runtime
 *   2. Can run STANDALONE on port 3001 for independent development
 *   3. Shares React as a singleton with the shell (so hooks/context work)
 *
 * WHAT THIS REMOTE EXPOSES:
 *   - './PolicyRoutes': Full-page component for /policy/:policyId route
 *   - './PolicySummaryWidget': Small card component for the dashboard
 *
 * HOW THE SHELL CONSUMES THIS:
 *   Shell's rspack.config.ts has: remotes: { policy: 'policy@http://localhost:3001/remoteEntry.js' }
 *   Shell's code does: import('policy/PolicyRoutes') → fetches from this server
 *
 * In production, this app would be built separately and deployed to a CDN.
 * The shell would read the URL from a remotes-manifest.json file.
 */
import { defineConfig } from '@rspack/cli';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';
import { resolve } from 'path';

export default defineConfig({
  entry: './src/entry.ts', // Async boundary — same pattern as the shell
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    port: 3001, // Each remote runs on a unique port
    hot: true,
    historyApiFallback: true,
    // CORS header required so the shell (port 3000) can fetch our remoteEntry.js and chunks
    headers: { 'Access-Control-Allow-Origin': '*' },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@org/shared-types': resolve(__dirname, '../libs/shared/types/src'),
      '@org/shared-design-system': resolve(__dirname, '../libs/shared/design-system/src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: { syntax: 'typescript', tsx: true },
              transform: { react: { runtime: 'automatic' } },
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
        type: 'javascript/auto',
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      // Name must match what the shell uses in its remotes config
      name: 'policy',

      // The manifest file that the shell fetches to discover our modules.
      // When the shell loads http://localhost:3001/remoteEntry.js, it gets
      // a JS file that registers this remote and its exposed modules.
      filename: 'remoteEntry.js',

      // EXPOSES: modules that other apps (the shell) can import from this remote.
      //
      // The key './PolicyRoutes' means the shell imports it as:
      //   import('policy/PolicyRoutes')
      //   where 'policy' = remote name, 'PolicyRoutes' = exposed module
      //
      // The value './src/app/PolicyRoutes' is the local file path to the component.
      exposes: {
        './PolicyRoutes': './src/app/PolicyRoutes',
        './PolicySummaryWidget': './src/app/PolicySummaryWidget',
      },

      // Same shared config as the shell — React must be a singleton.
      // When loaded inside the shell, this remote will use the shell's React instance.
      // When running standalone (port 3001 directly), it uses its own React.
      shared: {
        react: { singleton: true, requiredVersion: false, eager: false },
        'react-dom': { singleton: true, requiredVersion: false, eager: false },
        'react-router-dom': { singleton: true, requiredVersion: false, eager: false },
      },
    }),
  ],
  output: {
    publicPath: 'auto',
    uniqueName: 'policy', // Prevents chunk name collisions between remotes
  },
});
