# SplitWise (Base44 App) - Project Overview

A collaborative financial tracking application built with **React 18**, **Vite**, **Tailwind CSS**, and **Base44 SDK**. This project enables users to create groups, track shared income, and split expenses among members.

## Technical Stack

- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/) (shadcn/ui style components)
- **Data Fetching:** [TanStack Query (v5)](https://tanstack.com/query/latest)
- **Routing:** [React Router DOM (v6)](https://reactrouter.com/en/main)
- **Backend/SDK:** [@base44/sdk](https://docs.base44.com/) for authentication and entity CRUD operations
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Project Structure

- `src/api/`: Contains `base44Client.js` for SDK initialization.
- `src/components/`:
  - `ui/`: Base UI components (Radix + Tailwind).
  - `groups/`: Components for group listing and creation.
  - `group-detail/`: Components for managing specific group data (Budget, Expenses, Income, etc.).
- `src/hooks/`: Custom React hooks (e.g., `use-mobile.jsx`).
- `src/lib/`: Core logic, including `AuthContext.jsx`, `query-client.js`, and `NavigationTracker.jsx`.
- `src/pages/`: Application pages. Pages are auto-registered via `pages.config.js`.
- `src/Layout.jsx`: The main layout wrapper providing navigation, theme toggling, and authentication status.
- `src/pages.config.js`: **Important:** Controls page routing and specifies the `mainPage`.

## Building and Running

### Prerequisites
- Node.js installed.
- `.env.local` file with `VITE_BASE44_APP_ID` and `VITE_BASE44_APP_BASE_URL`.

### Commands
- `npm install`: Install project dependencies.
- `npm run dev`: Start the local development server.
- `npm run build`: Create a production-ready build in `dist/`.
- `npm run lint`: Run ESLint to find and fix code style issues.
- `npm run typecheck`: Run TypeScript type checking on the codebase.
- `npm run preview`: Preview the production build locally.

## Development Conventions

- **Routing:** Do not manually add routes to `App.jsx`. Instead, create a new file in `src/pages/` and ensure it is registered in `src/pages.config.js`.
- **Styling:** Use Tailwind CSS utility classes. Avoid custom CSS files unless absolutely necessary.
- **Data Management:** Always use `useQuery` for fetching data and `useMutation` for modifying it to ensure UI consistency and cache invalidation.
- **Authentication:** Access user information via the `AuthContext` or `base44.auth.me()`.
- **Components:** Favor small, reusable components. Base UI components should reside in `src/components/ui/`.
- **Naming:**
  - Components: `PascalCase.jsx`
  - Hooks: `use-kebab-case.jsx` or `useCamelCase.jsx`
  - Utilities/Configs: `camelCase.js`
