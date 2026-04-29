## 1. Infrastructure Cleanup

- [x] 1.1 Update `package.json` to change `"typecheck"` script to `"tsc --noEmit"`.
- [x] 1.2 Remove unused `@types/` dependencies from `package.json` if confirmed they are not used (`lodash`, `canvas-confetti`, `three`).
- [x] 1.3 Verify `npm run typecheck` runs (it will likely fail initially, which is expected).

## 2. Core Shared Types

- [x] 2.1 Implement `ToFrontend<T>` utility type in `src/api/types.ts`.
- [x] 2.2 Refactor `src/api/types.ts` to use `ToFrontend` for entity interfaces (`Group`, `Expense`, etc.).
- [x] 2.3 Update Zod schemas in `api/lib/schemas.ts` to be explicitly typed using `z.ZodType<T>` with the shared interfaces.

## 3. Backend Type Safety

- [x] 3.1 Refactor `api/data.ts` to eliminate `as any` for dynamic Prisma entity access.
- [x] 3.2 Ensure `api/data.ts` uses the `ExtendedPrismaClient` types for entity resolution.
- [x] 3.3 Verify that all API handlers in `api/*.ts` correctly use the updated schemas and types.

## 4. UI Logic Refinement

- [x] 4.1 Update `GroupProvider` in `src/contexts/GroupContext.tsx` to use a dynamic memoization key (e.g., an incrementing counter or data hash).
- [x] 4.2 Verify that financial calculations re-calculate correctly when dependencies change.

## 5. Final Validation

- [x] 5.1 Run `npm run typecheck` and resolve all remaining type errors.
- [x] 5.2 Run `npm run build` to ensure the project bundles correctly.
- [x] 5.3 Verify application functionality in dev mode.
