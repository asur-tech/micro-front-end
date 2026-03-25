declare module "policy/PolicyDetail" {
  import type { ComponentType } from "react";
  const PolicyDetail: ComponentType;
  export default PolicyDetail;
}

declare module "policy/PolicyWidget" {
  import type { ComponentType } from "react";
  import type { Policy } from "@repo/types";
  const PolicyWidget: ComponentType<{ policy: Policy }>;
  export default PolicyWidget;
}

declare module "payroll/PayrollDetail" {
  import type { ComponentType } from "react";
  const PayrollDetail: ComponentType;
  export default PayrollDetail;
}

declare module "payroll/PayrollWidget" {
  import type { ComponentType } from "react";
  import type { PayrollRecord } from "@repo/types";
  const PayrollWidget: ComponentType<{ payroll: PayrollRecord | null }>;
  export default PayrollWidget;
}

declare module "billing/BillingDetail" {
  import type { ComponentType } from "react";
  const BillingDetail: ComponentType;
  export default BillingDetail;
}

declare module "billing/BillingWidget" {
  import type { ComponentType } from "react";
  import type { Invoice } from "@repo/types";
  const BillingWidget: ComponentType<{ invoices: Invoice[] }>;
  export default BillingWidget;
}

declare module "claims/ClaimsDetail" {
  import type { ComponentType } from "react";
  const ClaimsDetail: ComponentType;
  export default ClaimsDetail;
}

declare module "claims/ClaimsWidget" {
  import type { ComponentType } from "react";
  import type { Claim } from "@repo/types";
  const ClaimsWidget: ComponentType<{ claims: Claim[] }>;
  export default ClaimsWidget;
}
