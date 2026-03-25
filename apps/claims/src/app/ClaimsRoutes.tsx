import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, DataField, Badge, PageHeader } from '../../../libs/shared/design-system/src';
import type { Claim } from '../../../libs/shared/types/src';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  open: 'info',
  under_investigation: 'warning',
  approved: 'success',
  denied: 'danger',
  closed: 'neutral' as any,
};

export default function ClaimsRoutes() {
  const { policyId } = useParams<{ policyId: string }>();
  const [claimsList, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!policyId) return;
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query GetClaims($policyId: String!) {
          claims(policyId: $policyId) {
            id policyId claimantName dateOfInjury status description amount filedDate
          }
        }`,
        variables: { policyId },
      }),
    })
      .then((res) => res.json())
      .then((data) => setClaims(data.data?.claims || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [policyId]);

  if (loading) return <div className="text-gray-500">Loading claims...</div>;

  return (
    <div>
      <PageHeader title="Claims" subtitle={`Policy ${policyId}`} vertical="claims" />
      {claimsList.length === 0 ? (
        <p className="text-gray-400">No claims found</p>
      ) : (
        <div className="space-y-4">
          {claimsList.map((claim) => (
            <Card key={claim.id} accent="red">
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <DataField label="Claim ID" value={claim.id} />
                <DataField label="Status" value={<Badge label={claim.status.replace('_', ' ')} variant={STATUS_VARIANT[claim.status]} />} />
                {claim.claimantName && <DataField label="Claimant" value={claim.claimantName} />}
                <DataField label="Date of Injury" value={claim.dateOfInjury} />
                <DataField label="Description" value={claim.description} />
                {claim.amount != null && <DataField label="Amount" value={`$${claim.amount.toLocaleString()}`} />}
                <DataField label="Filed" value={claim.filedDate} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
