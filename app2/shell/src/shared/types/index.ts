export interface Policy {
  policyId: string;
  holderName: string;
  status: "active" | "pending" | "cancelled" | "expired";
  effectiveDate: string;
  expirationDate: string;
  premium: number;
  type: string;
}

export interface PayrollRecord {
  id: string;
  policyId: string;
  period: string;
  employeeCount: number;
  totalWages: number;
  reportedPremium: number;
  status: "submitted" | "under_review" | "approved" | "rejected";
}

export interface Invoice {
  id: string;
  policyId: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  issuedDate: string;
  description: string;
}

export interface Claim {
  id: string;
  policyId: string;
  claimantName: string;
  dateOfInjury: string;
  status: "open" | "under_investigation" | "approved" | "denied" | "closed";
  description: string;
  amount: number;
  filedDate: string;
}

export interface DashboardData {
  policy: Policy | null;
  recentPayroll: PayrollRecord | null;
  recentInvoices: Invoice[];
  openClaims: Claim[];
}
