## Context

The recent migration to TypeScript successfully converted most files but left several technical debts:
- The `typecheck` script is broken because it references a deleted `jsconfig.json`.
- The `ToFrontend<T>` utility type, designed to handle Prisma serialization differences (BigInt -> string, Decimal -> number), was never implemented.
- `api/data.ts` relies on `as any` for dynamic entity indexing.
- Zod schemas are not type-linked to the frontend interfaces.
- The `GroupProvider` uses a static string for its memoization key, which might lead to stale data if reused incorrectly.

## Goals / Non-Goals

**Goals:**
- **Zero Errors**: Restore `tsc --noEmit` as a passing CI check.
- **Architectural Fidelity**: Implement the `ToFrontend` pattern as originally planned.
- **Strict Typing**: Eliminate `as any` from core API routing logic.
- **Contract Enforcement**: Tie Zod schemas to TypeScript interfaces.

**Non-Goals:**
- **Refactoring Business Logic**: No changes to the actual financial algorithms beyond typing and memoization keys.
- **Performance Optimization**: Beyond the specific memoization fix, no general performance tuning.

## Decisions

### 1. `ToFrontend<T>` Implementation
- **Decision**: Define a recursive utility type in `src/api/types.ts` that maps Prisma types to their JSON-serialized equivalents.
- **Rationale**: Prisma's `BigInt` and `Decimal` are not native JSON types. Automating this conversion ensures consistency.
- **Implementation**:
  ```typescript
  export type ToFrontend<T> = {
    [K in keyof T]: T[K] extends bigint ? string :
                    T[K] extends Decimal ? number :
                    T[K] extends bigint[] ? string[] : T[K]
  };
  ```

### 2. Type-Safe Prisma Entity Mapping
- **Decision**: Create a constant map or use `keyof ExtendedPrismaClient` to validate the `entity` string in `api/data.ts`.
- **Rationale**: Replaces `(prisma as any)[entity]` with a type-safe lookup that the compiler can verify.
- **Alternatives**: Using a giant switch statement. Rejected for verbosity.

### 3. Zod Schema Type Linking
- **Decision**: Use `z.ZodType<T>` to define schemas in `api/lib/schemas.ts`.
- **Rationale**: Ensures that if the `Group` interface changes, the `GroupSchema` must be updated to match, or it will throw a compile error.

### 4. Dynamic Memoization Key
- **Decision**: Generate a version key for `calculateCategorySplitsOptimized` based on a hash of the input data or a simple update counter in the `GroupProvider`.
- **Rationale**: Ensures that the cache is correctly invalidated when any relevant data (expenses, incomes, members) changes.

## Risks / Trade-offs

- **[Risk] Recursive Type Depth** → **Mitigation**: Keep the `ToFrontend` utility simple and non-recursive unless strictly necessary for nested models.
- **[Risk] Build Performance** → **Mitigation**: Ensure `tsc` only runs in `noEmit` mode for the `typecheck` script.
