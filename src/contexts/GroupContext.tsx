import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { calculateCategorySplitsOptimized, CategorySplits } from '@/utils/financial-utils';
import { Group, Expense, Income, BudgetCategory } from '@/api/types';

export interface GroupContextValue {
  group: Group | undefined;
  expenses: Expense[] | undefined;
  incomes: Income[] | undefined;
  categories: BudgetCategory[] | undefined;
  financialSplits: CategorySplits;
  isLoading: boolean;
}

const GroupContext = createContext<GroupContextValue | undefined>(undefined);

export const GroupProvider: React.FC<{ groupId: string, children: ReactNode }> = ({ groupId, children }) => {
  const { data: groups, isLoading: isGroupLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => base44.entities.Group.list(null, groupId)
  });

  const group = useMemo(() => {
      if (Array.isArray(groups)) {
          return groups.find(g => String(g.id) === String(groupId));
      }
      return undefined;
  }, [groups, groupId]);

  const { data: expenses, isLoading: isExpensesLoading } = useQuery({
    queryKey: ['expenses', groupId],
    queryFn: () => base44.entities.Expense.list(null, groupId)
  });

  const { data: incomes, isLoading: isIncomesLoading } = useQuery({
    queryKey: ['incomes', groupId],
    queryFn: () => base44.entities.Income.list(null, groupId)
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories', groupId],
    queryFn: () => base44.entities.BudgetCategory.list(null, groupId)
  });

  const isLoading = isGroupLoading || isExpensesLoading || isIncomesLoading || isCategoriesLoading;

  const financialSplits = useMemo(() => {
    if (isLoading || !categories || !incomes || !expenses) return {};
    return calculateCategorySplitsOptimized(groupId, '1', categories, incomes, group?.members || [], expenses);
  }, [isLoading, groupId, categories, incomes, expenses, group]);

  return (
    <GroupContext.Provider value={{ group, expenses, incomes, categories, financialSplits, isLoading }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
    const context = useContext(GroupContext);
    if (context === undefined) {
        throw new Error('useGroup must be used within a GroupProvider');
    }
    return context;
};
