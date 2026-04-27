import { describe, it, expect } from 'vitest';
import { calculateCategorySplits } from './financial-utils';
import { BudgetCategory, Income, User, Expense } from '../api/types';

describe('calculateCategorySplits - Largest Remainder Method', () => {
  it('should distribute remainder correctly to sum to total amount', () => {
    const categories: BudgetCategory[] = [{ id: '1', amount: 1000, members: ['1', '2', '3'], name: 'Rent', group_id: '1', icon: null, created_at: null }];
    const incomes: Income[] = [
      { user: '1', amount: 100, group_id: '1', id: '1', currency: 'EUR', created_at: null },
      { user: '2', amount: 100, group_id: '1', id: '2', currency: 'EUR', created_at: null },
      { user: '3', amount: 100, group_id: '1', id: '3', currency: 'EUR', created_at: null }
    ];
    const members: User[] = [
        { id: '1', name: 'User 1', auth_id: null, created_at: '', icon: null },
        { id: '2', name: 'User 2', auth_id: null, created_at: '', icon: null },
        { id: '3', name: 'User 3', auth_id: null, created_at: '', icon: null }
    ];
    const result = calculateCategorySplits(categories, incomes, members, []);
    
    const shares = result['1'].map(s => s.share);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(1000);
    expect(shares.sort()).toEqual([333, 333, 334]);
  });
});

describe('calculateCategorySplits - Budget Transfers', () => {
  it('should adjust shares based on budget transfers', () => {
    const categories: BudgetCategory[] = [{ id: '1', amount: 1000, members: ['1', '2'], name: 'Rent', group_id: '1', icon: null, created_at: null }];
    const incomes: Income[] = [
      { user: '1', amount: 1000, group_id: '1', id: '1', currency: 'EUR', created_at: null },
      { user: '2', amount: 0, group_id: '1', id: '2', currency: 'EUR', created_at: null }
    ];
    const members: User[] = [
        { id: '1', name: 'User 1', auth_id: null, created_at: '', icon: null },
        { id: '2', name: 'User 2', auth_id: null, created_at: '', icon: null }
    ];
    const expenses: Expense[] = [
        { description: '[BUDGET_TRANSFER] TO:2', amount: 200, paid_by: '1', category_id: '1', date: '2026-04-27', id: '1', group_id: '1', created_at: null }
    ];

    const result = calculateCategorySplits(categories, incomes, members, expenses);
    const shares = result['1'];
    
    expect(shares.find(s => s.userId === '1')?.share).toBe(800);
    expect(shares.find(s => s.userId === '2')?.share).toBe(200);
  });
});
