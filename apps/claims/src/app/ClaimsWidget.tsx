import React from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, DataField } from "@org/shared-design-system";
import type { Claim } from "@org/shared-types";

export default function ClaimsWidget({ claims }: { claims: Claim[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Open Claims</CardTitle>
      </CardHeader>
      <CardContent>
        <DataField label="Count" value={claims.length} />
        {claims.map((c) => (
          <div key={c.id} className="mt-2 border-t pt-2">
            <DataField label={c.id} value={<Badge variant="outline">{c.status.replace("_", " ")}</Badge>} />
            <DataField label="Description" value={c.description} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
