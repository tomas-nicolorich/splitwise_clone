# Specification: Migrate to Full TypeScript

## Overview
The goal of this track is to fully convert the current hybrid JavaScript/TypeScript codebase to full TypeScript with `strict: true`. This will cover both the frontend (`src/`) and serverless functions (`api/`), unifying configuration under a single `tsconfig.json`.

## Functional Requirements
- **Complete Conversion**: Convert all `.js` and `.jsx` files in `src/` and `api/` directories to `.ts` and `.tsx`.
- **Strict Typing**: Enable `strict: true` in `tsconfig.json` and resolve all type errors without exceptions. There will be **no exclusions** for the strict checking.
- **Shared Type Layer**: Create `src/api/types.ts` to export frontend-friendly versions of Prisma models (e.g., converting BigInt to string and Decimal to number).
- **Third-Party Libraries**: All dependencies must have types. If `@types/` are missing for a library, the library should be **replaced with a typed alternative**.
- **Dynamic DB Access**: For the dynamic Prisma entity access in `api/data.js`, if mapped types fail to provide sufficient inference, use explicit **Type Assertions** (e.g., `as any`) specifically isolated to that boundary.

## Non-Functional Requirements
- **Zero Runtime Regression**: The migration must not alter existing business logic or financial calculations.
- **Single Source of Truth**: `jsconfig.json` must be removed and its configuration merged into `tsconfig.json`.

## Acceptance Criteria
- All source files are `.ts` or `.tsx`.
- `tsc --noEmit` runs successfully with zero errors with `strict: true` enabled.
- The application builds successfully for both Vite (frontend) and Vercel (API).
- `jsconfig.json` has been deleted.

## Out of Scope
- Refactoring business logic (unless strictly necessary for typing).
- Modifying UI styles or CSS.
- Adding new product features.