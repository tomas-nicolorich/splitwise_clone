# Implementation Plan: Migrate to Full TypeScript

## Phase 1: Infrastructure & Core Types
- [ ] Task: Merge `jsconfig.json` into `tsconfig.json` and configure `strict: true`, including both `src/` and `api/` directories.
- [ ] Task: Identify and install missing `@types/` packages for all third-party dependencies.
- [ ] Task: Replace third-party libraries that lack `@types/` with typed alternatives.
- [ ] Task: Create `src/api/types.ts` to define shared frontend-friendly types mapped from Prisma models.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Core Types' (Protocol in workflow.md)

## Phase 2: Leaf Utilities Conversion
- [ ] Task: Rename and type `src/utils/*.js` and `src/utils/*.test.js` files to `.ts`/`.test.ts`.
    - [ ] Sub-task: Convert `financial-utils.js` and fix typing errors.
    - [ ] Sub-task: Convert `app-params.js`.
- [ ] Task: Rename and type `api/lib/*.js` files to `.ts`.
    - [ ] Sub-task: Convert `db-utils.js` and `schemas.js`.
    - [ ] Sub-task: Convert `prisma.js` and `supabase-admin.js`.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Leaf Utilities Conversion' (Protocol in workflow.md)

## Phase 3: API Layer Conversion
- [ ] Task: Rename and type `src/api/client.js` and `src/api/batch-queries.js` to `.ts`.
- [ ] Task: Rename and type `api/data.js` to `.ts`.
    - [ ] Sub-task: Implement explicit type assertions (`as any`) for dynamic Prisma entity access.
- [ ] Task: Rename and type remaining API endpoints (`api/auth.js`, `api/groups.js`, etc.) to `.ts`.
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