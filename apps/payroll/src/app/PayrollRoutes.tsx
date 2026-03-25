import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, DataField, Badge, PageHeader } from '../../../libs/shared/design-system/src';
import type { PayrollRecord } from '../../../libs/shared/types/src';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  approved: 'success',
  under_review: 'warning',
  submitted: 'info',
  rejected: 'danger',
};

export default function PayrollRoutes() {
  const { policyId } = useParams<{ policyId: string }>();
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!policyId) return;
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query GetPayroll($policyId: String!) {
          payroll(policyId: $policyId) {
            id policyId period employeeCount totalWages reportedPremium status
          }
        }`,
        variables: { policyId },
      }),
    })
      .then((res) => res.json())
      .then((data) => setRecords(data.data?.payroll || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [policyId]);

  if (loading) return <div className="text-gray-500">Loading payroll...</div>;

  return (
    <div>
      <PageHeader title="Payroll Records" subtitle={`Policy ${policyId}`} vertical="payroll" />
      {records.length === 0 ? (
        <p className="text-gray-400">No payroll records found</p>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <Card key={record.id} accent="green">
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <DataField label="Period" value={record.period} />
                <DataField label="Status" value={<Badge label={record.status.replace('_', ' ')} variant={STATUS_VARIANT[record.status]} />} />
                <DataField label="Employees" value={record.employeeCount} />
                {record.totalWages != null && (
                  <DataField label="Total Wages" value={`$${record.totalWages.toLocaleString()}`} />
                )}
                <DataField label="Reported Premium" value={`$${record.reportedPremium.toLocaleString()}`} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
