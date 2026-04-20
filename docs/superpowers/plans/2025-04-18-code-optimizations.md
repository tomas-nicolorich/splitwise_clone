# Code Optimizations Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement critical performance optimizations addressing O(n³) financial calculations, React re-render issues, and API inefficiencies to improve runtime performance for 5-member groups.

**Architecture:** Focus on memoization optimizations, targeted query invalidation, and parallel data fetching while maintaining backward compatibility. No breaking changes to existing APIs or UI structure.

**Tech Stack:** React 18, TanStack Query v5, Prisma ORM, PostgreSQL, Vite

---

## Task 1: Optimize calculateCategorySplits Performance

**Files:**
- Modify: `src/utils/financial-utils.js`
- Create: `src/utils/__tests__/financial-utils.test.js` (if test infrastructure exists)

### Step 1: Analyze current performance with benchmark
```bash
node -e "
const { calculateCategorySplits } = require('./src/utils/financial-utils.js');
console.time('calculateCategorySplits');
// Simulate 5 members, 10 categories, 100 expenses
calculateCategorySplits(
  Array(10).fill({id: 1, amount: 1000, members: [1,2,3,4,5]}),
  Array(5).fill({user: 1, amount: 1000}),
  Array(5).fill({id: 1}),
  Array(100).fill({description: 'test', amount: 10, category_id: 1})
);
console.timeEnd('calculateCategorySplits');
"
```

### Step 2: Optimize the function with memoization helper
```javascript
// Add to financial-utils.js

const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

export const calculateCategorySplitsOptimized = memoize((categories, rawIncomes, members, allExpenses = []) => {
  // ... existing implementation
});
```

### Step 3: Benchmark optimized version
```bash
node -e "
const { calculateCategorySplitsOptimized } = require('./src/utils/financial-utils.js');
console.time('Optimized');
calculateCategorySplitsOptimized(
  Array(10).fill({id: 1, amount: 1000, members: [1,2,3,4,5]}),
  Array(5).fill({user: 1, amount: 1000}),
  Array(5).fill({id: 1}),
  Array(100).fill({description: 'test', amount: 10, category_id: 1})
);
console.timeEnd('Optimized');
"
```

### Step 4: Update hook to use optimized version
```javascript
// In src/hooks/use-group-data.js

const categorySplits = useMemo(() => {
  return calculateCategorySplitsOptimized(categories, rawIncomes, members, expenses);
}, [categories, rawIncomes, members, expenses]);
```

### Step 5: Verify functional correctness
```bash
npm run dev
# Test with actual data in browser
# Check console for errors
```

---

## Task 2: Fix Query Invalidation Strategy

**Files:**
- Modify: `src/hooks/use-group-data.js:65-67`

### Step 1: Replace blanket invalidation with targeted approach
```javascript
// Replace generic invalidate function with specific ones
const invalidateIncome = () => {
  queryClient.invalidateQueries({ queryKey: ["incomes", groupId] });
};

const invalidateCategory = () => {
  queryClient.invalidateQueries({ queryKey: ["categories", groupId] });
};

const invalidateExpense = () => {
  queryClient.invalidateQueries({ queryKey: ["expenses", groupId] });
};
```

### Step 2: Update mutations to use targeted invalidation
```javascript
const addIncome = useMutation({
  mutationFn: (data) => base44.entities.Income.create({ ...data, group_id: groupId }),
  onSuccess: () => invalidateIncome(),
});

// Similarly update: updateIncome, addCategory, updateCategory, addExpense
// deleteGroup should continue invalidating multiple as needed
```

### Step 3: Test in browser - verify only affected queries refetch
```bash
npm run dev
# Open React Query DevTools
# Add income - verify only income query refetches
# Add expense - verify only expense query refetches
```

---

## Task 3: Add React Error Boundary

**Files:**
- Create: `src/components/ErrorBoundary.jsx`
- Modify: `src/App.jsx`

### Step 1: Create ErrorBoundary component
```javascript
// src/components/ErrorBoundary.jsx

import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Step 2: Wrap routes with ErrorBoundary
```javascript
// In src/App.jsx:58

<Router>
  <ErrorBoundary>
    <AuthenticatedApp />
  </ErrorBoundary>
</Router>
```

### Step 3: Test error boundary
```javascript
// Add to Dashboard.jsx temporarily for testing

const throwError = () => {
  throw new Error('Test error');
};

// Add button: <button onClick={throwError}>Throw Error</button>
```

---

## Task 4: Implement Parallel Query Batching

**Files:**
- Create: `src/api/batch-queries.js`
- Modify: `src/hooks/use-group-data.js`

### Step 1: Create batch query utility
```javascript
// src/api/batch-queries.js

import { base44 } from '@/api/client';

export const fetchGroupDataBatch = async (groupId, members = []) => {
  const [incomes, categories, expenses] = await Promise.all([
    base44.entities.Income.filter({ group_id: groupId }),
    base44.entities.BudgetCategory.filter({ group_id: groupId }),
    base44.entities.Expense.filter({ group_id: groupId }),
  ]);

  return {
    incomes,
    categories,
    expenses,
  };
};
```

### Step 2: Create parallel batch query in hook
```javascript
// Add to src/hooks/use-group-data.js

const { data: batchData } = useQuery({
  queryKey: ["groupBatch", groupId],
  queryFn: () => fetchGroupDataBatch(groupId),
  enabled: !!groupId,
});

// Keep individual queries for now but make them depend on batch
const { data: rawIncomes = [], isFetching: isFetchingIncomes } = useQuery({
  queryKey: ["incomes", groupId],
  queryFn: () => batchData?.incomes || base44.entities.Income.filter({ group_id: groupId }),
  enabled: !!groupId,
});
```

### Step 3: Measure performance improvement
```javascript
// In browser console, before and after
console.time('parallel');
// trigger refetch
console.timeEnd('parallel');
```

---

## Task 5: Add React.memo to Expensive Components

**Files:**
- Modify: `src/pages/GroupDetail.jsx` and child components

### Step 1: Wrap section components
```javascript
// Modify all section components in GroupDetail.jsx
import { memo } from 'react';

const BudgetSectionMemo = memo(function BudgetSection({ categories, ...props }) {
  return <BudgetSection categories={categories} {...props} />;
});

const IncomeSectionMemo = memo(function IncomeSection({ incomes, ...props }) {
  return <IncomeSection incomes={incomes} {...props} />;
});
// Repeat for ExpensesSection, BudgetTransfersSection, RemainingBalanceSection
```

### Step 2: Use memoized components in GroupDetail
```javascript
// In GroupDetail.jsx render
<BudgetSectionMemo 
  categories={categories} 
  categorySplits={categorySplits}
  totalBudget={totalBudget}
  onUpdate={actions.updateCategory}
  onDelete={actions.deleteCategory}
/>
```

### Step 3: Verify in React DevTools
```bash
# Open React DevTools > Profiler
# Record interaction
# Verify components don't re-render on parent state changes
```

---

## Task 6: Add Database Indexes

**Files:**
- Modify: `prisma/schema.prisma`

### Step 1: Add indexes for common queries
```prisma
// Add to each model

model Expense {
  id          BigInt    @id @default(autoincrement())
  group_id    BigInt
  category_id BigInt
  date        DateTime
  
  @@index([group_id, date])
  @@index([category_id])
}

model Income {
  id       BigInt @id @default(autoincrement())
  group_id BigInt
  
  @@index([group_id])
}

model BudgetCategory {
  id       BigInt @id @default(autoincrement())
  group_id BigInt
  
  @@index([group_id])
}
```

### Step 2: Create migration
```bash
npx prisma migrate dev --name add_performance_indexes
```

### Step 3: Verify indexes in database
```bash
# Connect to database
echo '\d "Expense"' | npx prisma db execute --stdin
# Should show indexes
```

---

## Task 7: Add API Validation

**Files:**
- Modify: `api/data.js`
- Modify: `api/lib/schemas.js` (already exists)

### Step 1: Import schemas in data handler
```javascript
// In api/data.js

import { schemas } from './lib/schemas.js';

// Helper to validate data
const validateData = (data, schema) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }
  return result.data;
};
```

### Step 2: Add validation to create operations
```javascript
// In api/data.js case 'create':
case 'create': {
  const { data } = params;
  const entitySchema = schemas[entity];
  if (!entitySchema) {
    return res.status(400).json({ error: `No schema for entity: ${entity}` });
  }
  const validatedData = validateData(data, entitySchema);
  const mappedData = await mapTypes(validatedData, entity);
  
  // ... rest of create logic
  const newItem = await prisma[entity].create({ data: mappedData });
  return res.status(200).json(enrichResult(newItem, entity));
}
```

### Step 3: Test validation
```bash
curl -X POST "http://localhost:3000/api/data?entity=Expense&operation=create" \
  -H "Content-Type: application/json" \
  -d '{"data":{"amount":-50}}'
# Should return 400 validation error
```

---

## Task 8: Set Up Unit Testing Infrastructure

**Files:**
- Modify: `package.json`
- Create: `src/utils/financial-utils.test.js`
- Create: `src/components/ErrorBoundary.test.js`

### Step 1: Add testing dependencies
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Step 2: Add test scripts to package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

### Step 3: Create test for calculateCategorySplits
```javascript
// src/utils/financial-utils.test.js
import { describe, it, expect } from 'vitest';
import { calculateCategorySplits } from './financial-utils';

describe('calculateCategorySplits', () => {
  it('should correctly split equal amounts', () => {
    const categories = [{ id: 1, amount: 1000, members: [1, 2] }];
    const incomes = [
      { user: 1, amount: 500 },
      { user: 2, amount: 500 }
    ];
    const members = [{ id: 1 }, { id: 2 }];
    const expenses = [];
    
    const result = calculateCategorySplits(categories, incomes, members, expenses);
    expect(result[1].length).toBe(2);
    expect(result[1][0].share).toBeCloseTo(500, 0);
  });
  
  it('should handle empty categories', () => {
    const result = calculateCategorySplits([], [], [], []);
    expect(result).toEqual({});
  });
});
```

---

## Task 9: Performance Monitoring

**Files:**
- Modify: `src/lib/query-client.js`
- Modify: `src/hooks/use-group-data.js`

### Step 1: Add performance marks to query client
```javascript
// In src/lib/query-client.js

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 5,
    },
  },
  queryCache: {
    onError: (error) => {
      console.error('Query error:', error);
    },
  },
});
```

### Step 2: Add React Query DevTools in dev mode
```javascript
// In src/App.jsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// In return statement
<QueryClientProvider client={queryClientInstance}>
  <Router>
    <AuthenticatedApp />
  </Router>
  <Toaster />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

## Task 10: Final Verification

### Verify critical fixes
1. **Performance:** Check React DevTools Profiler - render times should decrease
2. **Error handling:** ErrorBoundary catches and displays errors gracefully
3. **Queries:** Only affected queries refetch on mutations
4. **Functionality:** All features work identically to before

### Run manual test scenarios
```bash
# Test with real data
cd /home/tom/projects/splitwise_clone
npm run dev

# Verify in browser:
# 1. Financial calculations still correct
# 2. Data loads without errors
# 3. Adding income only refetches income data
# 4. Adding expense only refetches expense data
# 5. Error boundary catches errors
```

### Performance comparison
```javascript
// Before and after in console
console.time('GroupDetail render');
// Trigger re-render
console.timeEnd('GroupDetail render');
```
