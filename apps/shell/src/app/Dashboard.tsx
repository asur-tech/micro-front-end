/**
 * DASHBOARD — Aggregates widgets from all 4 remote micro-frontends.
 *
 * This is the best demonstration of micro-frontend composition:
 *   - The shell makes ONE GraphQL query to the BFF for all dashboard data
 *   - The BFF fans out to 4 backend services IN PARALLEL (mixed protocols)
 *   - Each widget component is loaded from a DIFFERENT remote application
 *   - If one remote fails, the others still render (error boundaries)
 *
 * DATA FLOW:
 *   Dashboard → BFF GraphQL → [Policy(GraphQL), Payroll(REST), Billing(REST), Claims(REST)]
 *                           → Field-level filtering by role
 *                           → Unified response
 *   Dashboard → distributes data to widgets from 4 different remotes
 */
import React, { Suspense, useEffect, useState } from 'react';
import type { DashboardData } from '../../../libs/shared/types/src';
import { ErrorFallback } from '../../../libs/shared/design-system/src';

/**
 * LAZY-LOADED WIDGET COMPONENTS FROM REMOTES
 *
 * Each widget is a small summary component exposed by a remote app.
 * Unlike the full-page route components, widgets receive their data as props
 * (the dashboard fetches all data centrally via one BFF call).
 *
 * The import paths map to Module Federation remotes:
 *   'policy/PolicySummaryWidget' → http://localhost:3001/remoteEntry.js → PolicySummaryWidget
 *   'payroll/PayrollWidget'      → http://localhost:3002/remoteEntry.js → PayrollWidget
 *   etc.
 */
const PolicySummaryWidget = React.lazy(() => import('policy/PolicySummaryWidget'));
const PayrollWidget = React.lazy(() => import('payroll/PayrollWidget'));
const BillingWidget = React.lazy(() => import('billing/BillingWidget'));
const ClaimsWidget = React.lazy(() => import('claims/ClaimsWidget'));

/**
 * Skeleton loading state — shown while a remote widget JS is being fetched.
 * Uses CSS animation (animate-pulse) to indicate loading.
 */
function WidgetFallback({ name }: { name: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-3 bg-gray-100 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
    </div>
  );
}

/**
 * ERROR BOUNDARY — Catches errors when a remote widget fails to load.
 *
 * WHY THIS MATTERS: If the Policy remote server is down, we don't want the
 * entire dashboard to crash. This boundary catches the error and shows a
 * "Failed to load Policy Remote" message, while Payroll/Billing/Claims
 * continue to work normally.
 *
 * Each widget gets its own error boundary so failures are isolated.
 */
class WidgetErrorBoundary extends React.Component<
  { name: string; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <ErrorFallback name={this.props.name} error={this.state.error} />;
    }
    return this.props.children;
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const policyId = 'POL-001';

  useEffect(() => {
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      .then((json) => setData(json.data?.dashboard || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [policyId]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Policy {policyId}</p>
      </div>

      {loading ? (
        // Show skeleton placeholders while data is being fetched
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WidgetFallback name="Policy" />
          <WidgetFallback name="Payroll" />
          <WidgetFallback name="Billing" />
          <WidgetFallback name="Claims" />
        </div>
      ) : (
        /**
         * WIDGET COMPOSITION — each widget is from a DIFFERENT remote app.
         *
         * Structure per widget:
         *   WidgetErrorBoundary → catches remote load failures
         *     Suspense → shows skeleton while remote JS downloads
         *       <RemoteWidget> → the actual component from the remote
         *
         * The data prop is passed from the central BFF response.
         * Each widget is owned by a different team but renders seamlessly.
         */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WidgetErrorBoundary name="Policy Remote">
            <Suspense fallback={<WidgetFallback name="Policy" />}>
              <PolicySummaryWidget policy={data?.policy || null} />
            </Suspense>
          </WidgetErrorBoundary>

          <WidgetErrorBoundary name="Payroll Remote">
            <Suspense fallback={<WidgetFallback name="Payroll" />}>
              <PayrollWidget payroll={data?.recentPayroll || null} />
            </Suspense>
          </WidgetErrorBoundary>

          <WidgetErrorBoundary name="Billing Remote">
            <Suspense fallback={<WidgetFallback name="Billing" />}>
              <BillingWidget invoices={data?.recentInvoices || []} />
            </Suspense>
          </WidgetErrorBoundary>

          <WidgetErrorBoundary name="Claims Remote">
            <Suspense fallback={<WidgetFallback name="Claims" />}>
              <ClaimsWidget claims={data?.openClaims || []} />
            </Suspense>
          </WidgetErrorBoundary>
        </div>
      )}
    </div>
  );
}
