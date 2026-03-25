import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ShellLayout from './layout/ShellLayout';
import Dashboard from './Dashboard';
import '../styles.css';

const PolicyRoutes = React.lazy(() => import('policy/PolicyRoutes'));
const PayrollRoutes = React.lazy(() => import('payroll/PayrollRoutes'));
const BillingRoutes = React.lazy(() => import('billing/BillingRoutes'));
const ClaimsRoutes = React.lazy(() => import('claims/ClaimsRoutes'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-400">Loading module...</div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ShellLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/policy/:policyId"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <PolicyRoutes />
              </Suspense>
            }
          />
          <Route
            path="/policy/:policyId/payroll"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <PayrollRoutes />
              </Suspense>
            }
          />
          <Route
            path="/policy/:policyId/billing"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <BillingRoutes />
              </Suspense>
            }
          />
          <Route
            path="/policy/:policyId/claims"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ClaimsRoutes />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
