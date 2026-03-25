import type { ReactNode } from "react";

interface DataFieldProps {
  label: string;
  value: ReactNode;
}

export function DataField({ label, value }: DataFieldProps) {
  return (
    <dl className="py-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </dl>
  );
}
