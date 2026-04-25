## Context

The current Splitwise clone (calculoides-vercel) has accumulated architectural debt:
- A generic `/api/data` endpoint handles all operations, leading to "type-blind" data fetching and manual BigInt serialization in every handler.
- Prop drilling in `GroupDetail` forces multiple components to call `useGroupData`, leading to redundant network requests and CPU-heavy re-calculations of financial splits.
- Core financial logic in `financial-utils.js` is complex but lacks an exhaustive test suite, making it fragile to changes.
- Redundant dependencies (moment/date-fns) increase bundle size.

## Goals / Non-Goals

**Goals:**
- Centralize group state and financial logic in a `GroupProvider` (GroupContext).
- Extract shared database logic into `api/lib/db-utils.js`.
- Migrate to entity-specific API endpoints with Zod validation.
- Achieve 100% test coverage for `financial-utils.js`.
- Reduce bundle size by consolidating redundant libraries.

**Non-Goals:**
- Completing the full JSX to TSX migration (deferred to Thread C).
- Changing the underlying database schema.
- Modifying the visual design of the application.

## Decisions

### 1. Shared Database Utility (`db-utils.js`)
**Decision**: Extract BigInt serialization, sequence syncing, and UUID-to-ID mapping into a shared utility.
**Rationale**: These operations are required for every database interaction. In the generic endpoint, they were repeated or mixed with routing logic. A shared utility ensures consistency across new specific endpoints.
**Alternatives**: Keep logic in individual handlers (too much duplication) or use a Prisma middleware (less explicit for serialization).

### 2. GroupContext Architecture
**Decision**: Implement a `GroupProvider` that wraps the `GroupDetail` page.
**Rationale**: This centralizes data fetching (using TanStack Query) and financial calculations (memoized splits). Components like `IncomeSection` or `ExpensesSection` will consume data via `useGroup()`, eliminating prop drilling and redundant query mounting.
**Alternatives**: Keep using `useGroupData` in each component (inefficient) or use a global store like Zustand (overkill for page-specific state).

### 3. Entity-Specific API Endpoints
**Decision**: Create dedicated handlers (e.g., `api/groups.js`, `api/expenses.js`) using Vercel serverless functions.
**Rationale**: Provides clearer API contracts, enables specific Zod validation per entity, and simplifies debugging.
**Alternatives**: Keep the generic endpoint (harder to type and secure).

### 4. Financial Utils Testing & Optimization
**Decision**: Add an exhaustive Vitest suite to `financial-utils.test.js` and optimize the `memoize` key.
**Rationale**: The current `JSON.stringify` memoization is slow for large datasets. A stable key based on `groupId` and a `lastUpdated` timestamp will be more efficient.
**Alternatives**: Replace the algorithm (too risky) or remove memoization (performance hit).

## Risks / Trade-offs

- **[Risk]**: Migration to specific endpoints might break frontend code still using the generic `base44` client. → **Mitigation**: Update `src/api/client.js` to bridge both architectures during the transition.
- **[Risk]**: Centralizing state in Context might cause unnecessary re-renders. → **Mitigation**: Use `memo` on section components and ensure the Context value is stable.
- **[Risk]**: Consolidation of libraries (e.g., removing `moment`) might break utility functions. → **Mitigation**: Run full test suite and verify date formatting in UI.
