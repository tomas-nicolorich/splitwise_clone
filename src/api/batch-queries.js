import { base44 } from './client';

export async function fetchGroupDataBatch(groupId) {
    const [incomes, categories, expenses] = await Promise.all([
        base44.entities.Income.filter({ group_id: groupId }),
        base44.entities.BudgetCategory.filter({ group_id: groupId }),
        base44.entities.Expense.filter({ group_id: groupId }),
    ]);

    return { incomes, categories, expenses };
}