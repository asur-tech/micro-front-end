import React from "react";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && (
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
