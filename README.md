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
