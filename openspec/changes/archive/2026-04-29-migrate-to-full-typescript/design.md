## Context

The codebase is currently a hybrid of JavaScript and TypeScript. The `src/` directory contains mostly `.jsx` files, and the `api/` directory is exclusively `.js`. While `strict: true` is enabled in `tsconfig.json`, it only covers the `src` directory, and the actual type-checking script runs against `jsconfig.json`. This fragmentation leads to a "false sense of security" where the most critical data transformations (API/DB layer) are not type-checked.

## Goals / Non-Goals

**Goals:**
- **Single Source of Truth**: Unify all configuration under `tsconfig.json`.
- **Strict Compliance**: Eliminate all `any` usage and resolve all strict mode errors.
- **End-to-End Safety**: Link Prisma types to the frontend via a shared type layer.
- **Zero Runtime Regression**: Ensure the migration does not break existing logic, especially financial calculations.

**Non-Goals:**
- **Refactoring Logic**: This change focuses on typing existing logic, not redesigning how the app works (unless necessary for type safety).
- **Styling Changes**: No CSS/Styling changes are in scope.
- **New Features**: No new functional requirements are being added.

## Decisions

### 1. Unified `tsconfig.json`
- **Decision**: Merge `jsconfig.json` into `tsconfig.json` and include the `api/` directory in the compilation.
- **Rationale**: Having two separate configs is confusing and allows the API layer to escape strict checking.
- **Alternatives**: Keeping them separate and adding a second `tsconfig.api.json`. Rejected because the API and frontend share a lot of data structures.

### 2. Shared Type Layer (`src/api/types.ts`)
- **Decision**: Create a central file that exports "Frontend" versions of Prisma models.
- **Rationale**: Prisma uses `bigint` and `Decimal`. The frontend receives these as `string` and `number` via JSON.
- **Implementation**:
  ```typescript
  type ToFrontend<T> = {
    [K in keyof T]: T[K] extends bigint ? string : 
                    T[K] extends Decimal ? number : 
                    T[K] extends bigint[] ? string[] : T[K]
  };
  export type Group = ToFrontend<PrismaGroup>;
  ```

### 3. Progressive Renaming
- **Decision**: Rename files in a "leaf-to-root" order (Utils -> API Client -> Components -> Contexts).
- **Rationale**: Minimizes the number of "red" files at any given time and allows the most fundamental types to be established first.

### 4. Handling `prisma[entity]`
- **Decision**: Use a mapped type or an object map to type the dynamic entity access in `api/data.js`.
- **Rationale**: Strict mode forbids indexing `prisma` with a string. We'll define a `PrismaEntity` union type.

## Risks / Trade-offs

- **[Risk] BigInt Serialization Errors** → **Mitigation**: Add unit tests for the `serializeBigInt` utility in TypeScript to ensure it handles all edge cases (nulls, nested objects) correctly before rolling it out to the whole API.
- **[Risk] "Any" Infection** → **Mitigation**: Ban `any` in `tsconfig.json` (via `noImplicitAny`) and strictly enforce it during the conversion of `api/data.js`.
- **[Risk] Build Time Increase** → **Mitigation**: Use `skipLibCheck: true` and ensure `incremental: true` is enabled in `tsconfig.json`.

## Migration Plan

1. **Infrastructure**: Fix `tsconfig.node.json`, merge `jsconfig.json`, install `@types/`.
2. **Core Types**: Generate Prisma types and create `src/api/types.ts`.
3. **Leaf Utilities**: Convert `src/utils/*.js` and `api/lib/*.js`.
4. **API Layer**: Convert `src/api/client.js` and `api/data.js`.
5. **UI Layer**: Convert components and pages folder-by-folder.
6. **Validation**: Run `tsc --noEmit` and fix remaining issues.

## Open Questions

- Should we use `Decimal.js` on the frontend or stick to `number`? (Decision: Stick to `number` for now as the backend handles the precision-critical parts, but revisit if rounding issues occur in the UI).
