export const typeDefs = `#graphql
  type Query {
    policy(policyId: String!): Policy
    policies: [Policy!]!
    payroll(policyId: String!): [PayrollRecord!]!
    invoices(policyId: String!): [Invoice!]!
    claims(policyId: String!): [Claim!]!
    dashboard(policyId: String!): Dashboard!
  }

  type Policy {
    policyId: String!
    holderName: String!
    status: String!
    effectiveDate: String!
    expirationDate: String!
    premium: Float!
    type: String!
  }

  type PayrollRecord {
    id: String!
    policyId: String!
    period: String!
    employeeCount: Int!
    totalWages: Float!
    reportedPremium: Float!
    status: String!
  }

  type Invoice {
    id: String!
    policyId: String!
    amount: Float!
    dueDate: String!
    status: String!
    issuedDate: String!
    description: String!
  }

  type Claim {
    id: String!
    policyId: String!
    claimantName: String!
    dateOfInjury: String!
    status: String!
    description: String!
    amount: Float!
    filedDate: String!
  }

  type Dashboard {
    policy: Policy
    recentPayroll: PayrollRecord
    recentInvoices: [Invoice!]!
    openClaims: [Claim!]!
  }
`;
