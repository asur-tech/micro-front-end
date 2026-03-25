import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  DataField,
} from "@repo/ui";
import type { Policy } from "@repo/types";

export default function PolicyWidget({ policy }: { policy: Policy }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Policy Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <DataField label="Policy" value={policy.policyId} />
        <DataField label="Holder" value={policy.holderName} />
        <DataField
          label="Status"
          value={<Badge variant="secondary">{policy.status}</Badge>}
        />
        <DataField
          label="Premium"
          value={`$${policy.premium.toLocaleString()}`}
        />
      </CardContent>
    </Card>
  );
}
