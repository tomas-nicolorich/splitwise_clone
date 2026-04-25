## Why

Stabilize the project's architecture by addressing prop drilling, generic API limitations, and core financial logic reliability. This provides a robust foundation for future feature development and fixes existing technical debt without requiring a full rebuild.

## What Changes

- Implement `GroupContext` architecture to eliminate prop drilling and redundant data fetching in `GroupDetail`.
- Extract generic database logic (BigInt serialization, sequence syncing, UUID mapping) into a shared `api/lib/db-utils.js` utility.
- Migrate from a single generic `/api/data` endpoint to specific RESTful endpoints (e.g., `/api/groups`, `/api/expenses`) with Zod validation.
- Expand unit test coverage for `financial-utils.js` and optimize its memoization strategy.
- Audit and consolidate redundant dependencies (e.g., choosing between `moment`/`date-fns` and `react-hot-toast`/`sonner`).

## Capabilities

### New Capabilities
- `group-context`: Centralized React Context for group-scoped data and mutations.
- `specific-api-endpoints`: RESTful API architecture replacing generic data endpoint.
- `db-utils`: Shared backend utility for database interaction consistency.

### Modified Capabilities
- `financial-calculations`: Enhanced validation and performance for income-weighted splitting.

## Impact

- **Frontend**: New `src/contexts/GroupContext.jsx`, all `GroupDetail` sections migrated to use the context.
- **Backend**: New `api/lib/db-utils.js`, multiple new entity-specific endpoints in `api/`.
- **Testing**: Significant expansion of `src/utils/financial-utils.test.js`.
- **Dependencies**: Reduction in bundle size by removing redundant libraries.
