/**
 * TYPE DECLARATIONS FOR MODULE FEDERATION REMOTES
 *
 * TypeScript has no built-in understanding of Module Federation.
 * When our code writes: import('policy/PolicyRoutes')
 * TypeScript doesn't know what 'policy/PolicyRoutes' is — it's not a file path
 * or an npm package. It's a Module Federation remote module.
 *
 * These declarations tell TypeScript:
 *   "Trust me, 'policy/PolicyRoutes' exists and exports a React component."
 *
 * Without this file, you'd get: Cannot find module 'policy/PolicyRoutes'
 *
 * The module names match the pattern: {remoteName}/{exposedModuleName}
 * where remoteName comes from rspack.config.ts remotes
 * and exposedModuleName comes from the remote's exposes config.
 */

// POLICY REMOTE (http://localhost:3001)
declare module 'policy/PolicyRoutes' {
  const Component: React.ComponentType;
  export default Component;
}
declare module 'policy/PolicySummaryWidget' {
  const Component: React.ComponentType<{ policy: any }>;
  export default Component;
}

// PAYROLL REMOTE (http://localhost:3002)
declare module 'payroll/PayrollRoutes' {
  const Component: React.ComponentType;
  export default Component;
}
declare module 'payroll/PayrollWidget' {
  const Component: React.ComponentType<{ payroll: any }>;
  export default Component;
}

// BILLING REMOTE (http://localhost:3003)
declare module 'billing/BillingRoutes' {
  const Component: React.ComponentType;
  export default Component;
}
declare module 'billing/BillingWidget' {
  const Component: React.ComponentType<{ invoices: any[] }>;
  export default Component;
}

// CLAIMS REMOTE (http://localhost:3004)
declare module 'claims/ClaimsRoutes' {
  const Component: React.ComponentType;
  export default Component;
}
declare module 'claims/ClaimsWidget' {
  const Component: React.ComponentType<{ claims: any[] }>;
  export default Component;
}
