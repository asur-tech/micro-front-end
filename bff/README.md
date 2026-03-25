# BFF — Backend for Frontend

GraphQL gateway between frontend and mock API.

## Dev

```bash
npm install
npm start    # starts on port 4000
```

> Requires mock server (`mocks/`) running on port 4010.

## Architecture

```
Frontend → BFF (GraphQL, :4000) → json-server (REST, :4010)
```

## Stack

- Fastify, Apollo Server, GraphQL
- TypeScript via `tsx`
