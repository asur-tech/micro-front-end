import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PayrollRoutes from './app/PayrollRoutes';

function StandaloneApp() {
  return (
    <BrowserRouter>
      <div className="p-6">
        <Routes>
          <Route path="/policy/:policyId/payroll" element={<PayrollRoutes />} />
          <Route
            path="*"
            element={<div>Payroll Remote — standalone dev mode</div>}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(<StandaloneApp />);
}
