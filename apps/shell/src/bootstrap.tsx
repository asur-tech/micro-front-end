/**
 * SHELL BOOTSTRAP — Mounts the React app after Module Federation initialization.
 *
 * This file runs AFTER entry.ts's dynamic import() resolves, which means
 * Module Federation has already:
 *   1. Loaded remoteEntry.js from each remote (policy, payroll, billing, claims)
 *   2. Negotiated shared dependencies (React is now a singleton)
 *   3. Made all exposed remote modules available for lazy loading
 *
 * At this point, it's safe to import React and render the app.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';

// Mount the shell app into the #root div defined in public/index.html
const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<App />);
}
