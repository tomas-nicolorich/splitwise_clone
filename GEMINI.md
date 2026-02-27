# SplitWise (Vercel-Compatible) - Project Overview

A collaborative financial tracking application migrated from Base44 to a standalone React application compatible with Vercel. It uses **React 18**, **Vite**, **Tailwind CSS**, and **Local Storage** for data persistence.

## Technical Stack

- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/)
- **Data Fetching:** [TanStack Query (v5)](https://tanstack.com/query/latest)
- **Routing:** [React Router DOM (v6)](https://reactrouter.com/en/main)
- **Data Persistence:** Local Storage (emulating a backend via `src/api/client.js`)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Project Structure

- `src/api/`:
  - `client.js`: Local Storage-based mock backend that implements the Base44 SDK interface.
  - `client.js`: Re-exports the mock client for compatibility with existing code.
- `src/components/`:
  - `ui/`: Base UI components.
  - `groups/`: Group management components.
  - `group-detail/`: Financial tracking components.
- `src/lib/`: Core logic, including `AuthContext.jsx` and `query-client.js`.
- `src/pages/`: Application pages (`Dashboard.jsx`, `GroupDetail.jsx`).
- `src/Layout.jsx`: Main layout wrapper.
- `src/App.jsx`: Main entry point with React Router configuration.

## Building and Running

### Commands
- `npm install`: Install project dependencies.
- `npm run dev`: Start the local development server.
- `npm run build`: Create a production-ready build for Vercel.
- `npm run lint`: Run ESLint.
- `npm run typecheck`: Run TypeScript type checking.

## Key Changes for Vercel Migration

1.  **Removed `@base44/sdk` and `@base44/vite-plugin`:** The project is now independent of the Base44 platform.
2.  **Mock Client:** Added `src/api/client.js` to handle data using the browser's Local Storage, allowing the app to work without a real backend.
3.  **Standard Routing:** Replaced the Base44 auto-routing with standard `react-router-dom` in `App.jsx`.
4.  **Simplified Auth:** Updated `AuthContext.jsx` to use a persistent mock user in Local Storage.
5.  **Removed Base44 Utilities:** Files like `pages.config.js` and `NavigationTracker.jsx` are no longer used.
