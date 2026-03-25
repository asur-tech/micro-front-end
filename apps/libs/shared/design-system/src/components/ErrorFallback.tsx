import React from 'react';

interface ErrorFallbackProps {
  name: string;
  error?: Error;
}

export function ErrorFallback({ name, error }: ErrorFallbackProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <p className="text-red-700 font-medium">Failed to load {name}</p>
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}
