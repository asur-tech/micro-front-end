/**
 * SHELL ENTRY POINT — The async boundary for Module Federation.
 *
 * WHY THIS FILE EXISTS:
 * Module Federation needs to negotiate shared dependencies (React, React DOM, React Router)
 * between the shell (host) and all remote apps BEFORE any application code runs.
 *
 * This dynamic import() creates an async boundary — it tells the bundler:
 * "Don't execute bootstrap.tsx immediately. First, load all the remoteEntry.js files,
 * figure out which app provides the shared React singleton, then run bootstrap."
 *
 * Without this file, you'd get runtime errors like:
 *   "Shared module is not available for eager consumption"
 *
 * PATTERN: Every Module Federation app (host or remote) follows this:
 *   entry.ts → import('./bootstrap') → bootstrap.tsx → actual app
 *
 * This is the ONLY thing this file does. Don't add anything else here.
 */
import('./bootstrap');
