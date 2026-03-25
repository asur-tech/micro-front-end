import React from 'react';
import { Card, DataField, Badge } from '../../../libs/shared/design-system/src';
import type { PayrollRecord } from '../../../libs/shared/types/src';

interface Props {
  payroll: PayrollRecord | null;
}

export default function PayrollWidget({ payroll }: Props) {
  if (!payroll) {
    return (
      <Card title="Payroll" accent="green">
        <p className="text-gray-400 text-sm">No payroll data available</p>
      </Card>
    );
  }

  return (
    <Card title="Latest Payroll" accent="green">
      <DataField label="Period" value={payroll.period} />
      <DataField label="Employees" value={payroll.employeeCount} />
      <DataField
        label="Status"
        value={<Badge label={payroll.status.replace('_', ' ')} variant={payroll.status === 'approved' ? 'success' : 'warning'} />}
      />
      <DataField label="Premium" value={`$${payroll.reportedPremium.toLocaleString()}`} />
    </Card>
  );
}
