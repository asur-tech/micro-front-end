import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, DataField, Badge, PageHeader } from '../../../libs/shared/design-system/src';
import type { Policy } from '../../../libs/shared/types/src';

// Maps policy status to visual badge colors
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  active: 'success',
  pending: 'warning',
  cancelled: 'danger',
  expired: 'neutral' as any,
};

export default function PolicyRoutes() {
  const { policyId } = useParams<{ policyId: string }>();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!policyId) return;

    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query GetPolicy($policyId: String!) {
          policy(policyId: $policyId) {
            policyId holderName status effectiveDate expirationDate premium type
          }
        }`,
        variables: { policyId },
      }),
    })
      .then((res) => res.json())
      .then((data) => setPolicy(data.data?.policy || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [policyId]);

  if (loading) return <div className="text-gray-500">Loading policy...</div>;
  if (!policy) return <div className="text-red-500">Policy not found</div>;

  // Renders using shared design system components (Card, DataField, Badge, PageHeader).
  // All verticals use the same components for visual consistency.
  // The 'vertical="policy"' prop adds a blue accent badge to identify this section.
  return (
    <div>
      <PageHeader title={`Policy ${policy.policyId}`} subtitle={policy.holderName} vertical="policy" />
      <Card accent="blue">
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          <DataField label="Status" value={<Badge label={policy.status} variant={STATUS_VARIANT[policy.status]} />} />
          <DataField label="Type" value={policy.type} />
          <DataField label="Effective Date" value={policy.effectiveDate} />
          <DataField label="Expiration Date" value={policy.expirationDate} />
          <DataField label="Premium" value={`$${policy.premium.toLocaleString()}`} />
        </div>
      </Card>
    </div>
  );
}
