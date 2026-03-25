import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, Badge, DataField, PageHeader } from "@org/shared-design-system";
import type { Policy } from "@org/shared-types";

export default function PolicyRoutes() {
  const { policyId } = useParams<{ policyId: string }>();
  const [policy, setPolicy] = useState<Policy | null>(null);

  useEffect(() => {
    if (!policyId) return;
    fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      .catch(console.error);
  }, [policyId]);

  if (!policy) return null;

  return (
    <div>
      <PageHeader title={`Policy ${policy.policyId}`} subtitle={policy.holderName} />
      <Card>
        <CardHeader>
          <CardTitle>Policy Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <DataField label="Status" value={<Badge variant="secondary">{policy.status}</Badge>} />
            <DataField label="Type" value={policy.type} />
            <DataField label="Effective Date" value={policy.effectiveDate} />
            <DataField label="Expiration Date" value={policy.expirationDate} />
            <DataField label="Premium" value={`$${policy.premium.toLocaleString()}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
