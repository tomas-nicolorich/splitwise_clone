## Why

The recent full-scale migration to TypeScript for the Splitwise clone left several critical and warning-level issues unresolved. These issues include a broken type-checking script, missing dependency types, and divergences from the intended type-safe architecture, which undermine the benefits of the migration and lead to a "false sense of security".

## What Changes

- **Infrastructure**: Fix the `typecheck` script in `package.json` to correctly use `tsc --noEmit` and remove obsolete references to `jsconfig.json`.
- **Dependencies**: Re-evaluate and correct the `@types/` dependencies in `package.json`, specifically for `lodash`, `canvas-confetti`, and `three`, ensuring only used libraries have their types installed.
- **Core Types**: Implement the `ToFrontend<T>` utility type in `src/api/types.ts` to derive frontend-compatible interfaces from Prisma models as originally designed.
- **Type Safety**: Refactor dynamic entity access in `api/data.ts` to eliminate `as any` and use strictly typed keys based on the `ExtendedPrismaClient`.
- **Schema Alignment**: Explicitly link Zod schemas in `api/lib/schemas.ts` to shared TypeScript interfaces to ensure end-to-end contract validation.
- **Logic Refinement**: Update the `GroupProvider` memoization key to be dynamic, ensuring correct cache invalidation.

## Capabilities

### New Capabilities
- `shared-type-utilities`: Introduction of `ToFrontend<T>` and other mapping utilities to bridge the Prisma-to-Frontend gap.

### Modified Capabilities
- `db-utils`: Updating BigInt serialization and entity resolution to be more robust.
- `financial-calculations`: Refinement of the memoization strategy in the context provider.
- `specific-api-endpoints`: Tightening the link between Zod schemas and TypeScript interfaces.

## Impact

- **Build/CI System**: Restores the ability to verify type safety across the entire project.
- **Developer Experience**: Improved IDE autocomplete and compile-time error catching for API and shared data structures.
- **Runtime Stability**: More reliable cache management for financial calculations.
