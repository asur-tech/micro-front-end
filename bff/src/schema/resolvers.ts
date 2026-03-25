const API = 'http://localhost:4010';

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Upstream error: ${res.status} from ${url}`);
  return res.json();
}

export const resolvers = {
  Query: {
    policy: async (_: any, { policyId }: { policyId: string }) => {
      return fetchJson(`${API}/policies/${policyId}`);
    },

    policies: async () => {
      return fetchJson(`${API}/policies`);
    },

    payroll: async (_: any, { policyId }: { policyId: string }) => {
      return fetchJson(`${API}/payroll?policyId=${policyId}`);
    },

    invoices: async (_: any, { policyId }: { policyId: string }) => {
      return fetchJson(`${API}/invoices?policyId=${policyId}`);
    },

    claims: async (_: any, { policyId }: { policyId: string }) => {
      return fetchJson(`${API}/claims?policyId=${policyId}`);
    },

    dashboard: async (_: any, { policyId }: { policyId: string }) => {
      const [policyResult, payroll, invoicesData, claimsData] = await Promise.allSettled([
        fetchJson(`${API}/policies/${policyId}`),
        fetchJson(`${API}/payroll?policyId=${policyId}`),
        fetchJson(`${API}/invoices?policyId=${policyId}`),
        fetchJson(`${API}/claims?policyId=${policyId}`),
      ]);

      const rawPayroll = payroll.status === 'fulfilled' ? payroll.value : [];
      const rawInvoices = invoicesData.status === 'fulfilled' ? invoicesData.value : [];
      const rawClaims = claimsData.status === 'fulfilled' ? claimsData.value : [];

      return {
        policy: policyResult.status === 'fulfilled' ? policyResult.value : null,
        recentPayroll: rawPayroll[0] || null,
        recentInvoices: rawInvoices,
        openClaims: rawClaims.filter((c: any) => c.status === 'open' || c.status === 'under_investigation'),
      };
    },
  },
};
