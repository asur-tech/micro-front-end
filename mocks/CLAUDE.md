# Mock Server — Local Dev Only

json-server serving `db.json` on port 4010. Not deployed to production.

## Dev

```bash
npm install
npm start   # starts on port 4010
```

## Endpoints

- `GET /policies` — all policies
- `GET /policies/:id` — single policy
- `GET /payroll?policyId=X` — payroll records
- `GET /invoices?policyId=X` — invoices
- `GET /claims?policyId=X` — claims

## Key files

- `db.json` — all mock data
