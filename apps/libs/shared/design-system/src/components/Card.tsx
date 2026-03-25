import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  accent?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
}

const accentColors = {
  blue: 'border-l-blue-500',
  green: 'border-l-green-500',
  orange: 'border-l-orange-500',
  red: 'border-l-red-500',
  gray: 'border-l-gray-400',
};

export function Card({ title, children, className = '', accent }: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-5 ${accent ? `border-l-4 ${accentColors[accent]}` : ''} ${className}`}
    >
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>}
      {children}
    </div>
  );
}
