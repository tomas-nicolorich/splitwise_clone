import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/client";
import { useMemo } from "react";
import { calculateCategorySplits } from "@/utils/financial-utils";
import { getMappedIncomes } from "@/utils/utils";
import { createPageUrl } from "@/utils";

/**
 * Custom hook to manage all group-related data and actions.
 * @param {string} groupId - The ID of the group.
 * @returns {Object} - Group data, status, and mutations.
 */
export function useGroupData(groupId) {
    const queryClient = useQueryClient();

    // Queries
    const { data: group, isLoading: groupLoading } = useQuery({
        queryKey: ["group", groupId],
        queryFn: async () => {
            const groups = await base44.entities.Group.filter({ id: groupId });
            return groups[0];
        },
        enabled: !!groupId,
    });

    const { data: members = [], isFetching: isFetchingMembers } = useQuery({
        queryKey: ["members", groupId],
        queryFn: async () => {
            if (!group?.members?.length) return [];
            return base44.entities.Users.filter({ id: { $in: group.members } });
        },
        enabled: !!group?.members?.length,
    });

    const { data: rawIncomes = [], isFetching: isFetchingIncomes } = useQuery({
        queryKey: ["incomes", groupId],
        queryFn: () => base44.entities.Income.filter({ group_id: groupId }),
        enabled: !!groupId,
    });

    const { data: categories = [], isFetching: isFetchingCategories } = useQuery({
        queryKey: ["categories", groupId],
        queryFn: () => base44.entities.BudgetCategory.filter({ group_id: groupId }),
        enabled: !!groupId,
    });

    const { data: expenses = [], isFetching: isFetchingExpenses } = useQuery({
        queryKey: ["expenses", groupId],
        queryFn: () => base44.entities.Expense.filter({ group_id: groupId }),
        enabled: !!groupId,
    });

    // Centralized Logic & Mappings
    const incomes = useMemo(() => getMappedIncomes(rawIncomes), [rawIncomes]);
    
    const categorySplits = useMemo(() => {
        return calculateCategorySplits(categories, rawIncomes, members, expenses);
    }, [categories, rawIncomes, members, expenses]);

    // Derived State
    const totalIncome = useMemo(() => incomes.reduce((sum, i) => sum + (i.amount || 0), 0), [incomes]);
    const totalBudget = useMemo(() => categories.reduce((sum, c) => sum + (c.amount || 0), 0), [categories]);

    // Mutation Helpers
    const invalidate = (keys) => {
        keys.forEach(key => queryClient.invalidateQueries({ queryKey: [key, groupId] }));
    };

    // Mutations
    const addIncome = useMutation({
        mutationFn: (data) => base44.entities.Income.create({ ...data, group_id: groupId }),
        onSuccess: () => invalidate(["incomes"]),
    });

    const updateIncome = useMutation({
        mutationFn: ({ id, ...data }) => base44.entities.Income.update(id, data),
        onSuccess: () => invalidate(["incomes"]),
    });

    const addCategory = useMutation({
        mutationFn: (data) => base44.entities.BudgetCategory.create({ ...data, group_id: groupId }),
        onSuccess: () => invalidate(["categories"]),
    });

    const updateCategory = useMutation({
        mutationFn: ({ id, ...data }) => base44.entities.BudgetCategory.update(id, data),
        onSuccess: () => invalidate(["categories"]),
    });

    const deleteCategory = useMutation({
        mutationFn: (id) => base44.entities.BudgetCategory.delete(id),
        onSuccess: () => invalidate(["categories"]),
    });

    const addExpense = useMutation({
        mutationFn: (data) => base44.entities.Expense.create({ ...data, group_id: groupId }),
        onSuccess: () => invalidate(["expenses"]),
    });

    const deleteExpense = useMutation({
        mutationFn: (id) => base44.entities.Expense.delete(id),
        onSuccess: () => invalidate(["expenses"]),
    });

    const deleteGroup = useMutation({
        mutationFn: async () => {
            // Delete all related data (matching GroupDetail logic)
            for (const income of rawIncomes) await base44.entities.Income.delete(income.id);
            for (const cat of categories) await base44.entities.BudgetCategory.delete(cat.id);
            for (const expense of expenses) await base44.entities.Expense.delete(expense.id);
            await base44.entities.Group.delete(groupId);
        },
        onSuccess: () => {
            window.location.href = createPageUrl("Dashboard");
        },
    });

    const inviteMember = useMutation({
        mutationFn: async (userId) => {
            const updatedMembers = [...(group.members || []), userId];
            await base44.entities.Group.update(groupId, { members: updatedMembers });
        },
        onSuccess: () => {
            invalidate(["group", "members"]);
        },
    });

    return {
        // Data
        group,
        members,
        incomes,
        rawIncomes,
        categories,
        expenses,
        categorySplits,
        totalIncome,
        totalBudget,
        
        // Status
        isLoading: groupLoading,
        isFetching: isFetchingMembers || isFetchingIncomes || isFetchingCategories || isFetchingExpenses,
        
        // Actions
        actions: {
            addIncome: addIncome.mutateAsync,
            updateIncome: updateIncome.mutateAsync,
            addCategory: addCategory.mutateAsync,
            updateCategory: updateCategory.mutateAsync,
            deleteCategory: deleteCategory.mutateAsync,
            addExpense: addExpense.mutateAsync,
            deleteExpense: deleteExpense.mutateAsync,
            deleteGroup: deleteGroup.mutateAsync,
            inviteMember: inviteMember.mutateAsync,
            refreshAll: () => invalidate(["group", "members", "incomes", "categories", "expenses"])
        }
    };
}
