import React, { Suspense, useEffect, useState } from "react";
import { PageHeader } from "@repo/ui";
import type { DashboardData } from "@repo/types";

const PolicyWidget = React.lazy(() => import("policy/PolicyWidget"));
const PayrollWidget = React.lazy(() => import("payroll/PayrollWidget"));
const BillingWidget = React.lazy(() => import("billing/BillingWidget"));
const ClaimsWidget = React.lazy(() => import("claims/ClaimsWidget"));

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const policyId = "POL-001";

  useEffect(() => {
    fetch("http://localhost:4005/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query Dashboard($policyId: String!) {
          dashboard(policyId: $policyId) {
            policy { policyId holderName status effectiveDate expirationDate premium type }
            recentPayroll { id policyId period employeeCount totalWages reportedPremium status }
            recentInvoices { id policyId amount dueDate status description }
            openClaims { id policyId claimantName dateOfInjury status description amount }
          }
        }`,
        variables: { policyId },
      }),
    })
      .then((res) => res.json())
      .then((json) => setData(json.data?.dashboard ?? null))
      .catch(console.error);
  }, [policyId]);

  if (!data) return null;

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Policy ${policyId}`} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={null}>
          <PolicyWidget policy={data.policy!} />
        </Suspense>
        <Suspense fallback={null}>
          <PayrollWidget payroll={data.recentPayroll} />
        </Suspense>
        <Suspense fallback={null}>
          <BillingWidget invoices={data.recentInvoices} />
        </Suspense>
        <Suspense fallback={null}>
          <ClaimsWidget claims={data.openClaims} />
        </Suspense>
      </div>
    </div>
  );
}
