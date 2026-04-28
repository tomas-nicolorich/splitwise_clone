# Project Context: splitwise_clone

## Architecture & Conventions
- The project is now fully migrated to TypeScript with strict mode enabled.
- All .jsx files have been renamed to .tsx, and all .js files to .ts.
- Vite and Vercel builds are verified and working.
- 'npx tsc --noEmit' passes with zero errors.
- 'vite-plugin-vercel' version 11 requires importing from 'vite-plugin-vercel/vite' and explicit entry configuration via 'getVercelEntries'.
