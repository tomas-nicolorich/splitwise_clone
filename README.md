# Calculoides

A collaborative, standalone financial tracking application.

## Project Overview
Calculoides is a financial tracking tool designed for shared household expenses. Originally built as a Splitwise clone on the Base44 platform, it has been migrated to a standalone React application. It maintains the original SDK's interface through a custom API wrapper while utilizing a modern, serverless-ready architecture.

## Technical Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Radix UI (via Shadcn UI)
- **Data Fetching:** TanStack Query (v5)
- **Forms:** React Hook Form + Zod
- **Backend:** Prisma ORM with PostgreSQL (hosted on Supabase)
- **Deployment:** Vercel (Serverless Functions)
- **Routing:** React Router DOM (v6)

## Architecture & Standalone Logic

### The API Wrapper (`src/api/client.js`)
To ensure compatibility with the original logic while removing dependencies on external platforms, the project uses a custom `api` object. This wrapper mimics the original SDK's structure:

- `api.auth`: Handles user session and profile management via Supabase Auth.
- `api.entities`: Provides CRUD operations for `Group`, `Income`, `BudgetCategory`, and `Expense`.

These calls are routed to local `/api` serverless endpoints, which interface directly with the Prisma client.

### Financial Core (`src/lib/financial-utils.js`)
The heart of the application is the `calculateCategorySplits` function. It implements a weighted cost distribution model:

1. **Member-Weighted Splitting:** Costs are divided among category members based on their relative monthly income.
2. **Rounding Precision:** The algorithm ensures that the sum of individual shares exactly matches the total category budget, handling remainders by distributing them to the members with the largest relative remainders.
3. **Budget Transfers:** Supports manual adjustments via special expense records tagged with `[BUDGET_TRANSFER]`, allowing users to shift costs between members within a category.
