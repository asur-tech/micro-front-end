import React from 'react';
import { Card, DataField, Badge } from '../../../libs/shared/design-system/src';
import type { Policy } from '../../../libs/shared/types/src';

interface Props {
  policy: Policy | null;
}

export default function PolicySummaryWidget({ policy }: Props) {
  if (!policy) {
    return (
      <Card title="Policy" accent="blue">
        <p className="text-gray-400 text-sm">No policy data available</p>
      </Card>
    );
  }

  return (
    <Card title="Policy Summary" accent="blue">
      <DataField label="Policy" value={policy.policyId} />
      <DataField label="Holder" value={policy.holderName} />
      <DataField
        label="Status"
        value={<Badge label={policy.status} variant={policy.status === 'active' ? 'success' : 'warning'} />}
      />
      <DataField label="Premium" value={`$${policy.premium.toLocaleString()}`} />
    </Card>
  );
}
