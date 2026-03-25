# BFF — Backend for Frontend

Fastify + Apollo GraphQL server. Proxies frontend queries to json-server mock API.

## Dev

```bash
npm install
npm start        # starts on port 4000
```

## Key files

- `src/main.ts` — server entry point
- `src/schema/typeDefs.ts` — GraphQL schema
- `src/schema/resolvers.ts` — resolver logic, backend fan-out
