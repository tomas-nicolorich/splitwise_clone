## 1. Backend Stabilization (db-utils & API)

- [x] 1.1 Create `api/lib/db-utils.js` and extract BigInt serialization, sequence syncing, and UUID mapping logic.
- [x] 1.2 Refactor `api/data.js` and `api/auth.js` to use the shared `db-utils.js`.
- [x] 1.3 Complete `api/lib/schemas.js` with Zod schemas for `BudgetCategory` and `Users`.
- [x] 1.4 Implement specific API endpoints for `groups.js` and `expenses.js`.
- [x] 1.5 Implement specific API endpoints for `incomes.js` and `categories.js`.
- [x] 1.6 Update `src/api/client.js` to support specific endpoints while maintaining backward compatibility for the generic route.

## 2. Core Logic Verification (financial-utils)

- [x] 2.1 Expand `src/utils/financial-utils.test.js` with exhaustive test cases for the Largest Remainder Method (rounding).
- [x] 2.2 Add unit tests for Budget Transfers in `financial-utils.test.js` to ensure adjusted shares are correct.
- [x] 2.3 Optimize the `memoize` function in `financial-utils.js` to use a stable key (e.g., `groupId` + data version) instead of `JSON.stringify`.

## 3. Frontend Architecture (GroupContext)

- [x] 3.1 Create `src/contexts/GroupContext.jsx` and implement the `GroupProvider` with TanStack Query fetching.
- [x] 3.2 Integrate memoized financial calculations into the `GroupProvider`.
- [x] 3.3 Wrap the `GroupDetail` page with `GroupProvider` and provide a `useGroup` custom hook.
- [x] 3.4 Migrate `IncomeSection` and `ExpensesSection` to consume data via `useGroup`.
- [x] 3.5 Migrate `BudgetSection`, `RemainingBalanceSection`, and `BudgetTransfersSection` to `useGroup`.
- [x] 3.6 Remove `groupId` prop drilling and redundant `useGroupData` calls throughout `GroupDetail`.

## 4. Cleanup & Optimization

- [x] 4.1 Audit dependencies in `package.json` and identify all instances of `moment` and `react-hot-toast`.
- [x] 4.2 Consolidate all date manipulation logic to `date-fns` and remove `moment` from the project.
- [x] 4.3 Consolidate all toast notifications to `sonner` and remove `react-hot-toast`.
- [x] 4.4 Run a full production build and verify bundle size reduction and application stability.
