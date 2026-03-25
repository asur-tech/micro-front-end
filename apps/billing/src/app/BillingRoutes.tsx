import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, DataField, Badge, PageHeader } from '../../../libs/shared/design-system/src';
import type { Invoice } from '../../../libs/shared/types/src';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  paid: 'success',
  pending: 'warning',
  overdue: 'danger',
  cancelled: 'neutral' as any,
};

export default function BillingRoutes() {
  const { policyId } = useParams<{ policyId: string }>();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!policyId) return;
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      .then((data) => setInvoices(data.data?.invoices || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [policyId]);

  if (loading) return <div className="text-gray-500">Loading invoices...</div>;

  return (
    <div>
      <PageHeader title="Billing" subtitle={`Policy ${policyId}`} vertical="billing" />
      {invoices.length === 0 ? (
        <p className="text-gray-400">No invoices found</p>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <Card key={inv.id} accent="orange">
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <DataField label="Invoice" value={inv.id} />
                <DataField label="Status" value={<Badge label={inv.status} variant={STATUS_VARIANT[inv.status]} />} />
                <DataField label="Amount" value={`$${inv.amount.toLocaleString()}`} />
                <DataField label="Due Date" value={inv.dueDate} />
                <DataField label="Description" value={inv.description} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
