import React from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';

export default function ShellLayout() {
  const { policyId } = useParams<{ policyId: string }>();
  const activePolicyId = policyId || 'POL-001';

  const navItems = [
    { to: '/', label: 'Dashboard', icon: '[]' },
    { to: `/policy/${activePolicyId}`, label: 'Policy', icon: '[]' },
    { to: `/policy/${activePolicyId}/payroll`, label: 'Payroll', icon: '[]' },
    { to: `/policy/${activePolicyId}/billing`, label: 'Billing', icon: '[]' },
    { to: `/policy/${activePolicyId}/claims`, label: 'Claims', icon: '[]' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold">WC Portal</h1>
          <p className="text-xs text-gray-400 mt-1">Workers' Comp Insurance</p>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
