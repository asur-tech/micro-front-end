import React from 'react';
import { Card, DataField, Badge } from '../../../libs/shared/design-system/src';
import type { Invoice } from '../../../libs/shared/types/src';

interface Props {
  invoices: Invoice[];
}

export default function BillingWidget({ invoices }: Props) {
  if (invoices.length === 0) {
    return (
      <Card title="Billing" accent="orange">
        <p className="text-gray-400 text-sm">No invoices</p>
      </Card>
    );
  }

  const pendingCount = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').length;
  const totalDue = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <Card title="Billing Overview" accent="orange">
      <DataField label="Outstanding Invoices" value={pendingCount} />
      <DataField label="Total Due" value={`$${totalDue.toLocaleString()}`} />
      {invoices
        .filter((i) => i.status === 'overdue')
        .map((i) => (
          <div key={i.id} className="mt-2">
            <DataField
              label={i.id}
              value={<Badge label="OVERDUE" variant="danger" />}
            />
          </div>
        ))}
    </Card>
  );
}
