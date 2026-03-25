# BFF — Backend for Frontend

GraphQL gateway that sits between the frontend and backend services. Handles auth, protocol translation, and field-level data filtering per user role.

## Dev

```bash
npm install
npm start    # starts on port 4000
```

> Requires mock servers (`mocks/mock-servers`) running on ports 4010–4013.

## Architecture

```
Frontend → BFF (GraphQL, :4000) → Policy backend  (GraphQL, :4010)
                                 → Payroll backend (REST,    :4011)
                                 → Billing backend (REST,    :4012)
                                 → Claims backend  (REST,    :4013)
```

## Stack

- Fastify, Apollo Server, GraphQL
- TypeScript via `tsx`
