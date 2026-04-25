## Why

The current project uses a mix of JavaScript and TypeScript, leading to inconsistent developer experiences, potential runtime errors that could be caught at compile time, and lack of type safety in critical financial calculations and API interactions. Moving to full TypeScript with `strict: true` ensures long-term maintainability, self-documenting code, and higher confidence in data integrity.

## What Changes

- **Full Conversion**: Convert all `.js` and `.jsx` files in `src/` and `api/` to `.ts` and `.tsx`.
- **Strict Mode**: Enable and resolve all errors for `"strict": true` in `tsconfig.json`.
- **Unified Configuration**: Merge `jsconfig.json` into a single, comprehensive `tsconfig.json` that covers both the frontend and the Vercel serverless functions (API).
- **Type Definitions**: Add missing `@types/` for all third-party dependencies.
- **Prisma Integration**: Leverage generated Prisma types to drive end-to-end type safety from the database to the UI.

## Capabilities

### New Capabilities
- `shared-types`: A central location for shared types (e.g., frontend-friendly versions of Prisma models) used by both the frontend and backend.

### Modified Capabilities
- `group-context`: Transition the `GroupContext` to a strictly typed TypeScript implementation.
- `db-utils`: Convert database utility functions to TypeScript, specifically handling BigInt and UUID transformations with type safety.
- `financial-calculations`: Ensure all financial utility functions (splits, totals) are strictly typed to prevent precision or logic errors.
- `specific-api-endpoints`: Type the dynamic API handler and specific entity endpoints to ensure request/response validation matches the Prisma schema.

## Impact

- **Entire Codebase**: Every file in the project will be affected by the extension change and type annotations.
- **Build Pipeline**: Vite and Vercel build processes will now involve more rigorous type checking.
- **Developer Workflow**: Strict mode will require explicit type definitions for all new code, improving overall code quality but slightly increasing initial development time for new features.
