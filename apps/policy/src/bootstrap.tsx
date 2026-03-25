/**
 * POLICY REMOTE BOOTSTRAP — Standalone development entry point.
 *
 * This file serves TWO purposes:
 *
 * 1. STANDALONE MODE: When a developer runs `npm run start:policy` and opens
 *    http://localhost:3001 directly, this renders a standalone version of the
 *    policy vertical with its own BrowserRouter. The developer can work on
 *    policy features without starting the shell or other remotes.
 *
 * 2. MODULE FEDERATION ENTRY: When the shell loads this remote, it doesn't
 *    use this file — it imports specific exposed modules (PolicyRoutes,
 *    PolicySummaryWidget) directly. This bootstrap only runs when the remote
 *    is accessed directly in the browser.
 *
 * This means each team can develop independently, then integrate via the shell.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PolicyRoutes from './app/PolicyRoutes';

function StandaloneApp() {
  return (
    <BrowserRouter>
      <div className="p-6">
        <Routes>
          <Route path="/policy/:policyId" element={<PolicyRoutes />} />
          <Route path="*" element={<div>Policy Remote — standalone dev mode</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<StandaloneApp />);
}
