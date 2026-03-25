import React from 'react';

interface DataFieldProps {
  label: string;
  value: React.ReactNode;
}

export function DataField({ label, value }: DataFieldProps) {
  return (
    <div className="py-1.5">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 mt-0.5">{value}</dd>
    </div>
  );
}
