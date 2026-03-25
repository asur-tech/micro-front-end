import React from 'react';
import { Card, DataField, Badge } from '../../../libs/shared/design-system/src';
import type { Claim } from '../../../libs/shared/types/src';

interface Props {
  claims: Claim[];
}

export default function ClaimsWidget({ claims }: Props) {
  if (claims.length === 0) {
    return (
      <Card title="Claims" accent="red">
        <p className="text-gray-400 text-sm">No open claims</p>
      </Card>
    );
  }

  return (
    <Card title="Open Claims" accent="red">
      <DataField label="Count" value={claims.length} />
      {claims.map((c) => (
        <div key={c.id} className="mt-2 border-t border-gray-100 pt-2">
          <DataField label={c.id} value={<Badge label={c.status.replace('_', ' ')} variant="warning" />} />
          <DataField label="Description" value={c.description} />
        </div>
      ))}
    </Card>
  );
}
