import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/client';
import { calculateCategorySplitsOptimized } from '@/utils/financial-utils';

const GroupContext = createContext(null);

export const GroupProvider = ({ groupId, children }) => {
  const { data: group, isLoading: isGroupLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => base44.entities.Group.list(null, groupId)
  });

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
    // Use groupId as key, and a dummy version 1 for now
    return calculateCategorySplitsOptimized(groupId, 1, categories, incomes, group?.members || [], expenses);
  }, [isLoading, groupId, categories, incomes, expenses, group]);

  return (
    <GroupContext.Provider value={{ group, expenses, incomes, categories, financialSplits, isLoading }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => useContext(GroupContext);
