import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  vertical?: string;
}

const verticalColors: Record<string, string> = {
  policy: 'bg-blue-500',
  payroll: 'bg-green-500',
  billing: 'bg-orange-500',
  claims: 'bg-red-500',
};

export function PageHeader({ title, subtitle, vertical }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        {vertical && (
          <span className={`${verticalColors[vertical] || 'bg-gray-500'} text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wide`}>
            {vertical}
          </span>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
