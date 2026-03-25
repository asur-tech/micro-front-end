import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, DataField } from "@org/shared-design-system";
import type { Invoice } from "@org/shared-types";

export default function BillingWidget({ invoices }: { invoices: Invoice[] }) {
  const pendingCount = invoices.filter((i) => i.status === "pending" || i.status === "overdue").length;
  const totalDue = invoices
    .filter((i) => i.status === "pending" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <DataField label="Outstanding Invoices" value={pendingCount} />
        <DataField label="Total Due" value={`$${totalDue.toLocaleString()}`} />
        {invoices
          .filter((i) => i.status === "overdue")
          .map((i) => (
            <div key={i.id} className="mt-2">
              <DataField label={i.id} value={<Badge variant="destructive">OVERDUE</Badge>} />
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
