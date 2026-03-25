import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ShellLayout from './layout/ShellLayout';
import Dashboard from './Dashboard';
import '../styles.css';

const PolicyRoutes = React.lazy(() => import('policy/PolicyRoutes'));
const PayrollRoutes = React.lazy(() => import('payroll/PayrollRoutes'));
const BillingRoutes = React.lazy(() => import('billing/BillingRoutes'));
const ClaimsRoutes = React.lazy(() => import('claims/ClaimsRoutes'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ShellLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/policy/:policyId"
            element={
              <Suspense>
                <PolicyRoutes />
              </Suspense>
            }
          />
          <Route
            path="/policy/:policyId/payroll"
            element={
              <Suspense>
                <PayrollRoutes />
              </Suspense>
            }
          />
          <Route
            path="/policy/:policyId/billing"
            element={
              <Suspense>
                <BillingRoutes />
              </Suspense>
            }
          />
          <Route
            path="/policy/:policyId/claims"
            element={
              <Suspense>
                <ClaimsRoutes />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
