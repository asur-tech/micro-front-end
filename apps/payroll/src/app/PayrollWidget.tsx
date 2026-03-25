import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, DataField } from "@org/shared-design-system";
import type { PayrollRecord } from "@org/shared-types";

export default function PayrollWidget({ payroll }: { payroll: PayrollRecord }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Payroll</CardTitle>
      </CardHeader>
      <CardContent>
        <DataField label="Start Date" value={payroll.periodStart} />
        <DataField label="End Date" value={payroll.periodEnd} />
        <DataField label="Employees" value={payroll.employeeCount} />
        <DataField label="Status" value={<Badge variant="secondary">{payroll.status.replace("_", " ")}</Badge>} />
        <DataField label="Premium" value={`$${payroll.reportedPremium.toLocaleString()}`} />
      </CardContent>
    </Card>
  );
}
