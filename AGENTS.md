# AGENTS.md


## Verified Commands

```bash
npm run dev              # Vite dev server (hot reload)
npm run dev:vercel       # Vercel serverless dev (tests API routes locally)
npm run build            # Production build
npm run lint             # ESLint (--quiet flag = only errors)
npm run lint:fix         # ESLint auto-fix
npm run typecheck        # Uses jsconfig.json, not tsconfig
npm run postinstall      # Runs prisma generate automatically
```

## Verification Order

`lint` -> `typecheck` -> `build` before claiming work is complete.

## Architecture Notes

- **API layer:** `src/api/client.js` wraps calls to `/api` serverless endpoints (in `api/` directory)
- **Financial core:** `src/utils/financial-utils.js` contains `calculateCategorySplits` - weighted cost distribution by member income
- **DB:** Prisma + PostgreSQL (Supabase) with multi-schema (`auth` + `public`); users sync between Supabase auth and local `users` table
- **Frontend:** React 18 with `.jsx` files, TanStack Query v5, React Hook Form + Zod

## Common Pitfalls

- TypeScript checking uses `jsconfig.json` not `tsconfig.json` - path aliases use `@/*` pattern
- ESLint is configured with `--quiet` by default - warnings are suppressed
- `npm install` runs `postinstall` which runs `prisma generate` - don't skip install
- No test framework configured - verify manually
- API routes in `api/` directory map to `/api/*` endpoints in Vercel

## Environment

Create `.env.local` before running:
```
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
VITE_APP_ID="your-app-id"
VITE_API_URL="/api"
```

## Key Files

- `prisma/schema.prisma` - DB schema and relations
- `api/*.js` - Serverless function handlers
- `src/main.jsx` - React entry point
- `src/App.jsx` - Main app with routing
- `src/lib/supabase-client.js` - Supabase client setup
- `src/utils/financial-utils.js` - calculateCategorySplits
- `vite.config.js` - Vite + Vercel plugin config

## Typecheck Exclusions

`jsconfig.json` excludes from type checking: `src/api`, `src/lib`, `src/components/ui`

## Instructions

Prioritize retrieval-led reasoning over pretrained-knowledge-led reasoning.
