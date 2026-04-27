import { describe, it, expect, vi } from 'vitest';
import { fetchGroupDataBatch } from './batch-queries';
import { base44 } from './client';

vi.mock('./client', () => ({
  base44: {
    entities: {
      Income: { filter: vi.fn() },
      BudgetCategory: { filter: vi.fn() },
      Expense: { filter: vi.fn() },
    }
  }
}));

describe('batch-queries', () => {
  it('fetchGroupDataBatch should call all filters', async () => {
    vi.mocked(base44.entities.Income.filter).mockResolvedValue([]);
    vi.mocked(base44.entities.BudgetCategory.filter).mockResolvedValue([]);
    vi.mocked(base44.entities.Expense.filter).mockResolvedValue([]);

    const result = await fetchGroupDataBatch('1');
    
    expect(base44.entities.Income.filter).toHaveBeenCalledWith({ group_id: '1' });
    expect(base44.entities.BudgetCategory.filter).toHaveBeenCalledWith({ group_id: '1' });
    expect(base44.entities.Expense.filter).toHaveBeenCalledWith({ group_id: '1' });
    expect(result).toHaveProperty('incomes');
  });
});
