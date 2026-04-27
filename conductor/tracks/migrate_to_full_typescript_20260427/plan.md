# Implementation Plan: Migrate to Full TypeScript

## Phase 1: Infrastructure & Core Types [checkpoint: 30a6ea7]
- [x] Task: Merge `jsconfig.json` into `tsconfig.json` and configure `strict: true`, including both `src/` and `api/` directories. b11e85d
- [x] Task: Identify and install missing `@types/` packages for all third-party dependencies. 1f99d53
- [x] Task: Replace third-party libraries that lack `@types/` with typed alternatives (and remove deprecated/unused ones). e0aa0d7
- [x] Task: Create `src/api/types.ts` to define shared frontend-friendly types mapped from Prisma models. e2f263f
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Core Types' (Protocol in workflow.md) 30a6ea7

## Phase 2: Leaf Utilities Conversion [checkpoint: 9451c0a]
- [x] Task: Rename and type `src/utils/*.js` and `src/utils/*.test.js` files to `.ts`/`.test.ts`. b956dc4
    - [x] Sub-task: Convert `financial-utils.js` and fix typing errors. b956dc4
    - [x] Sub-task: Convert `app-params.js`. b956dc4
- [x] Task: Rename and type `api/lib/*.js` files to `.ts`. 2cc13f0
    - [x] Sub-task: Convert `db-utils.js` and `schemas.js`. 2cc13f0
    - [x] Sub-task: Convert `prisma.js` and `supabase-admin.js`. 2cc13f0
- [x] Task: Conductor - User Manual Verification 'Phase 2: Leaf Utilities Conversion' (Protocol in workflow.md) 9451c0a

## Phase 3: API Layer Conversion
- [x] Task: Rename and type `src/api/client.js` and `src/api/batch-queries.js` to `.ts`. e5b98db
- [x] Task: Rename and type `api/data.js` to `.ts`. 8305c1d
    - [x] Sub-task: Implement explicit type assertions (`as any`) for dynamic Prisma entity access. 8305c1d
- [x] Task: Rename and type remaining API endpoints (`api/auth.js`, `api/groups.js`, etc.) to `.ts`. ed24fe2
- [ ] Task: Conductor - User Manual Verification 'Phase 3: API Layer Conversion' (Protocol in workflow.md)

## Phase 4: UI Layer Conversion (Components & Contexts)
- [ ] Task: Rename and type `src/contexts/*.jsx` to `.tsx`.
- [ ] Task: Rename and type `src/hooks/*.js(x)` to `.ts(x)`.
- [ ] Task: Rename and type `src/components/ui/*.jsx` to `.tsx`.
- [ ] Task: Rename and type remaining components (`auth`, `dashboard`, `group-detail`) to `.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: UI Layer Conversion (Components & Contexts)' (Protocol in workflow.md)

## Phase 5: Pages & Validation
- [ ] Task: Rename and type `src/pages/*.jsx` to `.tsx`.
- [ ] Task: Rename and type root files (`App.jsx`, `main.jsx`, `Layout.jsx`) to `.tsx`.
- [ ] Task: Run `tsc --noEmit` and resolve any lingering strict mode errors globally.
- [ ] Task: Run Vite build (`npm run build`) and Vercel build to ensure successful compilation.
- [ ] Task: Delete `jsconfig.json`.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Pages & Validation' (Protocol in workflow.md)