src/
├── api/
│   ├── endpoints/
│   │   ├── auth.ts          # Specific auth endpoints
│   │   ├── groups.ts        # Group CRUD operations
│   │   ├── users.ts         # User profile operations
│   │   ├── incomes.ts       # Income CRUD operations
│   │   ├── categories.ts    # Budget category CRUD
│   │   └── expenses.ts      # Expense CRUD operations
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client singleton
│   │   └── supabase-admin.ts # Supabase admin client
│   └── client.ts            # API client wrapper
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── ProfileModal.tsx
│   │   └── SetupProfileModal.tsx
│   ├── dashboard/
│   │   ├── CreateGroupDialog.tsx
│   │   └── GroupCard.tsx
│   ├── group-detail/
│   │   ├── AddExpenseDialog.tsx
│   │   ├── BudgetCategoryDialog.tsx
│   │   ├── BudgetSection.tsx
│   │   ├── BudgetTransferDialog.tsx
│   │   ├── BudgetTransfersSection.tsx
│   │   ├── ExpensesSection.tsx
│   │   ├── IncomeSection.tsx
│   │   ├── InviteMemberDialog.tsx
│   │   ├── RemainingBalanceSection.tsx
│   │   ├── SavingTargetSection.tsx
│   │   └── SavingTargetSkeleton.tsx
│   ├── layout/
│   │   ├── Layout.tsx
│   │   └── ErrorBoundary.tsx
│   └── ui/                  # Only actually used Radix components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── skeleton.tsx
│       ├── textarea.tsx
│       ├── card.tsx
│       ├── scroll-area.tsx
│       ├── calendar.tsx
│       ├── checkbox.tsx
│       └── section-card.tsx
├── contexts/
│   ├── AuthContext.tsx
│   └── GroupContext.tsx     # New: replaces prop drilling
├── hooks/
│   ├── use-auth.ts
│   ├── use-group-data.ts    # Updated to use GroupContext
│   └── use-groups.ts
├── lib/
│   ├── query-client.ts
│   ├── supabase-client.ts
│   └── utils.ts             # Moved from src/utils
├── pages/
│   ├── Dashboard.tsx
│   ├── GroupDetail.tsx
│   ├── Login.tsx
│   ├── NotFound.tsx
│   ├── SavingTargetPage.tsx
│   └── AllExpensesPage.tsx
├── utils/
│   ├── financial-utils.ts   # Core logic (income-weighted splits)
│   └── app-params.ts
├── App.tsx
├── main.tsx
└── index.css