import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Badge,
  DataField,
  PageHeader,
} from "@repo/ui";
import type { PayrollRecord } from "@repo/types";

export default function PayrollDetail() {
  const { policyId } = useParams<{ policyId: string }>();
  const [records, setRecords] = useState<PayrollRecord[]>([]);

  useEffect(() => {
    if (!policyId) return;
    fetch("http://localhost:4005/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query GetPayroll($policyId: String!) {
          payroll(policyId: $policyId) {
            id policyId periodStart periodEnd employeeCount totalWages reportedPremium status
          }
        }`,
        variables: { policyId },
      }),
    })
      .then((res) => res.json())
      .then((data) => setRecords(data.data?.payroll ?? []))
      .catch(console.error);
  }, [policyId]);

  return (
    <div>
      <PageHeader title="Payroll Records" subtitle={`Policy ${policyId}`} />
      <div className="max-w-2xl space-y-6">
        {records.map((record, i) => (
          <div key={record.id}>
            {i > 0 && <hr className="mb-6" />}
            <Card>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <DataField label="Start Date" value={record.periodStart} />
                <DataField label="End Date" value={record.periodEnd} />
                <DataField
                  label="Status"
                  value={
                    <Badge variant="secondary">
                      {record.status.replace("_", " ")}
                    </Badge>
                  }
                />
                <DataField label="Employees" value={record.employeeCount} />
                <DataField
                  label="Total Wages"
                  value={`$${record.totalWages.toLocaleString()}`}
                />
                <DataField
                  label="Reported Premium"
                  value={`$${record.reportedPremium.toLocaleString()}`}
                />
              </div>
            </CardContent>
          </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
