import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Badge,
  DataField,
  PageHeader,
} from "@repo/ui";
import type { Invoice } from "@repo/types";

export default function BillingDetail() {
  const { policyId } = useParams<{ policyId: string }>();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!policyId) return;
    fetch("http://localhost:4005/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query GetInvoices($policyId: String!) {
          invoices(policyId: $policyId) {
            id policyId amount dueDate status issuedDate description
          }
        }`,
        variables: { policyId },
      }),
    })
      .then((res) => res.json())
      .then((data) => setInvoices(data.data?.invoices ?? []))
      .catch(console.error);
  }, [policyId]);

  return (
    <div>
      <PageHeader title="Billing" subtitle={`Policy ${policyId}`} />
      <div className="max-w-2xl space-y-6">
        {invoices.map((inv, i) => (
          <div key={inv.id}>
            {i > 0 && <hr className="mb-6" />}
            <Card>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <DataField label="Invoice" value={inv.id} />
                <DataField
                  label="Status"
                  value={<Badge variant="secondary">{inv.status}</Badge>}
                />
                <DataField
                  label="Amount"
                  value={`$${inv.amount.toLocaleString()}`}
                />
                <DataField label="Due Date" value={inv.dueDate} />
                <DataField label="Description" value={inv.description} />
              </div>
            </CardContent>
          </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
