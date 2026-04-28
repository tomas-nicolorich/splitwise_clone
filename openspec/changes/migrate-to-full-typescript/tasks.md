## 1. Infrastructure & Configuration

- [x] 1.1 Fix `tsconfig.node.json` by adding `"composite": true` and ensure it matches `tsconfig.json` requirements.
- [x] 1.2 Merge `jsconfig.json` compiler options into `tsconfig.json`, including the `api/` directory in the `include` array.
- [x] 1.3 Install missing `@types/` for `lodash`, `canvas-confetti`, `three`, and any other dependencies.
- [x] 1.4 Delete `jsconfig.json` and verify `npm run typecheck` uses `tsconfig.json`.

## 2. Core Shared Types

- [x] 2.1 Create `src/api/types.ts` and implement the `ToFrontend<T>` utility type.
- [x] 2.2 Export frontend-compatible interfaces for `Group`, `Expense`, `Income`, `BudgetCategory`, and `User` based on Prisma models.
- [x] 2.3 Update `api/lib/schemas.js` to use these interfaces for Zod `z.infer`.

## 3. Leaf Utilities & Library Conversion

- [x] 3.1 Convert `src/utils/utils.js` and `src/utils/app-params.js` to TypeScript.
- [x] 3.2 Convert `src/utils/financial-utils.js` to TypeScript and ensure all calculations are strictly typed.
- [x] 3.3 Convert `api/lib/db-utils.js`, `api/lib/prisma.js`, and `api/lib/supabase-admin.js` to TypeScript.

## 4. API Client & Backend Logic

- [x] 4.1 Convert `src/api/client.js` to TypeScript, typing the `base44` object and `createEntityStore`.
- [x] 4.2 Convert `api/data.js` to TypeScript, resolving dynamic `prisma[entity]` access with a strictly typed map.
- [x] 4.3 Convert all specific entity endpoints in `api/*.js` (e.g., `api/groups.js`, `api/expenses.js`) to TypeScript.

## 5. UI Components & Contexts

- [x] 5.1 Convert `src/contexts/AuthContext.jsx` and `src/contexts/GroupContext.jsx` to TypeScript.
- [x] 5.2 Convert UI components in `src/components/ui/` from `.jsx` to `.tsx`.
- [x] 5.3 Convert application components in `src/components/dashboard/` and `src/components/group-detail/` to TypeScript.
- [x] 5.4 Convert pages in `src/pages/` to TypeScript.

## 6. Final Validation & Cleanup

- [x] 6.1 Resolve any remaining `tsc --noEmit` errors across the entire project.
- [x] 6.2 Remove any lingering `// @ts-nocheck` or `// @ts-ignore` comments.
- [x] 6.3 Verify the build with `npm run build` and ensure the application runs correctly in dev mode.
