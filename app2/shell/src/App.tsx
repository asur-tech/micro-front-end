import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import Dashboard from "./pages/dashboard";

const PolicyDetail = React.lazy(() => import("policy/PolicyDetail"));
const PayrollDetail = React.lazy(() => import("payroll/PayrollDetail"));
const BillingDetail = React.lazy(() => import("billing/BillingDetail"));
const ClaimsDetail = React.lazy(() => import("claims/ClaimsDetail"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/policy/:policyId"
            element={
              <Suspense>
                <PolicyDetail />
              </Suspense>
            }
          />
          <Route
            path="/policy/:policyId/payroll"
            element={
              <Suspense>
                <PayrollDetail />
              </Suspense>
            }
          />
          <Route
            path="/policy/:policyId/billing"
            element={
              <Suspense>
                <BillingDetail />
              </Suspense>
            }
          />
          <Route
            path="/policy/:policyId/claims"
            element={
              <Suspense>
                <ClaimsDetail />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
