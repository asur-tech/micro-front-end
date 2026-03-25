# BFF — Backend for Frontend

Fastify + Apollo GraphQL server. Acts as the gateway between the frontend and backend services.

## Dev

```bash
npm install
npm start        # starts on port 4000
```

## Stack

- **Fastify** — HTTP server
- **Apollo Server** — GraphQL engine
- **TypeScript** via `tsx` (no build step needed for dev)

## Key files

- `src/main.ts` — server entry point
- `src/schema/typeDefs.ts` — GraphQL schema
- `src/schema/resolvers.ts` — resolver logic, backend fan-out, field-level filtering
- `src/middleware/auth.ts` — TAM header auth, user lookup
- `src/types.ts` — domain types owned by the BFF
