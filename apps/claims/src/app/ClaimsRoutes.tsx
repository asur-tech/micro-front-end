import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, Badge, DataField, PageHeader } from "@org/shared-design-system";
import type { Claim } from "@org/shared-types";

export default function ClaimsRoutes() {
  const { policyId } = useParams<{ policyId: string }>();
  const [claimsList, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    if (!policyId) return;
    fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      .catch(console.error);
  }, [policyId]);

  return (
    <div>
      <PageHeader title="Claims" subtitle={`Policy ${policyId}`} />
      <div className="space-y-4">
        {claimsList.map((claim) => (
          <Card key={claim.id}>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                <DataField label="Claim ID" value={claim.id} />
                <DataField label="Status" value={<Badge variant="secondary">{claim.status.replace("_", " ")}</Badge>} />
                <DataField label="Claimant" value={claim.claimantName} />
                <DataField label="Date of Injury" value={claim.dateOfInjury} />
                <DataField label="Description" value={claim.description} />
                <DataField label="Amount" value={`$${claim.amount.toLocaleString()}`} />
                <DataField label="Filed" value={claim.filedDate} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
