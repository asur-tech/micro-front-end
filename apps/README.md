# Frontend — Micro-Frontend Workspace

React micro-frontend portal built with Module Federation and Nx.

## Apps

| App | Port | Role |
|-----|------|------|
| `shell` | 3000 | Host container — routes and composes all remotes |
| `policy` | 3001 | Workers' comp policy management |
| `payroll` | 3002 | Payroll reporting |
| `billing` | 3003 | Invoice and billing |
| `claims` | 3004 | Claims management |

## Shared libraries

- `libs/shared/types` — domain types shared across all apps
- `libs/shared/auth` — auth context, `useAuth()` hook, role-based access
- `libs/shared/design-system` — shared UI components (Card, Badge, DataField, etc.)

## Dev

```bash
npm install
npm run dev           # starts shell + all remotes concurrently
npm run start:shell   # shell only
npm run start:remotes # all 4 remotes only
```

> Requires the BFF (`bff`) and mock servers (`mocks/mock-servers`) to be running.

## Stack

- React 19, React Router 7
- Rspack + Module Federation
- Tailwind CSS
- TypeScript
- Nx (build orchestration)
