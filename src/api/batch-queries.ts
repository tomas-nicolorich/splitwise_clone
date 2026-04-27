import { base44 } from './client';
import { Income, BudgetCategory, Expense } from './types';

export interface GroupDataBatch {
    incomes: Income[];
    categories: BudgetCategory[];
    expenses: Expense[];
}

export async function fetchGroupDataBatch(groupId: string): Promise<GroupDataBatch> {
    const [incomes, categories, expenses] = await Promise.all([
        base44.entities.Income.filter({ group_id: groupId }),
        base44.entities.BudgetCategory.filter({ group_id: groupId }),
        base44.entities.Expense.filter({ group_id: groupId }),
    ]);

    return { incomes, categories, expenses };
}
