# GroupContext Architecture

## Problem with Current Approach
The current `useGroupData` hook suffers from:
1. **Prop drilling**: `groupId` passed from Page → Layout → Section → Sub-component
2. **Redundant fetches**: Each section calls `useGroupData(groupId)` independently
3. **Loose typing**: Components receive data as `any` or loose objects
4. **Stale data risk**: Multiple instances may have different fetch states

## Solution: GroupContext
A React Context that provides group-scoped data to all descendants, eliminating prop drilling and ensuring data consistency.

### Context Value Shape
```typescript
interface GroupContextValue {
  // Data
  group: Group | null
  members: User[]
  incomes: Income[]
  categories: BudgetCategory[]
  expenses: Expense[]
  categorySplits: Record<string, Split[]> // categoryId => splits
  
  // Derived
  totalIncome: number
  totalBudget: number
  
  // Status
  isLoading: boolean
  isFetching: boolean
  error: Error | null
  
  // Actions (mutations)
  actions: {
    addIncome: (data: IncomeInput) => Promise<void>
    updateIncome: (id: string, data: IncomeInput) => Promise<void>
    deleteIncome: (id: string) => Promise<void>
    addCategory: (data: CategoryInput) => Promise<void>
    updateCategory: (id: string, data: CategoryInput) => Promise<void>
    deleteCategory: (id: string) => Promise<void>
    addExpense: (data: ExpenseInput) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    inviteMember: (userId: string) => Promise<void>
    refreshAll: () => void
  }
}
```

### Implementation Approach

#### 1. GroupProvider Component
```typescript
interface GroupProviderProps {
  groupId: string
  children: React.ReactNode
}

export function GroupProvider({ groupId, children }: GroupProviderProps) {
  const queryClient = useQueryClient()
  
  // All queries and mutations (same as useGroupData but consolidated)
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const groups = await base44.entities.Group.filter({ id: groupId })
      return groups[0]
    },
    enabled: !!groupId,
  })
  
  // ... other queries for members, incomes, categories, expenses
  
  // Calculations
  const categorySplits = useMemo(() => {
    return calculateCategorySplitsOptimized(categories, rawIncomes, members, expenses)
  }, [categories, rawIncomes, members, expenses])
  
  // Mutations (same as useGroupData)
  
  const value = useMemo(() => ({
    group,
    members,
    incomes,
    categories,
    expenses,
    categorySplits,
    totalIncome,
    totalBudget,
    isLoading: groupLoading || isFetchingMembers || isFetchingIncomes || isFetchingCategories || isFetchingExpenses,
    isFetching: isFetchingMembers || isFetchingIncomes || isFetchingCategories || isFetchingExpenses,
    error: null, // simplified
    actions: {
      // all mutation functions
    }
  }), [group, members, incomes, categories, expenses, categorySplits, totalIncome, totalBudget, /* mutation deps */])
  
  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  )
}
```

#### 2. Usage in Components
```typescript
// Instead of:
// function BudgetSection({ groupId }) {
//   const { categorySplits } = useGroupData(groupId)
//   // ...
// }

// Use:
function BudgetSection() {
  const { categorySplits } = useGroupContext()
  // No props needed! Automatically subscribes to nearest GroupProvider
}
```

#### 3. Provider Placement
```typescript
// In GroupDetail.tsx:
export function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>()
  
  return (
    <GroupProvider groupId={groupId}>
      <GroupDetailContent />
    </GroupProvider>
  )
}

// GroupDetailContent and all its children can now consume group data
// without receiving groupId as prop
```

### Benefits
1. **Eliminates prop drilling**: No need to pass groupId through component tree
2. **Prevents redundant fetches**: Single source of truth for group data
3. **Better typing**: Strongly typed context value
4. **Automatic subscriptions**: Components re-render when relevant data changes
5. **Cleaner component signatures**: Sections only receive what they truly need
6. **Dev experience**: Easier to reason about data flow

### Migration Strategy
1. Create `src/contexts/GroupContext.tsx`
2. Move data fetching logic from `useGroupData` to GroupProvider
3. Keep `useGroupData` as a thin wrapper that reads from context (for backward compatibility during migration)
4. Update components to use `useGroupContext` instead of `useGroupData` + props
5. Remove prop drilling once all consumers are migrated
6. Eventually deprecate `useGroupData` in favor of context

### Files to Create/Modify
- `src/contexts/GroupContext.tsx` (new)
- `src/hooks/use-group-data.ts` (modified to use context internally)
- `src/components/group-detail/*.tsx` (remove groupId props, use context)
- `src/components/dashboard/GroupCard.tsx` (may need adjustment)
- `src/App.tsx` (no changes needed - context is scoped to group detail)