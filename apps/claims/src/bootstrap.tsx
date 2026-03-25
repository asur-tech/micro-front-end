import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClaimsRoutes from './app/ClaimsRoutes';

function StandaloneApp() {
  return (
    <BrowserRouter>
      <div className="p-6">
        <Routes>
          <Route path="/policy/:policyId/claims" element={<ClaimsRoutes />} />
          <Route path="*" element={<div>Claims Remote — standalone dev mode</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<StandaloneApp />);
}
