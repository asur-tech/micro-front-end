# Mock Server — Local Dev Only

json-server serving `db.json` on port 4010. Not deployed to production.

## Dev

```bash
npm install
npm start   # starts on port 4010
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /policies` | All policies |
| `GET /policies/:id` | Single policy |
| `GET /payroll?policyId=X` | Payroll records by policy |
| `GET /invoices?policyId=X` | Invoices by policy |
| `GET /claims?policyId=X` | Claims by policy |
