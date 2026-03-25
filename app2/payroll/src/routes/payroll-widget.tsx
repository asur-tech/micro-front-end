import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  DataField,
} from "@repo/ui";
import type { PayrollRecord } from "@repo/types";

export default function PayrollWidget({
  payroll,
}: {
  payroll: PayrollRecord | null;
}) {
  if (!payroll) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Latest Payroll</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No payroll data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Payroll</CardTitle>
      </CardHeader>
      <CardContent>
        <DataField label="Start Date" value={payroll.periodStart} />
        <DataField label="End Date" value={payroll.periodEnd} />
        <DataField label="Employees" value={payroll.employeeCount} />
        <DataField
          label="Status"
          value={
            <Badge variant="secondary">
              {payroll.status.replace("_", " ")}
            </Badge>
          }
        />
        <DataField
          label="Premium"
          value={`$${payroll.reportedPremium.toLocaleString()}`}
        />
      </CardContent>
    </Card>
  );
}
