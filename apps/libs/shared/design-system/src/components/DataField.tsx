import React from "react";

export function DataField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="py-1.5">
      <dt className="text-xs text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}
