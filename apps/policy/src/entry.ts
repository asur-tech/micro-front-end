/**
 * POLICY REMOTE ENTRY POINT — Async boundary for Module Federation.
 *
 * Same pattern as the shell's entry.ts:
 *   entry.ts → dynamic import → bootstrap.tsx → app code
 *
 * This ensures shared dependencies (React singleton) are negotiated
 * before any component code runs. See shell/src/entry.ts for details.
 */
import('./bootstrap');
