# Implementation Plan: Migrate to Full TypeScript

## Phase 1: Infrastructure & Core Types [checkpoint: 30a6ea7]
- [x] Task: Merge `jsconfig.json` into `tsconfig.json` and configure `strict: true`, including both `src/` and `api/` directories. 46a482b
- [x] Task: Establish base API types in `src/api/types.ts` and `api/lib/schemas.ts`. b78a1a3
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Core Types' (Protocol in workflow.md) [checkpoint: 30a6ea7]

## Phase 2: Utils & Client Layer Conversion [checkpoint: e667634]
- [x] Task: Rename and type `src/utils/*.js` to `.ts`. f541d4f
- [x] Task: Rename and type `api/lib/db-utils.js` to `.ts`. d675005
- [x] Task: Conductor - User Manual Verification 'Phase 2: Utils & Client Layer Conversion' (Protocol in workflow.md) [checkpoint: e667634]

## Phase 3: API Layer Conversion [checkpoint: e1196ec]
- [x] Task: Rename and type `src/api/client.js` and `src/api/batch-queries.js` to `.ts`. e5b98db
- [x] Task: Rename and type `api/data.js` to `.ts`. 8305c1d
- [x] Task: Rename and type remaining API endpoints (`api/auth.js`, `api/groups.js`, etc.) to `.ts`. ed24fe2
- [x] Task: Conductor - User Manual Verification 'Phase 3: API Layer Conversion' (Protocol in workflow.md) [checkpoint: e1196ec]

## Phase 4: UI Layer Conversion (Components & Contexts) [checkpoint: e680073]
- [x] Task: Rename and type `src/contexts/*.jsx` to `.tsx`. 4f36ee5
- [x] Task: Rename and type `src/hooks/*.js(x) to .ts(x)`. b4695e5
- [x] Task: Rename and type `src/components/ui/*.jsx` to `.tsx`. 6412b11
- [x] Task: Rename and type remaining components (auth, dashboard, group-detail) to `.tsx`. ec66c57
- [ ] Task: Conductor - User Manual Verification 'Phase 4: UI Layer Conversion (Components & Contexts)' (Protocol in workflow.md)

## Phase 5: Pages & Validation [checkpoint: e680073]
- [x] Task: Rename and type `src/pages/*.jsx` to `.tsx`.
- [x] Task: Rename and type root files (`App.jsx`, `main.jsx`, `Layout.jsx`) to `.tsx`.
- [x] Task: Ensure strict mode is enabled globally.
- [x] Task: Run Vite build (`npm run build`) and Vercel build to ensure successful compilation.
- [x] Task: Delete `jsconfig.json`.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Pages & Validation' (Protocol in workflow.md)
