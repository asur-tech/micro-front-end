# Policyholder Portal — Architecture Deep Dive

## What This Is

A micro-frontend portal built with **Vite** and **Module Federation**. The app is split into independently built and deployed pieces that compose together at runtime in the browser.

If you've never worked with Vite or Module Federation before, this document walks through exactly how everything connects — with file references you can click through in VS Code.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [What is Vite?](#2-what-is-vite)
3. [What is Module Federation?](#3-what-is-module-federation)
4. [Project Structure](#4-project-structure)
5. [The Shell (Host)](#5-the-shell-host)
6. [The Remotes](#6-the-remotes)
7. [How They Connect at Runtime](#7-how-they-connect-at-runtime)
8. [Shared Dependencies](#8-shared-dependencies)
9. [Shared Packages (types, ui)](#9-shared-packages-types-ui)
10. [Styling with Tailwind CSS](#10-styling-with-tailwind-css)
11. [TypeScript Configuration](#11-typescript-configuration)
12. [Development Workflow](#12-development-workflow)
13. [How Independent Teams Work](#13-how-independent-teams-work)
14. [Key Differences from Webpack/Rspack](#14-key-differences-from-webpackrspack)
15. [Adding UI Components (shadcn/ui)](#15-adding-ui-components-shadcnui)
16. [Known Limitations](#16-known-limitations)

---

## 1. High-Level Architecture

```
Browser (http://localhost:4000)
|
|  Shell (Vite dev server, port 4000)
|  ├── Sidebar navigation
|  ├── Header bar
|  └── Content area (<Outlet />)
|       |
|       |── Dashboard page
|       |    ├── PolicyWidget ──────── loaded from localhost:4001
|       |    ├── PayrollWidget ─────── loaded from localhost:4002
|       |    ├── BillingWidget ─────── loaded from localhost:4003
|       |    └── ClaimsWidget ──────── loaded from localhost:4004
|       |
|       |── /policy/:policyId
|       |    └── PolicyDetail ──────── loaded from localhost:4001
|       |
|       |── /policy/:policyId/payroll
|       |    └── PayrollDetail ─────── loaded from localhost:4002
|       |
|       |── /policy/:policyId/billing
|       |    └── BillingDetail ─────── loaded from localhost:4003
|       |
|       └── /policy/:policyId/claims
|            └── ClaimsDetail ──────── loaded from localhost:4004
```

The shell owns the layout. The remotes own the content. Each remote is a separate Vite build served from its own port.

---

## 2. What is Vite?

Vite is a frontend build tool. In this project it does three things:

1. **Dev server** — Serves the shell with hot module replacement (HMR). When you edit a file, the browser updates instantly without a full page reload.

2. **Bundler** — Compiles TypeScript, JSX, CSS (Tailwind) into optimized JavaScript bundles for production. Uses Rollup under the hood.

3. **Plugin host** — Vite is minimal by design. On its own it just serves ES modules. Everything else is added via plugins. A plugin is a function that hooks into Vite's build lifecycle:

```
vite dev / vite build
    │
    ├── resolveId    ← "import X" → plugin says where X lives
    ├── load         ← plugin can generate code for virtual modules
    ├── transform    ← plugin can transform file contents
    └── buildEnd     ← plugin can run tasks after build
```

We use three plugins (see [`shell/vite.config.ts`](shell/vite.config.ts)):

```typescript
plugins: [
  federation({...}),   // Adds Module Federation capability
  react(),             // Adds JSX transform + React Fast Refresh
  tailwindcss(),       // Adds Tailwind CSS processing
],
```

**What each plugin does at the `transform` stage:**

`react()` — converts JSX to JavaScript:
```
Input:  <Card className="p-4">hello</Card>
Output: React.createElement(Card, { className: "p-4" }, "hello")
```

`tailwindcss()` — scans your files for class names and generates CSS:
```
Input:  @import "tailwindcss" + scans .tsx files for class usage
Output: .p-4 { padding: 1rem; } .flex { display: flex; } ...
```

`federation()` — intercepts remote imports and wires up Module Federation:
```
Input:  import("policy/PolicyDetail")
Output: fetch("http://localhost:4001/remoteEntry.js")
        → negotiate shared deps → load the component chunk
```

This is why `vite.config.ts` is so short compared to the Rspack config — 3 plugins replace what took `swc-loader`, `style-loader`, `css-loader`, `postcss-loader`, and `HtmlRspackPlugin` to achieve.

Each app (shell, policy, payroll, billing, claims) has its own `vite.config.ts`. Compare:
- Shell config: [`shell/vite.config.ts`](shell/vite.config.ts)
- Remote config: [`policy/vite.config.ts`](policy/vite.config.ts)

---

## 3. What is Module Federation?

Module Federation lets separately built applications share code at **runtime**. Without it, you'd have to build everything together into one giant bundle, or use iframes.

### The plugin we use

**`@module-federation/vite` v1.13.4** ([GitHub](https://github.com/module-federation/vite))

Module Federation was originally built into webpack 5 (2020) by Zack Jackson. It later came to Rspack via `@module-federation/enhanced`. The Vite plugin is the newest implementation, maintained by the same Module Federation team. It's a Vite-native rewrite — not a webpack compatibility layer.

The plugin has two modes depending on which config you provide:

```typescript
// HOST mode (shell) — declares which remotes to consume
federation({
  name: "shell",
  remotes: { policy: { entry: "http://localhost:4001/remoteEntry.js" } },
  shared: { react: { singleton: true } },
})

// REMOTE mode (policy) — declares which components to expose
federation({
  name: "policy",
  filename: "remoteEntry.js",
  exposes: { "./PolicyDetail": "./src/routes/policy-detail" },
  shared: { react: { singleton: true } },
})
```

Same plugin, same import, different config. The plugin reads `remotes` vs `exposes` to determine the mode.

**What the plugin does at build time:**
- **Remote build** — generates `remoteEntry.js` (the manifest) alongside your normal build output. This file lists exposed modules and their chunk locations.
- **Host build** — rewrites `import("policy/PolicyDetail")` into runtime code that fetches the remote's `remoteEntry.js`, negotiates shared deps, and loads the component chunk.
- **Both** — wraps shared dependencies (React, etc.) in a negotiation layer so only one copy runs in the browser.

### The core concepts:

**Host** — An app that consumes components from other apps. Our shell is the host.

**Remote** — An app that exposes components for other apps to consume. Policy, payroll, billing, and claims are remotes.

**`remoteEntry.js`** — A manifest file produced by each remote's build. It tells the host: "Here are the components I expose, here's where to find them, and here are the shared dependencies I need."

**Shared dependencies** — Libraries like React that both host and remotes need. Instead of each app bundling its own copy of React (which would break), Module Federation negotiates at runtime so only one copy is loaded.

### How a remote component loads:

```
1. User navigates to /policy/POL-001
2. Shell's router hits the <PolicyDetail /> route
3. React.lazy() triggers: import("policy/PolicyDetail")
4. Module Federation runtime:
   a. Fetches http://localhost:4001/remoteEntry.js
   b. Reads the manifest to find "PolicyDetail"
   c. Checks shared dependencies (React already loaded? yes → reuse)
   d. Downloads the actual component chunk from localhost:4001
5. Component renders inside the shell's <Outlet />
```

This all happens transparently — the shell code just looks like a normal lazy import.

---

## 4. Project Structure

```
app2/
├── package.json                 # Workspace root — npm scripts, shared deps
├── tsconfig.base.json           # Shared TypeScript config
├── components.json              # shadcn/ui CLI config
├── .gitignore
│
├── shell/                       # HOST — port 4000
│   ├── vite.config.ts           #   MF host config (declares remotes)
│   ├── index.html               #   Vite entry HTML
│   └── src/
│       ├── main.tsx              #   React entry point
│       ├── styles.css            #   Tailwind + theme CSS vars
│       ├── remotes.d.ts          #   TypeScript declarations for remotes
│       ├── App.tsx               #   Router + lazy remote imports
│       │
│       ├── shared/               #   ── SHARED CODE (used by all apps) ──
│       │   ├── types/
│       │   │   └── index.ts      #   @repo/types — Policy, Claim, Invoice, etc.
│       │   └── ui/
│       │       ├── index.ts      #   @repo/ui — barrel export of all components
│       │       ├── lib/utils.ts  #   cn() utility (clsx + tailwind-merge)
│       │       └── components/
│       │           ├── ui/card.tsx    #   shadcn Card
│       │           ├── ui/badge.tsx   #   shadcn Badge
│       │           ├── data-field.tsx #   Custom label/value display
│       │           └── page-header.tsx#   Custom page title
│       │
│       ├── pages/
│       │   └── dashboard.tsx     #   Loads 4 remote widgets
│       └── components/
│           ├── app-sidebar.tsx   #   shadcn Sidebar with nav links
│           ├── app-layout.tsx    #   SidebarProvider + header + Outlet
│           └── ui/               #   Shell-only shadcn components
│               ├── sidebar.tsx
│               ├── button.tsx
│               ├── separator.tsx
│               ├── tooltip.tsx
│               ├── sheet.tsx
│               ├── input.tsx
│               └── skeleton.tsx
│
├── policy/                      # REMOTE — port 4001
│   ├── vite.config.ts           #   MF remote config (exposes components)
│   ├── index.html
│   └── src/
│       ├── main.tsx              #   Standalone dev entry
│       ├── styles.css            #   Tailwind + theme
│       └── routes/
│           ├── policy-detail.tsx #   Full-page policy view
│           └── policy-widget.tsx #   Dashboard summary card
│
├── payroll/                     # REMOTE — port 4002 (same structure)
├── billing/                     # REMOTE — port 4003 (same structure)
└── claims/                      # REMOTE — port 4004 (same structure)
```

Shared code lives inside `shell/src/shared/` but is consumed by all apps via path aliases (`@repo/ui`, `@repo/types`). Remotes resolve these aliases to the shell's shared folder — the import names are the same regardless of where the files physically live. For production with separate repos, these would become published npm packages.

---

## 5. The Shell (Host)

The shell is the container app. It provides:
- The layout (sidebar, header)
- The router (which URL shows which content)
- The entry point users hit in their browser

### 5.1 Entry Point

[`shell/index.html`](shell/index.html) — Standard Vite entry. Note `<script type="module">` — Vite serves ES modules natively in dev mode.

[`shell/src/main.tsx`](shell/src/main.tsx) — Mounts the React app. Unlike webpack-based MF setups, there is **no async boundary pattern** (`entry.ts -> import('./bootstrap')`). The Vite MF plugin handles async initialization internally.

### 5.2 Layout

[`shell/src/components/app-layout.tsx`](shell/src/components/app-layout.tsx) — The root layout. Uses shadcn's `SidebarProvider` to wrap the entire page. The `<Outlet />` from react-router is where remote components render.

[`shell/src/components/app-sidebar.tsx`](shell/src/components/app-sidebar.tsx) — Navigation sidebar. Uses shadcn's Sidebar component with lucide icons. Each nav item is a react-router `<Link>`.

### 5.3 Router & Remote Loading

[`shell/src/App.tsx`](shell/src/App.tsx) — This is where Module Federation is consumed:

```tsx
// Line 6-9: These imports look normal, but they load from OTHER servers
const PolicyDetail = React.lazy(() => import("policy/PolicyDetail"));
const PayrollDetail = React.lazy(() => import("payroll/PayrollDetail"));
const BillingDetail = React.lazy(() => import("billing/BillingDetail"));
const ClaimsDetail = React.lazy(() => import("claims/ClaimsDetail"));
```

`"policy/PolicyDetail"` is not a file path — it's a Module Federation remote reference. At runtime, this resolves to `http://localhost:4001/remoteEntry.js` → `PolicyDetail` export.

**What `React.lazy()` does:**

A normal import loads the code immediately when the app starts:
```typescript
import PolicyDetail from "./policy-detail";  // loaded upfront, blocks rendering
```

`React.lazy()` defers loading until the component is actually rendered:
```typescript
const PolicyDetail = React.lazy(() => import("policy/PolicyDetail"));
// nothing loaded yet — just a promise
// only fetches the code when <PolicyDetail /> appears in the tree
```

This is essential for Module Federation because remote components live on different servers. You don't want to fetch all 4 remotes upfront when the user might only visit one page.

**What `<Suspense>` does:**

While `React.lazy()` is fetching the component over the network, React needs to know what to show in the meantime. That's what `<Suspense>` provides:

```tsx
<Suspense fallback={<div>Loading...</div>}>
  <PolicyDetail />    ← takes ~100-500ms to fetch from localhost:4001
</Suspense>
```

The sequence:
```
1. User navigates to /policy/POL-001
2. React hits <Suspense> boundary
3. React.lazy triggers → starts fetching from remote server
4. While fetching → shows fallback (or nothing if fallback is omitted)
5. Fetch completes → React replaces fallback with the actual component
```

In our code, we omit the fallback (`<Suspense>` with no `fallback` prop) so the area is blank during the brief loading period. For production, you'd likely add a spinner or skeleton.

**What happens without `<Suspense>` at all?**

If you remove `<Suspense>` and render a lazy component directly:

```tsx
// No Suspense wrapper — this will crash
<Route path="/policy/:policyId" element={<PolicyDetail />} />
```

React **throws an error** and the entire app crashes with:

> "A component suspended while responding to synchronous input. This will cause the UI to be replaced with a loading indicator. To fix, updates that suspend should be wrapped with startTransition."

`React.lazy()` produces a component that "suspends" — it tells React "I'm not ready yet, I'm still loading." React needs a `<Suspense>` boundary somewhere above it in the tree to catch that suspension and handle it gracefully. Without one, React doesn't know what to do and gives up.

Think of it like a try/catch — `<Suspense>` catches the "I'm loading" signal the same way `catch` catches an error. No catch = unhandled = crash.

### 5.4 Vite Config (Host) — Fully Annotated

[`shell/vite.config.ts`](shell/vite.config.ts) — every section explained:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({

  // ── PLUGINS ──────────────────────────────────────────────
  // Vite does almost nothing by itself. Plugins add capabilities.
  // Order matters: federation must come before react.
  plugins: [
    federation({
      name: "shell",                          // Unique name for this app in the MF network
      remotes: {
        //  ↓ import name        ↓ where to fetch it
        policy: {
          type: "module",                      // ES module format (not CommonJS)
          name: "policy",                      // Must match the remote's federation "name"
          entry: "http://localhost:4001/remoteEntry.js",  // URL of the manifest
        },
        payroll: { type: "module", name: "payroll", entry: "http://localhost:4002/remoteEntry.js" },
        billing: { type: "module", name: "billing", entry: "http://localhost:4003/remoteEntry.js" },
        claims:  { type: "module", name: "claims",  entry: "http://localhost:4004/remoteEntry.js" },
      },
      shared: {
        react:             { singleton: true },  // Only one copy in the browser
        "react-dom":       { singleton: true },
        "react-router-dom": { singleton: true },
      },
    }),
    react(),           // JSX transform + React Fast Refresh for HMR
    tailwindcss(),     // Tailwind CSS processing (scans files, generates CSS)
  ],

  // ── RESOLVE ──────────────────────────────────────────────
  // Controls how `import "X"` is resolved to actual files.
  // Without these aliases, `import { Card } from "@repo/ui"` would fail
  // because "@repo/ui" isn't a real npm package — it's a local folder.
  resolve: {
    alias: {
      "@repo/types": resolve(__dirname, "../packages/types/src"),
      //  When code says:    import { Policy } from "@repo/types"
      //  Vite resolves to:  /Users/.../app2/packages/types/src/index.ts

      "@repo/ui": resolve(__dirname, "../packages/ui/src"),
      //  When code says:    import { Card } from "@repo/ui"
      //  Vite resolves to:  /Users/.../app2/packages/ui/src/index.ts

      "@": resolve(__dirname, "src"),
      //  When code says:    import { Sidebar } from "@/components/ui/sidebar"
      //  Vite resolves to:  /Users/.../app2/shell/src/components/ui/sidebar.tsx
    },
  },

  // ── SERVER ───────────────────────────────────────────────
  // Configuration for `vite dev` (development server).
  server: {
    port: 4000,                        // Dev server runs on this port
    origin: "http://localhost:4000",   // Used for proper URL resolution in dev
  },

  // ── BUILD ────────────────────────────────────────────────
  // Configuration for `vite build` (production bundle).
  build: {
    target: "es2022",   // Required: MF shared deps use top-level await
                        // Supported: Chrome 89+, Safari 15+, Firefox 89+ (2021)
  },
});
```

The `remotes` object maps import names to URLs. When you write `import("policy/PolicyDetail")`, MF knows to fetch from `http://localhost:4001/remoteEntry.js`.

### 5.5 TypeScript Declarations

[`shell/src/remotes.d.ts`](shell/src/remotes.d.ts) — Since remote modules don't exist locally, TypeScript needs ambient declarations:

```typescript
declare module "policy/PolicyDetail" {
  import type { ComponentType } from "react";
  const PolicyDetail: ComponentType;
  export default PolicyDetail;
}
```

Without this, TypeScript would error on `import("policy/PolicyDetail")`.

---

## 6. The Remotes

Each remote is a standalone Vite app that **exposes** specific components for the shell to consume. Using policy as an example:

### 6.1 Vite Config (Remote) — Fully Annotated

[`policy/vite.config.ts`](policy/vite.config.ts) — every section explained:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({

  // ── PLUGINS ──────────────────────────────────────────────
  // Same 3 plugins as the shell, but federation config is different.
  plugins: [
    federation({
      name: "policy",                    // Unique name — must match what the host uses
      filename: "remoteEntry.js",        // The manifest file the host will fetch
      exposes: {
        //  ↓ public name (what host imports)     ↓ local file path
        "./PolicyDetail": "./src/routes/policy-detail",
        "./PolicyWidget": "./src/routes/policy-widget",
        // Host imports as: import("policy/PolicyDetail")
        //                          ^^^^^^ ^^^^^^^^^^^^
        //                          remote  exposed name
        //                          name    (without ./)
      },
      shared: {
        react:             { singleton: true },  // Must match host's shared config
        "react-dom":       { singleton: true },
        "react-router-dom": { singleton: true },
      },
    }),
    react(),
    tailwindcss(),
  ],

  // ── RESOLVE ──────────────────────────────────────────────
  // Same alias pattern as shell — resolves @repo/* to local packages.
  resolve: {
    alias: {
      "@repo/types": resolve(__dirname, "../packages/types/src"),
      "@repo/ui": resolve(__dirname, "../packages/ui/src"),
      "@": resolve(__dirname, "src"),
    },
  },

  // ── SERVER ───────────────────────────────────────────────
  // For standalone development: `npx vite` runs the remote as its own app.
  server: {
    port: 4001,
    origin: "http://localhost:4001",
  },

  // ── PREVIEW ──────────────────────────────────────────────
  // For serving the built output: `npx vite preview`
  // This is how remotes run during integration testing.
  // Unlike `server` (dev mode), `preview` serves the production build.
  preview: {
    port: 4001,
    cors: true,    // Required: shell on port 4000 fetches from port 4001
                   // Without this, browser blocks cross-origin requests
  },

  // ── BUILD ────────────────────────────────────────────────
  build: {
    target: "es2022",
  },

  // ── BASE ─────────────────────────────────────────────────
  // The base URL for all asset references in the built output.
  // When the shell loads a remote component, the component may reference
  // other chunks or CSS files. Without `base`, those references would be
  // relative (e.g., "./assets/chunk-abc.js") which resolves against the
  // shell's domain (localhost:4000), not the remote's (localhost:4001).
  //
  // Setting base to the remote's full URL ensures all asset paths resolve
  // correctly when loaded cross-origin.
  base: "http://localhost:4001",
  // In production this would be: "https://cdn.example.com/policy/"
});
```

**Key differences from the shell config:**

| Config | Shell (host) | Remote |
|--------|-------------|--------|
| `remotes` | Declares where to find remotes | Not present |
| `exposes` | Not present | Declares what to share |
| `filename` | Not present | `"remoteEntry.js"` — the manifest |
| `preview` | Not needed | Needed — remotes serve built files |
| `preview.cors` | Not needed | `true` — allows cross-origin loading |
| `base` | Not needed (serves itself) | Full URL — so asset paths resolve correctly cross-origin |

### 6.2 Exposed Components

[`policy/src/routes/policy-detail.tsx`](policy/src/routes/policy-detail.tsx) — A full-page component that fetches and displays policy data. Uses `@repo/ui` components (Card, Badge, DataField) and `@repo/types` interfaces.

[`policy/src/routes/policy-widget.tsx`](policy/src/routes/policy-widget.tsx) — A compact card widget for the dashboard. Receives data via props (no fetching).

### 6.3 Standalone Mode

[`policy/src/main.tsx`](policy/src/main.tsx) — Each remote can run independently for development. It wraps the components in its own `BrowserRouter`. When loaded via Module Federation, only the exposed components are used — `main.tsx` is ignored.

This means a team can develop their remote without running the shell.

### 6.4 Build Output

When you run `vite build` on a remote, it produces:

```
policy/dist/
├── remoteEntry.js          # The MF manifest — loaded by the shell
├── index.html              # For standalone mode
└── assets/
    ├── policy-detail-*.js  # Chunked component code
    ├── policy-widget-*.js
    ├── index-*.css         # Tailwind CSS bundle
    └── ...                 # Shared dep chunks
```

The shell only needs `remoteEntry.js` — it handles loading the right chunks on demand.

---

## 7. How They Connect at Runtime

Here's the exact sequence when a user visits `http://localhost:4000/policy/POL-001`:

```
1. Browser requests http://localhost:4000
2. Vite dev server returns shell/index.html
3. Browser loads shell/src/main.tsx → App.tsx
4. React Router matches /policy/POL-001 → <PolicyDetail /> route
5. React.lazy triggers import("policy/PolicyDetail")
6. MF runtime:
   a. Fetches http://localhost:4001/remoteEntry.js (the manifest)
   b. Finds "PolicyDetail" in the manifest
   c. Negotiates shared deps:
      - "react" → already loaded by shell → reuse ✓
      - "react-dom" → already loaded → reuse ✓
      - "react-router-dom" → already loaded → reuse ✓
   d. Fetches http://localhost:4001/assets/policy-detail-*.js
7. PolicyDetail component renders inside <Suspense> → <Outlet />
8. PolicyDetail calls the BFF GraphQL API for data
9. Data renders using @repo/ui components
```

The key insight: **steps 6a-6d happen transparently**. From the React component's perspective, it's just a lazy import.

---

## 8. Shared Dependencies

Shared dependencies prevent duplicate copies of libraries in the browser. Without sharing, each remote would bundle its own React, and you'd get errors like "Invalid hook call" (multiple React instances).

Configuration in both host and remotes:

```typescript
shared: {
  react: { singleton: true },
  "react-dom": { singleton: true },
  "react-router-dom": { singleton: true },
}
```

`singleton: true` means: "There must be exactly one copy of this library. If the host already loaded it, remotes must reuse that copy."

The negotiation happens at runtime when `remoteEntry.js` is loaded. The MF runtime checks versions and resolves to the best available copy.

### Build target: es2022

The shared dependency negotiation uses **top-level await**, which requires `build.target: "es2022"`. This is supported in Chrome 89+, Safari 15+, Firefox 89+ (all from 2021) — acceptable for our external user base.

---

## 9. Shared Code (types, ui)

Unlike shared **dependencies** (React, which are negotiated at runtime), shared **code** is source that lives in the shell and is consumed by all apps at build time.

Shared code lives in `shell/src/shared/`:

```
shell/src/shared/
├── types/index.ts              # @repo/types — domain interfaces
└── ui/
    ├── index.ts                # @repo/ui — barrel export
    ├── lib/utils.ts            # cn() utility
    └── components/
        ├── ui/card.tsx         # shadcn Card
        ├── ui/badge.tsx        # shadcn Badge
        ├── data-field.tsx      # custom
        └── page-header.tsx     # custom
```

### @repo/types

[`shell/src/shared/types/index.ts`](shell/src/shared/types/index.ts) — Domain interfaces used by all apps:
- `Policy`, `PayrollRecord`, `Invoice`, `Claim`, `DashboardData`

Every app that imports `@repo/types` gets the same source compiled into its own bundle.

### @repo/ui

[`shell/src/shared/ui/index.ts`](shell/src/shared/ui/index.ts) — Shared UI component library:
- **shadcn/ui components**: Card, Badge (installed via `npx shadcn@latest add`)
- **Custom components**: DataField, PageHeader
- **Utilities**: `cn()` for Tailwind class merging

All apps import from `@repo/ui` so the UI stays consistent across remotes.

### How aliases work

Two configurations are needed so both Vite and TypeScript know where `@repo/ui` and `@repo/types` point:

1. **Vite** — for bundler resolution at build time:
   ```typescript
   // shell/vite.config.ts
   resolve: {
     alias: {
       "@repo/types": resolve(__dirname, "src/shared/types"),
       "@repo/ui": resolve(__dirname, "src/shared/ui"),
     },
   }

   // policy/vite.config.ts (and other remotes)
   resolve: {
     alias: {
       "@repo/types": resolve(__dirname, "../shell/src/shared/types"),
       "@repo/ui": resolve(__dirname, "../shell/src/shared/ui"),
     },
   }
   ```

2. **TypeScript** — for type checking and IDE support:
   ```json
   // tsconfig.base.json
   "paths": {
     "@repo/types": ["shell/src/shared/types/index.ts"],
     "@repo/ui": ["shell/src/shared/ui/index.ts"]
   }
   ```

Both must point to the same location. Vite uses the alias; TypeScript uses the path.

### Why not a separate packages/ folder?

For the POC, keeping shared code in the shell is simpler — one less concept to explain. For production with separate repos, `shared/types` and `shared/ui` would be extracted into published npm packages (`@repo/types`, `@repo/ui`). The import names stay the same — only the resolution changes from path alias to `node_modules`.

---

## 10. Styling with Tailwind CSS

### What is Tailwind?

Tailwind is a **utility-first CSS framework**. Instead of writing CSS in separate files, you apply small utility classes directly in your HTML/JSX:

```tsx
// Traditional CSS: write a class, define styles elsewhere
<div className="invoice-card">...</div>
// .invoice-card { padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #e5e7eb; }

// Tailwind: styles are the class names
<div className="p-6 rounded-xl border">...</div>
```

No CSS files to manage per component. The class names *are* the styles.

### The plugin we use

**`@tailwindcss/vite` v4.2.2** ([tailwindcss.com](https://tailwindcss.com))

This is the official Tailwind CSS Vite plugin, introduced in **Tailwind v4**. It replaces the older PostCSS-based setup that required `postcss.config.js` + `postcss-loader` + `autoprefixer`.

With the Vite plugin, there's zero config — just add `tailwindcss()` to your Vite plugins and `@import "tailwindcss"` in your CSS file. The plugin:

1. **Scans** your source files for Tailwind class names (guided by `@source` directives)
2. **Generates** only the CSS for classes you actually use (unused classes are not included)
3. **Injects** the compiled CSS into the page during dev, or into a `.css` bundle for production

**Tailwind v4 vs v3** — v4 (what we use) is a ground-up rewrite. Key differences:
- Config is in CSS (`@theme`, `@source`) instead of `tailwind.config.js`
- Uses the OKLch color space for more perceptually uniform colors
- No `postcss.config.js` needed with the Vite plugin
- Faster — the new engine is written in Rust

### How it works in our project

Each app has its own `styles.css` that independently compiles Tailwind:

[`shell/src/styles.css`](shell/src/styles.css) — The shell's CSS includes:
- `@import "tailwindcss"` — loads Tailwind 4
- `@source` directives — tells Tailwind which files to scan for class names
- `@theme inline` — maps CSS variables to Tailwind color names
- `:root` — defines the actual color values using OKLch color space
- Sidebar-specific CSS variables (`--sidebar-background`, etc.)

Remote CSS files are simpler (no sidebar variables).

### The @source directive

```css
@source "../../packages/ui/src/**/*.tsx";
@source "./routes/**/*.tsx";
```

Tailwind 4 scans these paths to find CSS class names used in your code. If a class isn't found in any scanned file, it won't be included in the CSS output. This is why each app must declare its own sources.

### Design tokens

All apps share the same CSS custom properties (`:root` block), ensuring consistent colors, border radius, and spacing across the entire portal — even though each remote bundles its own CSS.

---

## 11. TypeScript Configuration

[`tsconfig.base.json`](tsconfig.base.json) — Shared base config that all apps extend:

```json
{
  "compilerOptions": {
    "target": "es2022",              // Required for top-level await (MF)
    "module": "esnext",              // ES modules (Vite requirement)
    "moduleResolution": "bundler",   // Modern resolution (Vite requirement)
    "jsx": "react-jsx",             // Automatic JSX transform
    "noEmit": true,                  // Vite handles compilation, TS is just type checking
  }
}
```

Each app extends this and overrides `paths` relative to its own location:

```json
// policy/tsconfig.app.json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@repo/types": ["../packages/types/src/index.ts"],
      "@repo/ui": ["../packages/ui/src/index.ts"],
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

---

## 12. Development Workflow

### Start everything

```bash
cd app2
npm run dev
```

This runs:
1. Builds all 4 remotes (`vite build`)
2. Starts the BFF GraphQL server (port 4005)
3. Starts the mock data server (port 4010)
4. Previews all 4 remotes (`vite preview` on ports 4001-4004)
5. Starts the shell dev server (`vite` on port 4000)

### Port map

| Service          | Port | Mode          |
|------------------|------|---------------|
| Shell (host)     | 4000 | `vite dev`    |
| Policy remote    | 4001 | `vite preview`|
| Payroll remote   | 4002 | `vite preview`|
| Billing remote   | 4003 | `vite preview`|
| Claims remote    | 4004 | `vite preview`|
| BFF (GraphQL)    | 4005 | `tsx`         |
| Mock data        | 4010 | `json-server` |

### Active remote development

When working on a specific remote (e.g., policy), use watch mode so changes auto-rebuild:

```bash
# Terminal 1: watch + preview the remote
npm run watch:policy    # rebuilds on file change
npm run preview:policy  # serves the built files

# Terminal 2: run the shell
npm run dev:shell
```

### Shell development

The shell runs in Vite dev mode — changes to shell code hot-reload instantly. No rebuild needed.

---

## 13. How Independent Teams Work

This architecture enables team independence:

```
Team A (Policy)        Team B (Payroll)       Platform Team
─────────────────      ─────────────────      ─────────────
Works in policy/       Works in payroll/      Works in shell/
                                              and packages/

Uses @repo/ui          Uses @repo/ui          Maintains @repo/ui
Uses @repo/types       Uses @repo/types       Maintains @repo/types

Builds independently   Builds independently   Builds independently
Deploys to CDN         Deploys to CDN         Deploys to CDN

Own sprint cadence     Own sprint cadence     Coordinates releases
```

### What makes this possible:

1. **Separate build artifacts** — Each remote produces its own `remoteEntry.js`. Updating policy doesn't require rebuilding payroll.

2. **Runtime composition** — The shell discovers remotes via URL, not build-time imports. Updating a remote's URL in the shell config is all that's needed.

3. **Shared contracts** — `@repo/types` defines the data interfaces. As long as both sides honor the contract, they can evolve independently.

4. **Shared UI** — `@repo/ui` ensures consistent look and feel without coordination.

5. **Standalone mode** — Each remote can run on its own (`main.tsx` provides a standalone shell) so teams can develop without depending on other teams' services.

---

## 14. Key Differences from Webpack/Rspack

If you're coming from the existing Rspack-based setup in `apps/`:

| Aspect | Rspack (apps/) | Vite (app2/) |
|--------|----------------|--------------|
| **Entry pattern** | `entry.ts → import('./bootstrap')` async boundary required | Direct `main.tsx` — Vite plugin handles async init |
| **MF plugin import** | `from "@module-federation/enhanced/rspack"` | `from "@module-federation/vite"` |
| **Remote config syntax** | `"policy@http://localhost:3001/remoteEntry.js"` | `{ type: "module", name: "policy", entry: "..." }` |
| **Remote dev mode** | `rspack serve` (full dev server with HMR) | `vite build` + `vite preview` (must pre-build) |
| **CSS processing** | PostCSS loader chain (`style-loader → css-loader → postcss-loader`) | `@tailwindcss/vite` plugin (zero config) |
| **TypeScript** | SWC loader (`builtin:swc-loader`) | `@vitejs/plugin-react` (esbuild in dev, Rollup in build) |
| **HTML** | `public/index.html` via `HtmlRspackPlugin` | `index.html` at project root with `<script type="module">` |
| **Build target** | `es2020` works fine | `es2022` required (top-level await for MF shared deps) |
| **remoteEntry.js location** | `dist/remoteEntry.js` | `dist/remoteEntry.js` |

---

## 15. Adding UI Components (shadcn/ui)

### What is shadcn/ui?

shadcn/ui is **not a component library** — it's a **code generator**. Unlike libraries like Material UI where you `npm install` and import from `node_modules`, shadcn copies component source code directly into your project.

```bash
npx shadcn@latest add button
# Creates: shell/src/components/ui/button.tsx
# That file is now YOUR code — edit it freely
```

There is no `import { Button } from "shadcn"`. There's `import { Button } from "@/components/ui/button"` — a file you own.

This is why shadcn isn't a Vite plugin. It ran once to generate files. It doesn't transform anything at build time.

### Where components live

There are two locations, depending on whether the component is **shared** or **shell-only**:

**Shared components** (used by remotes) → `shell/src/shared/ui/`
```
shell/src/shared/ui/components/
├── ui/card.tsx          ← used by all remotes via @repo/ui
├── ui/badge.tsx         ← used by all remotes via @repo/ui
├── data-field.tsx       ← custom, used by all remotes
└── page-header.tsx      ← custom, used by all remotes
```

**Shell-only components** (sidebar, layout) → `shell/src/components/`
```
shell/src/components/
├── ui/sidebar.tsx       ← only the shell uses this
├── ui/button.tsx        ← only the shell uses this
├── ui/separator.tsx
├── ui/tooltip.tsx
├── ui/sheet.tsx
├── ui/input.tsx
└── ui/skeleton.tsx
```

### How to add a shared component (used by all remotes)

1. Make sure [`components.json`](components.json) points `ui` to the shared folder:

   ```json
   "aliases": {
     "ui": "shell/src/shared/ui/components/ui",
     "utils": "shell/src/shared/ui/lib/utils"
   }
   ```

2. Run the CLI from the `app2/` root:

   ```bash
   cd app2
   npx shadcn@latest add table
   ```

   This creates `shell/src/shared/ui/components/ui/table.tsx`.

3. Fix the import path — shadcn generates an absolute path for the `cn` utility:

   ```typescript
   // GENERATED (broken):
   import { cn } from "shell/src/shared/ui/lib/utils"

   // FIX to relative:
   import { cn } from "../../lib/utils"
   ```

4. Export it from the barrel file [`shell/src/shared/ui/index.ts`](shell/src/shared/ui/index.ts):

   ```typescript
   export { Table, TableRow, TableCell, ... } from "./components/ui/table";
   ```

5. Use it in any remote:

   ```typescript
   import { Table, TableRow, TableCell } from "@repo/ui";
   ```

### How to add a shell-only component

1. Temporarily update [`components.json`](components.json) to point `ui` to the shell:

   ```json
   "aliases": {
     "ui": "shell/src/components/ui"
   }
   ```

2. Run the CLI:

   ```bash
   npx shadcn@latest add dialog
   ```

3. Fix the `cn` import in the generated file:

   ```typescript
   // GENERATED (broken):
   import { cn } from "shell/lib/utils"

   // FIX to:
   import { cn } from "@repo/ui"
   ```

4. No need to switch `components.json` back — it already points to the shell.

5. Import in shell code:

   ```typescript
   import { Dialog, DialogContent } from "@/components/ui/dialog";
   ```

### How to add a custom (non-shadcn) component

Just create the file and export it. No CLI needed.

1. Create the component in `shell/src/shared/ui/components/`:

   ```typescript
   // shell/src/shared/ui/components/status-indicator.tsx
   import { cn } from "../lib/utils";

   interface StatusIndicatorProps {
     status: "active" | "inactive";
   }

   export function StatusIndicator({ status }: StatusIndicatorProps) {
     return (
       <span className={cn(
         "inline-block h-2 w-2 rounded-full",
         status === "active" ? "bg-green-500" : "bg-gray-300"
       )} />
     );
   }
   ```

2. Export from [`shell/src/shared/ui/index.ts`](shell/src/shared/ui/index.ts):

   ```typescript
   export { StatusIndicator } from "./components/status-indicator";
   ```

3. Use in any remote:

   ```typescript
   import { StatusIndicator } from "@repo/ui";
   ```

### Available shadcn components

Browse the full catalog at [ui.shadcn.com](https://ui.shadcn.com/docs/components). Any component can be added with `npx shadcn@latest add <name>`. Common ones you might need:

- `table` — data tables
- `dialog` — modal dialogs
- `tabs` — tabbed content
- `select` — dropdown selects
- `form` + `input` — form handling
- `alert` — alert messages
- `avatar` — user avatars
- `dropdown-menu` — context menus

---

## 16. Known Limitations

### Remote CSS in the host

When a remote component is loaded via Module Federation, its JavaScript is injected into the host page, but its **CSS is not automatically loaded**. Tailwind utility classes that exist in the shell's CSS (from `@repo/ui` components) work fine. Classes unique to a remote's route component may not render correctly in the shell.

**Current workaround**: Use inline styles for remote-specific layout (e.g., `style={{ maxWidth: "42rem" }}`). For production, this should be solved by either loading the remote's CSS stylesheet explicitly or ensuring the shell's Tailwind config scans remote components.

### Remote dev mode requires pre-build

Unlike Rspack where all apps run dev servers simultaneously, Vite MF remotes must be built before they can be consumed. The `vite build --watch` command mitigates this, but changes aren't instant — there's a 2-4 second rebuild cycle.

### DTS type generation warnings

You'll see warnings like `Failed to download types archive from "http://localhost:4001/@mf-types.zip"`. These are from the MF plugin's automatic type generation feature. They're non-critical and don't affect runtime behavior. The `remotes.d.ts` file in the shell provides the necessary type declarations manually.

### Build target es2022

Module Federation's shared dependency negotiation uses top-level await, which requires ES2022. This means the app won't work in browsers older than Chrome 89 / Safari 15 / Firefox 89 (all released 2021). For our external user base, this is acceptable.
